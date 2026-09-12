/**
 * @magniom/schemas - Triple-Network Systems Layer Schemas
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§6-45, 51, 65-72)
 * and MAGNIOM Multi-Indication Technical & Scientific Architecture Specification v2.1 (§17-20)
 */

import { z } from 'zod';
import type { TripleNetworkProfile } from '@magniom/domain';
import { CommonProvenanceSchema } from './schemas.js';

export const NetworkSystemCodeSchema = z.enum(['CEN', 'DMN', 'SN']);

export const NetworkSystemStatusSchema = z.enum(['active', 'deprecated', 'research_only']);

export const NetworkSystemSchema = z.object({
  id: z.string().uuid(),
  code: NetworkSystemCodeSchema,
  name: z.string().min(1),
  description: z.string(),
  definition_id: z.string().uuid(),
  version: z.string().min(1),
  status: NetworkSystemStatusSchema,
  provenance: CommonProvenanceSchema.optional(),
});

export const NetworkDefinitionStatusSchema = z.enum(['validated', 'provisional', 'research']);

export const NetworkDefinitionSchema = z.object({
  id: z.string().uuid(),
  network_system_id: z.string().uuid(),
  version: z.string().min(1),
  atlas_id: z.string().min(1),
  atlas_version: z.string().min(1),
  parcel_ids: z.array(z.string().min(1)),
  membership_method: z.string().min(1),
  membership_parameters: z.record(z.unknown()),
  source_evidence_claim_ids: z.array(z.string().uuid()),
  definition_hash: z.string().length(64),
  effective_from: z.string().datetime(),
  status: NetworkDefinitionStatusSchema,
  provenance: CommonProvenanceSchema.optional(),
});

export const NetworkNodeSchema = z.object({
  id: z.string().uuid(),
  network_system_id: z.string().uuid(),
  parcel_id: z.string().min(1),
  parcel_name: z.string().min(1),
  hemisphere: z.enum(['L', 'R', 'BILATERAL']),
  canonical_mni_coordinate: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number(),
  }),
  functional_weight: z.number(),
});

export const NetworkRelationshipCodeSchema = z.enum(['CEN_DMN', 'SN_CEN', 'SN_DMN']);

export const NetworkRelationshipDirectionalitySchema = z.enum([
  'undirected',
  'directed',
  'not_applicable',
]);

export const NetworkRelationshipStatusSchema = z.enum(['validated', 'provisional', 'research']);

export const NetworkRelationshipSchema = z.object({
  id: z.string().uuid(),
  network_a_id: z.string().uuid(),
  network_b_id: z.string().uuid(),
  relationship_code: NetworkRelationshipCodeSchema,
  metric_code: z.string().min(1),
  metric_version: z.string().min(1),
  directionality: NetworkRelationshipDirectionalitySchema,
  normative_reference_id: z.string().uuid().optional(),
  evidence_claim_ids: z.array(z.string().uuid()),
  status: NetworkRelationshipStatusSchema,
  provenance: CommonProvenanceSchema.optional(),
});

export const NetworkInterpretationStatusSchema = z.enum([
  'supportive',
  'neutral',
  'contradictory',
  'uncertain',
  'not_interpretable',
]);

export const NetworkInteractionMeasurementSchema = z.object({
  relationship_id: z.string().uuid(),
  relationship_code: NetworkRelationshipCodeSchema,
  metric_code: z.string().min(1),
  raw_value: z.number(),
  normalized_value: z.number().optional(),
  normative_deviation: z.number().optional(),
  unit: z.string().optional(),
  measurement_run_id: z.string().uuid(),
  reliability_profile_id: z.string().uuid(),
  interpretation_status: NetworkInterpretationStatusSchema,
});

export const NetworkMeasurementSchema = z.object({
  network_system_id: z.string().uuid(),
  network_code: NetworkSystemCodeSchema,
  metric_code: z.string().min(1),
  raw_value: z.number(),
  normalized_value: z.number().optional(),
  reliability_score: z.number().optional(),
  interpretation_status: NetworkInterpretationStatusSchema,
});

export const ReliabilityClassificationSchema = z.enum([
  'high',
  'moderate',
  'low',
  'unreliable',
  'not_assessable',
]);

export const NetworkReliabilityComponentSchema = z.object({
  reliability_class: ReliabilityClassificationSchema,
  metric_value: z.number().optional(),
  limiting_factors: z.array(z.string()),
});

export const NetworkOverallReliabilityStatusSchema = z.enum([
  'high',
  'moderate',
  'limited',
  'insufficient',
]);

