/**
 * MAGNIOM Triple-Network Systems Layer Determinism & Hash Invariance Tests
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§50, §51)
 *
 * Rules:
 * - 100 consecutive runs on identical inputs must yield identical SHA-256 profile digests.
 * - Any alteration to parcels, connectivity values, or reliability must alter the profile digest.
 */

import { describe, it, expect } from 'vitest';
import { buildTripleNetworkProfile } from '@magniom/networks';
import { computeTripleNetworkProfileHash } from '@magniom/schemas';

describe('MAGNIOM Triple-Network Determinism & Cryptographic Invariance (§50, §51)', () => {
  const baseParams = {
    id: 'tn-prof-det-001',
    caseId: 'case-det-001',
    configurationId: 'cfg-det-001',
    connectomeRunId: 'run-det-001',
    networkDefinitionReleaseId: 'def-det-001',
    metricReleaseId: '1.0.0',
    withinMeasurements: [
      {
        network_system_id: 's1',
        network_code: 'CEN' as const,
        metric_code: 'mean_fc',
        raw_value: 0.76,
        interpretation_status: 'supportive' as const,
      },
      {
        network_system_id: 's2',
        network_code: 'DMN' as const,
        metric_code: 'mean_fc',
        raw_value: 0.81,
        interpretation_status: 'supportive' as const,
      },
      {
        network_system_id: 's3',
        network_code: 'SN' as const,
        metric_code: 'mean_fc',
        raw_value: 0.72,
        interpretation_status: 'supportive' as const,
      },
    ],
    pairwiseMeasurements: [
      {
        relationship_id: 'r1',
        relationship_code: 'CEN_DMN' as const,
        metric_code: 'cross_fc',
        raw_value: -0.42,
        measurement_run_id: 'm1',
        reliability_profile_id: 'rel1',
        interpretation_status: 'supportive' as const,
      },
      {
        relationship_id: 'r2',
        relationship_code: 'SN_CEN' as const,
        metric_code: 'cross_fc',
        raw_value: 0.35,
        measurement_run_id: 'm1',
        reliability_profile_id: 'rel1',
        interpretation_status: 'supportive' as const,
      },
      {
        relationship_id: 'r3',
        relationship_code: 'SN_DMN' as const,
        metric_code: 'cross_fc',
        raw_value: -0.15,
        measurement_run_id: 'm1',
        reliability_profile_id: 'rel1',
        interpretation_status: 'supportive' as const,
      },
    ],
    reliability: {
      id: 'rel-det-001',
      overall_status: 'high' as const,
      clinical_qualification: 'qualified' as const,
      acquisition_quality: {
        reliability_class: 'high' as const,
        metric_value: 12.5,
        limiting_factors: [],
      },
      preprocessing_reliability: {
        reliability_class: 'high' as const,
        metric_value: 0.12,
        limiting_factors: [],
      },
      within_network_reliability: {
        reliability_class: 'high' as const,
        metric_value: 0.82,
        limiting_factors: [],
      },
      pairwise_reliability: {
        cen_dmn: { reliability_class: 'high' as const, metric_value: 0.85, limiting_factors: [] },
        sn_cen: { reliability_class: 'high' as const, metric_value: 0.8, limiting_factors: [] },
        sn_dmn: { reliability_class: 'high' as const, metric_value: 0.78, limiting_factors: [] },
      },
      normative_compatibility: { reliability_class: 'high' as const, limiting_factors: [] },
      atlas_sensitivity: { reliability_class: 'high' as const, limiting_factors: [] },
      preprocessing_sensitivity: { reliability_class: 'high' as const, limiting_factors: [] },
    },
    evidenceContext: {
      supporting_claim_ids: ['claim-01', 'claim-02'],
      negative_claim_ids: [],
      conflicting_claim_ids: [],
      evidence_level_ceiling: 'B' as const,
      applicability: 'strong' as const,
      interpretation: 'Deterministic test evidence context.',
    },
    clinicalAuthority: 'contextual' as const,
  };

  it('generates identical SHA-256 profile hashes across 100 independent consecutive executions', () => {
    const hashes = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const profile = buildTripleNetworkProfile(baseParams);
      hashes.add(profile.profile_hash);
    }

    // Must yield exactly 1 unique hash
    expect(hashes.size).toBe(1);
    const [uniqueHash] = Array.from(hashes);
    expect(uniqueHash).toBeDefined();
    expect(uniqueHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('strictly alters profile digest when within-network connectivity is modified', () => {
    const baseline = buildTripleNetworkProfile(baseParams);

    const modifiedParams = {
      ...baseParams,
      withinMeasurements: [
        { ...baseParams.withinMeasurements[0]!, raw_value: 0.77 }, // changed 0.76 -> 0.77
        baseParams.withinMeasurements[1]!,
        baseParams.withinMeasurements[2]!,
      ],
    };

    const modified = buildTripleNetworkProfile(modifiedParams);
    expect(modified.profile_hash).not.toBe(baseline.profile_hash);
  });

  it('strictly alters profile digest when pairwise coupling is modified', () => {
    const baseline = buildTripleNetworkProfile(baseParams);

    const modifiedParams = {
      ...baseParams,
      pairwiseMeasurements: [
        { ...baseParams.pairwiseMeasurements[0]!, raw_value: -0.43 }, // changed -0.42 -> -0.43
        baseParams.pairwiseMeasurements[1]!,
        baseParams.pairwiseMeasurements[2]!,
      ],
    };

    const modified = buildTripleNetworkProfile(modifiedParams);
    expect(modified.profile_hash).not.toBe(baseline.profile_hash);
  });

  it('strictly alters profile digest when reliability status is modified', () => {
    const baseline = buildTripleNetworkProfile(baseParams);

    const modifiedParams = {
      ...baseParams,
      reliability: {
        ...baseParams.reliability,
        overall_status: 'moderate' as const,
      },
    };

    const modified = buildTripleNetworkProfile(modifiedParams);
    expect(modified.profile_hash).not.toBe(baseline.profile_hash);
  });
});
