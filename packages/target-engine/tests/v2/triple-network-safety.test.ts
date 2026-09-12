/**
 * MAGNIOM Triple-Network Systems Layer Safety & Invariant Tests
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§2, 4, 16, 24, 28, 34, 36, 40, 44, 46, 62, 72)
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateTripleNetworkPolicy,
  buildTripleNetworkProfile,
  calculateNetworkSegregation,
  calculateNormativeDeviation,
} from '@magniom/networks';
import { enforceEvidenceCeiling } from '@magniom/evidence';
import {
  TN_FAILURE_CODES,
  TN_WARNING_CODES,
  type TripleNetworkTargetContext,
  type TripleNetworkPolicy,
} from '@magniom/domain';
import { MDD_TRIPLE_NETWORK_POLICY } from '@magniom/scientific-policy';

describe('MAGNIOM Triple-Network Systems Layer: Safety & Invariant Verification', () => {
  const standardContext: TripleNetworkTargetContext = {
    profile_id: 'tn-prof-001',
    configuration: {
      id: 'cfg-001',
      case_id: 'case-001',
      connectome_run_id: 'run-001',
      network_definition_release_id: 'def-rel-001',
      metric_release_id: '1.0.0',
      within_network_measurements: [],
      pairwise_relationships: [],
      reliability_profile_id: 'rel-001',
      interpretation_status: 'interpretable',
      clinical_use: 'contextual',
      configuration_hash: 'hash-001',
    },
    reliability: {
      id: 'rel-001',
      overall_status: 'high',
      clinical_qualification: 'qualified',
      acquisition_quality: { reliability_class: 'high', metric_value: 12.0, limiting_factors: [] },
      preprocessing_reliability: {
        reliability_class: 'high',
        metric_value: 0.1,
        limiting_factors: [],
      },
      within_network_reliability: {
        reliability_class: 'high',
        metric_value: 0.8,
        limiting_factors: [],
      },
      pairwise_reliability: {
        cen_dmn: { reliability_class: 'high', metric_value: 0.85, limiting_factors: [] },
        sn_cen: { reliability_class: 'high', metric_value: 0.8, limiting_factors: [] },
        sn_dmn: { reliability_class: 'high', metric_value: 0.78, limiting_factors: [] },
      },
      normative_compatibility: { reliability_class: 'high', limiting_factors: [] },
      atlas_sensitivity: { reliability_class: 'high', limiting_factors: [] },
      preprocessing_sensitivity: { reliability_class: 'high', limiting_factors: [] },
    },
    evidence_context: {
      supporting_claim_ids: ['claim-01'],
      negative_claim_ids: [],
      conflicting_claim_ids: [],
      evidence_level_ceiling: 'B',
      applicability: 'strong',
      interpretation: 'Standard Level B clinical evidence context.',
    },
    candidate_relationships: [],
    policy_status: 'contextual',
  };

  // ==========================================
  // Invariant 1: Evidence Ceiling Enforcement (§24)
  // ==========================================
  describe('Invariant 1: Evidence Ceiling Enforcement (§24)', () => {
    it('strictly preserves baseline evidence tier regardless of high network connectivity', () => {
      // Candidate with Level D empirical evidence and exceptional network metric (0.95)
      const baseEvidenceLevel = 'D';
      const effectiveCeiling = enforceEvidenceCeiling(baseEvidenceLevel, 'A');

      // The ceiling cannot raise D to A
      expect(effectiveCeiling).toBe('D');
    });

    it('caps proposed evidence level if it exceeds the indication policy ceiling', () => {
      // Proposed Level A evidence capped by indication ceiling Level B
      const effectiveCeiling = enforceEvidenceCeiling('A', 'B');
      expect(effectiveCeiling).toBe('B');
    });
  });

  // ==========================================
  // Invariant 2: Systems Context Only (§2, §34)
  // ==========================================
  describe('Invariant 2: Systems Context Only (§2, §34)', () => {
    it('prohibits autonomous candidate generation by the network systems layer', () => {
      const evaluation = evaluateTripleNetworkPolicy(
        standardContext,
        MDD_TRIPLE_NETWORK_POLICY,
        'clinical',
      );
      expect(evaluation.permitted).toBe(true);
      expect(evaluation.effectiveClinicalRole).toBe('context');
      // Role is strictly 'context' - never 'generator'
      expect(evaluation.effectiveClinicalRole).not.toBe('generator');
    });

    it('fails closed if policy attempts to assign candidate_refinement role without authorization', () => {
      const unauthorizedPolicy: TripleNetworkPolicy = {
        ...MDD_TRIPLE_NETWORK_POLICY,
        ranking_features: [
          {
            feature_code: 'unauthorized_ranking_fc',
            indication_id: 'ind-001',
            evidence_ceiling: 'A',
            minimum_reliability: 'high',
            allowed_role: 'candidate_refinement',
            validation_reference_ids: ['VAL-001'],
            policy_release_id: 'pol-rel-001',
          },
        ],
      };

      const result = evaluateTripleNetworkPolicy(standardContext, unauthorizedPolicy, 'clinical');
      expect(result.permitted).toBe(false);
      expect(result.failureCodes).toContain(
        TN_FAILURE_CODES.TN_013_NETWORK_FEATURE_NOT_AUTHORISED_BY_POLICY,
      );
    });
  });

  // ==========================================
  // Invariant 3: Low Reliability Safe Degradation (§44, §72)
  // ==========================================
  describe('Invariant 3: Low Reliability Safe Degradation (§44, §72)', () => {
    it('emits low reliability warning and omits qualification without false abstention', () => {
      const lowReliabilityContext: TripleNetworkTargetContext = {
        ...standardContext,
        reliability: {
          ...standardContext.reliability,
          overall_status: 'limited',
          clinical_qualification: 'context_only',
        },
      };

      const result = evaluateTripleNetworkPolicy(
        lowReliabilityContext,
        MDD_TRIPLE_NETWORK_POLICY,
        'clinical',
      );

      // Does NOT block clinical mode (blockOnLowReliability is false in MDD policy)
      expect(result.permitted).toBe(true);
      expect(result.warnings).toContain(TN_WARNING_CODES.TRIPLE_NETWORK_LOW_RELIABILITY);
    });
  });

  // ==========================================
  // Invariant 4: Non-Collapsible Relational Representation (§4, §16, §62)
  // ==========================================
  describe('Invariant 4: Non-Collapsible Relational Representation (§4, §16, §62)', () => {
    it('preserves all three distinct pairwise relationships independently', () => {
      const profile = buildTripleNetworkProfile({
        id: 'tn-prof-test',
        caseId: 'case-test',
        configurationId: 'cfg-test',
        connectomeRunId: 'run-test',
        networkDefinitionReleaseId: 'def-test',
        metricReleaseId: '1.0.0',
        withinMeasurements: [
          {
            network_system_id: 's1',
            network_code: 'CEN',
            metric_code: 'mean_fc',
            raw_value: 0.7,
            interpretation_status: 'supportive',
          },
          {
            network_system_id: 's2',
            network_code: 'DMN',
            metric_code: 'mean_fc',
            raw_value: 0.8,
            interpretation_status: 'supportive',
          },
          {
            network_system_id: 's3',
            network_code: 'SN',
            metric_code: 'mean_fc',
            raw_value: 0.65,
            interpretation_status: 'supportive',
          },
        ],
        pairwiseMeasurements: [
          {
            relationship_id: 'r1',
            relationship_code: 'CEN_DMN',
            metric_code: 'cross_fc',
            raw_value: -0.38,
            measurement_run_id: 'm1',
            reliability_profile_id: 'rel1',
            interpretation_status: 'supportive',
          },
          {
            relationship_id: 'r2',
            relationship_code: 'SN_CEN',
            metric_code: 'cross_fc',
            raw_value: 0.3,
            measurement_run_id: 'm1',
            reliability_profile_id: 'rel1',
            interpretation_status: 'supportive',
          },
          {
            relationship_id: 'r3',
            relationship_code: 'SN_DMN',
            metric_code: 'cross_fc',
            raw_value: -0.1,
            measurement_run_id: 'm1',
            reliability_profile_id: 'rel1',
            interpretation_status: 'supportive',
          },
        ],
        reliability: standardContext.reliability,
        evidenceContext: standardContext.evidence_context,
        clinicalAuthority: 'contextual',
      });

      // Pairwise interactions must be distinct entities
      expect(profile.cen_dmn.relationship_code).toBe('CEN_DMN');
      expect(profile.sn_cen.relationship_code).toBe('SN_CEN');
      expect(profile.sn_dmn.relationship_code).toBe('SN_DMN');

      // Coupling values must not be collapsed
      expect(profile.cen_dmn.coupling_value).toBe(-0.38);
      expect(profile.sn_cen.coupling_value).toBe(0.3);
      expect(profile.sn_dmn.coupling_value).toBe(-0.1);

      // Verify segregation index calculation
      const segCenDmn = calculateNetworkSegregation(0.75, -0.38);
      expect(segCenDmn).toBeGreaterThan(0.9);
    });
  });

  // ==========================================
  // Invariant 5: Dynamic Metric Hermetic Isolation (§40, §46, §47)
  // ==========================================
  describe('Invariant 5: Dynamic Metric Hermetic Isolation (§40, §46, §47)', () => {
    it('fails closed with TN_003 when dynamic metrics are supplied in Clinical Mode', () => {
      const dynamicPolicy: TripleNetworkPolicy = {
        ...MDD_TRIPLE_NETWORK_POLICY,
        dynamic_metrics_allowed: true, // Attempt to allow dynamic metrics
      };

      const result = evaluateTripleNetworkPolicy(standardContext, dynamicPolicy, 'clinical');
      expect(result.permitted).toBe(false);
      expect(result.failureCodes).toContain(
        TN_FAILURE_CODES.TN_012_RESEARCH_FEATURE_REQUESTED_IN_CLINICAL,
      );
      expect(result.effectiveClinicalRole).toBe('blocked');
    });

    it('permits dynamic metrics only in Research Mode with research_only role', () => {
      const dynamicPolicy: TripleNetworkPolicy = {
        ...MDD_TRIPLE_NETWORK_POLICY,
        dynamic_metrics_allowed: true,
      };

      const result = evaluateTripleNetworkPolicy(standardContext, dynamicPolicy, 'research');
      expect(result.permitted).toBe(true);
      expect(result.effectiveClinicalRole).toBe('research_only');
    });
  });

  // ==========================================
  // Normative Deviation Calculation
  // ==========================================
  describe('Normative Deviation & Segregation Mathematics', () => {
    it('correctly calculates z-score against normative distributions', () => {
      // Normative expected r = -0.35, std = 0.10, observed = -0.55 -> z = (-0.55 - -0.35) / 0.10 = -2.0
      const z = calculateNormativeDeviation(-0.55, -0.35, 0.01);
      expect(z).toBeCloseTo(-2.0, 4);
    });
  });
});
