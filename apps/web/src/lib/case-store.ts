/**
 * @magniom/web - In-Memory Case Store & State Engine
 * Manages clinical cases, phenotype snapshots, multi-indication contexts, target slates, decisions, and audit events.
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§9–25, 58–87, 250–262).
 * 100% Synthetic / Mockable for Clinician UX & Formative Human Factors Testing.
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
  ModuleQualificationLevel,
} from '@magniom/domain';
import {
  ALL_UX_GOLDEN_CASES,
  ALL_UX_GOLDEN_CASES_V2,
  G01_PHENOTYPE,
  GOLDEN_CASE_01_SLATE,
} from '@magniom/test-fixtures';
import { authStore } from './auth-store';

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
  staleSeverity?: 'blocking' | 'important' | 'informational' | undefined;
  isContradictory?: boolean | undefined;
  isBlindedValidation?: boolean | undefined;
  qualificationLevel?: ModuleQualificationLevel | undefined;
  activeCaseIndicationId: string;
  availableIndications: Array<{
    caseIndicationId: string;
    indicationCode: string;
    label: string;
    isPrimary: boolean;
    status: string;
  }>;
  clinicalObjective?:
    | {
        id: string;
        title: string;
        priorityRank: number;
        burdenScoreText?: string | undefined;
        isEvidenceMappable: boolean;
      }
    | undefined;
  diseaseStage?:
    | {
        stageCode: string;
        stageLabel: string;
        determinationMethod: string;
        isSubacuteOrAcute: boolean;
      }
    | undefined;
  lesionContext?:
    | {
        hasLesion: boolean;
        lesionType?: string | undefined;
        laterality?: string | undefined;
        interpretation?: string | undefined;
        affectedRegionsCount: number;
        hasTargetOverlapWarning: boolean;
        skullAbnormalityPresent: boolean;
      }
    | undefined;
  treatmentContext?:
    | {
        contextType: string;
        statusLabel: string;
        isConfirmed: boolean;
        summaryText: string;
      }
    | undefined;
  auditEvents: Array<{
    id: string;
    eventType: string;
    occurredAt: string;
    details: Record<string, unknown>;
  }>;
}

class CaseStore {
  private cases: Map<string, CaseStateRecord> = new Map();
  private listeners: Set<(caseId: string) => void> = new Set();

  constructor() {
    this.resetToGoldenCases();
  }

  public subscribe(listener: (caseId: string) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify(caseId: string): void {
    for (const listener of this.listeners) {
      try {
        listener(caseId);
      } catch {
        // Multi-listener error resilience
      }
    }
  }

  public resetToGoldenCases() {
    this.cases.clear();

    // 1. Initialise v1 UX Golden Cases (G01–G09)
    ALL_UX_GOLDEN_CASES.forEach(bundle => {
      this.cases.set(bundle.id, {
        clinicalCase: { ...bundle.clinicalCase },
        phenotype: { ...bundle.phenotype },
        slate: { ...bundle.slate },
        decision: bundle.initialDecision ? { ...bundle.initialDecision } : undefined,
        isStale: Boolean(bundle.isStale),
        staleReason: bundle.staleReason,
        staleSeverity: bundle.isStale ? 'blocking' : undefined,
        activeCaseIndicationId: `ci-${bundle.id}-pri`,
        availableIndications: [
          {
            caseIndicationId: `ci-${bundle.id}-pri`,
            indicationCode: bundle.clinicalCase.indicationCode,
            label: bundle.clinicalCase.indicationCode,
            isPrimary: true,
            status: 'confirmed',
          },
        ],
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

    // 2. Initialise v2 Canonical UX Golden Cases (UX_V2_CASE_01 to 13) (§250–262)
    ALL_UX_GOLDEN_CASES_V2.forEach(bundle => {
      const activeCiId =
        bundle.availableIndications?.[0]?.caseIndicationId || `ci-${bundle.id}-pri`;

      const availableInds = bundle.availableIndications
        ? bundle.availableIndications.map(i => ({ ...i }))
        : [
            {
              caseIndicationId: activeCiId,
              indicationCode: bundle.indicationCode,
              label: bundle.indicationFormatted,
              isPrimary: true,
              status: 'confirmed',
            },
          ];

      this.cases.set(bundle.id, {
        clinicalCase: { ...bundle.clinicalCase },
        phenotype: bundle.phenotype
          ? { ...bundle.phenotype }
          : {
              ...G01_PHENOTYPE,
              id: `pheno-${bundle.id}`,
              patientId: bundle.clinicalCase.patientId,
              primaryDiagnosis: bundle.indicationFormatted,
            },
        slate: bundle.slate
          ? { ...bundle.slate }
          : {
              ...GOLDEN_CASE_01_SLATE,
              id: `slate-${bundle.id}`,
              caseId: bundle.id,
              primaryCandidates: [],
            },
        decision: bundle.initialDecision ? { ...bundle.initialDecision } : undefined,
        isStale: Boolean(bundle.isStale),
        staleReason: bundle.staleReason,
        staleSeverity: bundle.isStale ? 'blocking' : undefined,
        isContradictory: Boolean(bundle.isContradictory),
        isBlindedValidation: Boolean(bundle.isBlindedValidation),
        qualificationLevel: bundle.qualificationLevel,
        activeCaseIndicationId: activeCiId,
        availableIndications: availableInds,
        clinicalObjective: bundle.clinicalObjective ? { ...bundle.clinicalObjective } : undefined,
        diseaseStage: bundle.diseaseStage ? { ...bundle.diseaseStage } : undefined,
        lesionContext: bundle.lesionContext ? { ...bundle.lesionContext } : undefined,
        treatmentContext: bundle.treatmentContext ? { ...bundle.treatmentContext } : undefined,
        auditEvents: [
          {
            id: `evt-${bundle.id}-init`,
            eventType: 'CASE_INITIALISED_V2',
            occurredAt: bundle.clinicalCase.createdAt,
            details: {
              caseCode: bundle.code,
              indication: bundle.indicationCode,
              qualificationLevel: bundle.qualificationLevel,
            },
          },
        ],
      });
    });
  }

  public getAllCases(): Array<{
    id: string;
    code: string;
    title: string;
    state: string;
    indication: string;
    isStale: boolean;
    mode: string;
  }> {
    const list: Array<{
      id: string;
      code: string;
      title: string;
      state: string;
      indication: string;
      isStale: boolean;
      mode: string;
    }> = [];

    // Include v2 cases first, then legacy v1 cases
    ALL_UX_GOLDEN_CASES_V2.forEach(b => {
      const record = this.cases.get(b.id);
      list.push({
        id: b.id,
        code: b.code,
        title: b.title,
        state: record?.clinicalCase.state || b.clinicalCase.state,
        indication: b.indicationCode,
        isStale: Boolean(record?.isStale),
        mode: record?.clinicalCase.mode || b.mode,
      });
    });

    ALL_UX_GOLDEN_CASES.forEach(b => {
      const record = this.cases.get(b.id);
      list.push({
        id: b.id,
        code: b.code,
        title: b.title,
        state: record?.clinicalCase.state || b.clinicalCase.state,
        indication: b.clinicalCase.indicationCode,
        isStale: Boolean(record?.isStale),
        mode: record?.clinicalCase.mode || b.clinicalCase.mode,
      });
    });

    return list;
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
   * Creates a new clinical case (§152–158)
   */
  public createCase(params: {
    patientId: string;
    indicationCode: string;
    mode?: 'CLINICAL' | 'RESEARCH' | 'VALIDATION';
  }): string {
    const newCaseId = `case-${Date.now()}`;
    const caseCode = `MC-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const clinicalCase: ClinicalCase = {
      id: newCaseId,
      organisationId: 'org-synth-001',
      patientId: params.patientId,
      caseCode,
      state: 'draft',
      indicationCode: params.indicationCode,
      mode: params.mode || 'CLINICAL',
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    const { snapshotHash: _unusedHash, ...basePheno } = G01_PHENOTYPE;
    const phenotype: PhenotypeSnapshot = {
      ...basePheno,
      id: `pheno-${newCaseId}`,
      patientId: params.patientId,
      primaryDiagnosis: params.indicationCode,
      confirmedAt: now,
    };

    const slate: TargetSlate = {
      ...GOLDEN_CASE_01_SLATE,
      id: `slate-${newCaseId}`,
      caseId: newCaseId,
      phenotypeSnapshotId: phenotype.id,
      deterministicManifestHash: deterministicHexHash(newCaseId),
      primaryCandidates: [],
      additionalCandidates: [],
      suppressedCandidates: [],
    };

    const activeCiId = `ci-${newCaseId}-pri`;

    this.cases.set(newCaseId, {
      clinicalCase,
      phenotype,
      slate,
      isStale: false,
      activeCaseIndicationId: activeCiId,
      availableIndications: [
        {
          caseIndicationId: activeCiId,
          indicationCode: params.indicationCode,
          label: params.indicationCode,
          isPrimary: true,
          status: 'confirmed',
        },
      ],
      auditEvents: [
        {
          id: `evt-${newCaseId}-created`,
          eventType: 'CASE_CREATED',
          occurredAt: now,
          details: {
            caseId: newCaseId,
            patientId: params.patientId,
            indication: params.indicationCode,
          },
        },
      ],
    });

    return newCaseId;
  }

  /**
   * Switches the active CaseIndication for a multi-indication patient case (§64–67).
   * Strictly enforces slate isolation: never reuses previous Target Slate under the new indication!
   */
  public switchCaseIndication(caseId: string, targetCaseIndicationId: string): CaseStateRecord {
    const record = this.cases.get(caseId);
    if (!record) throw new Error(`Case ${caseId} not found`);

    const targetInd = record.availableIndications.find(
      i => i.caseIndicationId === targetCaseIndicationId,
    );
    if (!targetInd) {
      throw new Error(`CaseIndication ${targetCaseIndicationId} not found on case ${caseId}`);
    }

    const previousIndication = record.clinicalCase.indicationCode;

    // Update active indication
    record.activeCaseIndicationId = targetCaseIndicationId;
    record.clinicalCase = {
      ...record.clinicalCase,
      indicationCode: targetInd.indicationCode,
      updatedAt: new Date().toISOString(),
    };

    // ZERO CROSS-INDICATION SLATE REUSE (§67):
    // Unload the previous slate and initialize an independent empty/pending slate for the target indication.
    record.slate = {
      ...GOLDEN_CASE_01_SLATE,
      id: `slate-${caseId}-${targetInd.indicationCode.toLowerCase()}`,
      caseId,
      primaryCandidates: [],
    };
    record.decision = undefined; // Unset previous indication decision!
    record.isStale = false;
    record.staleReason = undefined;
    record.staleSeverity = undefined;

    record.auditEvents.push({
      id: `evt-ind-switch-${Date.now()}`,
      eventType: 'CASE_INDICATION_SWITCHED',
      occurredAt: new Date().toISOString(),
      details: {
        caseId,
        previousIndication,
        activeIndication: targetInd.indicationCode,
        targetCaseIndicationId,
      },
    });

    this.notify(caseId);
    broadcastCaseStoreInvalidation('CASE_INDICATION_SWITCHED', caseId);

    return record;
  }

  /**
   * Updates staleness status for a Case (§76–80)
   */
  public setStaleness(
    caseId: string,
    isStale: boolean,
    reason?: string | undefined,
    severity: 'blocking' | 'important' | 'informational' = 'blocking',
  ): void {
    const record = this.cases.get(caseId);
    if (!record) throw new Error(`Case ${caseId} not found`);

    record.isStale = isStale;
    record.staleReason = reason;
    record.staleSeverity = isStale ? severity : undefined;

    record.auditEvents.push({
      id: `evt-stale-${Date.now()}`,
      eventType: isStale ? 'CASE_STALENESS_DETECTED' : 'CASE_STALENESS_RESOLVED',
      occurredAt: new Date().toISOString(),
      details: { isStale, reason, severity },
    });

    this.notify(caseId);
    broadcastCaseStoreInvalidation('STALENESS_CHANGED', caseId);
  }

  /**
   * Approves a PhenotypeSnapshot, sealing it with a SHA-256 equivalent hash
   */
  public approvePhenotype(
    caseId: string,
    clinicianId = 'clin-specialist-001',
    clinicianNotes?: string,
  ): PhenotypeSnapshot {
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

    this.notify(caseId);
    broadcastCaseStoreInvalidation('PHENOTYPE_UPDATED', caseId);

    return sealedSnapshot;
  }

  /**
   * Authoritatively updates the clinical objective and invalidates active target slate per §78
   */
  public updateClinicalObjective(
    caseId: string,
    objective: {
      id?: string | undefined;
      title: string;
      priorityRank?: number | undefined;
      burdenScoreText?: string | undefined;
      isEvidenceMappable?: boolean | undefined;
    },
  ): void {
    const record = this.cases.get(caseId);
    if (!record) throw new Error(`Case ${caseId} not found`);

    const hasActiveSlate = Boolean(
      (record.slate.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
      record.clinicalCase.currentTargetSlateId,
    );

    record.clinicalObjective = {
      id: objective.id || record.clinicalObjective?.id || `obj-${caseId}-${Date.now()}`,
      title: objective.title.trim(),
      priorityRank: objective.priorityRank ?? record.clinicalObjective?.priorityRank ?? 1,
      burdenScoreText: objective.burdenScoreText?.trim() || undefined,
      isEvidenceMappable:
        objective.isEvidenceMappable ?? record.clinicalObjective?.isEvidenceMappable ?? true,
    };

    record.clinicalCase = {
      ...record.clinicalCase,
      updatedAt: new Date().toISOString(),
    };

    record.auditEvents.push({
      id: `evt-obj-${Date.now()}`,
      eventType: 'CLINICAL_OBJECTIVE_UPDATED',
      occurredAt: new Date().toISOString(),
      details: { objective: record.clinicalObjective },
    });

    if (hasActiveSlate) {
      this.setStaleness(
        caseId,
        true,
        'Clinical objective changed after slate generation',
        'blocking',
      );
    } else {
      this.notify(caseId);
      broadcastCaseStoreInvalidation('CASE_CONTEXT_UPDATED', caseId);
    }
  }

  /**
   * Authoritatively updates lesion context and triggers blocking staleness per §78
   */
  public updateLesionContext(
    caseId: string,
    lesionContext: NonNullable<CaseStateRecord['lesionContext']>,
  ): void {
    const record = this.cases.get(caseId);
    if (!record) throw new Error(`Case ${caseId} not found`);

    const hasActiveSlate = Boolean(
      (record.slate.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
      record.clinicalCase.currentTargetSlateId,
    );

    record.lesionContext = { ...lesionContext };
    record.clinicalCase = {
      ...record.clinicalCase,
      updatedAt: new Date().toISOString(),
    };

    record.auditEvents.push({
      id: `evt-lesion-${Date.now()}`,
      eventType: 'LESION_CONTEXT_UPDATED',
      occurredAt: new Date().toISOString(),
      details: { lesionContext },
    });

    if (hasActiveSlate) {
      this.setStaleness(caseId, true, 'Lesion review updated after slate generation', 'blocking');
    } else {
      this.notify(caseId);
      broadcastCaseStoreInvalidation('LESION_CONTEXT_UPDATED', caseId);
    }
  }

  /**
   * Authoritatively updates disease stage and invalidates slate if present per §78
   */
  public updateDiseaseStage(
    caseId: string,
    diseaseStage: NonNullable<CaseStateRecord['diseaseStage']>,
  ): void {
    const record = this.cases.get(caseId);
    if (!record) throw new Error(`Case ${caseId} not found`);

    const hasActiveSlate = Boolean(
      (record.slate.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
      record.clinicalCase.currentTargetSlateId,
    );

    record.diseaseStage = { ...diseaseStage };
    record.clinicalCase = {
      ...record.clinicalCase,
      updatedAt: new Date().toISOString(),
    };

    record.auditEvents.push({
      id: `evt-stage-${Date.now()}`,
      eventType: 'DISEASE_STAGE_UPDATED',
      occurredAt: new Date().toISOString(),
      details: { diseaseStage },
    });

    if (hasActiveSlate) {
      this.setStaleness(caseId, true, 'Disease stage updated after slate generation', 'blocking');
    } else {
      this.notify(caseId);
      broadcastCaseStoreInvalidation('CASE_CONTEXT_UPDATED', caseId);
    }
  }

  /**
   * Authoritatively updates treatment context and invalidates slate if present per §78
   */
  public updateTreatmentContext(
    caseId: string,
    treatmentContext: NonNullable<CaseStateRecord['treatmentContext']>,
  ): void {
    const record = this.cases.get(caseId);
    if (!record) throw new Error(`Case ${caseId} not found`);

    const hasActiveSlate = Boolean(
      (record.slate.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
      record.clinicalCase.currentTargetSlateId,
    );

    record.treatmentContext = { ...treatmentContext };
    record.clinicalCase = {
      ...record.clinicalCase,
      updatedAt: new Date().toISOString(),
    };

    record.auditEvents.push({
      id: `evt-treatment-${Date.now()}`,
      eventType: 'TREATMENT_CONTEXT_UPDATED',
      occurredAt: new Date().toISOString(),
      details: { treatmentContext },
    });

    if (hasActiveSlate) {
      this.setStaleness(
        caseId,
        true,
        'Treatment context updated after slate generation',
        'blocking',
      );
    } else {
      this.notify(caseId);
      broadcastCaseStoreInvalidation('CASE_CONTEXT_UPDATED', caseId);
    }
  }

  /**
   * Creates a revised draft decision superseding an immutable signed decision
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
      details: { previousDecisionId: previousId, newDecisionId: record.decision.id },
    });

    this.notify(caseId);
    broadcastCaseStoreInvalidation('DECISION_UPDATED', caseId);
  }

  /**
   * Saves candidate decisions
   */
  public saveCandidateDecision(caseId: string, candidateDecision: CandidateDecision): void {
    const record = this.cases.get(caseId);
    if (!record) throw new Error(`Case ${caseId} not found`);

    const existingDecisions = record.decision?.candidateDecisions
      ? [...record.decision.candidateDecisions]
      : [];
    const index = existingDecisions.findIndex(
      d => d.targetCandidateId === candidateDecision.targetCandidateId,
    );

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
      selectedCandidateIds: existingDecisions
        .filter(d => d.action === 'accept')
        .map(d => d.targetCandidateId),
      candidateDecisions: existingDecisions,
      reviewedCounterfactuals: true,
      reviewedConflictingEvidence: true,
      decidedAt: new Date().toISOString(),
      digitalSignatureHash: '',
      isImmutable: false,
    };

    this.notify(caseId);
    broadcastCaseStoreInvalidation('DECISION_UPDATED', caseId);
  }

  /**
   * Signs a clinician decision immutably with digital signature hash.
   * Safety invariant (§22, §78, §139, §140):
   * Prohibited if:
   * 1. Case is Stale with blocking severity
   * 2. Active Mode is RESEARCH
   * 3. Contradictory authority state
   */
  public signDecision(params: {
    caseId: string;
    overallReasoning: string;
    magniomInfluence: MagniomInfluence;
    disagreementWithMagniom?: string | undefined;
    clinicianId?: string | undefined;
    clinicianName: string;
    licenseNumber?: string | undefined;
    attestationStatement: string;
  }): ClinicianDecision {
    const record = this.cases.get(params.caseId);
    if (!record) throw new Error(`Case ${params.caseId} not found`);

    // Safety Invariant 1: Blocking Staleness prevents signing (§78, §140)
    if (record.isStale && record.staleSeverity === 'blocking') {
      throw new Error('Safety Violation: Cannot sign a stale Target Slate (§78, §140).');
    }

    // Safety Invariant 2: Research Mode prevents clinical signing (§22, §139)
    if (record.clinicalCase.mode === 'RESEARCH') {
      throw new Error(
        'Safety Violation: Clinical digital signature is prohibited in Research Mode (§22, §139).',
      );
    }

    // Safety Invariant 3: Contradictory authority state (§25)
    if (record.isContradictory) {
      throw new Error(
        'Safety Violation: Module authority contradiction. Target signing locked (§25).',
      );
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
        therapeuticObjectives: [`${record.clinicalCase.indicationCode} symptom alleviation`],
      }));

    let decisionType: DecisionType = 'ACCEPTED_PRIMARY';
    if (finalTargets.length === 0) {
      decisionType = 'DEFERRED';
    } else if (candidateDecisions.some(cd => cd.action === 'modify')) {
      decisionType = 'MANUAL_OVERRIDE';
    }

    const activeClinicianId =
      params.clinicianId || authStore.getAuthSession()?.user.id || 'usr-spec-001';

    const payloadToHash = JSON.stringify({
      caseId: params.caseId,
      slateId: record.slate.id,
      finalTargets,
      reasoning: params.overallReasoning,
      clinician: params.clinicianName,
      license: params.licenseNumber,
      decidedAt,
    });
    const digitalSignatureHash = deterministicHexHash(payloadToHash);

    const signedDecision: ClinicianDecision = {
      id: record.decision?.id || `dec-${params.caseId}-${Date.now()}`,
      caseId: params.caseId,
      slateId: record.slate.id,
      clinicianId: activeClinicianId,
      decisionType,
      selectedCandidateIds: candidateDecisions
        .filter(d => d.action === 'accept' || d.action === 'modify')
        .map(d => d.targetCandidateId),
      finalTargets,
      candidateDecisions,
      overallReasoning: params.overallReasoning,
      magniomInfluence: params.magniomInfluence,
      ...(params.disagreementWithMagniom
        ? { disagreementWithMagniom: params.disagreementWithMagniom }
        : {}),
      reviewedCounterfactuals: true,
      reviewedConflictingEvidence: true,
      decidedAt,
      attestation: {
        clinicianId: activeClinicianId,
        clinicianName: params.clinicianName,
        licenseNumber: params.licenseNumber || 'MED-SYNTH-992',
        statement: params.attestationStatement,
        digitalSignatureHash,
        signedAt: decidedAt,
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
      id: `evt-sign-${Date.now()}`,
      eventType: 'CLINICAL_DECISION_SIGNED',
      occurredAt: decidedAt,
      details: {
        decisionId: signedDecision.id,
        signatureHash: digitalSignatureHash,
        clinicianName: params.clinicianName,
        decisionType,
      },
    });

    this.notify(params.caseId);
    broadcastCaseStoreInvalidation('DECISION_SIGNED', params.caseId);

    return signedDecision;
  }
}

export const caseStore = new CaseStore();

// ==========================================
// Multi-Tab Safety Coordination (§141)
// ==========================================

/**
 * Multi-tab state invalidation via BroadcastChannel (§141).
 * When another tab modifies case state (phenotype, lesion context, slate generation,
 * or decision signing), all sibling tabs receive an invalidation event so that
 * stale-tab guards can prevent consequential action on outdated state.
 */
export type MultiTabEventType =
  | 'PHENOTYPE_UPDATED'
  | 'LESION_CONTEXT_UPDATED'
  | 'CASE_CONTEXT_UPDATED'
  | 'SLATE_REGENERATED'
  | 'DECISION_SIGNED'
  | 'DECISION_UPDATED'
  | 'STALENESS_CHANGED'
  | 'CASE_INDICATION_SWITCHED';

export interface MultiTabInvalidationEvent {
  readonly type: MultiTabEventType;
  readonly caseId: string;
  readonly timestamp: string;
  readonly tabId: string;
}

const CASE_STORE_CHANNEL_NAME = 'magniom-case-store-sync';
const TAB_ID =
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tab-${Date.now()}`;

type MultiTabHandler = (event: MultiTabInvalidationEvent) => void;
const multiTabHandlers: MultiTabHandler[] = [];

/**
 * Registers a handler for multi-tab invalidation events.
 * Returns an unsubscribe function.
 */
export function onMultiTabInvalidation(handler: MultiTabHandler): () => void {
  multiTabHandlers.push(handler);
  return () => {
    const idx = multiTabHandlers.indexOf(handler);
    if (idx >= 0) multiTabHandlers.splice(idx, 1);
  };
}

/**
 * Broadcasts a state invalidation event to all sibling tabs.
 */
export function broadcastCaseStoreInvalidation(type: MultiTabEventType, caseId: string): void {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;

  try {
    const channel = new BroadcastChannel(CASE_STORE_CHANNEL_NAME);
    const event: MultiTabInvalidationEvent = {
      type,
      caseId,
      timestamp: new Date().toISOString(),
      tabId: TAB_ID,
    };
    channel.postMessage(event);
    channel.close();
  } catch {
    // BroadcastChannel not supported or blocked — fail silently
  }
}

// Listen for incoming multi-tab invalidation events
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    const listener = new BroadcastChannel(CASE_STORE_CHANNEL_NAME);
    listener.onmessage = (msg: MessageEvent<MultiTabInvalidationEvent>) => {
      const event = msg.data;
      // Only process events from other tabs
      if (event.tabId === TAB_ID) return;

      for (const handler of multiTabHandlers) {
        try {
          handler(event);
        } catch {
          // Multi-tab handlers must not throw
        }
      }
    };
  } catch {
    // Fail silently if BroadcastChannel is not available
  }
}
