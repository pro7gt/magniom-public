/**
 * @magniom/target-engine - Section 21 Exit Criterion 4 Test Suite
 * "Research generator cannot leak into Clinical"
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§21, §115)
 */

import { describe, it, expect } from 'vitest';
import {
  runTargetEngineV2,
  createCanonicalResolvedContextV2,
  createCanonicalPointGeometry,
  type CandidateGenerator,
  type CandidateDraft,
  type ResolvedTargetEngineContextV2,
  type CandidateGeneratorResult,
  type IndicationTargetingPlugin,
  MDDPlugin,
} from '../../src/index.js';
import { evaluateGateG14 } from '../../src/gates/v2/g14-research-leakage.js';

describe('Target Engine Core Exit Criterion 4: Research Candidate Isolation', () => {
  const researchGenerator: CandidateGenerator = {
    descriptor: {
      id: 'GEN-RESEARCH-ONLY-001',
      code: 'EXPERIMENTAL_CONNECTOME_GENERATOR',
      semanticVersion: '0.1.0',
      indicationModuleReleaseIds: ['00000000-0000-0000-0000-000000000001'],
      candidateRoles: ['research_hypothesis'],
      targetFamilyScopeIds: ['TF-MDD-LDLPFC-EST-001'],
      evidencePathStatusScope: ['research_permitted'],
      permittedModes: ['research'], // Research only!
      requiredCapabilities: [],
      optionalCapabilities: [],
      permittedGeometryTypes: ['point'],
      baselineRelationship: 'independent_hypothesis',
      deterministic: true,
      generatorFailurePolicy: 'research_optional',
    },
    generate(_ctx: ResolvedTargetEngineContextV2): CandidateGeneratorResult {
      const draft: CandidateDraft = {
        draftId: 'draft-research-experimental',
        generatorId: 'GEN-RESEARCH-ONLY-001',
        targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
        proposedRole: 'research_hypothesis',
        targetGeometry: createCanonicalPointGeometry(-40, 42, 32, 'left', 'research-pipeline'),
        evidencePathIds: ['PATH-MDD-BA46'],
        clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
        reliedOnMeasurementIds: [],
        reliedOnReliabilityIds: [],
        lineage: { lineageType: 'experimental_protocol' },
        rawScientificFeatures: [
          { code: 'phenotype_concordance', value: 0.99, isApplicable: true },
          { code: 'circuit_concordance', value: 0.99, isApplicable: true },
        ],
        generatorLimitations: ['For investigational and exploratory use only.'],
        nominationRationale: 'Exploratory experimental cortical hypothesis.',
        generatorTrace: { algorithmCode: 'EXP_01', algorithmVersion: '0.1.0' },
      };
      return {
        generatorId: 'GEN-RESEARCH-ONLY-001',
        generatorVersion: '0.1.0',
        status: 'generated',
        candidates: [draft],
      };
    },
  };

  it('prevents research-only generator from leaking into a Clinical Slate', () => {
    // Mode is explicitly CLINICAL
    const context = createCanonicalResolvedContextV2({
      request: {
        mode: 'clinical',
      } as any,
    });

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), researchGenerator];
      }
    }

    const pluginWithResearch = new TestPlugin();
    const result = runTargetEngineV2(context, { plugin: pluginWithResearch });

    // The research generator MUST NOT appear in primary or additional candidates in clinical mode
    const primaryCandidateIds = result.slate.primaryCandidates.map(p => p.targetCandidateId);
    const additionalCandidateIds = result.slate.additionalCandidates.map(a => a.targetCandidateId);

    for (const cand of result.allCandidates) {
      if (
        cand.candidateRole === 'research_hypothesis' ||
        cand.provenance.createdBy === 'GEN-RESEARCH-ONLY-001'
      ) {
        expect(primaryCandidateIds).not.toContain(cand.id);
        expect(additionalCandidateIds).not.toContain(cand.id);
      }
    }

    // Diagnostic should log that the generator was skipped in clinical mode
    expect(result.diagnostics.some(d => d.includes('GENERATOR_MODE_SKIPPED'))).toBe(true);
  });

  it('allows research generator to run and nominate candidates when mode is research', () => {
    // Mode is RESEARCH
    const context = createCanonicalResolvedContextV2({
      request: {
        mode: 'research',
      } as any,
      indicationModule: {
        permittedModes: ['clinical', 'research', 'validation'],
      } as any,
    });

    class TestPlugin extends MDDPlugin {
      override generators(): readonly CandidateGenerator[] {
        return [...super.generators(), researchGenerator];
      }
    }

    const pluginWithResearch = new TestPlugin();
    const result = runTargetEngineV2(context, { plugin: pluginWithResearch });

    // In research mode, the generator executed and was not blocked by mode gate
    const executedHashes = result.reproducibilityManifest.executedGeneratorManifestHashes;
    expect(executedHashes.length).toBeGreaterThanOrEqual(2);
  });

  it('Gate G14 directly rejects candidate draft with synthetic dataOrigin in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-synthetic-candidate',
      generatorId: 'GEN-MDD-CONNECTOME-REFINED-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'synthetic', // Synthetic candidate!
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'connectomic_refinement' },
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Synthetic target test',
      generatorTrace: { algorithmCode: 'CASH_ZALESKY_FC_CENTROID', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain(
      'TN-014:SYNTHETIC_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE',
    );
  });

  it('Gate G14 directly rejects candidate relying on synthetic measurement bundle in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
      measurementBundle: {
        bundleId: 'bundle-synth-01',
        patientId: 'patient-01',
        createdAt: new Date().toISOString(),
        dataOrigin: 'synthetic', // Synthetic bundle!
        measurements: [],
      } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-patient-measured',
      generatorId: 'GEN-MDD-CONNECTOME-REFINED-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'patient_measured',
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'connectomic_refinement' },
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Target test',
      generatorTrace: { algorithmCode: 'CASH_ZALESKY_FC_CENTROID', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain(
      'TN-014:SYNTHETIC_MEASUREMENT_LEAKAGE_IN_CLINICAL_MODE',
    );
  });

  it('Gate G14 allows synthetic dataOrigin in research mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'research' } as any,
      measurementBundle: {
        bundleId: 'bundle-synth-01',
        patientId: 'patient-01',
        createdAt: new Date().toISOString(),
        dataOrigin: 'synthetic',
        measurements: [],
      } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-synthetic-candidate',
      generatorId: 'GEN-MDD-CONNECTOME-REFINED-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'research_hypothesis',
      dataOrigin: 'synthetic',
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      lineage: { lineageType: 'experimental_protocol' },
      rawScientificFeatures: [],
      generatorTrace: { algorithmCode: 'CASH_ZALESKY_FC_CENTROID', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('pass');
  });

  it('Gate G14 directly rejects candidate draft with unknown dataOrigin in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-unknown-origin',
      generatorId: 'GEN-MDD-CONNECTOME-REFINED-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'unknown',
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Unknown origin test',
      generatorTrace: { algorithmCode: 'CASH_ZALESKY_FC_CENTROID', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain(
      'TN-014:UNKNOWN_DATA_ORIGIN_PROHIBITED_IN_CLINICAL_MODE',
    );
  });

  it('Gate G14 rejects normative dataOrigin in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-normative-origin',
      generatorId: 'GEN-MDD-PATHWAY-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'normative',
      targetGeometry: createCanonicalPointGeometry(-38, 44, 34, 'left', 'pathway-pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Normative origin clinical test',
      generatorTrace: { algorithmCode: 'SEGUIN_PATHWAY_ROUTING', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain(
      'TN-012:NORMATIVE_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE',
    );
  });

  it('Gate G14 rejects candidate with unpromoted scientificMaturity (validation) in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-validation-maturity',
      generatorId: 'GEN-MDD-CONNECTOME-REFINED-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'patient_measured',
      scientificMaturity: 'validation',
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Unpromoted validation candidate test',
      generatorTrace: { algorithmCode: 'CASH_ZALESKY_FC_CENTROID', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain(
      'TN-012:UNPROMOTED_MATURITY_PROHIBITED_IN_CLINICAL_MODE',
    );
  });

  it('Gate G14 rejects candidate with clinicalPromotionStatus = blocked in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-blocked-status',
      generatorId: 'GEN-MDD-CONNECTOME-REFINED-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_candidate',
      clinicalPromotionStatus: 'blocked',
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Blocked promotion status candidate test',
      generatorTrace: { algorithmCode: 'CASH_ZALESKY_FC_CENTROID', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain('TN-012:CLINICAL_PROMOTION_BLOCKED');
  });

  it('Gate G14 fails closed when dataOrigin is missing/undefined in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-missing-origin',
      generatorId: 'GEN-TEST-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      // dataOrigin omitted!
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Missing origin test',
      generatorTrace: { algorithmCode: 'TEST', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain(
      'TN-014:UNKNOWN_DATA_ORIGIN_PROHIBITED_IN_CLINICAL_MODE',
    );
  });

  it('Gate G14 fails closed when scientificMaturity is missing/undefined in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-missing-maturity',
      generatorId: 'GEN-TEST-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'patient_measured',
      // scientificMaturity omitted!
      clinicalPromotionStatus: 'approved',
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Missing maturity test',
      generatorTrace: { algorithmCode: 'TEST', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain(
      'TN-012:UNPROMOTED_MATURITY_PROHIBITED_IN_CLINICAL_MODE',
    );
  });

  it('Gate G14 fails closed when clinicalPromotionStatus is missing/undefined in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-missing-promotion',
      generatorId: 'GEN-TEST-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_approved',
      // clinicalPromotionStatus omitted!
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Missing promotion status test',
      generatorTrace: { algorithmCode: 'TEST', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain('TN-012:CLINICAL_PROMOTION_BLOCKED');
  });

  it('Gate G14 fails closed on candidate_under_review in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-under-review',
      generatorId: 'GEN-TEST-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_candidate',
      clinicalPromotionStatus: 'candidate_under_review', // Not yet approved!
      targetGeometry: createCanonicalPointGeometry(-42, 44, 30, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Candidate under review test',
      generatorTrace: { algorithmCode: 'TEST', algorithmVersion: '1.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain('TN-012:CLINICAL_PROMOTION_BLOCKED');
  });

  it('Gate G14 passes candidate with complete valid clinical provenance in clinical mode', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-valid-clinical',
      generatorId: 'GEN-MDD-EVIDENCE-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      targetGeometry: createCanonicalPointGeometry(-44, 40, 28, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Fully qualified clinical candidate',
      generatorTrace: { algorithmCode: 'CANONICAL_ANCHOR', algorithmVersion: '2.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('pass');
    expect(evalResult.reasonCodes).toHaveLength(0);
  });

  it('Gate G14 passes guideline-approved fixed baseline with normative origin in clinical mode (MAGNIOM Revision 03 §4)', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const fixedGuidelineDraft: CandidateDraft = {
      draftId: 'draft-mdd-guideline-fixed',
      generatorId: 'GEN-MDD-EVIDENCE-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'evidence_anchor',
      targetDefinitionOrigin: 'guideline',
      inputDataOrigin: 'none',
      patientPersonalizationStatus: 'fixed',
      clinicalApprovalStatus: 'approved',
      dataOrigin: 'normative',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      targetGeometry: createCanonicalPointGeometry(-44, 40, 28, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: [],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Guideline-approved canonical fixed baseline',
      generatorTrace: { algorithmCode: 'CANONICAL_ANCHOR', algorithmVersion: '2.0.0' },
    };

    const evalResult = evaluateGateG14(fixedGuidelineDraft, context);
    expect(evalResult.result).toBe('pass');
    expect(evalResult.reasonCodes).toHaveLength(0);
  });

  it('Gate G14 rejects candidate with unresolved reliedOnMeasurementId in clinical mode (MAGNIOM Revision 03 §8)', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
    });

    const unresolvableDraft: CandidateDraft = {
      draftId: 'draft-unresolvable-measurement',
      generatorId: 'GEN-MDD-CONNECTOME-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      targetGeometry: createCanonicalPointGeometry(-44, 40, 28, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: ['MEAS-DOES-NOT-EXIST'],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Target with dangling measurement ID',
      generatorTrace: { algorithmCode: 'CANONICAL_ANCHOR', algorithmVersion: '2.0.0' },
    };

    const evalResult = evaluateGateG14(unresolvableDraft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain(
      'TN-014:UNRESOLVED_MEASUREMENT_ID:MEAS-DOES-NOT-EXIST',
    );
  });

  it('Gate G14 rejects candidate relying on mixed measurement bundle in clinical mode (MAGNIOM Revision 03 §8)', () => {
    const context = createCanonicalResolvedContextV2({
      request: { mode: 'clinical' } as any,
      measurementBundle: {
        bundleId: 'bundle-mixed-01',
        patientId: 'patient-01',
        createdAt: new Date().toISOString(),
        dataOrigin: 'mixed', // Mixed bundle!
        measurements: [
          {
            measurementId: 'MEAS-01',
            modality: 'resting_state_fmri',
            status: 'qualified',
            dataOrigin: 'patient_measured',
          },
        ],
      } as any,
    });

    const draft: CandidateDraft = {
      draftId: 'draft-mixed-bundle',
      generatorId: 'GEN-MDD-CONNECTOME-001',
      targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
      proposedRole: 'primary',
      dataOrigin: 'patient_measured',
      scientificMaturity: 'clinical_approved',
      clinicalPromotionStatus: 'approved',
      targetGeometry: createCanonicalPointGeometry(-44, 40, 28, 'left', 'pipeline'),
      evidencePathIds: ['PATH-MDD-BA46'],
      clinicalObjectiveIds: ['00000000-0000-0000-0000-000000000040'],
      reliedOnMeasurementIds: ['MEAS-01'],
      reliedOnReliabilityIds: [],
      rawScientificFeatures: [],
      generatorLimitations: [],
      nominationRationale: 'Candidate relying on mixed bundle',
      generatorTrace: { algorithmCode: 'CANONICAL_ANCHOR', algorithmVersion: '2.0.0' },
    };

    const evalResult = evaluateGateG14(draft, context);
    expect(evalResult.result).toBe('fail');
    expect(evalResult.reasonCodes).toContain(
      'TN-014:MIXED_MEASUREMENT_ORIGIN_PROHIBITED_IN_CLINICAL_MODE',
    );
  });
});
