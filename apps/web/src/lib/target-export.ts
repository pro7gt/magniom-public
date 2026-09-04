/**
 * @magniom/web - Target Export & Neuronavigation Package
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§283–284).
 *
 * Rules:
 * - All exports MUST include full clinical context (Case, target, geometry, coordinate space, scientific source, clinician decision, version).
 * - Neuronavigation export is ONLY available AFTER clinician target selection — not before (§284).
 * - Export does not alter any clinical state.
 */

import type {
  CaseShellViewModel,
  ClinicalActionCapabilities,
} from '@magniom/presentation';
import { emitAuditEvent } from './shell-observability';

// ==========================================
// 1. Export Package Types
// ==========================================

export interface TargetExportPackage {
  readonly exportId: string;
  readonly exportTimestamp: string;
  readonly exportType: 'clinical_decision' | 'neuronavigation' | 'research_report';
  /** Case context */
  readonly caseId: string;
  readonly caseCode: string;
  readonly indicationCode: string;
  readonly indicationFormatted: string;
  readonly patientDisplayLabel: string;
  /** Module context */
  readonly moduleReleaseId: string;
  readonly moduleVersion: string;
  readonly moduleName: string;
  /** Target context */
  readonly selectedTargetId: string;
  readonly selectedTargetName: string;
  readonly selectedCoordinateFormatted: string;
  readonly coordinateSpace: string;
  readonly geometryType: string;
  /** Evidence source */
  readonly evidenceTierLabel: string;
  readonly scientificSource: string;
  /** Decision context */
  readonly decisionId?: string | undefined;
  readonly decisionHash?: string | undefined;
  readonly clinicianName?: string | undefined;
  readonly clinicianDecisionTimestamp?: string | undefined;
  /** Version and provenance */
  readonly softwareBuildId: string;
  readonly releaseDigest: string;
}

// ==========================================
// 2. Export Guard (§284)
// ==========================================

export interface ExportGuardResult {
  readonly canExport: boolean;
  readonly blockedReasons: readonly string[];
}

/**
 * Checks if target candidate is qualified for export (§284).
 */
export function isTargetQualifiedForExport(
  hasSelectedTarget: boolean,
  hasValidCoordinates: boolean,
): boolean {
  return hasSelectedTarget && hasValidCoordinates;
}

/**
 * Validates that neuronavigation export is permitted (§284).
 * Export is ONLY available after clinician target selection.
 */
export function validateNeuronavigationExport(
  shellVm: CaseShellViewModel,
  capabilities: ClinicalActionCapabilities,
  hasSelectedTarget: boolean,
  isDecisionSigned: boolean,
): ExportGuardResult {
  const blockedReasons: string[] = [];

  if (!capabilities.may_export_navigation_target) {
    blockedReasons.push(
      'User does not have authority to export neuronavigation targets in this module context.',
    );
  }

  if (!hasSelectedTarget) {
    blockedReasons.push(
      'No target has been selected by the treating clinician. Neuronavigation export requires an explicit clinician target selection (§284).',
    );
  }

  if (!isDecisionSigned) {
    blockedReasons.push(
      'Clinical decision has not been signed. Neuronavigation export is available only after the treating clinician has signed the target decision.',
    );
  }

  if (shellVm.mode.isResearch) {
    blockedReasons.push(
      'Neuronavigation export is not available in Research Mode. Research targets are hypothesis-generating only.',
    );
  }

  if (shellVm.safetyState === 'FAIL_CLOSED') {
    blockedReasons.push(
      'System is in FAIL CLOSED state. All export operations are locked.',
    );
  }

  if (shellVm.currentness.blockingSignOff) {
    blockedReasons.push(
      'Target Slate is stale. Export is not permitted until the Slate is regenerated and a new decision is signed.',
    );
  }

  return {
    canExport: blockedReasons.length === 0,
    blockedReasons,
  };
}

// ==========================================
// 3. Export Package Builder
// ==========================================

/**
 * Builds a complete export package with all required context (§283).
 */
export function buildTargetExportPackage(
  shellVm: CaseShellViewModel,
  target: {
    id: string;
    name: string;
    coordinateFormatted: string;
    coordinateSpace: string;
    geometryType: string;
    evidenceTierLabel: string;
    scientificSource: string;
  },
  decision?: {
    id: string;
    hash: string;
    clinicianName: string;
    timestamp: string;
  },
): TargetExportPackage {
  const exportId = `EXPORT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const pkg: TargetExportPackage = {
    exportId,
    exportTimestamp: new Date().toISOString(),
    exportType: decision ? 'neuronavigation' : 'research_report',
    caseId: shellVm.caseIdentity.caseId,
    caseCode: shellVm.caseIdentity.caseCode,
    indicationCode: shellVm.indication.indicationCode,
    indicationFormatted: shellVm.indication.indicationFormatted,
    patientDisplayLabel: shellVm.caseIdentity.patientDisplayLabel,
    moduleReleaseId: shellVm.moduleAuthority.moduleReleaseId,
    moduleVersion: shellVm.moduleAuthority.moduleVersion,
    moduleName: shellVm.moduleAuthority.humanReadableName,
    selectedTargetId: target.id,
    selectedTargetName: target.name,
    selectedCoordinateFormatted: target.coordinateFormatted,
    coordinateSpace: target.coordinateSpace,
    geometryType: target.geometryType,
    evidenceTierLabel: target.evidenceTierLabel,
    scientificSource: target.scientificSource,
    decisionId: decision?.id,
    decisionHash: decision?.hash,
    clinicianName: decision?.clinicianName,
    clinicianDecisionTimestamp: decision?.timestamp,
    softwareBuildId: 'MAGNIOM-BUILD-M3-20260902',
    releaseDigest: 'M3-FROZEN',
  };

  // Emit audit event
  emitAuditEvent('NEURONAVIGATION_EXPORTED', {
    message: `Target ${target.name} exported for neuronavigation (${target.coordinateFormatted}).`,
    caseId: shellVm.caseIdentity.caseId,
    caseCode: shellVm.caseIdentity.caseCode,
    indicationCode: shellVm.indication.indicationCode,
    moduleReleaseId: shellVm.moduleAuthority.moduleReleaseId,
    targetCandidateId: target.id,
    decisionId: decision?.id,
    metadata: { exportId, geometryType: target.geometryType },
  });

  return pkg;
}
