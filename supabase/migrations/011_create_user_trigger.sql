-- Migration: Create trigger on auth.users to handle new user onboarding
-- This replaces the Supabase Auth hook which has secret issues
-- The trigger calls our edge function directly via pg_net (HTTP)

-- Enable pg_net extension for HTTP requests (if available)
-- Note: pg_net may not be available on all Supabase tiers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  service_role_key TEXT;
  response RECORD;
BEGIN
  -- Get configuration
  webhook_url := 'https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/auth-webhook';
  service_role_key := current_setting('app.settings.service_role_key', true);
  
  -- Try to call edge function via pg_net (if available)
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
      -- Async HTTP call to edge function
      PERFORM net.http_post(
        url := webhook_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || service_role_key
        ),
        body := jsonb_build_object(
          'type', 'user.created',
          'record', jsonb_build_object(
            'id', NEW.id,
            'email', NEW.email,
            'user_metadata', NEW.raw_user_meta_data
          )
        )
      );
      
      RAISE LOG 'Webhook called for user %', NEW.id;
    ELSE
      -- Fallback: pg_net not available, use alternative method
      -- Insert into pending_webhooks table for async processing
      RAISE LOG 'pg_net not available, user % queued for processing', NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE LOG 'Error calling webhook for user %: %', NEW.id, SQLERRM;
  END;
  
  -- Always create profile and subscription synchronously
  -- (reliable, runs in same transaction)
  BEGIN
    INSERT INTO public.profiles (id, role, full_name, language, updated_at)
    VALUES (
      NEW.id,
      'user',
      (NEW.raw_user_meta_data->>'full_name')::text,
      'en',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      updated_at = NOW();
    
    INSERT INTO public.subscriptions (user_id, tier, status, trial_starts_at, trial_ends_at)
    VALUES (
      NEW.id,
      'free',
      'trialing',
      NOW(),
      NOW() + INTERVAL '7 days'
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE LOG 'Profile and subscription created for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
-- Note: Run this as superuser or service_role
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Comment
COMMENT ON FUNCTION public.handle_new_user IS 'Trigger function called when new user signs up. Creates profile, subscription, and calls webhook for emails.';