export const NetworkClinicalQualificationSchema = z.enum([
  'qualified',
  'qualified_with_caution',
  'context_only',
  'research_only',
]);

export const NetworkReliabilityProfileSchema = z.object({
  id: z.string().uuid(),
  acquisition_quality: NetworkReliabilityComponentSchema,
  preprocessing_reliability: NetworkReliabilityComponentSchema,
  within_network_reliability: NetworkReliabilityComponentSchema,
  pairwise_reliability: z.object({
    cen_dmn: NetworkReliabilityComponentSchema,
    sn_cen: NetworkReliabilityComponentSchema,
    sn_dmn: NetworkReliabilityComponentSchema,
  }),
  normative_compatibility: NetworkReliabilityComponentSchema,
  atlas_sensitivity: NetworkReliabilityComponentSchema,
  preprocessing_sensitivity: NetworkReliabilityComponentSchema,
  cross_run_stability: NetworkReliabilityComponentSchema.optional(),
  overall_status: NetworkOverallReliabilityStatusSchema,
  clinical_qualification: NetworkClinicalQualificationSchema,
  provenance: CommonProvenanceSchema.optional(),
});

export const NetworkEvidenceClaimTypeSchema = z.enum([
  'association',
  'phenotype_relationship',
  'circuit_relationship',
  'target_relationship',
  'mechanistic',
  'predictive',
  'causal',
  'safety',
  'negative',
  'conflicting',
]);

export const NetworkEvidenceLevelSchema = z.enum(['A', 'B', 'C', 'D', 'R']);

export const NetworkEvidenceClaimSchema = z.object({
  id: z.string().uuid(),
  evidence_claim_id: z.string().uuid(),
  network_system_ids: z.array(z.string().uuid()),
  relationship_ids: z.array(z.string().uuid()).optional(),
  indication_id: z.string().uuid().optional(),
  clinical_objective_id: z.string().uuid().optional(),
  claim_type: NetworkEvidenceClaimTypeSchema,
  evidence_level: NetworkEvidenceLevelSchema,
  population_scope: z.string().min(1),
  methodology: z.string().min(1),
  directionality: z.string().optional(),
  applicability: z.enum(['direct', 'partial', 'indirect', 'research']),
  provenance_refs: z.array(z.string()),
  approved_for: z.enum(['clinical_context', 'clinical_refinement', 'research_only']),
});

export const NetworkEvidenceContextSchema = z.object({
  supporting_claim_ids: z.array(z.string().uuid()),
  negative_claim_ids: z.array(z.string().uuid()),
  conflicting_claim_ids: z.array(z.string().uuid()),
  evidence_level_ceiling: NetworkEvidenceLevelSchema,
  applicability: z.enum(['strong', 'moderate', 'limited', 'uncertain']),
  interpretation: z.string(),
});

export const NormativeNetworkContextSchema = z.object({
  normative_reference_id: z.string().uuid(),
  model_version: z.string().min(1),
  cohort_description: z.string().min(1),
  compatibility_status: z.enum(['compatible', 'caution', 'incompatible']),
  percentile_cen_dmn: z.number().optional(),
  percentile_sn_cen: z.number().optional(),
  percentile_sn_dmn: z.number().optional(),
  z_score_cen_dmn: z.number().optional(),
});

export const NetworkConfigurationInterpretationStatusSchema = z.enum([
  'interpretable',
  'partially_interpretable',
  'uncertain',
  'not_qualified',
]);

export const NetworkConfigurationClinicalUseSchema = z.enum([
  'contextual',
  'qualified_contextual',
  'research_only',
]);

export const NetworkConfigurationSchema = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  connectome_run_id: z.string().uuid(),
  network_definition_release_id: z.string().uuid(),
  metric_release_id: z.string().uuid(),
  within_network_measurements: z.array(NetworkMeasurementSchema),
  pairwise_relationships: z.array(NetworkInteractionMeasurementSchema),
  global_integration: z.number().optional(),
  global_segregation: z.number().optional(),
  normative_context: NormativeNetworkContextSchema.optional(),
  reliability_profile_id: z.string().uuid(),
  interpretation_status: NetworkConfigurationInterpretationStatusSchema,
  clinical_use: NetworkConfigurationClinicalUseSchema,
  configuration_hash: z.string().length(64),
});

export const NetworkStateSchema = z.object({
  code: NetworkSystemCodeSchema,
  name: z.string().min(1),
  within_network_integrity: z.number(),
  status: z.enum(['intact', 'altered', 'hypoconnected', 'hyperconnected', 'uncertain']),
  interpretation: z.string(),
});

