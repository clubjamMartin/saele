-- Services table for dashboard services panel
-- Part of SAE-4: Dashboard Frontend Layout

CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL CHECK (status IN ('active', 'available', 'unavailable')) DEFAULT 'available',
  icon text,
  display_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.services IS 'Services available to guests (e.g., breakfast, parking, ski pass)';
COMMENT ON COLUMN public.services.status IS 'Service status: active (guest has service), available (can request), unavailable (not offered)';
COMMENT ON COLUMN public.services.display_order IS 'Order in which services are displayed (lower = higher priority)';
COMMENT ON COLUMN public.services.is_active IS 'Whether service is currently offered';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_display_order ON public.services(display_order);

-- RLS Policies
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view active services
CREATE POLICY "services_select_authenticated"
  ON public.services
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

-- Admins can view all services
CREATE POLICY "services_select_all_admin"
  ON public.services
  FOR SELECT
  USING (public.is_admin());

-- Only admins can insert/update/delete services
CREATE POLICY "services_insert_admin"
  ON public.services
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "services_update_admin"
  ON public.services
  FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "services_delete_admin"
  ON public.services
  FOR DELETE
  USING (public.is_admin());

-- Updated_at trigger
CREATE TRIGGER handle_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
