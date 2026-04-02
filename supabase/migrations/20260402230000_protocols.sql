-- ============================================================
-- Protocols feature: recurring medications, hormones, peptides, supplements
-- ============================================================

-- 1. Create protocols table
CREATE TABLE IF NOT EXISTS public.protocols (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('medication', 'hormone', 'peptide', 'supplement')),
    dose_amount NUMERIC NOT NULL,
    dose_unit TEXT NOT NULL,
    route TEXT NOT NULL CHECK (route IN ('oral', 'subcutaneous', 'intramuscular', 'topical', 'transdermal', 'sublingual', 'inhalation', 'other')),
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('weekdays', 'interval')),
    schedule_weekdays INT[] DEFAULT NULL,
    schedule_interval_days INT DEFAULT NULL,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_time TIME DEFAULT NULL,
    followup_reminder_minutes INT DEFAULT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'discontinued')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Ensure the schedule columns match the schedule_type
    CONSTRAINT chk_schedule_weekdays CHECK (
        schedule_type != 'weekdays' OR (schedule_weekdays IS NOT NULL AND array_length(schedule_weekdays, 1) > 0)
    ),
    CONSTRAINT chk_schedule_interval CHECK (
        schedule_type != 'interval' OR (schedule_interval_days IS NOT NULL AND schedule_interval_days > 0)
    )
);

-- 2. Create protocol_logs table
CREATE TABLE IF NOT EXISTS public.protocol_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('taken', 'skipped', 'missed')),
    taken_at TIMESTAMPTZ DEFAULT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for protocols
DROP POLICY IF EXISTS "protocols_select_own" ON public.protocols;
DROP POLICY IF EXISTS "protocols_insert_own" ON public.protocols;
DROP POLICY IF EXISTS "protocols_update_own" ON public.protocols;
DROP POLICY IF EXISTS "protocols_delete_own" ON public.protocols;
CREATE POLICY "protocols_select_own" ON public.protocols
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "protocols_insert_own" ON public.protocols
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "protocols_update_own" ON public.protocols
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "protocols_delete_own" ON public.protocols
    FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS policies for protocol_logs (join through protocols to check ownership)
DROP POLICY IF EXISTS "protocol_logs_select_own" ON public.protocol_logs;
DROP POLICY IF EXISTS "protocol_logs_insert_own" ON public.protocol_logs;
DROP POLICY IF EXISTS "protocol_logs_update_own" ON public.protocol_logs;
DROP POLICY IF EXISTS "protocol_logs_delete_own" ON public.protocol_logs;
CREATE POLICY "protocol_logs_select_own" ON public.protocol_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.protocols WHERE protocols.id = protocol_logs.protocol_id AND protocols.user_id = auth.uid())
    );

CREATE POLICY "protocol_logs_insert_own" ON public.protocol_logs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.protocols WHERE protocols.id = protocol_logs.protocol_id AND protocols.user_id = auth.uid())
    );

CREATE POLICY "protocol_logs_update_own" ON public.protocol_logs
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.protocols WHERE protocols.id = protocol_logs.protocol_id AND protocols.user_id = auth.uid())
    );

CREATE POLICY "protocol_logs_delete_own" ON public.protocol_logs
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM public.protocols WHERE protocols.id = protocol_logs.protocol_id AND protocols.user_id = auth.uid())
    );

-- 6. Add missing columns to existing protocols table
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'supplement';
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS dose_amount NUMERIC DEFAULT 0;
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS dose_unit TEXT DEFAULT 'mg';
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS route TEXT DEFAULT 'oral';
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS schedule_type TEXT DEFAULT 'weekdays';
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS schedule_weekdays INT[] DEFAULT NULL;
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS schedule_interval_days INT DEFAULT NULL;
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS reminder_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS reminder_time TIME DEFAULT NULL;
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS followup_reminder_minutes INT DEFAULT NULL;
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.protocols ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add missing columns to protocol_logs
ALTER TABLE public.protocol_logs ADD COLUMN IF NOT EXISTS scheduled_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.protocol_logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'taken';
ALTER TABLE public.protocol_logs ADD COLUMN IF NOT EXISTS taken_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.protocol_logs ADD COLUMN IF NOT EXISTS notes TEXT;

-- 7. Indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_protocols_user_id ON public.protocols(user_id);
CREATE INDEX IF NOT EXISTS idx_protocols_user_status ON public.protocols(user_id, status);
CREATE INDEX IF NOT EXISTS idx_protocol_logs_protocol_id ON public.protocol_logs(protocol_id);
CREATE INDEX IF NOT EXISTS idx_protocol_logs_scheduled_date ON public.protocol_logs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_protocol_logs_protocol_date ON public.protocol_logs(protocol_id, scheduled_date);

-- 7. Updated-at trigger (reuse existing function if available)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_protocols_updated_at ON public.protocols;
CREATE TRIGGER trg_protocols_updated_at
    BEFORE UPDATE ON public.protocols
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
