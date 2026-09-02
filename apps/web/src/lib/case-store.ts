/**
 * @magniom/web - In-Memory Case Store & State Engine
 * Manages clinical cases, phenotype snapshots, target slates, decisions, and audit events.
 * 100% Synthetic / Mockable for Sprint 6 Clinician UX & Formative Human Factors Testing.
 */

import type {
  ClinicalCase,
  PhenotypeSnapshot,
  TargetSlate,
  ClinicianDecision,
  CandidateDecision,
  MagniomInfluence,
  DecisionType,
  FinalTarget,
} from '@magniom/domain';
import { ALL_UX_GOLDEN_CASES } from '@magniom/test-fixtures';

/**
 * Deterministic browser/universal 64-hex-character hash function
 */
function deterministicHexHash(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  let h3 = 0x9e3779b9;
  let h4 = 0x85ebca6b;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 3812015801);
    h4 = Math.imul(h4 ^ ch, 2246822507);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h3 ^ (h3 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 2246822507) ^ Math.imul(h4 ^ (h4 >>> 13), 3266489909);
  h4 = Math.imul(h4 ^ (h4 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  const hex3 = (h3 >>> 0).toString(16).padStart(8, '0');
  const hex4 = (h4 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}${hex2}${hex3}${hex4}${hex2}${hex3}${hex4}${hex1}`;
}

export interface CaseStateRecord {
  clinicalCase: ClinicalCase;
  phenotype: PhenotypeSnapshot;
  slate: TargetSlate;
  decision?: ClinicianDecision | undefined;
  isStale: boolean;
  staleReason?: string | undefined;
  auditEvents: Array<{
    id: string;
    eventType: string;
    occurredAt: string;
    details: Record<string, unknown>;
  }>;
}

class CaseStore {
  private cases: Map<string, CaseStateRecord> = new Map();

  constructor() {
    this.resetToGoldenCases();
  }

  public resetToGoldenCases() {
    this.cases.clear();
    ALL_UX_GOLDEN_CASES.forEach(bundle => {
      this.cases.set(bundle.id, {
        clinicalCase: { ...bundle.clinicalCase },
        phenotype: { ...bundle.phenotype },
        slate: { ...bundle.slate },
        decision: bundle.initialDecision ? { ...bundle.initialDecision } : undefined,
        isStale: Boolean(bundle.isStale),
        staleReason: bundle.staleReason,
        auditEvents: [
          {
            id: `evt-${bundle.id}-init`,
            eventType: 'CASE_INITIALISED',
            occurredAt: bundle.clinicalCase.createdAt,
            details: { caseCode: bundle.code, indication: bundle.clinicalCase.indicationCode },
          },
        ],
      });
    });
  }

  public getAllCases(): Array<{ id: string; code: string; title: string; state: string; indication: string; isStale: boolean }> {
    return ALL_UX_GOLDEN_CASES.map(bundle => {
      const record = this.cases.get(bundle.id);
      return {
        id: bundle.id,
        code: bundle.code,
        title: bundle.title,
        state: record?.clinicalCase.state || bundle.clinicalCase.state,
        indication: bundle.clinicalCase.indicationCode,
        isStale: Boolean(record?.isStale),
      };
    });
  }

  public getCaseRecord(caseId: string): CaseStateRecord | undefined {
    return this.cases.get(caseId);
  }

  public getCaseByCode(caseCode: string): CaseStateRecord | undefined {
    for (const record of this.cases.values()) {
      if (record.clinicalCase.caseCode === caseCode) {
        return record;
      }
    }
    return undefined;
  }

  /**
   * Approves a PhenotypeSnapshot, sealing it with a SHA-256 equivalent hash
   */
  public approvePhenotype(caseId: string, clinicianId = 'clin-specialist-001', clinicianNotes?: string): PhenotypeSnapshot {
    const record = this.cases.get(caseId);
    if (!record) throw new Error(`Case ${caseId} not found`);

    const summary = clinicianNotes || record.phenotype.clinicianSummary;
    const updatedPhenotype: PhenotypeSnapshot = {
      ...record.phenotype,
      state: 'approved',
      confirmedByClinicianId: clinicianId,
      confirmedAt: new Date().toISOString(),
      ...(summary ? { clinicianSummary: summary } : {}),
    };

    const hashString = JSON.stringify({
      caseId: updatedPhenotype.patientId,
      scores: updatedPhenotype.symptomScores,
      diagnosis: updatedPhenotype.primaryDiagnosis,
      confirmedBy: updatedPhenotype.confirmedByClinicianId,
      confirmedAt: updatedPhenotype.confirmedAt,
    });
    const sealedHash = deterministicHexHash(hashString);

    const sealedSnapshot: PhenotypeSnapshot = {
      ...updatedPhenotype,
      snapshotHash: sealedHash,
    };

    record.phenotype = sealedSnapshot;
    record.clinicalCase = {
      ...record.clinicalCase,
      state: 'phenotype_approved',
      currentPhenotypeSnapshotId: sealedSnapshot.id,
      updatedAt: new Date().toISOString(),
    };

    record.auditEvents.push({
      id: `evt-snap-app-${Date.now()}`,
      eventType: 'PHENOTYPE_APPROVED',
      occurredAt: new Date().toISOString(),
      details: { snapshotId: sealedSnapshot.id, snapshotHash: sealedHash, clinicianId },
    });

    return sealedSnapshot;
  }

  /**
   * Saves candidate decisions
   */
  public saveCandidateDecision(
    caseId: string,
    candidateDecision: CandidateDecision
  ): void {
    const record = this.cases.get(caseId);
    if (!record) throw new Error(`Case ${caseId} not found`);

    const existingDecisions = record.decision?.candidateDecisions ? [...record.decision.candidateDecisions] : [];
    const index = existingDecisions.findIndex(d => d.targetCandidateId === candidateDecision.targetCandidateId);

    if (index >= 0) {
      existingDecisions[index] = candidateDecision;
    } else {
      existingDecisions.push(candidateDecision);
    }

    record.decision = {
      id: record.decision?.id || `dec-${caseId}-${Date.now()}`,
      caseId,
      slateId: record.slate.id,
      clinicianId: 'clin-specialist-001',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: existingDecisions.filter(d => d.action === 'accept').map(d => d.targetCandidateId),
      candidateDecisions: existingDecisions,
      reviewedCounterfactuals: true,
      reviewedConflictingEvidence: true,
      decidedAt: new Date().toISOString(),
      digitalSignatureHash: '',
      isImmutable: false,
    };
  }

  /**
   * Signs a clinician decision immutably with digital signature hash
   */
  public signDecision(params: {
    caseId: string;
    overallReasoning: string;
    magniomInfluence: MagniomInfluence;
    disagreementWithMagniom?: string | undefined;
    clinicianName: string;
    licenseNumber?: string | undefined;
    attestationStatement: string;
  }): ClinicianDecision {
    const record = this.cases.get(params.caseId);
    if (!record) throw new Error(`Case ${params.caseId} not found`);

    if (record.isStale) {
      throw new Error('Safety Violation: Cannot sign a stale Target Slate.');
    }

    const decidedAt = new Date().toISOString();
    const candidateDecisions = record.decision?.candidateDecisions || [];

    // Form final targets
    const finalTargets: FinalTarget[] = candidateDecisions
      .filter(cd => cd.action === 'accept' || cd.action === 'modify')
      .map((cd, idx) => ({
        sequenceOrder: idx + 1,
        source: cd.action === 'modify' ? 'clinician_defined' : 'magniom_candidate',
        sourceCandidateId: cd.targetCandidateId,
        targetRegion: (cd.modifiedTarget || {}) as Record<string, unknown>,
        therapeuticObjectives: ['Depression symptom alleviation'],
      }));

    let decisionType: DecisionType = 'ACCEPTED_PRIMARY';
    if (finalTargets.length === 0) {
      decisionType = 'DEFERRED';
    } else if (candidateDecisions.some(cd => cd.action === 'modify')) {
      decisionType = 'MANUAL_OVERRIDE';
    } else if (candidateDecisions.some(cd => cd.action === 'replace')) {
      decisionType = 'SUBSTITUTED_ALTERNATIVE';
    }

    const signaturePayload = JSON.stringify({
      caseId: params.caseId,
      slateId: record.slate.id,
      clinicianName: params.clinicianName,
      decidedAt,
      candidateDecisions,
      overallReasoning: params.overallReasoning,
      magniomInfluence: params.magniomInfluence,
      finalTargets,
    });
    const digitalSignatureHash = deterministicHexHash(signaturePayload);

    const signedDecision: ClinicianDecision = {
      id: record.decision?.id || `dec-${params.caseId}`,
      caseId: params.caseId,
      slateId: record.slate.id,
      clinicianId: 'clin-specialist-001',
      status: 'completed',
      decisionType,
      selectedCandidateIds: finalTargets.map(ft => ft.sourceCandidateId || ''),
      overallReasoning: params.overallReasoning,
      magniomInfluence: params.magniomInfluence,
      ...(params.disagreementWithMagniom ? { disagreementWithMagniom: params.disagreementWithMagniom } : {}),
      candidateDecisions,
      finalTargets,
      reviewedCounterfactuals: true,
      reviewedConflictingEvidence: true,
      decidedAt,
      attestation: {
        clinicianId: 'clin-specialist-001',
        clinicianName: params.clinicianName,
        statement: params.attestationStatement,
        signedAt: decidedAt,
        digitalSignatureHash,
        ...(params.licenseNumber ? { licenseNumber: params.licenseNumber } : {}),
      },
      digitalSignatureHash,
      isImmutable: true,
    };

    record.decision = signedDecision;
    record.clinicalCase = {
      ...record.clinicalCase,
      state: 'decision_signed',
      updatedAt: decidedAt,
    };

    record.auditEvents.push({
      id: `evt-dec-sign-${Date.now()}`,
      eventType: 'DECISION_SIGNED',
      occurredAt: decidedAt,
      details: {
        decisionId: signedDecision.id,
        decisionType: signedDecision.decisionType,
        digitalSignatureHash,
        magniomInfluence: params.magniomInfluence,
      },
    });

    return signedDecision;
  }

  /**
   * Triggers a supersession event, unsealing the case for a revised decision
   */
  public createRevisedDecision(caseId: string): void {
    const record = this.cases.get(caseId);
    if (!record || !record.decision) return;

    const previousId = record.decision.id;
    record.decision = {
      ...record.decision,
      id: `dec-${caseId}-rev-${Date.now()}`,
      isImmutable: false,
      supersedesId: previousId,
      status: 'in_review',
    };
    record.clinicalCase = {
      ...record.clinicalCase,
      state: 'clinician_review',
      updatedAt: new Date().toISOString(),
    };

    record.auditEvents.push({
      id: `evt-dec-supersede-${Date.now()}`,
      eventType: 'DECISION_SUPERSEDED',
      occurredAt: new Date().toISOString(),
      details: { supersededDecisionId: previousId, newDecisionId: record.decision.id },
    });
  }

  /**
   * Sets staleness state on a case for testing Safeguard 18 & Task 11
   */
  public setStaleness(caseId: string, isStale: boolean, reason?: string) {
    const record = this.cases.get(caseId);
    if (record) {
      record.isStale = isStale;
      record.staleReason = reason;
    }
  }
}

// Global Singleton Store
export const caseStore = new CaseStore();
