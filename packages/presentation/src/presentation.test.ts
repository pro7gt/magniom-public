import { describe, it, expect } from 'vitest';
import {
  formatMniCoordinate,
  calculateEuclideanDistance,
  getTierBadgeLabel,
  getRoleTitleAndSubtitle,
  formatReliabilityBadge,
  toCandidateCardViewModel,
  toTargetSlateViewModel,
  toPhenotypeViewModel,
  toEvidenceDrawerViewModel,
  toComparisonTableViewModel,
  toConvergenceViewModel,
  toTargetRoiViewModel,
  toCounterfactual3DViewModel,
  toConfidenceRegion3DViewModel,
  getCanonicalCircuitOverlays,
  toComparison3DViewModel,
  toClinical3DViewerViewModel,
  toTopBarViewModel,
  toEnvironmentModeBadgeViewModel,
  toCaseShellContextViewModel,
  toReleaseContextSummaryViewModel,
  validateClinicianFacingLanguage,
  HEATMAP_NO_AUTHORITY_DISCLAIMER,
} from './index.js';
import {
  G01_PHENOTYPE,
  G01_PRIMARY_1,
  GOLDEN_CASE_01_SLATE,
  G02_PRIMARY_1,
  GOLDEN_CASE_02_SLATE,
  GOLDEN_CASE_05_SLATE,
} from '@magniom/test-fixtures';

