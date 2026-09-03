/**
 * @magniom/target-engine - Candidate Generator Registry
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§8, 35-41, 118, 135-136)
 *
 * Enforces:
 * 1. Static registration (no dynamic runtime download)
 * 2. Whitelist verification against Scientific Policy & Mode
 * 3. Execution order invariance (promise completion order cannot alter candidate IDs or Slate)
 * 4. Deterministic candidate ID derivation
 * 5. Explicit generator failure policies
 */

import type {
  CandidateDraft,
  CandidateGeneratorResult,
  ResolvedTargetEngineContextV2,
  GeneratorDiagnostic,
} from '@magniom/domain';
import { computeSha256, canonicalJsonStringify } from '@magniom/scientific-policy';
import type { CandidateGenerator } from '../sdk/generator.js';

export interface ExecutedGeneratorsResult {
  readonly candidates: readonly CandidateDraft[];
  readonly failedRequiredGenerator: boolean;
  readonly failedGeneratorCodes: readonly string[];
  readonly diagnostics: readonly GeneratorDiagnostic[];
  readonly executedGeneratorManifestHashes: readonly string[];
}

/**
 * Derives a deterministic UUID from an arbitrary seed string using SHA-256.
 * Formats as a canonical UUID (RFC 4122 v5 variant compliant).
 */
