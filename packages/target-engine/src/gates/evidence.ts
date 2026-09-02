/**
 * Gate 2 — Evidence Eligibility Gate
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 12-14.
 * Evaluates candidate evidence tier permissions according to active Scientific Policy,
 * Evidence Knowledge Graph ceiling, and execution Mode.
 */

import type { EvidenceTier, CandidateRole, MagniomMode } from '@magniom/domain';
import type { ScientificPolicyRelease } from '@magniom/scientific-policy';
import { EvidenceKnowledgeGraph, EVIDENCE_TIER_ORDER } from '@magniom/evidence';

export interface EvidenceGateResult {
  readonly eligible: boolean;
  readonly reason?: string;
}

export function evaluateEvidenceGate(
  tier: EvidenceTier,
  role: CandidateRole,
  policy: ScientificPolicyRelease,
  mode: MagniomMode,
  familyId?: string,
  graph?: EvidenceKnowledgeGraph,
): EvidenceGateResult {
  // Graph-level Evidence Ceiling Check
  if (graph && familyId) {
    const graphPermitted = graph.isTargetFamilyPermittedInMode(familyId, mode);
    if (!graphPermitted && mode === 'CLINICAL') {
      return {
        eligible: false,
        reason: `Target family '${familyId}' is restricted from Clinical Mode by Evidence Knowledge Graph ceiling constraint.`,
      };
    }

    const ceilingTier = graph.getEvidenceCeilingTier(familyId);
    if (EVIDENCE_TIER_ORDER[tier] > EVIDENCE_TIER_ORDER[ceilingTier]) {
      return {
        eligible: false,
        reason: `Candidate evidence tier '${tier}' exceeds graph-derived evidence ceiling '${ceilingTier}' for family '${familyId}'.`,
      };
    }
  }

  const tierPermission = policy.evidencePolicy.tierPermissions.find(
    (tp: { tier: string }) => tp.tier === tier,
  );

  if (!tierPermission) {
    return {
      eligible: false,
      reason: `Evidence tier '${tier}' is not recognized in active Scientific Policy.`,
    };
  }

  // Clinical mode restrictions
  if (mode === 'CLINICAL') {
    if (role.startsWith('PRIMARY') && !tierPermission.standalonePrimary) {
      return {
        eligible: false,
        reason: `Evidence tier '${tier}' is prohibited from standalone Primary candidate role in Clinical Mode.`,
      };
    }

    if (role.startsWith('ADDITIONAL') && !tierPermission.standaloneAdditional) {
      return {
        eligible: false,
        reason: `Evidence tier '${tier}' is prohibited from Additional candidate role in Clinical Mode.`,
      };
    }

    if (!tierPermission.permittedCandidateRoles.includes(role)) {
      return {
        eligible: false,
        reason: `Role '${role}' is not in permitted roles for evidence tier '${tier}'.`,
      };
    }
  }

  return { eligible: true };
}
