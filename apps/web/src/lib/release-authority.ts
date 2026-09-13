/**
 * @magniom/web - Release & Authority Context Provider
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v1.0 (Sections 11, 12, 17, 18, 124, 125).
 *
 * Provides single authoritative release provenance and user session context
 * to prevent maturity-state contradictions (e.g. M1 vs M3).
 */

import {
  toReleaseContextSummaryViewModel,
  toTopBarViewModel,
  type ReleaseContextSummaryViewModel,
  type TopBarViewModel,
  type EnvironmentMode,
  type UserIdentityViewModel,
  type OrganisationContextViewModel,
} from '@magniom/presentation';

export interface AuthoritativeSession {
  user: UserIdentityViewModel;
  organization: OrganisationContextViewModel;
  mode: EnvironmentMode;
  releaseContext: ReleaseContextSummaryViewModel;
}

// Canonical Default Session Context for the TMS Specialist
export const CANONICAL_CLINICAL_SESSION: AuthoritativeSession = {
  user: {
    id: 'usr-spec-001',
    displayName: 'Dr A. Smith',
    roleTitle: 'TMS Specialist & Clinical Reviewer',
    hasSigningAuthority: true,
    signingAuthorityLevel: 'Full Specialist Target Attestation (IEC 62304 / ISO 14971)',
    organizationId: 'org-melb-tms',
    organizationName: 'Melbourne TMS Centre',
    siteName: 'Site 1 — Surrey Hills Clinic',
    initials: 'AS',
  },
  organization: {
    organizationId: 'org-melb-tms',
    organizationName: 'Melbourne TMS Centre',
    siteId: 'site-surrey-hills-01',
    siteName: 'Surrey Hills Clinic',
    displayLabel: 'Melbourne TMS Centre · Site 1',
  },
  mode: 'CLINICAL',
  releaseContext: toReleaseContextSummaryViewModel(),
};

/**
 * Returns the authoritative release manifest summary.
 */
export function getAuthoritativeReleaseContext(): ReleaseContextSummaryViewModel {
  return toReleaseContextSummaryViewModel();
}

/**
 * Returns TopBarViewModel built directly from authoritative session context.
 */
export function getAuthoritativeTopBarViewModel(currentMode?: EnvironmentMode): TopBarViewModel {
  const mode = currentMode || CANONICAL_CLINICAL_SESSION.mode;
  return toTopBarViewModel({
    mode,
    user: CANONICAL_CLINICAL_SESSION.user,
    organization: CANONICAL_CLINICAL_SESSION.organization,
    releaseDigest: CANONICAL_CLINICAL_SESSION.releaseContext.buildId,
  });
}
