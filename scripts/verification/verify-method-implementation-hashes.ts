/**
 * Verifies Method Manifest Evidence IDs and Implementation Hashes
 * Conforms to MAGNIOM Revision 02 Findings 10 & 11 (§10 & §11).
 *
 * Asserts:
 * 1. Every evidenceId in scientific-config/methods/ resolves to a known source in CANONICAL_SOURCES.
 * 2. Every implementationHash matches the exact SHA-256 of the source implementation file.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { CANONICAL_SOURCES } from '../../packages/evidence/src/seeds/sources';

const METHOD_IMPLEMENTATION_MAP: Record<string, string> = {
  FC_CLUSTER_PERSONALISED: 'packages/target-engine/src/algorithms/cash-zalesky-clustering.ts',
  NORMATIVE_PATHWAY_MODEL: 'packages/target-engine/src/algorithms/seguin-pathway-routing.ts',
};

function computeSha256(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function verifyMethodManifests(repoRoot: string = process.cwd()): {
  passed: boolean;
  checkedCount: number;
  errors: string[];
} {
  const methodsDir = path.join(repoRoot, 'scientific-config', 'methods');
  const canonicalSourceIds = new Set(CANONICAL_SOURCES.map(s => s.id));
  const errors: string[] = [];
  let checkedCount = 0;

  if (!fs.existsSync(methodsDir)) {
    return {
      passed: false,
      checkedCount: 0,
      errors: [`Methods directory not found: ${methodsDir}`],
    };
  }

  const methodEntries = fs.readdirSync(methodsDir, { withFileTypes: true });
  for (const entry of methodEntries) {
    if (!entry.isDirectory()) continue;
    const methodId = entry.name;
    const versionDir = path.join(methodsDir, methodId);
    const configFiles = fs.readdirSync(versionDir).filter(f => f.endsWith('.json'));

    for (const cfgFile of configFiles) {
      checkedCount++;
      const fullPath = path.join(versionDir, cfgFile);
      const manifest = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));

      // 1. Verify Evidence IDs
      if (!Array.isArray(manifest.evidenceIds) || manifest.evidenceIds.length === 0) {
        errors.push(`[${methodId}/${cfgFile}] Missing or empty evidenceIds.`);
      } else {
        for (const evId of manifest.evidenceIds) {
          if (!canonicalSourceIds.has(evId)) {
            errors.push(
              `[${methodId}/${cfgFile}] Evidence ID '${evId}' not found in CANONICAL_SOURCES registry.`,
            );
          }
        }
      }

      // 2. Verify Implementation Status & Hash
      if (manifest.implementationStatus === 'not_implemented') {
        if (manifest.implementationHash !== undefined && manifest.implementationHash !== null) {
          errors.push(
            `[${methodId}/${cfgFile}] Method marked as not_implemented must not have an implementationHash.`,
          );
        }
        continue;
      }

      const relImplPath = METHOD_IMPLEMENTATION_MAP[methodId];
      if (!relImplPath) {
        errors.push(
          `[${methodId}/${cfgFile}] No implementation mapping registered for method '${methodId}'.`,
        );
        continue;
      }

      const fullImplPath = path.join(repoRoot, relImplPath);
      if (!fs.existsSync(fullImplPath)) {
        errors.push(`[${methodId}/${cfgFile}] Implementation file not found: ${fullImplPath}`);
        continue;
      }

      const actualHash = computeSha256(fullImplPath);
      if (manifest.implementationHash !== actualHash) {
        errors.push(
          `[${methodId}/${cfgFile}] Implementation hash mismatch: manifest='${manifest.implementationHash}', actual='${actualHash}' (${relImplPath})`,
        );
      }
    }
  }

  return {
    passed: errors.length === 0,
    checkedCount,
    errors,
  };
}

if (require.main === module) {
  console.log('--- Verifying Method Manifests and Implementation Hashes ---');
  const res = verifyMethodManifests();
  console.log(`Checked ${res.checkedCount} method manifests.`);
  if (res.passed) {
    console.log('✅ ALL METHOD MANIFESTS, EVIDENCE IDS, AND IMPLEMENTATION HASHES MATCH EXACTLY.');
    process.exit(0);
  } else {
    console.error('❌ VALIDATION FAILED:');
    for (const err of res.errors) {
      console.error(` - ${err}`);
    }
    process.exit(1);
  }
}
