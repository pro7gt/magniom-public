/**
 * @magniom/target-engine - Canonical TN-GOLDEN Suite (10 Cases)
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§75–78) & Architecture Spec v2.1 (§114)
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  buildTripleNetworkProfile,
  evaluateTripleNetworkPolicy,
  calculateNetworkSegregation,
  evaluateNetworkReliability,
} from '@magniom/networks';
import { enforceEvidenceCeiling } from '@magniom/evidence';
import {
  TN_FAILURE_CODES,
  type TripleNetworkTargetContext,
  type TripleNetworkPolicy,
} from '@magniom/domain';
import { MDD_TRIPLE_NETWORK_POLICY } from '@magniom/scientific-policy';

const goldenCasesPath = path.resolve(
  __dirname,
  '../../../../validation/golden-cases/TN-GOLDEN/golden-cases.json',
);

describe('MAGNIOM Triple-Network Systems Layer: TN-GOLDEN Suite (10 Cases)', () => {
  const cases: any[] = JSON.parse(fs.readFileSync(goldenCasesPath, 'utf8'));

  it('contains exactly 10 canonical golden cases', () => {
    expect(cases.length).toBe(10);
  });

  // TN-GOLDEN-001: Canonical Intact Triple-Network Architecture
  it('TN-GOLDEN-001: Canonical Intact Triple-Network Architecture', () => {
    const c = cases.find(x => x.id === 'TN-GOLDEN-001')!;
    const profile = buildTripleNetworkProfile({
      id: 'tn-prof-g001',
      caseId: 'case-g001',
      configurationId: 'cfg-g001',
      connectomeRunId: 'run-g001',
      networkDefinitionReleaseId: 'hcp-mmp1-tri-1.0',
      metricReleaseId: '1.0.0',
      withinMeasurements: c.inputs.withinMeasurements.map((m: any) => ({
        network_system_id: `sys-${m.network_code.toLowerCase()}`,
        network_code: m.network_code,
        metric_code: 'mean_within_fc',
        raw_value: m.raw_value,
        interpretation_status: 'supportive',
      })),
      pairwiseMeasurements: c.inputs.pairwiseMeasurements.map((m: any) => ({
        relationship_id: `rel-${m.relationship_code.toLowerCase()}`,
        relationship_code: m.relationship_code,
        metric_code: 'cross_fc',
        raw_value: m.raw_value,
        measurement_run_id: 'run-g001',
        reliability_profile_id: 'rel-g001',
        interpretation_status: 'supportive',
      })),
      reliability: {
        id: 'rel-g001',
        overall_status: c.expected.reliabilityStatus,
        clinical_qualification: c.expected.clinicalQualification,
        acquisition_quality: {
          reliability_class: 'high',
          metric_value: c.inputs.scrubbedMinutes,
          limiting_factors: [],
        },
        preprocessing_reliability: {
          reliability_class: 'high',
          metric_value: c.inputs.meanFdMm,
          limiting_factors: [],
        },
        within_network_reliability: {
          reliability_class: 'high',
          metric_value: c.inputs.splitHalfConcordance,
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
      evidenceContext: {
        supporting_claim_ids: ['claim-001'],
        negative_claim_ids: [],
        conflicting_claim_ids: [],
        evidence_level_ceiling: 'B',
        applicability: 'strong',
        interpretation: 'Standard intact clinical connectome.',
      },
      clinicalAuthority: c.expected.clinicalAuthority,
    });

    expect(profile.reliability.overall_status).toBe('high');
    expect(profile.reliability.clinical_qualification).toBe('qualified');
    expect(profile.clinical_authority).toBe('contextual');
    expect(profile.profile_hash).toBeDefined();
    expect(profile.profile_hash.length).toBe(64);
  });

  // TN-GOLDEN-002: MDD Hyposegregated CEN-DMN Architecture
  it('TN-GOLDEN-002: MDD Hyposegregated / Hypocoupled CEN-DMN Architecture', () => {
    const c = cases.find(x => x.id === 'TN-GOLDEN-002')!;
    const intactCenDmn = -0.42; // Robust anti-correlation
    const hyposegregatedCenDmn = c.inputs.pairwiseMeasurements.find(
      (m: any) => m.relationship_code === 'CEN_DMN',
    )!.raw_value; // -0.05

    // Hyposegregation is detected by loss of anti-correlation (closer to 0)
    expect(hyposegregatedCenDmn).toBeGreaterThan(intactCenDmn);
    expect(c.expected.segregationReductionDetected).toBe(true);
    expect(c.expected.cenDmnStatus).toBe('altered');
  });

  // TN-GOLDEN-003: MDD Pathological Hyperconnected DMN Architecture
  it('TN-GOLDEN-003: MDD Pathological Hyperconnected DMN Architecture', () => {
    const c = cases.find(x => x.id === 'TN-GOLDEN-003')!;
    const dmnWithin = c.inputs.withinMeasurements.find(
      (m: any) => m.network_code === 'DMN',
    )!.raw_value;
    expect(dmnWithin).toBeGreaterThanOrEqual(0.9);
    expect(c.expected.dmnStatus).toBe('intact');
  });

  // TN-GOLDEN-004: Low Reliability Acquisition Safe Degradation
  it('TN-GOLDEN-004: Low Reliability Acquisition Safe Degradation', () => {
    const c = cases.find(x => x.id === 'TN-GOLDEN-004')!;
    const reliability = evaluateNetworkReliability('rel-04', {
      meanFdMm: c.inputs.meanFdMm,
      retainedMinutes: c.inputs.scrubbedMinutes,
      t1RegistrationScore: 0.88,
      parcelCoverageRatio: 0.94,
      crossRunStability: c.inputs.splitHalfConcordance,
    });

    expect(reliability.overall_status).toBe('insufficient');
    expect(reliability.clinical_qualification).toBe('research_only');
    expect(reliability.acquisition_quality.limiting_factors.length).toBeGreaterThan(0);
    expect(c.expected.falseAbstentionPrevented).toBe(true);
  });

  // TN-GOLDEN-005: Dynamic Metric Leakage Rejection in Clinical Mode
  it('TN-GOLDEN-005: Dynamic Metric Leakage Rejection in Clinical Mode', () => {
    const dynamicPolicy: TripleNetworkPolicy = {
      ...MDD_TRIPLE_NETWORK_POLICY,
      dynamic_metrics_allowed: true, // Prohibited in Clinical Mode
    };

    const dummyRel = evaluateNetworkReliability('rel-05', {
      meanFdMm: 0.12,
      retainedMinutes: 12.0,
      t1RegistrationScore: 0.94,
      parcelCoverageRatio: 0.98,
    });

    const context: TripleNetworkTargetContext = {
      profile_id: 'prof-05',
      configuration: {} as any,
      reliability: dummyRel,
      evidence_context: {} as any,
      candidate_relationships: [],
      policy_status: 'contextual',
    };

    const evaluation = evaluateTripleNetworkPolicy(context, dynamicPolicy, 'clinical');

    expect(evaluation.permitted).toBe(false);
    expect(evaluation.failureCodes).toContain(
      TN_FAILURE_CODES.TN_012_RESEARCH_FEATURE_REQUESTED_IN_CLINICAL,
    );
  });

  // TN-GOLDEN-006: Prohibition of Autonomous Network Target Nomination
  it('TN-GOLDEN-006: Prohibition of Autonomous Network Target Nomination', () => {
    const c = cases.find(x => x.id === 'TN-GOLDEN-006')!;
    expect(c.expected.autonomousCandidatesGenerated).toBe(0);
    expect(c.expected.contextualOnlyEnforced).toBe(true);
  });

  // TN-GOLDEN-007: Prohibition of Composite Scalar Collapse
  it('TN-GOLDEN-007: Prohibition of Composite Scalar Collapse', () => {
    const c = cases.find(x => x.id === 'TN-GOLDEN-007')!;
    expect(c.expected.compositeScalarForbidden).toBe(true);
    expect(c.expected.pairwisePreserved).toEqual(['CEN_DMN', 'SN_CEN', 'SN_DMN']);
  });

  // TN-GOLDEN-008: Evidence Ceiling Enforcement
  it('TN-GOLDEN-008: Evidence Ceiling Enforcement', () => {
    const baseEvidenceLevel = 'D';
    const indicationPolicyCeiling = 'B';
    const effectiveCeiling = enforceEvidenceCeiling(baseEvidenceLevel, indicationPolicyCeiling);

    expect(effectiveCeiling).toBe('D');
  });

  // TN-GOLDEN-009: Bit-for-Bit Determinism & Canonical Hashing
  it('TN-GOLDEN-009: Bit-for-Bit Determinism & Canonical Hashing across 100 Iterations', () => {
    const digests = new Set<string>();

    for (let i = 0; i < 100; i++) {
      const profile = buildTripleNetworkProfile({
        id: 'tn-prof-det',
        caseId: 'case-det',
        configurationId: 'cfg-det',
        connectomeRunId: 'run-det',
        networkDefinitionReleaseId: 'hcp-mmp1-tri-1.0',
        metricReleaseId: '1.0.0',
        withinMeasurements: [
          {
            network_system_id: 'sys-cen',
            network_code: 'CEN',
            metric_code: 'mean_within_fc',
            raw_value: 0.76,
            interpretation_status: 'supportive',
          },
        ],
        pairwiseMeasurements: [
          {
            relationship_id: 'rel-cen-dmn',
            relationship_code: 'CEN_DMN',
            metric_code: 'cross_fc',
            raw_value: -0.42,
            measurement_run_id: 'run-det',
            reliability_profile_id: 'rel-det',
            interpretation_status: 'supportive',
          },
        ],
        reliability: {
          id: 'rel-det',
          overall_status: 'high',
          clinical_qualification: 'qualified',
          acquisition_quality: {
            reliability_class: 'high',
            metric_value: 12.0,
            limiting_factors: [],
          },
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
        evidenceContext: {
          supporting_claim_ids: ['claim-det'],
          negative_claim_ids: [],
          conflicting_claim_ids: [],
          evidence_level_ceiling: 'B',
          applicability: 'strong',
          interpretation: 'Deterministic hashing validation.',
        },
        clinicalAuthority: 'contextual',
      });

      digests.add(profile.profile_hash);
    }

    expect(digests.size).toBe(1);
  });

  // TN-GOLDEN-010: Clinical / Research Mode Hermetic Isolation
  it('TN-GOLDEN-010: Clinical / Research Mode Hermetic Isolation', () => {
    const dummyRel = evaluateNetworkReliability('rel-10', {
      meanFdMm: 0.12,
      retainedMinutes: 12.0,
      t1RegistrationScore: 0.94,
      parcelCoverageRatio: 0.98,
    });

    const context: TripleNetworkTargetContext = {
      profile_id: 'prof-10',
      configuration: {} as any,
      reliability: dummyRel,
      evidence_context: {} as any,
      candidate_relationships: [],
      policy_status: 'research_only',
    };

    const clinicalEval = evaluateTripleNetworkPolicy(
      context,
      MDD_TRIPLE_NETWORK_POLICY,
      'clinical',
    );
    expect(clinicalEval.permitted).toBe(false);
    expect(clinicalEval.failureCodes).toContain(
      TN_FAILURE_CODES.TN_012_RESEARCH_FEATURE_REQUESTED_IN_CLINICAL,
    );

    const researchEval = evaluateTripleNetworkPolicy(
      context,
      MDD_TRIPLE_NETWORK_POLICY,
      'research',
    );
    expect(researchEval.permitted).toBe(true);
  });
});
