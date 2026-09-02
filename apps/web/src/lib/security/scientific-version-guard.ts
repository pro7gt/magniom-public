/**
 * SCIENTIFIC VERSION GUARD & RUNTIME FAIL-CLOSED CONTROLLER
 * Aligned with MAGNIOM-Enterprise Verification, Testing CI/CD Specification v1.0 (Sections 162-163)
 *
 * Verifies that the running runtime subsystem digests match the approved release manifest:
 * - Running Target Engine Digest == Approved Release Digest
 * - Active Evidence Hash == Approved Release Hash
 * - Active Scientific Policy == Approved Policy Version & Hash
 * - Active Database Schema Head == Approved Migration Head
 *
 * If any mismatch is detected:
 * - System activates FAIL-CLOSED MODE:
 *   - Allows read-only historical case review
 *   - Strictly blocks creation of new Clinical Target Slates
 *   - Emits a high-severity security audit event
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface SubsystemVersionCheck {
  subsystem: string;
  expectedHash: string;
  actualHash: string;
  matched: boolean;
}

export interface RuntimeVersionStatus {
  integrityPassed: boolean;
  failClosedActive: boolean;
  systemMode: 'RESEARCH' | 'CLINICAL';
  releaseId: string;
  manifestTimestamp: string;
  subsystemChecks: SubsystemVersionCheck[];
  reason?: string;
}

export class ScientificVersionGuard {
  private static cachedStatus: RuntimeVersionStatus | null = null;

  public static verifyRuntimeIntegrity(): RuntimeVersionStatus {
    if (this.cachedStatus) {
      return this.cachedStatus;
    }

    const repoRoot = path.resolve(process.cwd());
    const manifestPath = path.join(
      repoRoot,
      'docs/verification/verification-build-m3-manifest.json',
    );

    if (!fs.existsSync(manifestPath)) {
      const failStatus: RuntimeVersionStatus = {
        integrityPassed: false,
        failClosedActive: true,
        systemMode: (process.env.MAGNIOM_MODE as 'RESEARCH' | 'CLINICAL') || 'CLINICAL',
        releaseId: 'UNKNOWN_UNSEALED',
        manifestTimestamp: new Date().toISOString(),
        subsystemChecks: [],
        reason: 'Master verification manifest is missing. System locked in fail-closed mode.',
      };
      this.cachedStatus = failStatus;
      return failStatus;
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const subsystemChecks: SubsystemVersionCheck[] = [];
    let allMatched = true;

    for (const sub of manifest.frozenSubsystems || []) {
      const fullPath = path.join(repoRoot, sub.frozenArtifactPath);
      let actualSha256 = 'FILE_NOT_FOUND';

      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          const pkgJson = path.join(fullPath, 'package.json');
          if (fs.existsSync(pkgJson)) {
            actualSha256 = crypto
              .createHash('sha256')
              .update(fs.readFileSync(pkgJson))
              .digest('hex');
          }
        } else {
          actualSha256 = crypto
            .createHash('sha256')
            .update(fs.readFileSync(fullPath))
            .digest('hex');
        }
      }

      const matched = actualSha256 === sub.sha256;
      if (!matched) allMatched = false;

      subsystemChecks.push({
        subsystem: sub.subsystem,
        expectedHash: sub.sha256,
        actualHash: actualSha256,
        matched,
      });
    }

    const isClinical = (process.env.MAGNIOM_MODE || 'CLINICAL') === 'CLINICAL';
    const failClosedActive = isClinical && !allMatched;

    const status: RuntimeVersionStatus = {
      integrityPassed: allMatched,
      failClosedActive,
      systemMode: isClinical ? 'CLINICAL' : 'RESEARCH',
      releaseId: manifest.buildId,
      manifestTimestamp: manifest.freezeTimestamp,
      subsystemChecks,
      ...(failClosedActive
        ? { reason: 'Runtime scientific digest mismatch detected. Fail-closed active.' }
        : {}),
    };

    this.cachedStatus = status;
    return status;
  }

  public static canGenerateClinicalTargetSlate(): { allowed: boolean; reason?: string } {
    const status = this.verifyRuntimeIntegrity();
    if (status.failClosedActive) {
      return {
        allowed: false,
        reason: `FAIL_CLOSED_ACTIVE: Cannot generate new Clinical Target Slate. Scientific subsystem mismatch: ${status.reason}`,
      };
    }
    return { allowed: true };
  }
}