describe('@magniom/presentation Unit Tests', () => {
  it('formats MNI coordinates cleanly with explicit signs', () => {
    expect(formatMniCoordinate({ x: -42, y: 38, z: 31 })).toBe('(-42.0, +38.0, +31.0)');
    expect(formatMniCoordinate(undefined)).toBe('(—, —, —)');
  });

  it('calculates Euclidean distance between coordinates correctly', () => {
    const c1 = { x: 0, y: 0, z: 0 };
    const c2 = { x: 3, y: 4, z: 0 };
    expect(calculateEuclideanDistance(c1, c2)).toBe(5.0);
  });

  it('maps evidence tiers to human-readable labels without raw codes', () => {
    expect(getTierBadgeLabel('T1').label).toBe('Tier 1 — Established');
    expect(getTierBadgeLabel('T2').label).toBe('Tier 2 — Prospectively Supported');
    expect(getTierBadgeLabel('T_EXP').label).toBe('Tier Exp — Research Only');
  });

  it('maps candidate roles to clinical titles and functional subtitles', () => {
    const p1 = getRoleTitleAndSubtitle('PRIMARY_1');
    expect(p1.title).toBe('Primary Candidate 1');
    expect(p1.subtitle).toBe('Evidence Anchor');
    expect(p1.isPrimary).toBe(true);

    const addA = getRoleTitleAndSubtitle('ADDITIONAL_A');
    expect(addA.title).toBe('Additional Candidate A');
    expect(addA.subtitle).toBe('Standard Evidence Baseline');
    expect(addA.isPrimary).toBe(false);
  });

  it('formats reliability profile without exposing raw floating point math', () => {
    const high = formatReliabilityBadge({
      candidateId: 'c1',
      testRetestIcc: 0.88,
      crossRunCorrelation: 0.85,
      splitHalfSpatialOverlap: 0.82,
      spatialStandardErrorMm: 1.8,
      overallReliabilityScore: 0.85,
    });
    expect(high.level).toBe('HIGH');
    expect(high.label).toBe('Reliability: High');

    const low = formatReliabilityBadge({
      candidateId: 'c2',
      testRetestIcc: 0.45,
      crossRunCorrelation: 0.48,
      splitHalfSpatialOverlap: 0.42,
      spatialStandardErrorMm: 4.8,
      overallReliabilityScore: 0.45,
    });
    expect(low.level).toBe('LOW');
    expect(low.label).toContain('Context Only');
  });

  it('converts TargetCandidate to CandidateCardViewModel with mandatory counterarguments', () => {
    const card = toCandidateCardViewModel(G01_PRIMARY_1);
    expect(card.roleTitle).toBe('Primary Candidate 1');
    expect(card.roleSubtitle).toBe('Evidence Anchor');
    expect(card.whyThisMayBeWrong.length).toBeGreaterThan(0);
    expect(card.anatomicalAccessibility.rating).toBe('Optimal');
  });

  it('converts PhenotypeSnapshot to PhenotypeViewModel with circuit mappability status', () => {
    const vm = toPhenotypeViewModel(G01_PHENOTYPE);
    expect(vm.primaryDiagnosis).toContain('Major Depressive Disorder');
    expect(vm.domains.length).toBe(6);
    expect(vm.targetMappableCount).toBe(3);
    expect(vm.isApproved).toBe(true);
  });

  it('transforms TargetSlate into TargetSlateViewModel', () => {
    const slateVM = toTargetSlateViewModel(GOLDEN_CASE_01_SLATE);
    expect(slateVM.primaryCandidates.length).toBe(1);
    expect(slateVM.manifestHash).toBe(GOLDEN_CASE_01_SLATE.deterministicManifestHash);
  });

  it('generates rich EvidenceDrawerViewModel with citations and balanced support/conflict', () => {
    const drawerVM = toEvidenceDrawerViewModel(G02_PRIMARY_1);
    expect(drawerVM.strongestSupport.length).toBeGreaterThan(0);
    expect(drawerVM.conflictingOrLimitingEvidence.length).toBeGreaterThan(0);
    expect(drawerVM.studySources.length).toBeGreaterThan(0);
    expect(drawerVM.evidencePath.length).toBe(5);
  });

  it('transforms candidates into ComparisonTableViewModel without single winner column', () => {
    const compVM = toComparisonTableViewModel([G01_PRIMARY_1, G02_PRIMARY_1]);
    expect(compVM.rows.length).toBe(2);
    expect(compVM.rows[0].roleLabel).toContain('Primary Candidate 1');
  });

  it('evaluates target convergence correctly for multi-candidate slates', () => {
    const convG02 = toConvergenceViewModel(GOLDEN_CASE_02_SLATE.primaryCandidates);
    expect(convG02.convergenceLevel).toBe('HIGH');

    const convG05 = toConvergenceViewModel(GOLDEN_CASE_05_SLATE.primaryCandidates);
    expect(['HIGH', 'MODERATE', 'LOW']).toContain(convG05.convergenceLevel);
  });

  it('converts candidate to TargetRoiViewModel with labelled coordinates and HCP-MMP parcel', () => {
    const roiVM = toTargetRoiViewModel(G02_PRIMARY_1, true);
    expect(roiVM.roleTitle).toContain('Primary Candidate 1');
    expect(roiVM.mniFormatted).toBe('(-44.0, +40.0, +34.0)');
    expect(roiVM.subjectNativeFormatted).toContain('Native T1w');
    expect(roiVM.primaryHcpParcel).toContain('HCP-MMP1.0');
    expect(roiVM.isSelected).toBe(true);
    expect(roiVM.coilNormal.z).toBeGreaterThan(0);
  });

  it('generates Counterfactual3DViewModel with displacement distance and neutral interpretation', () => {
    const cfVM = toCounterfactual3DViewModel(G02_PRIMARY_1);
    expect(cfVM).toBeDefined();
    expect(cfVM?.hasCounterfactual).toBe(true);
    expect(cfVM?.displacementDistanceMm).toBeGreaterThan(0);
    expect(cfVM?.targetFamilyComparison).toBe('SAME_FAMILY');
    expect(cfVM?.therapeuticCircuitComparison).toBe('SAME_CIRCUIT');
    expect(cfVM?.justificationText).toContain('Connectome refinement');
  });

  it('generates ConfidenceRegion3DViewModel with spatial dispersion radius and coil spread context', () => {
    const confVM = toConfidenceRegion3DViewModel(G02_PRIMARY_1);
    expect(confVM.dispersionRadiusMm).toBeGreaterThan(0);
    expect(confVM.badgeClass).toBe('badge-reliability-high');
    expect(confVM.coilContextDescription).toContain('figure-8 coil');
  });

  it('provides canonical circuit overlay maps with colormaps and opacity', () => {
    const overlays = getCanonicalCircuitOverlays();
    expect(overlays.length).toBe(4);
    expect(overlays[0]!.shortCode).toBe('sgACC-DLPFC');
    expect(overlays[0]!.colormap).toBe('coolwarm');
  });

  it('constructs complete Clinical3DViewerViewModel for Target Slate Workspace', () => {
    const allCandidates = [
      ...GOLDEN_CASE_02_SLATE.primaryCandidates,
      ...GOLDEN_CASE_02_SLATE.additionalCandidates,
    ];
    const viewerVM = toClinical3DViewerViewModel(
      GOLDEN_CASE_02_SLATE,
      allCandidates,
      G02_PRIMARY_1.id,
    );

    expect(viewerVM.caseId).toBe(GOLDEN_CASE_02_SLATE.caseId);
    expect(viewerVM.selectedTarget.id).toBe(G02_PRIMARY_1.id);
    expect(viewerVM.counterfactual).toBeDefined();
    expect(viewerVM.confidenceRegion).toBeDefined();
    expect(viewerVM.circuitOverlays.length).toBe(4);
    expect(viewerVM.cameraPresets.length).toBe(7);
    expect(viewerVM.accessibleTextSummary).toContain('3D Cortical Viewer');
    expect(viewerVM.comparison3D.candidates.length).toBe(allCandidates.length);
  });

  describe('Application Shell & Navigation View Models', () => {
    it('creates TopBarViewModel with authoritative mode badge, user identity, and site context', () => {
      const topBarVM = toTopBarViewModel({
        mode: 'CLINICAL',
        user: {
          displayName: 'Dr A. Smith',
          roleTitle: 'TMS Specialist',
          hasSigningAuthority: true,
        },
        organization: {
          organizationName: 'Melbourne TMS Centre',
          siteName: 'Site 1 — Surrey Hills Clinic',
        },
      });

      expect(topBarVM.brandName).toBe('MAGNIOM');
      expect(topBarVM.brandSubtitle).toBe('TMS Target Decision Support');
      expect(topBarVM.modeBadge.mode).toBe('CLINICAL');
      expect(topBarVM.modeBadge.label).toBe('CLINICAL MODE');
      expect(topBarVM.currentUser.displayName).toBe('Dr A. Smith');
      expect(topBarVM.currentUser.hasSigningAuthority).toBe(true);
      expect(topBarVM.organisationContext.displayLabel).toContain('Melbourne TMS Centre · Site 1');
    });

    it('creates EnvironmentModeBadgeViewModel distinguishing Research from Clinical', () => {
      const resBadge = toEnvironmentModeBadgeViewModel('RESEARCH');
      expect(resBadge.isExperimental).toBe(true);
      expect(resBadge.label).toBe('RESEARCH PROTOTYPE');
      expect(resBadge.badgeClass).toBe('badge-tierexp');

      const clinBadge = toEnvironmentModeBadgeViewModel('CLINICAL');
      expect(clinBadge.isExperimental).toBe(false);
      expect(clinBadge.label).toBe('CLINICAL MODE');
      expect(clinBadge.badgeClass).toBe('badge-tier1');
    });

    it('creates CaseShellContextViewModel with qualification status and staleness alerts', () => {
      const caseShellVM = toCaseShellContextViewModel({
        clinicalCase: {
          id: 'case-001',
          caseCode: 'MGN-26-0042',
          patientId: 'PT-998',
          indicationCode: 'MDD',
          mode: 'CLINICAL',
          state: 'target_slate_ready',
        },
        phenotype: { snapshotHash: 'sha256-mock', state: 'approved' },
        slate: {
          qualification: { level: 'HIGH' },
          primaryCandidates: [{ id: 'cand-1' }, { id: 'cand-2' }],
          deterministicManifestHash: 'hash-abc',
        },
        isStale: true,
        staleReason: 'Phenotype snapshot was modified post-generation.',
      });

      expect(caseShellVM.displayIdentifier).toBe('MGN-26-0042');
      expect(caseShellVM.patientDisplayLabel).toBe('Patient PT-998');
      expect(caseShellVM.phenotypeStatus.isApproved).toBe(true);
      expect(caseShellVM.staleness.isStale).toBe(true);
      expect(caseShellVM.staleness.blockingSign).toBe(true);
      expect(caseShellVM.staleness.alertText).toContain('STALE TARGET SLATE');
    });

    it('provides unified ReleaseContextSummaryViewModel with all 6 frozen subsystems', () => {
      const releaseVM = toReleaseContextSummaryViewModel();
      expect(releaseVM.buildId).toBe('MAGNIOM-BUILD-M3-20260902');
      expect(releaseVM.subsystems.length).toBe(6);
      expect(releaseVM.subsystems.every(s => s.status === 'FROZEN')).toBe(true);
      expect(releaseVM.decisionSupportDisclaimer).toContain(
        'does not autonomously prescribe treatment',
      );
    });
  });

  describe('Canonical Export Package v2 (§133)', () => {
    it('builds and validates a complete export package with deterministic manifest hashes', async () => {
      const { buildCanonicalExportPackageV2, validateCanonicalExportPackageV2 } =
        await import('./export-package-v2.js');

      const mockCaseMetadata = {
        caseId: '00000000-0000-0000-0000-000000000001',
        patientPseudonymId: 'PT-TEST-001',
        createdAt: '2026-09-03T00:00:00.000Z',
      };

      const mockCaseIndication = {
        id: '00000000-0000-0000-0000-000000000002',
        version: '1.0.0',
        caseId: mockCaseMetadata.caseId,
        indication: { conceptId: 'MDD-F33', label: 'MDD' },
        indicationModuleReleaseId: '00000000-0000-0000-0000-000000000003',
        status: 'confirmed' as const,
        clinicalRole: 'primary_targeting_indication' as const,
        confirmationSourceIds: [],
        dataQuality: 'verified' as const,
        provenance: {
          createdBy: 'system',
          createdAt: '2026-09-03T00:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      };

      const mockIndicationModule = {
        id: '00000000-0000-0000-0000-000000000003',
        code: 'MAGNIOM-MODULE-MDD',
        semanticVersion: '2.0.0',
        title: 'MDD Module',
        description: 'Major depression',
        indication: { conceptId: 'MDD-F33', label: 'MDD' },
        lifecycleStatus: 'active' as const,
        moduleStatus: 'clinical_active' as const,
        qualificationLevel: 'Q5' as const,
        permittedModes: ['clinical' as const],
        intendedPopulation: { code: 'POP-01', label: 'Adults', description: 'Adult population' },
        phenotypeSchemaVersionId: 'PHE-1',
        clinicalObjectiveDefinitionIds: ['OBJ-01'],
        evidenceScopeId: 'EV-01',
        permittedTargetFamilyIds: ['TF-01'],
        permittedCandidateGenerationMethodIds: ['GEN-01'],
        measurementRequirements: [],
        reliabilityPolicyRefs: ['POL-01'],
        permittedTargetGeometryTypes: ['point' as const],
        scientificPolicyCompatibilityRefs: ['POL-COMPAT'],
        knownLimitations: [],
        validationEvidenceIds: [],
        payloadSha256: 'a'.repeat(64),
        manifestSha256: 'b'.repeat(64),
        createdAt: '2026-09-03T00:00:00.000Z',
        provenance: {
          createdBy: 'system',
          createdAt: '2026-09-03T00:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      };

      const mockMeasurementBundle = {
        id: '00000000-0000-0000-0000-000000000005',
        version: '1.0.0',
        caseId: mockCaseMetadata.caseId,
        caseIndicationId: mockCaseIndication.id,
        indicationModuleReleaseId: mockIndicationModule.id,
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000007',
        qualificationStatus: 'qualified' as const,
        measurements: [],
        requirementEvaluations: [],
        limitingFactors: [],
        createdAt: '2026-09-03T00:00:00.000Z',
        payloadSha256: 'c'.repeat(64),
        provenance: {
          createdBy: 'system',
          createdAt: '2026-09-03T00:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      };

      const mockSlate = {
        id: '00000000-0000-0000-0000-000000000010',
        version: '1.0.0',
        caseId: mockCaseMetadata.caseId,
        caseIndicationId: mockCaseIndication.id,
        mode: 'clinical' as const,
        indicationModuleReleaseId: mockIndicationModule.id,
        scientificPolicyReleaseId: '00000000-0000-0000-0000-000000000004',
        status: 'active' as const,
        generatedAt: '2026-09-03T00:00:00.000Z',
        phenotypeSnapshotId: '00000000-0000-0000-0000-000000000007',
        clinicalObjectiveIds: ['OBJ-01'],
        measurementBundleId: mockMeasurementBundle.id,
        evidenceLibraryReleaseId: 'EVD-2.0.0',
        targetEngineVersionId: '2.0.0',
        pipelineVersionIds: [],
        primaryCandidates: [],
        additionalCandidates: [],
        slateConvergence: {
          comparedSources: [],
          pairwiseRelationships: [],
          overall: 'high' as const,
          interpretation: 'High',
        },
        clinicalCoverage: { objectives: [], redundancySummary: 'Complete' },
        generationSummary: 'Summary',
        scientificLimitations: [],
        payloadSha256: 'd'.repeat(64),
        provenance: {
          createdBy: 'system',
          createdAt: '2026-09-03T00:00:00.000Z',
          softwareVersion: '2.0.0',
        },
      };

      const pkg = buildCanonicalExportPackageV2({
        caseMetadata: mockCaseMetadata,
        caseIndication: mockCaseIndication,
        indicationModuleRelease: mockIndicationModule,
        clinicalObjectives: [],
        phenotypeSnapshot: {},
        measurementBundle: mockMeasurementBundle,
        evidenceLibraryReleaseId: 'EVD-2.0.0',
        scientificPolicyReleaseId: 'POL-2.0.0',
        targetFamilies: [],
        generatedCandidates: [],
        suppressedCandidates: [],
        targetSlate: mockSlate,
      });

      expect(pkg.schemaVersion).toBe('2.0.0');
      expect(pkg.scientificManifestHashes.exportPackageSha256).toHaveLength(64);
      expect(validateCanonicalExportPackageV2(pkg)).toBe(true);
    });

    it('enforces clinician-facing language validation (§182)', () => {
      const clean = validateClinicianFacingLanguage(
        'Left DLPFC coordinate demonstrates optimal test-retest reliability under protocol v2.0.',
      );
      expect(clean.valid).toBe(true);
      expect(clean.violations).toHaveLength(0);

      const biased1 = validateClinicianFacingLanguage(
        'Patient has a good brain with strong connectivity',
      );
      expect(biased1.valid).toBe(false);
      expect(biased1.violations).toContain('good brain');

      const biased2 = validateClinicianFacingLanguage('Excluding this run due to a bad scan');
      expect(biased2.valid).toBe(false);
      expect(biased2.violations).toContain('bad scan');

      const biased3 = validateClinicianFacingLanguage('A weak patient showed poor task compliance');
      expect(biased3.valid).toBe(false);
      expect(biased3.violations).toContain('weak patient');

      const biased4 = validateClinicianFacingLanguage('Delivers a high-confidence treatment plan');
      expect(biased4.valid).toBe(false);
      expect(biased4.violations).toContain('high-confidence treatment');
    });

    it('exposes heatmap no-authority disclaimer (§184)', () => {
      expect(HEATMAP_NO_AUTHORITY_DISCLAIMER).toContain('visual aids for spatial orientation only');
      expect(HEATMAP_NO_AUTHORITY_DISCLAIMER).toContain(
        'do not constitute diagnostic or targeting authority',
      );
    });
  });
});
