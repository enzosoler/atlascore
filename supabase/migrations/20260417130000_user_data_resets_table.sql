CREATE TABLE IF NOT EXISTS user_data_resets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  reset_at timestamptz DEFAULT now(),
  counts jsonb DEFAULT '{}'
);
ALTER TABLE user_data_resets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own resets" ON user_data_resets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert" ON user_data_resets FOR INSERT WITH CHECK (true);
