import { describe, it, expect } from 'vitest';
import {
  validateIndicationModule,
  validateIndicationTargetingContext,
  validateIndicationPhenotypeExtension,
  ModuleGovernanceStatusSchema,
  IndicationModuleStatusSchema,
  AbstentionTypeSchema,
  DomainValidationError,
} from '../src/index.js';
import type {
  IndicationModule,
  IndicationTargetingContext,
  IndicationPhenotypeExtension,
} from '@magniom/domain';

describe('Architecture Spec v2.0 Schemas & Validators', () => {
  it('1. should validate all 9 IndicationModuleStatus values (§3)', () => {
    const validStatuses = [
      'research_only',
      'evidence_staging',
      'validation_candidate',
      'retrospective_validation',
      'silent_prospective',
      'clinical_release_candidate',
      'clinical_active',
      'suspended',
      'withdrawn',
    ] as const;

    for (const status of validStatuses) {
      expect(() => ModuleGovernanceStatusSchema.parse(status)).not.toThrow();
      expect(() => IndicationModuleStatusSchema.parse(status)).not.toThrow();
    }

    expect(() => ModuleGovernanceStatusSchema.parse('invalid_status')).toThrow();
  });

  it('2. should validate canonical IndicationModule object conforming to §12', () => {
    const validModule: IndicationModule = {
      id: '11111111-1111-4111-8111-111111111111',
      code: 'MAGNIOM-IND-STROKE-MOTOR',
      version: '1.0.0',
      indication: {
        conceptId: 'concept-stroke-motor',
        system: 'SNOMED-CT',
        codingSystem: 'SNOMED-CT',
        code: '230690007',
        display: 'Stroke motor impairment',
        preferredTerm: 'Stroke motor impairment',
      },
      title: 'Stroke Motor Recovery Indication Module',
      status: 'validation_candidate',
      intended_population: {
        code: 'POP-STROKE-MOTOR-ADULT',
        label: 'Adult post-stroke hemiparesis',
        description: 'Adult patients with ischemic or hemorrhagic cortical/subcortical stroke',
        minAgeYears: 18,
        maxAgeYears: 85,
      },
      allowed_modes: ['RESEARCH', 'VALIDATION'],
      phenotype_schema_version_id: 'schema-pheno-stroke-1.0.0',
      evidence_scope_id: 'scope-stroke-motor-001',
      clinical_objectives: [
        {
          id: 'obj-upper-limb',
          indicationModuleReleaseId: '11111111-1111-4111-8111-111111111111',
          code: 'UPPER_LIMB_MOTOR_RECOVERY',
          label: 'Upper Limb Motor Recovery',
          description: 'Improvement in paretic upper limb fugl-meyer motor score',
          targetMappability: 'clinically_supported',
        },
      ],
      candidate_generation_methods: [
        {
          strategyId: 'strat-ipsilesional-m1',
          code: 'IPSILESIONAL_M1_STIMULATION',
          label: 'Ipsilesional M1 High-Frequency',
        },
      ],
      measurement_requirements: [
        {
          code: 'REQ-SMRI-LESION',
          modality: 'lesion_mapping',
          requirement: 'required',
          purpose: 'candidate_generation',
          missingDataBehaviour: 'block_target_generation',
          rationale: 'Lesion anatomy required to evaluate tissue destruction',
        },
      ],
      target_geometry_types: ['somatotopic', 'point'],
      reliability_policy_refs: ['pol-rel-stroke-001'],
      scientific_policy_compatibility: ['pol-compat-stroke-2.0.0'],
      adjunctive_context_requirements: [
        {
          id: '22222222-2222-4222-8222-222222222222',
          version: '1.0',
          indicationModuleReleaseId: '11111111-1111-4111-8111-111111111111',
          code: 'CONCURRENT_MOTOR_REHAB',
          label: 'Concurrent Physical/Occupational Therapy',
          contextType: 'concurrent_rehabilitation',
          role: 'recommended_by_evidence',
          description: 'rTMS administered immediately preceding or during motor training',
          evidenceClaimIds: ['33333333-3333-4333-8333-333333333333'],
          absenceBehaviour: 'show_limitation',
          provenance: {
            createdBy: 'test-author',
            createdAt: '2026-09-04T07:00:00.000Z',
            softwareVersion: '2.0.0',
          },
        },
      ],
      limitations: ['Not validated for acute stroke under 2 weeks'],
      validation_evidence_ids: ['val-ev-stroke-001'],
      manifest_sha256: 'a'.repeat(64),
    };

    expect(() => validateIndicationModule(validModule)).not.toThrow();

    // Rejection on invalid sha256
    const invalidModule = { ...validModule, manifest_sha256: 'short-hash' };
    expect(() => validateIndicationModule(invalidModule)).toThrow(DomainValidationError);
  });

  it('3. should validate IndicationTargetingContext conforming to §34', () => {
    const validContext: IndicationTargetingContext = {
      case_id: '22222222-2222-4222-8222-222222222222',
      indication_module_release_id: '33333333-3333-4333-8333-333333333333',
      clinical_objective_snapshot_id: '44444444-4444-4444-8444-444444444444',
      phenotype_snapshot_id: '55555555-5555-4555-8555-555555555555',
      evidence_library_release_id: '66666666-6666-4666-8666-666666666666',
      scientific_policy_release_id: '77777777-7777-4777-8777-777777777777',
      measurement_bundle_id: '88888888-8888-4888-8888-888888888888',
      reliability_bundle_id: '99999999-9999-4999-8999-999999999999',
      target_engine_version_id: '2.0.0',
      device_context: [
        {
          coilModelId: 'MagVenture-B65',
          stimulatorClass: 'MagPro-R30',
        },
      ],
    };

    expect(() => validateIndicationTargetingContext(validContext)).not.toThrow();

    const invalidContext = { ...validContext, case_id: 'not-a-uuid' };
    expect(() => validateIndicationTargetingContext(invalidContext)).toThrow(DomainValidationError);
  });

  it('4. should validate IndicationPhenotypeExtension conforming to §62', () => {
    const validExtension: IndicationPhenotypeExtension = {
      indication_module_release_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      schema_version: '1.0.0',
      payload: {
        painLaterality: 'right',
        vasScore: 8.5,
        neuropathicDescriptors: ['burning', 'allodynia'],
      },
      validation_status: 'valid',
      approved_by: 'clinician-007',
      approved_at: '2026-09-04T07:00:00.000Z',
      payload_sha256: 'b'.repeat(64),
    };

    expect(() => validateIndicationPhenotypeExtension(validExtension)).not.toThrow();

    const invalidExtension = { ...validExtension, validation_status: 'unknown_status' };
    expect(() => validateIndicationPhenotypeExtension(invalidExtension)).toThrow(
      DomainValidationError,
    );
  });

  it('5. should validate all 11 §74 abstention classes in AbstentionTypeSchema', () => {
    const requiredAbstentions = [
      'unsupported_indication',
      'unsupported_disease_stage',
      'module_not_clinically_qualified',
      'lesion_registration_failure',
      'target_region_destroyed_by_lesion',
      'protocol_context_missing',
      'motor_map_unreliable',
      'body_region_mapping_uncertain',
      'audiology_incomplete',
      'coil_not_compatible',
      'field_model_unreliable',
    ] as const;

    for (const code of requiredAbstentions) {
      expect(() => AbstentionTypeSchema.parse(code)).not.toThrow();
    }
  });
});
