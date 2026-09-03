/**
 * @magniom/target-engine - Plugin SDK: Candidate Generator Contract
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§35-41)
 */

import type {
  CandidateGeneratorDescriptor,
  CandidateGeneratorResult,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export interface CandidateGenerator {
  readonly descriptor: CandidateGeneratorDescriptor;
  generate(context: ResolvedTargetEngineContextV2): CandidateGeneratorResult;
}