export const NetworkRelationshipStateSchema = z.object({
  relationship_code: NetworkRelationshipCodeSchema,
  name: z.string().min(1),
  coupling_value: z.number(),
  segregation_index: z.number(),
  status: z.enum(['normal', 'altered', 'hypocoupled', 'hypercoupled', 'uncertain']),
  interpretation: z.string(),
});

export const NetworkInterpretationConfidenceSchema = z.enum([
  'high',
  'moderate',
  'limited',
  'uncertain',
]);

export const NetworkClinicalImplicationSchema = z.enum([
  'supportive_context',
  'neutral_context',
  'uncertain_context',
  'contradictory_context',
  'research_only',
]);

export const NetworkInterpretationSchema = z.object({
  summary: z.string().min(1),
  confidence: NetworkInterpretationConfidenceSchema,
  supporting_facts: z.array(z.string()),
  contradictory_facts: z.array(z.string()),
  limitations: z.array(z.string()),
  clinical_implication: NetworkClinicalImplicationSchema,
});

export const TripleNetworkProfileClinicalAuthoritySchema = z.enum([
  'contextual',
  'qualified_contextual',
  'research',
]);

export const TripleNetworkProfileSchema = z.object({
  id: z.string().uuid(),
  case_id: z.string().uuid(),
  network_configuration_id: z.string().uuid(),
  cen: NetworkStateSchema,
  dmn: NetworkStateSchema,
  sn: NetworkStateSchema,
  cen_dmn: NetworkRelationshipStateSchema,
  sn_cen: NetworkRelationshipStateSchema,
  sn_dmn: NetworkRelationshipStateSchema,
  global_integration: z.number().optional(),
  global_segregation: z.number().optional(),
  reliability: NetworkReliabilityProfileSchema,
  normative_context: NormativeNetworkContextSchema.optional(),
  evidence_context: NetworkEvidenceContextSchema,
  interpretation: NetworkInterpretationSchema,
  clinical_authority: TripleNetworkProfileClinicalAuthoritySchema,
  version: z.string().min(1),
  profile_hash: z.string().length(64),
  provenance: CommonProvenanceSchema.optional(),
});

export const TherapeuticCircuitNetworkRelationshipTypeSchema = z.enum([
  'embedded',
  'intersects',
  'connects',
  'modulates',
  'associated_with',
]);

export const TherapeuticCircuitNetworkContextSchema = z.object({
  therapeutic_circuit_id: z.string().uuid(),
  network_system_id: z.string().uuid(),
  network_code: NetworkSystemCodeSchema,
  relationship_type: TherapeuticCircuitNetworkRelationshipTypeSchema,
  evidence_claim_ids: z.array(z.string().uuid()),
  evidence_level: NetworkEvidenceLevelSchema,
  clinical_authority: z.enum(['clinical', 'contextual', 'research']),
});

export const CandidateNetworkRelationshipTypeSchema = z.enum([
  'direct',
  'indirect',
  'circuit_mediated',
  'contextual',
  'not_established',
]);

export const CandidateNetworkInterpretationSchema = z.enum([
  'supportive',
  'neutral',
  'contradictory',
  'uncertain',
]);

export const CandidateNetworkAuthoritySchema = z.enum([
  'clinical_context',
  'qualified_context',
  'research_only',
]);

export const CandidateNetworkRelationshipSchema = z.object({
  candidate_id: z.string().min(1),
  network_system_id: z.string().uuid(),
  network_code: NetworkSystemCodeSchema,
  relationship_type: CandidateNetworkRelationshipTypeSchema,
  strength: z.number().optional(),
  reliability: NetworkReliabilityComponentSchema,
  evidence_claim_ids: z.array(z.string().uuid()),
  interpretation: CandidateNetworkInterpretationSchema,
  clinical_authority: CandidateNetworkAuthoritySchema,
});

export const TripleNetworkPolicyStatusSchema = z.enum([
  'contextual',
  'qualified_contextual',
  'research_only',
]);

export const TripleNetworkTargetContextSchema = z.object({
  profile_id: z.string().uuid(),
  configuration: NetworkConfigurationSchema,
  reliability: NetworkReliabilityProfileSchema,
  evidence_context: NetworkEvidenceContextSchema,
  candidate_relationships: z.array(CandidateNetworkRelationshipSchema),
  policy_status: TripleNetworkPolicyStatusSchema,
});

