-- Product-analytics event log for activation-funnel visibility.
-- Lightweight append-only table — no updates, no deletes from client.

CREATE TABLE IF NOT EXISTS public.product_events (
  id         UUID                     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID                     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event      TEXT                     NOT NULL,
  metadata   JSONB                    DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_events_user  ON product_events(user_id);
CREATE INDEX idx_product_events_event ON product_events(event);
CREATE INDEX idx_product_events_created ON product_events(created_at);

ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own events"
  ON product_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own events"
  ON product_events FOR SELECT
  USING (auth.uid() = user_id);
