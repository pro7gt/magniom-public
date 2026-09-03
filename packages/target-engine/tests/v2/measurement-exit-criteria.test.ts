/**
 * @magniom/target-engine - Phase 3 Measurement Exit Criteria Integration Tests
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (Phase 3)
 * Verifies that Target Engine consumes MeasurementBundle and ReliabilityBundle produced by
 * multimodal measurement platform, validating Gates G4 and G5.
 */

import { describe, it, expect } from 'vitest';
import {
  evaluateGateG4,
  evaluateGateG5,
  createCanonicalResolvedContextV2,
  createCanonicalPointGeometry,
  type CandidateDraft,
} from '../../src/index.js';
import { GOLDEN_MULTIMODAL_CASES } from '@magniom/measurement-testkit';

describe('Target Engine - Phase 3 Multimodal Measurement Integration', () => {
  it('passes Gates G4 and G5 when MeasurementBundle & ReliabilityBundle are fully qualified (MM-01)', () => {
    const baseContext = createCanonicalResolvedContextV2();
    const mm01 = GOLDEN_MULTIMODAL_CASES['MM-01']!;
    const bundles = mm01.buildBundles();

    const context = {
      ...baseContext,
      measurementBundle: bundles.measurementBundle,
      reliabilityBundle: bundles.reliabilityBundle,
    };

    const refinedDraft: CandidateDraft = {
      draftId: 'draft-refined-fc',
      generatorId: 'GEN-FC-01',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'connectome_refinement',
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'refined-fc'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: ['MEAS-RSFMRI-01'],
      reliedOnReliabilityIds: ['REL-RSFMRI-01'],
      lineage: {
        lineageType: 'measurement_refinement',
        refinementKind: 'functional_connectivity',
        baselineCandidateDraftId: 'draft-baseline-beam',
      },
      rawScientificFeatures: [{ code: 'phenotype_concordance', value: 0.92, isApplicable: true }],
      warnings: [],
      scientificLimitations: [],
    };

    // Gate G4: requires 'individual_fc_refinement'
    const g4 = evaluateGateG4(refinedDraft, context, ['individual_fc_refinement']);
    expect(g4.result).toBe('pass');

    // Gate G5: reliability check
    const g5 = evaluateGateG5(refinedDraft, context);
    expect(g5.result).toBe('pass');
  });

  it('fails Gate G4 and G5 when rs-fMRI fails QC and reliability criteria (MM-02)', () => {
    const baseContext = createCanonicalResolvedContextV2();
    const mm02 = GOLDEN_MULTIMODAL_CASES['MM-02']!;
    const bundles = mm02.buildBundles();

    const context = {
      ...baseContext,
      measurementBundle: bundles.measurementBundle,
      reliabilityBundle: bundles.reliabilityBundle,
    };

    const refinedDraft: CandidateDraft = {
      draftId: 'draft-refined-fc',
      generatorId: 'GEN-FC-01',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'connectome_refinement',
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'refined-fc'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: context.request.clinicalObjectiveIds,
      reliedOnMeasurementIds: ['MEAS-RSFMRI-02'],
      reliedOnReliabilityIds: ['REL-RSFMRI-02'],
      lineage: {
        lineageType: 'measurement_refinement',
        refinementKind: 'functional_connectivity',
        baselineCandidateDraftId: 'draft-baseline-beam',
      },
      rawScientificFeatures: [{ code: 'phenotype_concordance', value: 0.35, isApplicable: true }],
      warnings: [],
      scientificLimitations: [],
    };

    // Gate G4 fails because requirement is unsatisfied
    const g4 = evaluateGateG4(refinedDraft, context, ['individual_fc_refinement']);
    expect(g4.result).toBe('fail');
    expect(g4.reasonCodes[0]).toContain('MEASUREMENT_CAPABILITY_NOT_QUALIFIED');

    // Gate G5 fails because capability is not_qualified
    const g5 = evaluateGateG5(refinedDraft, context);
    expect(g5.result).toBe('fail');
    expect(g5.reasonCodes).toContain('RELIABILITY_QUALIFICATION_FAILED');
  });
});
