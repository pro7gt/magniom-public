-- 006_security_helpers.sql
-- Security helper functions for RLS, multi-tenancy, and immutability
-- Conforms to Sections 18, 19, 61, 74 of MAGNIOM-Supabase Database & Security Specification v1.0

CREATE OR REPLACE FUNCTION security.has_permission(
  p_organisation_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM identity.memberships m
    JOIN identity.role_permissions rp
      ON rp.role = m.role
    WHERE m.user_id = auth.uid()
      AND m.organisation_id = p_organisation_id
      AND m.active = true
      AND rp.permission_code = p_permission
  );
$$;

CREATE OR REPLACE FUNCTION security.can_access_site(
  p_organisation_id UUID,
  p_site_id UUID
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM identity.memberships m
    WHERE m.user_id = auth.uid()
      AND m.organisation_id = p_organisation_id
      AND m.active = true
      AND (
        m.site_id IS NULL
        OR m.site_id = p_site_id
      )
  );
$$;

CREATE OR REPLACE FUNCTION security.current_user_org_ids()
RETURNS TABLE (org_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT organisation_id
  FROM identity.memberships
  WHERE user_id = auth.uid()
    AND active = true;
$$;

CREATE OR REPLACE FUNCTION security.has_role(required_role identity.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM identity.memberships
    WHERE user_id = auth.uid()
      AND role = required_role
      AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION security.is_system_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT security.has_role('system_admin'::identity.app_role);
$$;

CREATE OR REPLACE FUNCTION security.reject_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  RAISE EXCEPTION 'Immutable record cannot be modified';
END;
$$;

