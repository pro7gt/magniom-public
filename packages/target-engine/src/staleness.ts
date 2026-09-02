/**
 * Target Slate & Decision Multi-Dimensional Stale Protection
 * Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Section 78 & SRS MAG-POL-024
 */

import type { StalenessEvaluation } from '@magniom/domain';

export interface StaleCheckOptions {
  readonly caseRecord: {
    readonly id: string;
    readonly currentPhenotypeSnapshotId?: string | undefined;
    readonly currentTargetSlateId?: string | undefined;
    readonly version: number;
    readonly state: string;
  };
  readonly slateRecord: {
    readonly id: string;
    readonly phenotypeSnapshotId: string;
    readonly status: string;
  };
  readonly expectedCaseVersion?: number | undefined;
}

/**
 * Evaluates whether a Target Slate is stale relative to its case, phenotype, and version state.
 */
export function evaluateStaleStatus(options: StaleCheckOptions): StalenessEvaluation {
  const { caseRecord, slateRecord, expectedCaseVersion } = options;

  // 1. Concurrency Version Check
  if (expectedCaseVersion !== undefined && caseRecord.version !== expectedCaseVersion) {
    return {
      isStale: true,
      reason: 'STALE_CASE_VERSION',
    };
  }

  // 2. Phenotype Snapshot Drift Check
  if (
    caseRecord.currentPhenotypeSnapshotId &&
    caseRecord.currentPhenotypeSnapshotId !== slateRecord.phenotypeSnapshotId
  ) {
    return {
      isStale: true,
      reason: 'STALE_PHENOTYPE_SNAPSHOT',
    };
  }

  // 3. Slate Supersession Check
  if (
    caseRecord.currentTargetSlateId &&
    caseRecord.currentTargetSlateId !== slateRecord.id
  ) {
    return {
      isStale: true,
      reason: 'TARGET_SLATE_SUPERSEDED',
    };
  }

  // 4. Slate Status Invalidation Check
  if (slateRecord.status === 'superseded') {
    return {
      isStale: true,
      reason: 'TARGET_SLATE_SUPERSEDED',
    };
  }

  return {
    isStale: false,
    reason: 'CURRENT',
  };
}

/**
 * Checks whether a Target Slate is stale compared to a given Phenotype Snapshot.
 */
export function isSlateStale(
  slate: { phenotypeSnapshotId: string },
  currentPhenotype: { id: string }
): boolean {
  return slate.phenotypeSnapshotId !== currentPhenotype.id;
}