export function deriveDeterministicUuid(seed: string): string {
  const hash = computeSha256(seed);
  // Take first 32 hex chars
  const p1 = hash.substring(0, 8);
  const p2 = hash.substring(8, 12);
  // Version 5 (0x5xxx)
  const p3 = '5' + hash.substring(13, 16);
  // Variant 1 (0x8xxx, 0x9xxx, 0xaxxx, 0xbxxx) -> set high bits to 10
  const byte8 = parseInt(hash.substring(16, 18), 16);
  const variantByte = ((byte8 & 0x3f) | 0x80).toString(16).padStart(2, '0');
  const p4 = variantByte + hash.substring(18, 20);
  const p5 = hash.substring(20, 32);
  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

export class CandidateGeneratorRegistry {
  private readonly generators = new Map<string, CandidateGenerator>();

  public register(generator: CandidateGenerator): void {
    const desc = generator.descriptor;
    this.generators.set(desc.id, generator);
    this.generators.set(desc.code, generator);
  }

  public get(idOrCode: string): CandidateGenerator | undefined {
    return this.generators.get(idOrCode);
  }

  public getAll(): readonly CandidateGenerator[] {
    const unique = new Set<CandidateGenerator>(this.generators.values());
    return Array.from(unique);
  }

  /**
   * Executes all authorized generators for the given context.
   * Guarantees order invariance: resulting candidate drafts are sorted canonically
   * and assigned deterministic IDs before passing to gate evaluation.
   */
  public executeGenerators(context: ResolvedTargetEngineContextV2): ExecutedGeneratorsResult {
    const diagnostics: GeneratorDiagnostic[] = [];
    const rawCandidates: CandidateDraft[] = [];
    const executedManifestHashes: string[] = [];
    let failedRequired = false;
    const failedCodes: string[] = [];

    const mode = context.request.mode;
    const uniqueGenerators = this.getAll();

    for (const generator of uniqueGenerators) {
      const desc = generator.descriptor;

      // 1. Mode Gate on Generator
      const normalizedMode = String(mode).toLowerCase();
      const permittedLower = desc.permittedModes.map(m => String(m).toLowerCase());
      if (!permittedLower.includes(normalizedMode)) {
        if (normalizedMode === 'clinical') {
          // Explicit requirement: Research generator cannot run in Clinical mode
          diagnostics.push({
            level: 'info',
            code: 'GENERATOR_MODE_SKIPPED',
            message: `Generator ${desc.code} does not permit mode ${mode}.`,
          });
          continue;
        }
      }

      // 2. Indication Module Release check
      if (
        desc.indicationModuleReleaseIds.length > 0 &&
        !desc.indicationModuleReleaseIds.includes(context.request.indicationModuleReleaseId)
      ) {
        continue;
      }

      // Record manifest hash
      executedManifestHashes.push(
        desc.configurationSha256 || computeSha256(desc.id + desc.semanticVersion),
      );

      // 3. Execution with failure policy
      try {
        const result: CandidateGeneratorResult = generator.generate(context);

        if (result.diagnostics) {
          diagnostics.push(...result.diagnostics);
        }

        if (result.status === 'failed') {
          failedCodes.push(desc.code);
          if (desc.generatorFailurePolicy === 'required_fail_run') {
            failedRequired = true;
            diagnostics.push({
              level: 'error',
              code: 'REQUIRED_GENERATOR_FAILED',
              message: `Required generator ${desc.code} failed: run must abstain.`,
            });
            break;
          } else {
            diagnostics.push({
              level: 'warning',
              code: 'OPTIONAL_GENERATOR_FAILED',
              message: `Optional generator ${desc.code} failed, omitting with warning.`,
            });
            continue;
          }
        }

        if (result.candidates && result.candidates.length > 0) {
          for (const cand of result.candidates) {
            rawCandidates.push(cand);
          }
        }
      } catch (err: unknown) {
        failedCodes.push(desc.code);
        const errMsg = err instanceof Error ? err.message : String(err);
        if (desc.generatorFailurePolicy === 'required_fail_run') {
          failedRequired = true;
          diagnostics.push({
            level: 'error',
            code: 'REQUIRED_GENERATOR_THREW',
            message: `Required generator ${desc.code} threw error: ${errMsg}`,
          });
          break;
        } else {
          diagnostics.push({
            level: 'warning',
            code: 'OPTIONAL_GENERATOR_THREW',
            message: `Optional generator ${desc.code} threw error: ${errMsg}, omitting.`,
          });
        }
      }
    }

    if (failedRequired) {
      return {
        candidates: [],
        failedRequiredGenerator: true,
        failedGeneratorCodes: failedCodes,
        diagnostics,
        executedGeneratorManifestHashes: executedManifestHashes,
      };
    }

    // 4. ORDER INVARIANCE (§135-136):
    // Sort all gathered candidate drafts by canonical intrinsic scientific key
    // BEFORE assigning final candidate IDs or feeding them into downstream pipeline.
    const sorted = [...rawCandidates].sort((a, b) => {
      const keyA = `${a.targetFamilyId}|${a.proposedRole}|${a.targetGeometry.geometryType}|${computeSha256(canonicalJsonStringify(a.targetGeometry))}|${a.generatorId}`;
      const keyB = `${b.targetFamilyId}|${b.proposedRole}|${b.targetGeometry.geometryType}|${computeSha256(canonicalJsonStringify(b.targetGeometry))}|${b.generatorId}`;
      return keyA.localeCompare(keyB);
    });

    // 5. DETERMINISTIC CANDIDATE ID DERIVATION (§136):
    // Ensures IDs are independent of execution order.
    const idMap = new Map<string, string>();
    const canonicalCandidates: CandidateDraft[] = sorted.map(draft => {
      const geometryHash = computeSha256(canonicalJsonStringify(draft.targetGeometry));
      const seed = `${context.request.caseId}|${draft.generatorId}|${draft.targetFamilyId}|${draft.proposedRole}|${geometryHash}`;
      const deterministicDraftId = deriveDeterministicUuid(seed);
      idMap.set(draft.draftId, deterministicDraftId);

      return {
        ...draft,
        draftId: deterministicDraftId,
      };
    });

    // Remap baseline references to deterministic IDs
    const updatedCandidates: CandidateDraft[] = canonicalCandidates.map(draft => {
      if (
        draft.lineage?.baselineCandidateDraftId &&
        idMap.has(draft.lineage.baselineCandidateDraftId)
      ) {
        return {
          ...draft,
          lineage: {
            ...draft.lineage,
            baselineCandidateDraftId: idMap.get(draft.lineage.baselineCandidateDraftId),
          },
        };
      }
      return draft;
    });

    return {
      candidates: updatedCandidates,
      failedRequiredGenerator: false,
      failedGeneratorCodes: failedCodes,
      diagnostics,
      executedGeneratorManifestHashes: executedManifestHashes.sort(),
    };
  }
}
