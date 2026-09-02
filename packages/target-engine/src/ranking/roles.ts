/**
 * Role-Based Slate Assignment
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 71–79 & 101–107.
 * Assigns candidates to constrained Slate roles: Primary 1, Primary 2, Primary 3, Additional A, Additional B.
 */

import type { TargetCandidate, PhenotypeSnapshot, MagniomMode } from '@magniom/domain';

export interface SlateRoleAllocation {
  readonly primaryCandidates: readonly TargetCandidate[];
  readonly additionalCandidates: readonly TargetCandidate[];
}

export function allocateSlateRoles(
  activeCandidates: readonly TargetCandidate[],
  phenotype: PhenotypeSnapshot,
  mode: MagniomMode = 'CLINICAL',
): SlateRoleAllocation {
  if (activeCandidates.length === 0) {
    return { primaryCandidates: [], additionalCandidates: [] };
  }

  const primaryCandidates: TargetCandidate[] = [];
  const additionalCandidates: TargetCandidate[] = [];

  // Determine dominant symptom and priorities
  const priorities =
    phenotype.symptomPriorities && phenotype.symptomPriorities.length > 0
      ? [...phenotype.symptomPriorities].sort((a, b) => a.priorityRank - b.priorityRank)
      : [
          {
            domainCode: 'DOMAIN-MDD-DYSPHORIC-001',
            priorityRank: 1,
            clinicianWeight: 0.9,
            evidenceMappability: 'direct' as const,
          },
        ];

  const primaryDomain = priorities[0]?.domainCode ?? 'DOMAIN-MDD-DYSPHORIC-001';
  const hasAnxietyComponent = priorities.some(
    p => p.domainCode === 'DOMAIN-MDD-ANXIOSOMATIC-001' && p.clinicianWeight >= 0.2,
  );

  // 1. Primary 1: Evidence Anchor / Qualified Primary Depression Target
  // Left DLPFC target is always the primary anchor for depression
  const primary1Candidate: TargetCandidate =
    activeCandidates.find(c => {
      // Prefer qualified connectome refined candidate if available
      if (
        c.method === 'CONNECTOME_REFINED' &&
        (c.familyId === 'TF-MDD-CONVERGENT-LDLPFC-001' || c.familyId === 'TF-MDD-LDLPFC-EST-001')
      ) {
        return true;
      }
      return false;
    }) ??
    activeCandidates.find(c => c.familyId === 'TF-MDD-LDLPFC-EST-001') ??
    activeCandidates[0]!;

  const p1: TargetCandidate = {
    ...primary1Candidate,
    role: 'PRIMARY_1',
  };
  primaryCandidates.push(p1);

  // 2. Primary 2: Distinct Symptom-Circuit Target (if an uncovered high-priority domain exists)
  if (hasAnxietyComponent) {
    const anxiosomaticCandidate =
      activeCandidates.find(
        c =>
          c.id !== primary1Candidate.id &&
          c.method !== 'EVIDENCE_ONLY_PRIOR' &&
          (c.familyId === 'TF-MDD-ANXIOSOMATIC-DMPFC-001' ||
            c.circuitId === 'CIRCUIT-MDD-ANXIOSOMATIC-001'),
      ) ??
      activeCandidates.find(
        c =>
          c.id !== primary1Candidate.id &&
          (c.familyId === 'TF-MDD-ANXIOSOMATIC-DMPFC-001' ||
            c.circuitId === 'CIRCUIT-MDD-ANXIOSOMATIC-001'),
      );

    if (
      anxiosomaticCandidate &&
      (primaryDomain === 'DOMAIN-MDD-ANXIOSOMATIC-001' ||
        (priorities[1]?.clinicianWeight ?? 0) >= 0.5)
    ) {
      const p2: TargetCandidate = {
        ...anxiosomaticCandidate,
        role: 'PRIMARY_2',
      };
      primaryCandidates.push(p2);
    }
  }

  // 3. Additional A: Counterfactual Evidence Prior (when Primary 1 is personalised) or Network Alternative
  const remaining = activeCandidates.filter(c => !primaryCandidates.some(p => p.id === c.id));

  const baselineCounterfactual = remaining.find(
    c => c.familyId === 'TF-MDD-LDLPFC-EST-001' && c.method === 'EVIDENCE_ONLY_PRIOR',
  );

  if (baselineCounterfactual && primary1Candidate.method === 'CONNECTOME_REFINED') {
    const addA: TargetCandidate = {
      ...baselineCounterfactual,
      role: 'ADDITIONAL_A',
      rationale: 'Counterfactual standard left-prefrontal evidence prior.',
    };
    additionalCandidates.push(addA);
  }

  // In Research mode, allocate remaining active candidates to available Additional slots (up to max 2)
  if (mode === 'RESEARCH') {
    for (const rem of remaining) {
      if (additionalCandidates.length >= 2) break;
      if (additionalCandidates.some(a => a.id === rem.id)) continue;
      const role =
        additionalCandidates.length === 0 ? ('ADDITIONAL_A' as const) : ('ADDITIONAL_B' as const);
      additionalCandidates.push({
        ...rem,
        role,
      });
    }
  }

  return {
    primaryCandidates,
    additionalCandidates,
  };
}
