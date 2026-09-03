/**
 * @magniom/target-engine - Plugin SDK: Indication Targeting Plugin Contract
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§33-34)
 */

import type {
  IndicationTargetingPluginManifest,
  ComparisonDomainDefinition,
  RefinementProfileDefinition,
  SlateAssemblyProfileDefinition,
  ResolvedTargetEngineContextV2,
  ModuleContextValidation,
  ScientificFeatureValue,
  CandidateDraft,
} from '@magniom/domain';
import type { CandidateGenerator } from './generator.js';

export interface CandidateFeatureProvider {
  readonly code: string;
  readonly semanticVersion: string;
  extractFeatures(
    candidate: CandidateDraft,
    context: ResolvedTargetEngineContextV2,
  ): readonly ScientificFeatureValue[];
}

export interface IndicationTargetingPlugin {
  readonly manifest: IndicationTargetingPluginManifest;
  generators(): readonly CandidateGenerator[];
  featureProviders(): readonly CandidateFeatureProvider[];
  comparisonProfiles(): readonly ComparisonDomainDefinition[];
  refinementProfiles(): readonly RefinementProfileDefinition[];
  slateProfile(): SlateAssemblyProfileDefinition;
  validateModuleContext(context: ResolvedTargetEngineContextV2): ModuleContextValidation;
}
