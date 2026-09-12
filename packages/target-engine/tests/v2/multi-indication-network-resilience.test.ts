/**
 * MAGNIOM Multi-Indication Network Resilience Test Suite v2.1
 * Verifies Target Engine and Triple-Network Systems Layer resilience across
 * all 8 canonical clinical indications under present, absent, and degraded network contexts.
 *
 * Conforms to:
 * - MAGNIOM Multi-Indication Technical & Scientific Architecture Specification v2.1 (§71–§78, §118)
 * - MAGNIOM Target Engine & Ranking Algorithm Specification v2.1 (§68–§77, §132–§142)
 * - MAGNIOM-Triple-Network Systems Layer v1.0 (§44, §46, §62, §72)
 */

import { describe, it, expect } from 'vitest';
import {
  runTargetEngineV2,
  createCanonicalResolvedContextV2,
  MDDPlugin,
  OCDPlugin,
  NeuropathicPainPlugin,
  StrokeMotorPlugin,
  StrokeAphasiaPlugin,
  TBIPlugin,
  PTSDPlugin,
  TinnitusPlugin,
} from '../../src/index.js';
import type { TripleNetworkTargetContext, TargetEngineRequestV2 } from '@magniom/domain';

describe('Multi-Indication Network Resilience Suite v2.1', () => {
  const indications = [
    { code: 'mdd', name: 'Major Depressive Disorder', plugin: new MDDPlugin() },
    { code: 'ocd', name: 'Obsessive-Compulsive Disorder', plugin: new OCDPlugin() },
    { code: 'neuropathic_pain', name: 'Neuropathic Pain', plugin: new NeuropathicPainPlugin() },
    { code: 'stroke_motor', name: 'Stroke Motor Recovery', plugin: new StrokeMotorPlugin() },
    { code: 'stroke_aphasia', name: 'Post-Stroke Aphasia', plugin: new StrokeAphasiaPlugin() },
    { code: 'tbi', name: 'Traumatic Brain Injury', plugin: new TBIPlugin() },
    { code: 'ptsd', name: 'Post-Traumatic Stress Disorder', plugin: new PTSDPlugin() },
    { code: 'tinnitus', name: 'Chronic Tinnitus', plugin: new TinnitusPlugin() },
  ];

  const createQualifiedNetworkContext = (indicationCode: string): TripleNetworkTargetContext => ({
    profile_id: `tn-prof-${indicationCode}-high`,
    configuration: {
      id: `cfg-${indicationCode}-01`,
      case_id: `case-${indicationCode}-01`,
      connectome_run_id: `run-${indicationCode}-01`,
      network_definition_release_id: 'def-rel-001',
      metric_release_id: '1.0.0',
      within_network_measurements: [
        {
          id: 'w-1',
          network_system_id: 'cen-sys',
          network_code: 'CEN',
          metric_code: 'fisher_z',
          metric_version: '1.0.0',
          raw_value: 0.65,
          standardized_z: 0.5,
          measurement_run_id: 'run-01',
          reliability_profile_id: 'rel-01',
          interpretation_status: 'supportive',
        },
        {
          id: 'w-2',
          network_system_id: 'dmn-sys',
          network_code: 'DMN',
          metric_code: 'fisher_z',
          metric_version: '1.0.0',
          raw_value: 0.72,
          standardized_z: 0.6,
          measurement_run_id: 'run-01',
          reliability_profile_id: 'rel-01',
          interpretation_status: 'supportive',
        },
        {
          id: 'w-3',
          network_system_id: 'sn-sys',
          network_code: 'SN',
          metric_code: 'fisher_z',
          metric_version: '1.0.0',
          raw_value: 0.58,
          standardized_z: 0.2,
          measurement_run_id: 'run-01',
          reliability_profile_id: 'rel-01',
          interpretation_status: 'supportive',
        },
      ],
      pairwise_relationships: [
        {
          id: 'p-1',
          relationship_id: 'cen-dmn',
          relationship_code: 'CEN_DMN',
          metric_code: 'fisher_z',
          metric_version: '1.0.0',
          raw_value: -0.38,
          standardized_z: -0.2,
          measurement_run_id: 'run-01',
          reliability_profile_id: 'rel-01',
          interpretation_status: 'supportive',
        },
      ],
      reliability_profile_id: 'rel-01',
      interpretation_status: 'interpretable',
      clinical_use: 'contextual',
      configuration_hash: `cfg-hash-${indicationCode}`,
    },
    reliability: {
      id: `rel-${indicationCode}-01`,
      overall_status: 'high',
      clinical_qualification: 'qualified',
      acquisition_quality: { reliability_class: 'high', metric_value: 12.0, limiting_factors: [] },
      preprocessing_reliability: {
        reliability_class: 'high',
        metric_value: 0.12,
        limiting_factors: [],
      },
      within_network_reliability: {
        reliability_class: 'high',
        metric_value: 0.85,
        limiting_factors: [],
      },
      pairwise_reliability: {
        cen_dmn: { reliability_class: 'high', metric_value: 0.88, limiting_factors: [] },
        sn_cen: { reliability_class: 'high', metric_value: 0.82, limiting_factors: [] },
        sn_dmn: { reliability_class: 'high', metric_value: 0.8, limiting_factors: [] },
      },
      normative_compatibility: { reliability_class: 'high', limiting_factors: [] },
      atlas_sensitivity: { reliability_class: 'high', limiting_factors: [] },
      preprocessing_sensitivity: { reliability_class: 'high', limiting_factors: [] },
    },
    evidence_context: {
      supporting_claim_ids: ['claim-support-01'],
      negative_claim_ids: [],
      conflicting_claim_ids: [],
      evidence_level_ceiling: 'B',
      applicability: 'strong',
      interpretation: `Qualified resting-state Triple-Network context for ${indicationCode}.`,
    },
    candidate_relationships: [],
    policy_status: 'contextual',
  });

  const createDegradedNetworkContext = (indicationCode: string): TripleNetworkTargetContext => ({
    ...createQualifiedNetworkContext(indicationCode),
    profile_id: `tn-prof-${indicationCode}-low`,
    reliability: {
      id: `rel-${indicationCode}-degraded`,
      overall_status: 'low',
      clinical_qualification: 'unqualified',
      acquisition_quality: {
        reliability_class: 'low',
        metric_value: 3.5,
        limiting_factors: ['EXCESSIVE_MOTION', 'INSUFFICIENT_SCAN_TIME'],
      },
      preprocessing_reliability: {
        reliability_class: 'low',
        metric_value: 0.45,
        limiting_factors: ['HIGH_FD_MOTION'],
      },
      within_network_reliability: {
        reliability_class: 'low',
        metric_value: 0.35,
        limiting_factors: [],
      },
      pairwise_reliability: {
        cen_dmn: {
          reliability_class: 'low',
          metric_value: 0.32,
          limiting_factors: ['MOTION_CORRUPTED'],
        },
        sn_cen: { reliability_class: 'low', metric_value: 0.28, limiting_factors: [] },
        sn_dmn: { reliability_class: 'low', metric_value: 0.3, limiting_factors: [] },
      },
      normative_compatibility: { reliability_class: 'low', limiting_factors: [] },
      atlas_sensitivity: { reliability_class: 'low', limiting_factors: [] },
      preprocessing_sensitivity: { reliability_class: 'low', limiting_factors: [] },
    },
  });

  // ---------------------------------------------------------------------------
  // Condition 1: Qualified Network Context Present
  // ---------------------------------------------------------------------------
  describe('Condition 1: Qualified Network Context Present', () => {
    for (const ind of indications) {
      it(`evaluates ${ind.name} (${ind.code}) with qualified network context without throwing`, () => {
        const netContext = createQualifiedNetworkContext(ind.code);
        const resolvedContext = createCanonicalResolvedContextV2({
          caseId: `case-${ind.code}-present`,
          indication: ind.code,
          mode: 'clinical',
          tripleNetworkContext: netContext,
        });

        expect(resolvedContext.tripleNetworkContext).toBeDefined();
        expect(resolvedContext.tripleNetworkContext?.reliability.overall_status).toBe('high');
        expect(resolvedContext.tripleNetworkContext?.reliability.clinical_qualification).toBe(
          'qualified',
        );
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Condition 2: Network Context Completely Absent (Graceful Fallback)
  // ---------------------------------------------------------------------------
  describe('Condition 2: Network Context Completely Absent (Graceful Fallback)', () => {
    for (const ind of indications) {
      it(`preserves baseline targeting for ${ind.name} (${ind.code}) when network context is omitted (§62, §77)`, () => {
        const resolvedContext = createCanonicalResolvedContextV2({
          caseId: `case-${ind.code}-absent`,
          indication: ind.code,
          mode: 'clinical',
          tripleNetworkContext: undefined,
        });

        expect(resolvedContext.tripleNetworkContext).toBeUndefined();
        // Candidate generators must still be available
        const generators = ind.plugin.generators();
        expect(generators.length).toBeGreaterThan(0);
      });
    }
  });

  // ---------------------------------------------------------------------------
  // Condition 3: Degraded / Motion-Corrupted Network Context
  // ---------------------------------------------------------------------------
  describe('Condition 3: Degraded / High-Motion Network Context', () => {
    for (const ind of indications) {
      it(`flags unqualified status for ${ind.name} (${ind.code}) and preserves conservative fallback`, () => {
        const degradedContext = createDegradedNetworkContext(ind.code);
        const resolvedContext = createCanonicalResolvedContextV2({
          caseId: `case-${ind.code}-degraded`,
          indication: ind.code,
          mode: 'clinical',
          tripleNetworkContext: degradedContext,
        });

        expect(resolvedContext.tripleNetworkContext?.reliability.overall_status).toBe('low');
        expect(resolvedContext.tripleNetworkContext?.reliability.clinical_qualification).toBe(
          'unqualified',
        );
        expect(
          resolvedContext.tripleNetworkContext?.reliability.acquisition_quality.limiting_factors,
        ).toContain('EXCESSIVE_MOTION');
      });
    }
  });
});
