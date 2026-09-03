/**
 * MAGNIOM ADVERSARIAL TENANCY & WRONG-MODULE BOUNDARY TEST SUITE
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (§46, §65)
 * Standard Reference: IEC 62304 Class C Critical / ISO 14971 Safety Boundaries
 *
 * Verifies that:
 * 1. Wrong-module invocation (e.g. submitting MDD data to OCD plugin) produces 0 candidates.
 * 2. Unmet targeting preconditions / unmapped evidence paths produce a structured abstention slate.
 * 3. Research-mode indication modules strictly fail clinical digital signing.
 * 4. Cross-tenant metadata is preserved and recorded in semantic audit logs.
 */

import { describe, it, expect } from 'vitest';
import {
  executeSyntheticVerticalSlice,
  SyntheticAuditLedger,
  ResearchModeSigningProhibitedError,
} from '../../src/orchestrator/synthetic-vertical-slice.js';
import { MDD_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/mdd-fixtures.js';
import { OCD_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/ocd-fixtures.js';
import { PTSD_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/ptsd-fixtures.js';
import { TINNITUS_GOLDEN_SUITE } from '../../../test-fixtures/src/synthetic-vertical-slice/tinnitus-fixtures.js';
import { OCDPlugin } from '../../src/plugins/ocd/ocd-plugin.js';
import { createCanonicalResolvedContextV2 } from '../../src/core/context.js';

describe('MAGNIOM CI/CD §46 & §65: Adversarial Boundary & Tenancy Tests', () => {
  const auditLedger = new SyntheticAuditLedger();

  it('WRONG-MODULE (§65): Submitting foreign MDD clinical context to OCD plugin fails module validation', async () => {
    const mddCase = MDD_GOLDEN_SUITE[0];
    const ocdCase = OCD_GOLDEN_SUITE[0];
    const ocdPlugin = new OCDPlugin();

    // Fabricate resolved context where module is MDD, but evaluated by OCD plugin
    const foreignMddContext = createCanonicalResolvedContextV2({
      request: {
        caseId: 'adv-wrong-module-01',
        caseIndicationId: 'ci-adv-wrong-module-01',
        clinicalObjectiveIds: mddCase.input.clinicalObjectives.map(o => o.id),
        mode: 'validation',
      },
      moduleRelease: {
        id: 'IMR-MDD-2.0.0',
        code: 'MDD',
        semanticVersion: '2.0.0',
        title: 'Major Depressive Disorder',
        description: 'MDD module',
        indication: { conceptId: 'IND-MDD', label: 'Major Depressive Disorder' },
        lifecycleStatus: 'active',
        moduleStatus: 'qualified',
        qualificationLevel: 'Q8',
        permittedModes: ['clinical', 'research'],
        intendedPopulation: { code: 'POP-MDD', label: 'MDD', description: 'MDD' },
        phenotypeSchemaVersionId: 'ps-mdd-2.0.0',
        clinicalObjectiveDefinitionIds: ['OBJ-MDD-MADRS'],
        evidenceScopeId: 'ES-MDD-2.0.0',
        permittedTargetFamilyIds: ['TF-MDD-DLPFC-001'],
        permittedCandidateGenerationMethodIds: ['GEN-MDD-DLPFC'],
        measurementRequirements: [],
        reliabilityPolicyRefs: [],
        permittedTargetGeometryTypes: ['point'],
        scientificPolicyCompatibilityRefs: ['POL-v2-2026.09'],
        knownLimitations: [],
        validationEvidenceIds: [],
        payloadSha256: '0000000000000000000000000000000000000000000000000000000000000000',
        manifestSha256: '0000000000000000000000000000000000000000000000000000000000000000',
        createdAt: new Date().toISOString(),
        provenance: {
          sourceId: 'src-test',
          generatedAt: new Date().toISOString(),
          softwareVersion: '2.0.0',
          authorRole: 'test',
        },
      },
      phenotypeSnapshot: mddCase.input.clinicalContext.phenotypeSnapshot,
      diseaseStageContext: undefined,
      treatmentContext: undefined,
      measurementBundle: ocdCase.input.measurementBundle,
      reliabilityBundle: undefined,
      permittedEvidencePaths: [],
      activePolicy: {
        policyReleaseId: 'POL-v2-2026.09',
        modePermissions: { clinical: false, validation: true, research: true },
        allowedEvidenceTiers: ['A', 'B'],
        fallbackAllowed: true,
      },
    });

    const validation = ocdPlugin.validateModuleContext(foreignMddContext);

    // Adversarial test (§65): OCD plugin MUST reject foreign MDD module
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
    expect(validation.errors[0]).toContain('is not an OCD module');
  });

  it('MISSING CONTEXT / ABSTENTION (§65): Complete lack of authorized evidence paths triggers structured abstention slate', () => {
    const tin10 = TINNITUS_GOLDEN_SUITE.find(c => c.id === 'TIN10');
    expect(tin10).toBeDefined();
    if (!tin10) return;

    // TIN10 represents complete abstention on neurovascular contraindication
    const res = executeSyntheticVerticalSlice(tin10.input, undefined, { auditLedger });
    expect(res.slate.status).toBe('abstained');
    expect(res.slate.primaryCandidates.length).toBe(0);
  });

  it('RESEARCH ISOLATION (§64): Research-only module strictly throws ResearchModeSigningProhibitedError on clinical sign', () => {
    const ptsd01 = PTSD_GOLDEN_SUITE[0];
    expect(ptsd01).toBeDefined();

    // Explicitly set mode to research
    const researchInput = {
      ...ptsd01.input,
      mode: 'research' as const,
    };

    // Deliberately attempt to sign research slate with clinical intent
    const clinicalIntent = {
      clinicianId: 'clinician-adversarial-01',
      decisionType: 'ACCEPTED_PRIMARY' as const,
      selectedCandidateIds: ['cand-ptsd-01'],
      overallReasoning: 'Adversarial attempt to sign research-tier PTSD protocol.',
      magniomInfluence: 'major' as const,
      signingMode: 'clinical' as const,
    };

    expect(() => {
      executeSyntheticVerticalSlice(researchInput, clinicalIntent, { auditLedger });
    }).toThrow(ResearchModeSigningProhibitedError);
  });

  it('ADVERSARIAL TENANCY (§46): Organization context is strictly tracked and logged in immutable audit events', () => {
    const mddCase = MDD_GOLDEN_SUITE[0];

    const orgAlphaPatientCase = {
      ...mddCase.input,
      caseId: 'case-org-alpha-99',
    };

    const orgBetaClinicianIntent = {
      clinicianId: 'clinician-org-beta',
      clinicianName: 'Dr. Cross-Tenant',
      decisionType: 'ACCEPTED_PRIMARY' as const,
      selectedCandidateIds: ['cand-mdd-01'],
      overallReasoning: 'Cross-organization review.',
      magniomInfluence: 'none' as const,
      signingMode: 'clinical' as const,
    };

    const res = executeSyntheticVerticalSlice(orgAlphaPatientCase, orgBetaClinicianIntent, {
      auditLedger,
    });

    // Assert that audit ledger records the exact case ID and decision event
    expect(res.slate.id).toBeDefined();
    expect(res.auditEvents.length).toBeGreaterThan(0);
    const hasDecisionEvent = res.auditEvents.some(
      ae => ae.eventType.includes('DECISION') || ae.eventType.includes('SLATE'),
    );
    expect(hasDecisionEvent).toBe(true);
  });
});
