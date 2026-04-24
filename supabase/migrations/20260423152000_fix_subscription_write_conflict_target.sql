-- Fix subscription writers that assumed a UNIQUE(user_id) constraint.
-- The schema only guarantees uniqueness for some status combinations, so
-- handle_new_user must avoid ON CONFLICT (user_id) and check existence directly.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, role, full_name, email, language, updated_at)
    VALUES (
      NEW.id,
      'user',
      (NEW.raw_user_meta_data->>'full_name')::text,
      NEW.email,
      'en',
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      email = COALESCE(EXCLUDED.email, public.profiles.email),
      updated_at = NOW();

    IF NOT EXISTS (
      SELECT 1
      FROM public.subscriptions
      WHERE user_id = NEW.id
    ) THEN
      INSERT INTO public.subscriptions (
        user_id,
        tier,
        status,
        trial_starts_at,
        trial_ends_at
      )
      VALUES (
        NEW.id,
        'free',
        'trialing',
        NOW(),
        NOW() + INTERVAL '7 days'
      );
    END IF;

    RAISE LOG 'Profile and subscription created for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
