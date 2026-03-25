-- Migration: Create email_events table for logging
-- This table tracks all email sending attempts for observability

create table if not exists email_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email varchar(255) not null,
  type varchar(50) not null,
  language varchar(10) default 'en',
  status varchar(20) not null check (status in ('pending', 'sent', 'failed', 'retrying')),
  resend_id varchar(100),
  error_message text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_email_events_user_id ON email_events(user_id);
CREATE INDEX IF NOT EXISTS idx_email_events_created_at ON email_events(created_at);
CREATE INDEX IF NOT EXISTS idx_email_events_type ON email_events(type);
CREATE INDEX IF NOT EXISTS idx_email_events_status ON email_events(status);

-- Enable RLS
ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- Policies: Only admins can view all logs
-- Users can only view their own email events (if they need to)

-- Admins see all
CREATE POLICY "Admins can view all email events"
ON email_events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role can manage email events"
ON email_events FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own (optional, but good for transparency)
CREATE POLICY "Users can view own email events"
ON email_events FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Grant permissions
GRANT ALL ON email_events TO service_role;
GRANT SELECT ON email_events TO authenticated;

-- Comment for documentation
COMMENT ON TABLE email_events IS 'Audit log for all transactional emails sent through the system';
COMMENT ON COLUMN email_events.status IS 'pending | sent | failed | retrying';
COMMENT ON COLUMN email_events.resend_id IS 'Resend API message ID for tracking';
