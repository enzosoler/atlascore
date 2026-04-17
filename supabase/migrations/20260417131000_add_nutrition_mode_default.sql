-- Set nutrition_mode for existing users who don't have it yet
-- Default to 'macros_only' since that's the simpler mode
UPDATE profiles
SET profile_data = COALESCE(profile_data, '{}'::jsonb) || '{"nutrition_mode": "macros_only"}'::jsonb
WHERE profile_data IS NULL OR profile_data->>'nutrition_mode' IS NULL;
