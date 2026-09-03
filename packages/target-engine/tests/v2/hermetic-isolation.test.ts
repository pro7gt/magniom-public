/**
 * @magniom/target-engine - Hermetic Scientific Kernel Isolation Test Suite
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (§34, 40)
 * and Section 23 (Plugin Contract Tests — Item 6: No DB/network scientific access)
 */

import { describe, it, expect, vi } from 'vitest';
import { CANONICAL_PLUGIN_CATALOG, type ResolvedTargetEngineContextV2 } from '../../src/index.js';

function createMockContext(
  indicationCode: string,
  mode: 'clinical' | 'research' = 'clinical',
): ResolvedTargetEngineContextV2 {
  return {
    request: {
      caseId: 'case-isolation-001',
      caseIndicationId: 'ci-isolation-001',
      mode,
      indicationModuleReleaseId: '00000000-0000-0000-0000-000000000001',
      phenotypeSnapshotId: 'ps-isolation-001',
      clinicalObjectiveIds: ['obj-001', 'obj-anxious-somatic', 'obj-bilateral'],
      measurementBundleId: 'mb-isolation-001',
      evidenceLibraryReleaseId: 'el-isolation-001',
      scientificPolicyReleaseId: 'sp-isolation-001',
      targetEngineReleaseId: 'te-isolation-001',
    },
    phenotypeSnapshot: {
      patientId: 'pat-001',
      phenotypeId: 'pheno-001',
      caseId: 'case-isolation-001',
      capturedAt: '2026-09-02T12:00:00.000Z',
      anxiousDistressPresent: true,
      anhedoniaPresent: false,
      treatmentResistanceTier: 2,
      subtypes: [],
      severityScales: [],
    },
    clinicalObjectives: [],
    indicationModule: {
      id: '00000000-0000-0000-0000-000000000001',
      code: `MAGNIOM-IND-${indicationCode}`,
      semanticVersion: '2.0.0',
      title: `${indicationCode} Targeting Module`,
      indication: { conceptId: 'c-001', label: indicationCode, code: indicationCode },
      intendedPopulation: {
        code: 'POP-001',
        label: 'Adult Population',
        description: 'Adults with indication',
      },
      status: 'clinical_active',
      governanceStatus: 'approved',
      qualificationLevel: 'Q1',
      permittedModes: ['clinical', 'research', 'validation'],
      phenotypeSchemaVersionId: 'schema-001',
      evidenceScopeId: 'scope-001',
      clinicalObjectives: [],
      candidateGenerationMethods: [],
      measurementRequirements: [],
      targetGeometryTypes: ['point', 'coil_field', 'somatotopic', 'surface_roi', 'network'],
      reliabilityPolicyRefs: [],
      scientificPolicyCompatibility: [],
      adjunctiveContextRequirements: [],
      limitations: [],
      validationEvidenceIds: [],
      manifestSha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      provenance: {
        createdBy: 'test',
        createdAt: '2026-09-02T12:00:00.000Z',
        softwareVersion: '2.0.0',
      },
    },
    lesionContexts: [
      {
        id: 'lesion-001',
        version: '1.0',
        caseIndicationId: 'ci-isolation-001',
        lesionType: 'ischemic',
        lesionLaterality: 'left',
        sourceImagingStudyIds: [],
        corticalRegionsAffected: [],
        subcorticalRegionsAffected: [],
        structuralDistortion: 'low',
        registrationQuality: 'high',
        segmentationQuality: 'high',
        efieldRelevance: 'none_known',
        dataQuality: 'valid',
        interpretation: 'Left MCA stroke, perilesional M1 intact',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
    ],
    measurementBundle: {
      id: 'mb-isolation-001',
      caseIndicationId: 'ci-isolation-001',
      version: '1.0',
      measurements: [],
      requirementEvaluations: [
        {
          requirementCode: 'individual_fc_refinement',
          modality: 'resting_state_fmri',
          requirementType: 'required_for_personalisation',
          status: 'satisfied',
          resultingCapability: 'enabled',
          explanation: 'Valid rs-fMRI',
        },
        {
          requirementCode: 'motor_hotspot_targeting',
          modality: 'tms_motor_mapping',
          requirementType: 'required_for_personalisation',
          status: 'satisfied',
          resultingCapability: 'enabled',
          explanation: 'Valid motor map',
        },
      ],
      structuralDistortionIndex: 0.05,
      overallDataQuality: 'valid',
      bundleManifestSha256: '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
      provenance: {
        createdBy: 'test',
        createdAt: '2026-09-02T12:00:00.000Z',
        softwareVersion: '2.0.0',
      },
    },
    permittedEvidencePaths: [
      {
        id: 'ep-001',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000001',
        evidencePathCode: 'EP-M1',
        therapeuticCircuitId: 'TC-001',
        targetFamilyId: 'TF-MDD-LDLPFC-EST-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-ocd-001',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000002',
        evidencePathCode: 'EP-OCD-MPFC',
        therapeuticCircuitId: 'TC-002',
        targetFamilyId: 'TF-OCD-MPFC-ACC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-pain-001',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000003',
        evidencePathCode: 'EP-PAIN-M1',
        therapeuticCircuitId: 'TC-003',
        targetFamilyId: 'TF-PAIN-M1-SOMATOTOPIC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-stroke-001',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000004',
        evidencePathCode: 'EP-STROKE-M1',
        therapeuticCircuitId: 'TC-004',
        targetFamilyId: 'TF-STROKE-CONTRALESIONAL-M1-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-aphasia-001',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000005',
        evidencePathCode: 'EP-APHASIA-RIFG',
        therapeuticCircuitId: 'TC-005',
        targetFamilyId: 'TF-APHASIA-RIGHT-IFG-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-tbi-001',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000006',
        evidencePathCode: 'EP-TBI-DLPFC',
        therapeuticCircuitId: 'TC-006',
        targetFamilyId: 'TF-TBI-COGNITIVE-DLPFC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-ptsd-001',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000007',
        evidencePathCode: 'EP-PTSD-RDLPFC',
        therapeuticCircuitId: 'TC-007',
        targetFamilyId: 'TF-PTSD-RDLPFC-001',
        status: 'clinical_permitted',
        permittedModes: ['clinical', 'research', 'validation'],
        governanceClassification: 'established_consensus',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
      {
        id: 'ep-tinnitus-001',
        version: '2.0.0',
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000008',
        evidencePathCode: 'EP-TINNITUS-AUD',
        therapeuticCircuitId: 'TC-008',
        targetFamilyId: 'TF-TINNITUS-AUDITORY-001',
        status: 'research_permitted',
        permittedModes: ['research'],
        governanceClassification: 'investigational',
        provenance: {
          createdBy: 'test',
          createdAt: '2026-09-02T12:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      },
    ],
    permittedTargetFamilies: [],
    scientificPolicy: {
      id: 'sp-001',
      code: 'DEFAULT-SP',
      semanticVersion: '2.0.0',
    },
  };
}

describe('Hermetic Isolation Contract — Item 6: No DB / Network Access', () => {
  it('should execute all plugins without triggering global fetch or network requests', () => {
    // Spy on global fetch
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    try {
      for (const entry of CANONICAL_PLUGIN_CATALOG) {
        const plugin = entry.createInstance();
        const context = createMockContext(entry.indication, 'research');

        // Execute all generators in memory
        for (const gen of plugin.generators()) {
          const result = gen.generate(context);
          expect(result).toBeDefined();
          expect(result.generatorId).toBe(gen.descriptor.id);
        }

        // Execute context validation
        const val = plugin.validateModuleContext(context);
        expect(val).toBeDefined();
      }

      // Assert zero network calls
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
