-- Migration: Sync profile role changes to JWT app_metadata
-- This trigger calls the sync-role-to-jwt edge function whenever profile role changes

-- Create function to call sync-role-to-jwt edge function
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_jwt()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  service_role_key TEXT;
BEGIN
  -- Only process if role actually changed
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Get configuration
    webhook_url := 'https://xrtqwdpczgdomqebmfkk.supabase.co/functions/v1/sync-role-to-jwt';
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
            'user_id', NEW.id,
            'role', NEW.role
          )
        );
        
        RAISE LOG 'Sync role trigger called for user % with role %', NEW.id, NEW.role;
      ELSE
        RAISE LOG 'pg_net not available, role sync skipped for user %', NEW.id;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't block profile update
      RAISE LOG 'Error calling sync-role-to-jwt for user %: %', NEW.id, SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS on_profile_role_changed ON public.profiles;

CREATE TRIGGER on_profile_role_changed
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_to_jwt();

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.sync_profile_role_to_jwt() TO service_role;

-- Comment
COMMENT ON FUNCTION public.sync_profile_role_to_jwt IS 'Trigger function called when profile role changes. Calls sync-role-to-jwt edge function to update JWT app_metadata.';
