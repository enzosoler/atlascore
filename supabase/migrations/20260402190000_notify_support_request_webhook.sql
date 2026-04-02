-- Webhook: notify team on new support requests
-- Calls the notify-support-request edge function on every INSERT

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
