import { describe, it, expect } from 'vitest';
import {
  CANONICAL_CEN_DEFINITION,
  CANONICAL_DMN_DEFINITION,
  CANONICAL_SN_DEFINITION,
  calculateWithinNetworkMetrics,
  calculatePairwiseNetworkMetrics,
  calculateNetworkSegregation,
  evaluateNetworkReliability,
  buildTripleNetworkProfile,
  evaluateTripleNetworkPolicy,
} from '../src/index.js';
import { TripleNetworkProfileSchema } from '@magniom/schemas';

describe('@magniom/networks - Canonical Triple-Network Systems Layer', () => {
  it('exposes frozen canonical network definitions on HCP-MMP1.0', () => {
    expect(CANONICAL_CEN_DEFINITION.parcel_ids).toContain('L_46');
    expect(CANONICAL_CEN_DEFINITION.parcel_ids).toContain('R_46');
    expect(CANONICAL_DMN_DEFINITION.parcel_ids).toContain('L_7m');
    expect(CANONICAL_DMN_DEFINITION.parcel_ids).toContain('L_10v');
    expect(CANONICAL_SN_DEFINITION.parcel_ids).toContain('L_AVI');
    expect(CANONICAL_SN_DEFINITION.parcel_ids).toContain('R_AVI');
  });

  it('calculates within-network integrity and pairwise segregation from parcel FC matrix', () => {
    const parcelNames = ['L_46', 'L_9-46d', 'L_7m', 'L_10v', 'L_AVI', 'R_AVI'];
    // Mock 6x6 correlation matrix: strong within, negative between
    const matrix = [
      [1.0, 0.6, -0.3, -0.25, 0.2, 0.2],
      [0.6, 1.0, -0.28, -0.22, 0.18, 0.18],
      [-0.3, -0.28, 1.0, 0.7, -0.1, -0.1],
      [-0.25, -0.22, 0.7, 1.0, -0.05, -0.05],
      [0.2, 0.18, -0.1, -0.05, 1.0, 0.65],
      [0.2, 0.18, -0.1, -0.05, 0.65, 1.0],
    ];

    const cenMetrics = calculateWithinNetworkMetrics({ parcelNames, matrix }, 'CEN');
    expect(cenMetrics.raw_value).toBeGreaterThan(0.4);
    expect(cenMetrics.interpretation_status).toBe('supportive');

    const dmnMetrics = calculateWithinNetworkMetrics({ parcelNames, matrix }, 'DMN');
    expect(dmnMetrics.raw_value).toBeGreaterThan(0.5);

    const cenDmnMetrics = calculatePairwiseNetworkMetrics(
      { parcelNames, matrix },
      'CEN_DMN',
      '00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002',
    );
    expect(cenDmnMetrics.raw_value).toBeLessThan(-0.15); // Negative Z (anti-correlated)
    expect(cenDmnMetrics.interpretation_status).toBe('supportive');

    const seg = calculateNetworkSegregation(0.65, -0.25);
    expect(seg).toBeGreaterThan(0.5);
  });

  it('evaluates multi-dimensional network reliability and enforces monotonicity', () => {
    const highRel = evaluateNetworkReliability('rel-01', {
      meanFdMm: 0.12,
      retainedMinutes: 12.0,
      t1RegistrationScore: 0.94,
      parcelCoverageRatio: 0.98,
      crossRunStability: 0.85,
    });
    expect(highRel.overall_status).toBe('high');
    expect(highRel.clinical_qualification).toBe('qualified');

    const lowRel = evaluateNetworkReliability('rel-02', {
      meanFdMm: 0.42, // High motion
      retainedMinutes: 4.0, // Insufficient minutes
      t1RegistrationScore: 0.65,
      parcelCoverageRatio: 0.75,
      crossRunStability: 0.35,
    });
    expect(lowRel.overall_status).toBe('insufficient');
    expect(lowRel.clinical_qualification).toBe('research_only');
  });

  it('builds a valid TripleNetworkProfile that satisfies Zod validation and computes SHA-256 hash', () => {
    const rel = evaluateNetworkReliability('00000000-0000-4000-8000-000000000060', {
      meanFdMm: 0.12,
      retainedMinutes: 12.0,
      t1RegistrationScore: 0.94,
      parcelCoverageRatio: 0.98,
      crossRunStability: 0.85,
    });

    const profile = buildTripleNetworkProfile({
      id: '00000000-0000-4000-8000-000000000099',
      caseId: '00000000-0000-4000-8000-000000000010',
      configurationId: '00000000-0000-4000-8000-000000000020',
      connectomeRunId: '00000000-0000-4000-8000-000000000030',
      networkDefinitionReleaseId: '00000000-0000-4000-8000-000000000040',
      metricReleaseId: '00000000-0000-4000-8000-000000000050',
      withinMeasurements: [
        {
          network_system_id: 'c0000000-0000-4000-8000-000000000001',
          network_code: 'CEN',
          metric_code: 'fisher_z',
          raw_value: 0.48,
          interpretation_status: 'supportive',
        },
        {
          network_system_id: 'd0000000-0000-4000-8000-000000000002',
          network_code: 'DMN',
          metric_code: 'fisher_z',
          raw_value: 0.54,
          interpretation_status: 'supportive',
        },
        {
          network_system_id: 's0000000-0000-4000-8000-000000000003',
          network_code: 'SN',
          metric_code: 'fisher_z',
          raw_value: 0.41,
          interpretation_status: 'supportive',
        },
      ],
      pairwiseMeasurements: [
        {
          relationship_id: 'r0000000-0000-4000-8000-000000000001',
          relationship_code: 'CEN_DMN',
          metric_code: 'fisher_z',
          raw_value: -0.24,
          measurement_run_id: '00000000-0000-4000-8000-000000000030',
          reliability_profile_id: '00000000-0000-4000-8000-000000000060',
          interpretation_status: 'supportive',
        },
        {
          relationship_id: 'r0000000-0000-4000-8000-000000000002',
          relationship_code: 'SN_CEN',
          metric_code: 'fisher_z',
          raw_value: 0.19,
          measurement_run_id: '00000000-0000-4000-8000-000000000030',
          reliability_profile_id: '00000000-0000-4000-8000-000000000060',
          interpretation_status: 'supportive',
        },
        {
          relationship_id: 'r0000000-0000-4000-8000-000000000003',
          relationship_code: 'SN_DMN',
          metric_code: 'fisher_z',
          raw_value: -0.04,
          measurement_run_id: '00000000-0000-4000-8000-000000000030',
          reliability_profile_id: '00000000-0000-4000-8000-000000000060',
          interpretation_status: 'supportive',
        },
      ],
      reliability: rel,
      evidenceContext: {
        supporting_claim_ids: ['e0000000-0000-4000-8000-000000000001'],
        negative_claim_ids: [],
        conflicting_claim_ids: [],
        evidence_level_ceiling: 'B',
        applicability: 'strong',
        interpretation: 'Literature supports CEN-DMN segregation alteration in MDD.',
      },
    });

    expect(profile.profile_hash).toHaveLength(64);
    const parsed = TripleNetworkProfileSchema.parse(profile);
    expect(parsed.id).toBe('00000000-0000-4000-8000-000000000099');
    expect(parsed.cen.within_network_integrity).toBe(0.48);
  });

  it('prevents research network leakage in Clinical Mode', () => {
    const rel = evaluateNetworkReliability('00000000-0000-4000-8000-000000000060', {
      meanFdMm: 0.12,
      retainedMinutes: 12.0,
      t1RegistrationScore: 0.94,
      parcelCoverageRatio: 0.98,
    });

    const evalResult = evaluateTripleNetworkPolicy(
      {
        profile_id: 'prof-01',
        configuration: {} as any,
        reliability: rel,
        evidence_context: {} as any,
        candidate_relationships: [],
        policy_status: 'research_only',
      },
      {
        enabled: true,
        allowed_network_definitions: [],
        allowed_metric_releases: [],
        minimum_reliability: 'moderate',
        allowed_clinical_roles: ['context'],
        allowed_indications: [],
        allowed_objectives: [],
        dynamic_metrics_allowed: false,
        ranking_features: [],
      },
      'clinical',
    );

    expect(evalResult.permitted).toBe(false);
    expect(evalResult.failureCodes).toContain('TN-012');
  });
});
