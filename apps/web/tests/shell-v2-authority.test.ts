import { describe, it, expect, beforeEach } from 'vitest';
import { caseStore } from '../src/lib/case-store';
import { resolveCaseShellContext } from '../src/lib/shell-authority';
import {
  validateSignOffPreconditions,
  buildSignOffContextRestatement,
  isOptimisticProhibited,
} from '../src/lib/security/sign-off-guard';
import { parseDeepLinkPath, resolveDeepLinkContext, buildHistoricalSlateContext } from '../src/lib/deep-link-resolver';
import { buildTargetExportPackage, isTargetQualifiedForExport } from '../src/lib/target-export';
import { generateCaseReport } from '../src/lib/case-report-generator';
import { onOperationalEvent, onAuditEvent, type ShellAuditEvent, type ShellOperationalEvent } from '../src/lib/shell-observability';
import type { ClinicalActionCapabilities } from '@magniom/presentation';

describe('MAGNIOM Application Shell v2.0 — Comprehensive Verification Suite (§241–268)', () => {
  beforeEach(() => {
    caseStore.resetToGoldenCases();
  });

  // =========================================================================
  // 1. Authoritative Shell Context Resolution (§12–16, §235)
  // =========================================================================
  describe('Authoritative Shell Context Resolution (§12–16, §235)', () => {
    it('MAG-UX-042: resolves canonical CaseShellViewModel with module authority and active indication', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-01' });
      expect(shellVm).not.toBeNull();
      expect(shellVm?.caseIdentity.caseCode).toBe('MGN-26-0041');
      expect(shellVm?.indication.indicationCode).toBe('MDD');
      expect(shellVm?.moduleAuthority.moduleCode).toBe('MDD');
      expect(shellVm?.moduleAuthority.qualificationLevel).toBe('Q8');
      expect(shellVm?.mode.isClinical).toBe(true);
      expect(shellVm?.safetyState).toBe('NORMAL');
    });

    it('MAG-UX-043: propagates Research mode correctly', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-08' });
      expect(shellVm).not.toBeNull();
      expect(shellVm?.mode.isResearch).toBe(true);
      expect(shellVm?.mode.label).toBe('RESEARCH MODE');
    });

    it('MAG-UX-052: enters FAIL_CLOSED when module authority is contradictory (§25)', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-10' });
      expect(shellVm).not.toBeNull();
      expect(shellVm?.safetyState).toBe('FAIL_CLOSED');
    });

    it('MAG-UX-051: respects Silent Prospective Blinded state (§221)', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-12' });
      expect(shellVm).not.toBeNull();
      expect(shellVm?.moduleAuthority.silentProspectiveBlinded).toBe(true);
    });
  });

  // =========================================================================
  // 2. Pre-Signing Validation Guard (§139–142, §189)
  // =========================================================================
  describe('Pre-Signing Validation Guard (§139–142, §189)', () => {
    const fullCapabilities: ClinicalActionCapabilities = {
      may_generate_target_slate: true,
      may_review_target_slate: true,
      may_create_clinician_decision: true,
      may_sign_target_decision: true,
      may_export_navigation_target: true,
    };

    it('MAG-UX-045: prevents sign-off when Target Slate has blocking staleness (§140)', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-13' });
      expect(shellVm).not.toBeNull();
      expect(shellVm?.currentness.blockingSignOff).toBe(true);

      const validation = validateSignOffPreconditions(shellVm!, fullCapabilities);
      expect(validation.canSign).toBe(false);
      expect(validation.blockedReasons.some(r => r.includes('stale'))).toBe(true);
    });

    it('MAG-UX-047: strictly prohibits clinical signing in Research Mode (§22, §139)', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-08' });
      expect(shellVm).not.toBeNull();
      expect(shellVm?.mode.isResearch).toBe(true);

      const validation = validateSignOffPreconditions(shellVm!, fullCapabilities);
      expect(validation.canSign).toBe(false);
      expect(validation.blockedReasons.some(r => r.includes('Research Mode'))).toBe(true);
    });

    it('MAG-UX-041: prohibits signing when user lacks signing authority capability (§139)', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-01' });
      expect(shellVm).not.toBeNull();

      const nonSigningCapabilities: ClinicalActionCapabilities = {
        ...fullCapabilities,
        may_sign_target_decision: false,
      };

      const validation = validateSignOffPreconditions(shellVm!, nonSigningCapabilities);
      expect(validation.canSign).toBe(false);
      expect(validation.blockedReasons.some(r => r.includes('signing authority'))).toBe(true);
    });

    it('MAG-UX-052: prohibits signing in FAIL_CLOSED state (§25)', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-10' });
      expect(shellVm).not.toBeNull();
      expect(shellVm?.safetyState).toBe('FAIL_CLOSED');

      const validation = validateSignOffPreconditions(shellVm!, fullCapabilities);
      expect(validation.canSign).toBe(false);
      expect(validation.blockedReasons.some(r => r.includes('FAIL CLOSED'))).toBe(true);
    });

    it('MAG-UX-051: prohibits signing during Blinded Silent Prospective validation (§221)', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-12' });
      expect(shellVm).not.toBeNull();

      const validation = validateSignOffPreconditions(shellVm!, fullCapabilities);
      expect(validation.canSign).toBe(false);
      expect(validation.blockedReasons.some(r => r.includes('Silent Prospective'))).toBe(true);
    });

    it('allows signing when all preconditions are fully satisfied', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-01' });
      expect(shellVm).not.toBeNull();

      const validation = validateSignOffPreconditions(shellVm!, fullCapabilities);
      expect(validation.canSign).toBe(true);
      expect(validation.blockedReasons).toHaveLength(0);
    });

    it('enforces optimistic UI prohibitions (§189)', () => {
      expect(isOptimisticProhibited('sign_clinical_decision')).toBe(true);
      expect(isOptimisticProhibited('approve_phenotype')).toBe(true);
      expect(isOptimisticProhibited('regenerate_target_slate')).toBe(true);
      expect(isOptimisticProhibited('export_neuronavigation_target')).toBe(true);
      expect(isOptimisticProhibited('navigate_to_page')).toBe(false);
    });
  });

  // =========================================================================
  // 3. Sign-Off Context Restatement (§138)
  // =========================================================================
  describe('Sign-Off Context Restatement (§138)', () => {
    it('builds comprehensive restatement including case, module, slate, target, and clinician', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-01' });
      expect(shellVm).not.toBeNull();

      const restatement = buildSignOffContextRestatement(
        shellVm!,
        'cand-001',
        'sgACC Anti-Correlated DLPFC',
        '(-42, +38, +30)',
        {
          id: 'usr-001',
          displayName: 'Dr. Sarah Lin',
          roleTitle: 'TMS Specialist',
          hasSigningAuthority: true,
        },
      );

      expect(restatement.caseId).toBe('case-ux-v2-01');
      expect(restatement.caseCode).toBe('MGN-26-0041');
      expect(restatement.indicationCode).toBe('MDD');
      expect(restatement.moduleReleaseId).toBe('IMR-MDD-2.0.0');
      expect(restatement.selectedTargetId).toBe('cand-001');
      expect(restatement.selectedCoordinateFormatted).toBe('(-42, +38, +30)');
      expect(restatement.clinicianDisplayName).toBe('Dr. Sarah Lin');
      expect(restatement.hasSigningAuthority).toBe(true);
    });
  });

  // =========================================================================
  // 4. Deep Link Context Resolution (§143–146)
  // =========================================================================
  describe('Deep Link Context Resolution (§143–146)', () => {
    it('parses deep link URL components accurately', () => {
      const parsed = parseDeepLinkPath('/cases/case-ux-v2-01/indications/ci-mdd-01/targets?slate=slate-123');
      expect(parsed.caseId).toBe('case-ux-v2-01');
      expect(parsed.caseIndicationId).toBe('ci-mdd-01');
      expect(parsed.slateId).toBe('slate-123');
    });

    it('resolves valid deep link context successfully', () => {
      const result = resolveDeepLinkContext('/cases/case-ux-v2-01/targets');
      expect(result.status).toBe('resolved');
      expect(result.shellVm).toBeDefined();
      expect(result.caseId).toBe('case-ux-v2-01');
    });

    it('MAG-UX-048: returns case_not_found with descriptive message for invalid case (§144)', () => {
      const result = resolveDeepLinkContext('/cases/non-existent-case-999/targets');
      expect(result.status).toBe('case_not_found');
      expect(result.errorTitle).toBe('Case Not Found');
      expect(result.errorMessage).toContain('non-existent-case-999');
      expect(result.suggestedAction).toBeDefined();
    });

    it('builds historical Slate context preserving generation-time parameters (§145–146)', () => {
      const hist = buildHistoricalSlateContext(
        'slate-hist-001',
        'case-001',
        'MDD',
        'IMR-MDD-1.9.0',
        '2026-03-01T10:00:00Z',
      );
      expect(hist.isHistorical).toBe(true);
      expect(hist.moduleReleaseId).toBe('IMR-MDD-1.9.0');
      expect(hist.generationContextNote).toContain('preserved');
    });
  });

  // =========================================================================
  // 5. Target Export & Neuronavigation Guard (§283–284)
  // =========================================================================
  describe('Target Export & Neuronavigation Guard (§283–284)', () => {
    it('MAG-UX-057: prohibits neuronavigation export before clinician selection', () => {
      expect(isTargetQualifiedForExport(false, true)).toBe(false);
      expect(isTargetQualifiedForExport(false, false)).toBe(false);
    });

    it('MAG-UX-057: permits export only after clinician selection with valid coordinates', () => {
      expect(isTargetQualifiedForExport(true, true)).toBe(true);
      expect(isTargetQualifiedForExport(true, false)).toBe(false);
    });

    it('builds full export package with required clinical and provenance context', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-01' });
      expect(shellVm).not.toBeNull();

      const exportPkg = buildTargetExportPackage(
        shellVm!,
        {
          id: 'target-001',
          name: 'Left DLPFC - sgACC',
          geometryType: 'point',
          coordinateFormatted: '(-42.0, +38.0, +30.0)',
          coordinateSpace: 'MNI152_NONLINEAR_2009C',
          evidenceTierLabel: 'Tier 1 — Established',
          scientificSource: 'Fox et al. (2012) Biol Psychiatry',
        },
        {
          id: 'dec-001',
          hash: 'hash-abc-123',
          clinicianName: 'Dr. Sarah Lin',
          timestamp: '2026-09-04T10:00:00Z',
        },
      );

      expect(exportPkg.caseId).toBe('case-ux-v2-01');
      expect(exportPkg.selectedCoordinateFormatted).toBe('(-42.0, +38.0, +30.0)');
      expect(exportPkg.clinicianName).toBe('Dr. Sarah Lin');
      expect(exportPkg.softwareBuildId).toBeDefined();
    });
  });

  // =========================================================================
  // 6. Case Report Generation & Scientific Restraint (§149–151)
  // =========================================================================
  describe('Case Report Generation & Scientific Restraint (§149–151)', () => {
    it('MAG-UX-050: uses scientifically restrained nomination language in clinical report (§150)', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-01' });
      expect(shellVm).not.toBeNull();

      const report = generateCaseReport({
        shellVm: shellVm!,
        clinicianName: 'Dr. Sarah Lin',
        clinicianLicense: 'MED-12345',
      });

      expect(report.isResearchOnly).toBe(false);
      expect(report.markdownContent).toContain('MAGNIOM nominated candidate targets');
      expect(report.markdownContent).toContain('The treating specialist clinician independently evaluated candidates');
      // Must not contain autonomous prescriptive phrasing
      expect(report.markdownContent).not.toContain('MAGNIOM prescribed');
      expect(report.markdownContent).not.toContain('the system decided');
    });

    it('generates research target hypothesis report with mandatory disclaimer (§151)', () => {
      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-08' });
      expect(shellVm).not.toBeNull();

      const report = generateCaseReport({
        shellVm: shellVm!,
      });

      expect(report.isResearchOnly).toBe(true);
      expect(report.reportTitle).toContain('Research Target Hypothesis Report');
      expect(report.markdownContent).toContain('RESEARCH USE ONLY — NOT FOR CLINICAL DIAGNOSTIC OR TREATMENT PROCEDURE');
    });
  });

  // =========================================================================
  // 7. Observability & Audit Events (§238–240)
  // =========================================================================
  describe('Observability & Audit Events (§238–240)', () => {
    it('emits and captures operational events', () => {
      const captured: ShellOperationalEvent[] = [];
      const cleanup = onOperationalEvent(evt => captured.push(evt));

      // Trigger a deep link resolution failure to emit operational event
      resolveDeepLinkContext('/cases/invalid-case-test/targets');

      expect(captured.length).toBeGreaterThan(0);
      expect(captured[0]?.eventType).toBe('DEEP_LINK_RESOLUTION_FAILED');
      cleanup();
    });

    it('emits and captures clinical audit events', () => {
      const captured: ShellAuditEvent[] = [];
      const cleanup = onAuditEvent(evt => captured.push(evt));

      const shellVm = resolveCaseShellContext({ caseId: 'case-ux-v2-01' });
      generateCaseReport({ shellVm: shellVm! });

      expect(captured.length).toBeGreaterThan(0);
      expect(captured[0]?.eventType).toBe('REPORT_GENERATED');
      cleanup();
    });
  });
});
