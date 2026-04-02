-- Webhook: notify team on new support requests
-- Calls the notify-support-request edge function on every INSERT

-- Ensure pg_net extension is enabled
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create support_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  type text NOT NULL DEFAULT 'contact',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS: users can insert their own requests, only service role can read all
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert support requests" ON public.support_requests;
CREATE POLICY "Users can insert support requests"
  ON public.support_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anon can insert support requests" ON public.support_requests;
CREATE POLICY "Anon can insert support requests"
  ON public.support_requests FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Create the trigger function that calls the edge function via pg_net
CREATE OR REPLACE FUNCTION public.notify_support_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _url text;
  _anon_key text;
BEGIN
  _url := current_setting('app.settings.supabase_url', true);
  _anon_key := current_setting('app.settings.supabase_anon_key', true);

  -- Use pg_net to make an async HTTP call to the edge function
  PERFORM net.http_post(
    url := coalesce(_url, 'https://xrtqwdpczgdomqebmfkk.supabase.co') || '/functions/v1/notify-support-request',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(_anon_key, current_setting('supabase.anon_key', true))
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'support_requests',
      'record', row_to_json(NEW)
    )
  );

  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_support_request_inserted ON public.support_requests;
CREATE TRIGGER on_support_request_inserted
  AFTER INSERT ON public.support_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_support_request();
