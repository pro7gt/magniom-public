-- 006_security_helpers.sql
-- Security helper functions for RLS and multi-tenancy
-- Conforms to Section 11 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE OR REPLACE FUNCTION identity.current_user_org_ids()
RETURNS TABLE (org_id UUID)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id
  FROM identity.memberships
  WHERE user_id = auth.uid()
    AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION identity.has_role(required_role identity.app_role)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM identity.memberships
    WHERE user_id = auth.uid()
      AND role = required_role
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION identity.is_system_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT identity.has_role('system_admin'::identity.app_role);
$$;
