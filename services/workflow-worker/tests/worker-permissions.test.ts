import { describe, it, expect, beforeEach } from 'vitest';
import { WorkerAuthManager } from '../src/worker-auth.js';

describe('MAG-SEC-010 & MAG-SEC-011: Worker Scoped Permissions & M2M Authentication', () => {
  let authManager: WorkerAuthManager;

  beforeEach(() => {
    authManager = new WorkerAuthManager([
      'neurocompute-worker-01',
      'workflow-worker-01',
      'efield-worker-01',
      'report-worker-01',
    ]);
  });

  it('generates valid bounded M2M token for registered worker ID', () => {
    const { token, claims } = authManager.generateWorkerToken('neurocompute-worker-01', ['compute.execute', 'artifact.write'], 300);

    expect(token).toBeDefined();
    expect(claims.sub).toBe('neurocompute-worker-01');
    expect(claims.role).toBe('service_worker');
    expect(claims.scope).toContain('compute.execute');
    expect(claims.exp - claims.iat).toBe(300);

    const validation = authManager.validateWorkerToken(token);
    expect(validation.valid).toBe(true);
    expect(validation.claims?.sub).toBe('neurocompute-worker-01');
  });

  it('rejects token generation for unregistered worker IDs (MAG-SEC-010)', () => {
    expect(() => {
      authManager.generateWorkerToken('malicious-unregistered-worker', ['job.process']);
    }).toThrow('not registered in authorized worker registry');
  });

  it('rejects tampered worker tokens', () => {
    const { token } = authManager.generateWorkerToken('workflow-worker-01');
    const tamperedToken = token.slice(0, -5) + 'xxxxx';

    const validation = authManager.validateWorkerToken(tamperedToken);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('Invalid token signature');
  });

  it('enforces bounded storage access restricted to assigned org and case prefix (MAG-SEC-014)', () => {
    const orgId = 'org-alpha-123';
    const caseId = 'case-patient-456';
    const scope = ['artifact.write', 'artifact.read'];

    // Valid path within bounded scope
    const validPath = `org/${orgId}/case/${caseId}/artifact/bold_matrix.json`;
    expect(authManager.validateStorageAccess(scope, validPath, orgId, caseId)).toBe(true);

    // Cross-tenant storage path attempt (Denied)
    const crossTenantPath = `org/other-org-999/case/${caseId}/artifact/bold_matrix.json`;
    expect(authManager.validateStorageAccess(scope, crossTenantPath, orgId, caseId)).toBe(false);

    // Cross-case storage path attempt (Denied)
    const crossCasePath = `org/${orgId}/case/other-case-777/artifact/bold_matrix.json`;
    expect(authManager.validateStorageAccess(scope, crossCasePath, orgId, caseId)).toBe(false);
  });

  it('creates de-identified job execution context without patient PII (MAG-SEC-029)', () => {
    const context = authManager.createJobContext(
      'job-101',
      'neurocompute-worker-01',
      'case-404',
      'org-alpha'
    );

    expect(context.jobId).toBe('job-101');
    expect(context.workerId).toBe('neurocompute-worker-01');
    expect(context.correlationId).toMatch(/^corr-/);
    expect(context.traceId).toMatch(/^tr-/);
    // Verifies no patient MRN, name, or health text is in context
    expect(JSON.stringify(context)).not.toContain('patient_name');
    expect(JSON.stringify(context)).not.toContain('mrn');
  });
});
