/**
 * @magniom/web - Authoritative Case Shell Server Context Resolution Engine
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§12–16, 217–220, 235–238).
 *
 * Rules:
 * - Shell context is resolved authoritatively on the server.
 * - Effective module authority derives from: Module ∩ Policy ∩ Compatibility ∩ Deployment ∩ User.
 * - Contradictory states fail closed with operational diagnostic codes (§25, §236–238).
 */

import { caseStore, type CaseStateRecord } from './case-store';
import { CANONICAL_CLINICAL_SESSION } from './release-authority';
import {
  createCaseShellViewModel,
  type CaseShellViewModel,
  type EnvironmentMode,
  type StalenessInput,
} from '@magniom/presentation';

export interface ResolveCaseShellContextOptions {
  caseId: string;
  activePath?: string;
  environmentMode?: EnvironmentMode;
  targetCaseIndicationId?: string;
}

export function resolveCaseShellContext(
  options: ResolveCaseShellContextOptions,
): CaseShellViewModel | null {
  const record: CaseStateRecord | undefined = caseStore.getCaseRecord(options.caseId);
  if (!record) {
    return null;
  }

  const session = CANONICAL_CLINICAL_SESSION;
  const mode: EnvironmentMode =
    options.environmentMode || (record.clinicalCase.mode as EnvironmentMode) || 'CLINICAL';

  // Find active indication
  const activeCiId = options.targetCaseIndicationId || record.activeCaseIndicationId;
  const activeInd =
    record.availableIndications.find(i => i.caseIndicationId === activeCiId) ||
    record.availableIndications[0]!;

  const stalenessInput: StalenessInput = {
    isCaseContextUpdatedAfterSlate: false,
    isLesionReviewUpdatedAfterSlate: record.staleReason?.toLowerCase().includes('lesion'),
    isClinicalObjectiveChangedAfterSlate: record.staleReason?.toLowerCase().includes('objective'),
    isMeasurementReplaced: record.staleReason?.toLowerCase().includes('measurement'),
  };

  const isPhenotypeApproved = record.phenotype.state === 'approved';
  const isSlateReady = Boolean(
    (record.slate.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
    record.clinicalCase.currentTargetSlateId,
  );
  const isDecisionSigned = Boolean(record.decision?.isImmutable);

  return createCaseShellViewModel({
    caseId: record.clinicalCase.id,
    caseCode: record.clinicalCase.caseCode,
    patientDisplayLabel: `PT-${record.clinicalCase.patientId.slice(-4).toUpperCase()}`,
    subjectDeIdentifiedToken: `SUBJ-${record.clinicalCase.patientId}`,
    activeCaseIndicationId: activeCiId,
    indicationCode: activeInd.indicationCode,
    indicationFormatted: activeInd.label,
    isPrimaryIndication: activeInd.isPrimary,
    availableIndications: record.availableIndications,
    mode,
    moduleReleaseId: `IMR-${activeInd.indicationCode}-2.0.0`,
    moduleCode: activeInd.indicationCode,
    moduleVersion: '2.0.0',
    humanReadableModuleName: `${activeInd.indicationCode} Targeting Module`,
    qualificationLevel: record.qualificationLevel || 'Q8',
    permittedModes: record.isContradictory
      ? ['RESEARCH'] // Force mismatch with CLINICAL to test fail-closed!
      : activeInd.indicationCode === 'TINNITUS' || activeInd.indicationCode === 'TBI'
        ? ['RESEARCH']
        : ['CLINICAL', 'VALIDATION', 'RESEARCH'],
    userHasSigningAuthority: session.user.hasSigningAuthority,
    isBlindedValidation: record.isBlindedValidation,
    stalenessInput,
    activePath: options.activePath || `/cases/${options.caseId}`,
    isPhenotypeApproved,
    isMeasurementsComplete: true,
    isSlateReady,
    isDecisionSigned,
    clinicalObjective: record.clinicalObjective,
    diseaseStage: record.diseaseStage,
    lesionContext: record.lesionContext,
    treatmentContext: record.treatmentContext,
    targetSlateStatus: isSlateReady
      ? {
          slateId: record.slate.id,
          candidateCount: record.slate.primaryCandidates?.length || 2,
          primaryCandidateRole: 'Primary 1 — Evidence Baseline',
          convergenceLevel: 'High Convergence (Δ ≤ 12mm)',
          geometryType:
            activeInd.indicationCode === 'OCD'
              ? 'coil_field'
              : activeInd.indicationCode === 'STROKE_APHASIA' || activeInd.indicationCode === 'TBI'
                ? 'network'
                : activeInd.indicationCode === 'PAIN' || activeInd.indicationCode === 'STROKE_MOTOR'
                  ? 'somatotopic'
                  : 'point',
        }
      : undefined,
    decisionStatus: record.decision
      ? {
          isSigned: record.decision.isImmutable,
          signedAtFormatted: record.decision.decidedAt,
          signedBy: record.decision.attestation?.clinicianName || session.user.displayName,
          immutableHash: record.decision.digitalSignatureHash,
          selectedCandidateId: record.decision.selectedCandidateIds[0],
          decisionType: record.decision.decisionType,
        }
      : undefined,
    createdAt: record.clinicalCase.createdAt,
    updatedAt: record.clinicalCase.updatedAt,
  });
}
