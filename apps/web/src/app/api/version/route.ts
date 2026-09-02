/**
 * CANONICAL RELEASE VERSION ENDPOINT (/api/version)
 * Aligned with MAGNIOM-Enterprise Verification, Testing CI/CD Specification v1.0 (Sections 162, 206)
 *
 * Exposes canonical release identity, cryptographic digests, subsystem versions, and fail-closed state.
 */

import { NextResponse } from 'next/server';
import { ScientificVersionGuard } from '@/lib/security/scientific-version-guard';

export async function GET() {
  const versionStatus = ScientificVersionGuard.verifyRuntimeIntegrity();

  return NextResponse.json({
    system: 'Magniom Decision Support Platform',
    status: versionStatus.integrityPassed ? 'healthy' : 'degraded_integrity_fail_closed',
    releaseId: versionStatus.releaseId,
    mode: versionStatus.systemMode,
    failClosedActive: versionStatus.failClosedActive,
    manifestTimestamp: versionStatus.manifestTimestamp,
    subsystems: versionStatus.subsystemChecks.map((s) => ({
      name: s.subsystem,
      verified: s.matched,
      digest: s.actualHash,
    })),
    capabilities: {
      historicalReviewAllowed: true,
      clinicalTargetGenerationAllowed: !versionStatus.failClosedActive,
    },
  });
}
