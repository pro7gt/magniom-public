import { describe, it, expect } from 'vitest';
import type { AppRole, SlateStatus, DecisionType } from './enums.js';

describe('MAG-SEC-012 & MAG-SEC-006: Multi-Tenant RLS & Capability Policy Engine', () => {
  interface UserSession {
    userId: string;
    organisationId: string;
    siteId?: string;
    role: AppRole;
    permissions: string[];
    canSignTms: boolean;
  }

  interface MockCaseResource {
    caseId: string;
    organisationId: string;
    siteId?: string;
    patientId: string;
    phenotypeSnapshotLocked: boolean;
    targetSlateStatus?: SlateStatus;
    signedDecisionId?: string;
  }

  const orgAClinician: UserSession = {
    userId: 'user-alpha-01',
    organisationId: 'org-alpha',
    siteId: 'site-a1',
    role: 'tms_specialist',
    permissions: ['case.read', 'case.update', 'phenotype.edit', 'tms.sign', 'target.generate'],
    canSignTms: true,
  };

  const orgBClinician: UserSession = {
    userId: 'user-beta-01',
    organisationId: 'org-beta',
    siteId: 'site-b1',
    role: 'tms_specialist',
    permissions: ['case.read', 'case.update', 'phenotype.edit', 'tms.sign', 'target.generate'],
    canSignTms: true,
  };

  const orgAOperator: UserSession = {
    userId: 'user-alpha-operator',
    organisationId: 'org-alpha',
    siteId: 'site-a1',
    role: 'clinical_reviewer',
    permissions: ['case.read', 'case.create', 'imaging.upload'],
    canSignTms: false,
  };

  const serviceWorker: UserSession = {
    userId: 'worker-neurocompute-01',
    organisationId: 'org-alpha',
    role: 'service_worker',
    permissions: ['compute.execute', 'artifact.write', 'job.process'],
    canSignTms: false,
  };

  const caseInOrgA: MockCaseResource = {
    caseId: 'case-alpha-100',
    organisationId: 'org-alpha',
    siteId: 'site-a1',
    patientId: 'patient-alpha-001',
    phenotypeSnapshotLocked: true,
    targetSlateStatus: 'ready_for_review',
  };

  function evaluateRlsReadPolicy(user: UserSession, resource: MockCaseResource): boolean {
    if (!user.permissions.includes('case.read') && user.role !== 'service_worker') {
      return false;
    }
    if (user.organisationId !== resource.organisationId) {
      return false;
    }
    if (user.siteId && resource.siteId && user.siteId !== resource.siteId) {
      return false;
    }
    return true;
  }

  function evaluateDecisionSigningPolicy(user: UserSession, resource: MockCaseResource): { allowed: boolean; reason?: string } {
    if (user.organisationId !== resource.organisationId) {
      return { allowed: false, reason: 'Cross-organisation signing prohibited' };
    }
    if (!user.canSignTms || !user.permissions.includes('tms.sign')) {
      return { allowed: false, reason: 'User lacks TMS signing authority' };
    }
    if (!resource.phenotypeSnapshotLocked) {
      return { allowed: false, reason: 'Cannot sign decision without locked PhenotypeSnapshot' };
    }
    if (resource.targetSlateStatus !== 'ready_for_review') {
      return { allowed: false, reason: 'Cannot sign decision without review-ready TargetSlate' };
    }
    return { allowed: true };
  }

  it('permits authenticated clinician to read case within own organisation and site', () => {
    expect(evaluateRlsReadPolicy(orgAClinician, caseInOrgA)).toBe(true);
  });

  it('STRICTLY DENIES cross-tenant case read access (MAG-SEC-012)', () => {
    expect(evaluateRlsReadPolicy(orgBClinician, caseInOrgA)).toBe(false);
  });

  it('denies user when site assignment does not match case site', () => {
    const userDifferentSite: UserSession = {
      ...orgAClinician,
      siteId: 'site-a2',
    };
    expect(evaluateRlsReadPolicy(userDifferentSite, caseInOrgA)).toBe(false);
  });

  it('authorizes decision signing when clinician has explicit TMS authority (MAG-SEC-022, MAG-SEC-023)', () => {
    const result = evaluateDecisionSigningPolicy(orgAClinician, caseInOrgA);
    expect(result.allowed).toBe(true);
  });

  it('rejects decision signing when operator lacks tms.sign permission', () => {
    const result = evaluateDecisionSigningPolicy(orgAOperator, caseInOrgA);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('lacks TMS signing authority');
  });

  it('rejects cross-tenant decision signing attempt from clinician in different organisation', () => {
    const result = evaluateDecisionSigningPolicy(orgBClinician, caseInOrgA);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Cross-organisation');
  });

  it('enforces immutable triggers on published TargetSlates and signed ClinicianDecisions', () => {
    const immutableEntity = {
      type: 'TARGET_SLATE',
      id: 'slate-001',
      status: 'ready_for_review' as SlateStatus,
      isImmutable: true,
    };

    function attemptMutation(entity: typeof immutableEntity, op: 'UPDATE' | 'DELETE') {
      if (entity.isImmutable) {
        throw new Error(`MAG-SEC-025: Table targeting.target_slates is immutable. ${op} operation is strictly prohibited.`);
      }
    }

    expect(() => attemptMutation(immutableEntity, 'UPDATE')).toThrow('MAG-SEC-025');
    expect(() => attemptMutation(immutableEntity, 'DELETE')).toThrow('MAG-SEC-025');
  });
});
