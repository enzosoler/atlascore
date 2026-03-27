-- ============================================================================
-- Atlas Core — Professional Links
-- Replaces base44 CoachStudent / ClinicianPatient / NutritionistClientLink
-- ============================================================================

-- ─── TABLE ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.professional_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  link_type        TEXT NOT NULL CHECK (link_type IN ('coach', 'nutritionist', 'clinician')),
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'removed')),
  invited_by       UUID REFERENCES auth.users(id),
  accepted_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (professional_id, client_id, link_type)
);

CREATE INDEX IF NOT EXISTS idx_professional_links_professional_id ON public.professional_links(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_links_client_id       ON public.professional_links(client_id);
CREATE INDEX IF NOT EXISTS idx_professional_links_status          ON public.professional_links(status);

-- ─── RLS ──────────────────────────────────────────────────────────────────

ALTER TABLE public.professional_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pl_select" ON public.professional_links;
CREATE POLICY "pl_select" ON public.professional_links
  FOR SELECT USING (
    professional_id = auth.uid() OR client_id = auth.uid()
  );

DROP POLICY IF EXISTS "pl_insert" ON public.professional_links;
CREATE POLICY "pl_insert" ON public.professional_links
  FOR INSERT WITH CHECK (
    professional_id = auth.uid()
  );

DROP POLICY IF EXISTS "pl_update" ON public.professional_links;
CREATE POLICY "pl_update" ON public.professional_links
  FOR UPDATE USING (
    professional_id = auth.uid() OR client_id = auth.uid()
  );

DROP POLICY IF EXISTS "pl_delete" ON public.professional_links;
CREATE POLICY "pl_delete" ON public.professional_links
  FOR DELETE USING (
    professional_id = auth.uid()
  );

-- ─── VIEW ─────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW professional_link_details AS
SELECT
  pl.*,
  pp.full_name  AS professional_name,
  pp.email      AS professional_email,
  cp.full_name  AS client_name,
  cp.email      AS client_email
FROM professional_links pl
LEFT JOIN profiles pp ON pp.id = pl.professional_id
LEFT JOIN profiles cp ON cp.id = pl.client_id;

-- ============================================================================
-- DONE
-- ============================================================================
