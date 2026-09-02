import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { FROZEN_SUBSYSTEM_VERSIONS } from '@magniom/domain';
import { runTargetEngine } from '../src/engine.js';
import {
  G01_CASE_PHENOTYPE,
  G02_CASE_PHENOTYPE,
  G02_CASE_CONNECTOME,
  G03_CASE_PHENOTYPE,
  G03_CASE_CONNECTOME,
  G05_CASE_PHENOTYPE,
  G05_CASE_CONNECTOME,
} from '@magniom/test-fixtures';

describe('Sprint 15: Verification Build M3 Freeze Invariants', () => {
  const rootDir = path.resolve(__dirname, '../../../');

  it('verifies all 6 frozen subsystem semantic versions match canonical constants', () => {
    expect(FROZEN_SUBSYSTEM_VERSIONS.TARGET_ENGINE).toBe('1.0.0');
    expect(FROZEN_SUBSYSTEM_VERSIONS.EVIDENCE_LIBRARY).toBe('1.0.0');
    expect(FROZEN_SUBSYSTEM_VERSIONS.PHENOTYPE_ONTOLOGY).toBe('MAGNIOM-PHENOTYPE-1.0.0');
    expect(FROZEN_SUBSYSTEM_VERSIONS.NEURO_PIPELINE).toBe('MAGNIOM-NEURO-1.0.0');
    expect(FROZEN_SUBSYSTEM_VERSIONS.SCIENTIFIC_POLICY).toBe('MAGNIOM-POLICY-1.0.0');
    expect(FROZEN_SUBSYSTEM_VERSIONS.UX_WORKSPACE).toBe('MAGNIOM-UX-1.0.0');
    expect(FROZEN_SUBSYSTEM_VERSIONS.MATURITY_STAGE).toBe('M3');
  });

  it('verifies the existence and schema integrity of all frozen release bundles', () => {
    const phenotypeBundlePath = path.join(
      rootDir,
      'packages/phenotype/releases/phenotype-ontology-v1.0.0.json',
    );
    const evidenceBundlePath = path.join(rootDir, 'evidence/releases/evidence-library-v1.0.0.json');
    const policyBundlePath = path.join(
      rootDir,
      'scientific-config/releases/scientific-policy-v1.0.0.json',
    );
    const neuroBundlePath = path.join(
      rootDir,
      'services/neurocompute/releases/neuro-pipeline-v1.0.0.json',
    );

    expect(fs.existsSync(phenotypeBundlePath)).toBe(true);
    expect(fs.existsSync(evidenceBundlePath)).toBe(true);
    expect(fs.existsSync(policyBundlePath)).toBe(true);
    expect(fs.existsSync(neuroBundlePath)).toBe(true);

    const phenotype = JSON.parse(fs.readFileSync(phenotypeBundlePath, 'utf8'));
    const evidence = JSON.parse(fs.readFileSync(evidenceBundlePath, 'utf8'));
    const policy = JSON.parse(fs.readFileSync(policyBundlePath, 'utf8'));
    const neuro = JSON.parse(fs.readFileSync(neuroBundlePath, 'utf8'));

    expect(phenotype.status).toBe('FROZEN');
    expect(phenotype.ontologyVersion).toBe('MAGNIOM-PHENOTYPE-1.0.0');

    expect(evidence.status).toBe('FROZEN');
    expect(evidence.version).toBe('MAGNIOM-EVIDENCE-1.0.0');

    expect(policy.status).toBe('FROZEN');
    expect(policy.policyVersion).toBe('MAGNIOM-POLICY-1.0.0');

    expect(neuro.status).toBe('FROZEN');
    expect(neuro.pipelineVersion).toBe('MAGNIOM-NEURO-1.0.0');
  });

  it('verifies Target Engine determinism across 100 repeated runs (Requirement MAG-VAL-002)', () => {
    const initialSlate = runTargetEngine({
      phenotypeSnapshot: G01_CASE_PHENOTYPE,
      connectome: null,
      mode: 'CLINICAL',
    });
    const initialSlateId = initialSlate.id;

    for (let i = 0; i < 100; i++) {
      const repeatedSlate = runTargetEngine({
        phenotypeSnapshot: G01_CASE_PHENOTYPE,
        connectome: null,
        mode: 'CLINICAL',
      });
      expect(repeatedSlate.id).toBe(initialSlateId);
      expect(repeatedSlate.primaryCandidates.length).toBe(initialSlate.primaryCandidates.length);
      expect(repeatedSlate.primaryCandidates[0].mniCoordinate).toEqual(
        initialSlate.primaryCandidates[0].mniCoordinate,
      );
    }
  });

  it('verifies coordinate laterality preservation without hemisphere bleed (Requirement MAG-VAL-003)', () => {
    // G01 (Left DLPFC)
    const slateG01 = runTargetEngine({
      phenotypeSnapshot: G01_CASE_PHENOTYPE,
      connectome: null,
      mode: 'CLINICAL',
    });
    for (const candidate of slateG01.primaryCandidates) {
      if (candidate.hemisphere === 'L') {
        expect(candidate.mniCoordinate.x).toBeLessThan(0); // Strict Left Hemisphere X < 0
      }
    }

    // G05 (Anxiosomatic with right hemisphere candidate)
    const slateG05 = runTargetEngine({
      phenotypeSnapshot: G05_CASE_PHENOTYPE,
      connectome: G05_CASE_CONNECTOME,
      mode: 'CLINICAL',
    });
    for (const candidate of slateG05.additionalCandidates) {
      if (candidate.hemisphere === 'R') {
        expect(candidate.mniCoordinate.x).toBeGreaterThan(0); // Strict Right Hemisphere X > 0
      }
    }
  });

  it('verifies slate structure invariants (Requirement MAG-SYS-001: <= 3 Primary, <= 2 Additional)', () => {
    const slate1 = runTargetEngine({
      phenotypeSnapshot: G01_CASE_PHENOTYPE,
      connectome: null,
      mode: 'CLINICAL',
    });
    expect(slate1.primaryCandidates.length).toBeLessThanOrEqual(3);
    expect(slate1.primaryCandidates.length).toBeGreaterThanOrEqual(1);
    expect(slate1.additionalCandidates.length).toBeLessThanOrEqual(2);

    const slate2 = runTargetEngine({
      phenotypeSnapshot: G02_CASE_PHENOTYPE,
      connectome: G02_CASE_CONNECTOME,
      mode: 'CLINICAL',
    });
    expect(slate2.primaryCandidates.length).toBeLessThanOrEqual(3);
    expect(slate2.additionalCandidates.length).toBeLessThanOrEqual(2);
  });

  it('verifies evidence ceiling bounding on all candidate confidence scores (Requirement MAG-EVD-001)', () => {
    const slate = runTargetEngine({
      phenotypeSnapshot: G02_CASE_PHENOTYPE,
      connectome: G02_CASE_CONNECTOME,
      mode: 'CLINICAL',
    });

    for (const candidate of [...slate.primaryCandidates, ...slate.additionalCandidates]) {
      expect(candidate.overallScore).toBeLessThanOrEqual(1.0);
      expect(candidate.overallScore).toBeGreaterThanOrEqual(0.0);
      expect(candidate.evidenceScore).toBeLessThanOrEqual(1.0);
    }
  });

  it('verifies the existence of all 7 Formal Verification Reports (Roadmap Section 121)', () => {
    const reportsDir = path.join(rootDir, 'docs/verification/reports');
    const expectedReports = [
      '01-software-requirements-verification-report.md',
      '02-database-verification-report.md',
      '03-security-verification-report.md',
      '04-target-engine-verification-report.md',
      '05-neurocompute-verification-report.md',
      '06-evidence-graph-verification-report.md',
      '07-ux-critical-task-verification-report.md',
    ];

    for (const report of expectedReports) {
      const reportPath = path.join(reportsDir, report);
      expect(fs.existsSync(reportPath)).toBe(true);
      const content = fs.readFileSync(reportPath, 'utf8');
      expect(content).toContain('PASSED');
    }
  });
});