export const NetworkRankingFeaturePolicySchema = z.object({
  feature_code: z.string().min(1),
  indication_id: z.string().uuid(),
  clinical_objective_id: z.string().uuid().optional(),
  evidence_ceiling: NetworkEvidenceLevelSchema,
  minimum_reliability: NetworkOverallReliabilityStatusSchema,
  allowed_role: z.enum(['context', 'tie_break', 'ranking_feature', 'candidate_refinement']),
  validation_reference_ids: z.array(z.string().uuid()),
  policy_release_id: z.string().uuid(),
});

export const TripleNetworkPolicySchema = z.object({
  enabled: z.boolean(),
  allowed_network_definitions: z.array(z.string().min(1)),
  allowed_metric_releases: z.array(z.string().min(1)),
  minimum_reliability: NetworkOverallReliabilityStatusSchema,
  allowed_clinical_roles: z.array(z.enum(['context', 'convergence', 'explanation', 'tie_break'])),
  allowed_indications: z.array(z.string().min(1)),
  allowed_objectives: z.array(z.string().min(1)),
  dynamic_metrics_allowed: z.boolean(),
  ranking_features: z.array(NetworkRankingFeaturePolicySchema),
});

export const NetworkOverlapRedundancySchema = z.object({
  cen: z.number().min(0).max(1),
  dmn: z.number().min(0).max(1),
  sn: z.number().min(0).max(1),
  pairwise_relationship_overlap: z.number().min(0).max(1),
});

// ==========================================
// Canonical Hashing & Determinism Helper (§50, §51)
// ==========================================

function canonicalJsonStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'number') {
      // Canonical float representation: round to 6 decimal places if float
      if (Number.isFinite(obj) && !Number.isInteger(obj)) {
        return Number(obj.toFixed(6)).toString();
      }
    }
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(item => canonicalJsonStringify(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = sortedKeys.map(key => {
    const val = (obj as Record<string, unknown>)[key];
    return `${JSON.stringify(key)}:${canonicalJsonStringify(val)}`;
  });

  return '{' + pairs.join(',') + '}';
}

const K_CONSTANTS = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha256Universal(msg: string): string {
  const utf8: number[] = [];
  for (let i = 0; i < msg.length; i++) {
    let charcode = msg.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (msg.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    }
  }

  const bitLength = utf8.length * 8;
  utf8.push(0x80);
  while (utf8.length % 64 !== 56) {
    utf8.push(0);
  }

  const high = Math.floor(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  for (let i = 3; i >= 0; i--) utf8.push((high >>> (i * 8)) & 0xff);
  for (let i = 3; i >= 0; i--) utf8.push((low >>> (i * 8)) & 0xff);

  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a,
    h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let i = 0; i < utf8.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      const b0 = utf8[i + j * 4] ?? 0;
      const b1 = utf8[i + j * 4 + 1] ?? 0;
      const b2 = utf8[i + j * 4 + 2] ?? 0;
      const b3 = utf8[i + j * 4 + 3] ?? 0;
      w[j] = (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
    }
    for (let j = 16; j < 64; j++) {
      const wj15 = w[j - 15] ?? 0;
      const wj2 = w[j - 2] ?? 0;
      const wj16 = w[j - 16] ?? 0;
      const wj7 = w[j - 7] ?? 0;
      const s0 = ((wj15 >>> 7) | (wj15 << 25)) ^ ((wj15 >>> 18) | (wj15 << 14)) ^ (wj15 >>> 3);
      const s1 = ((wj2 >>> 17) | (wj2 << 15)) ^ ((wj2 >>> 19) | (wj2 << 13)) ^ (wj2 >>> 10);
      w[j] = (wj16 + s0 + wj7 + s1) >>> 0;
    }

    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;

    for (let j = 0; j < 64; j++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const kj = K_CONSTANTS[j] ?? 0;
      const wj = w[j] ?? 0;
      const temp1 = (h + S1 + ch + kj + wj) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const toHex = (n: number) => n.toString(16).padStart(8, '0');
  return `${toHex(h0)}${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}${toHex(h5)}${toHex(h6)}${toHex(h7)}`;
}

export function computeTripleNetworkProfileHash(
  profile: Omit<TripleNetworkProfile, 'profile_hash'>,
): string {
  const hashPayload = {
    case_id: profile.case_id,
    network_configuration_id: profile.network_configuration_id,
    cen: profile.cen,
    dmn: profile.dmn,
    sn: profile.sn,
    cen_dmn: profile.cen_dmn,
    sn_cen: profile.sn_cen,
    sn_dmn: profile.sn_dmn,
    reliability: profile.reliability,
    evidence_context: profile.evidence_context,
    version: profile.version,
  };
  const canonicalString = canonicalJsonStringify(hashPayload);
  return sha256Universal(canonicalString);
}
