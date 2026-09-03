/**
 * MAGNIOM MODULE KILL SWITCH & SUSPENSION TEST SUITE
 * Conforms to MAGNIOM-Enterprise Verification, Testing & CI/CD Specification v2.0 (§183–184)
 * Standard Reference: IEC 62304 Class C Safety Mitigations / ISO 14971 Risk Controls
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ModuleKillSwitchManager } from '../../../../scripts/release/module-kill-switch.js';

describe('MAGNIOM CI/CD §183–184: Module Kill Switch & Runtime Suspension', () => {
  const repoRoot = path.resolve(process.cwd());
  const registryPath = path.join(repoRoot, 'docs/verification/v2/module-kill-switch-registry.json');
  let originalRegistryContent: string | null = null;

  beforeEach(() => {
    if (fs.existsSync(registryPath)) {
      originalRegistryContent = fs.readFileSync(registryPath, 'utf8');
    }
  });

  afterEach(() => {
    if (originalRegistryContent !== null) {
      fs.writeFileSync(registryPath, originalRegistryContent, 'utf8');
    } else if (fs.existsSync(registryPath)) {
      fs.unlinkSync(registryPath);
    }
  });

  it('INDEPENDENT SUSPENSION (§184): Suspending OCD does not impact MDD or other modules', () => {
    const manager = new ModuleKillSwitchManager(repoRoot);

    // Initial state: not suspended
    expect(manager.isSuspended('OCD')).toBe(false);
    expect(manager.isSuspended('MDD')).toBe(false);

    // Suspend OCD
    const state = manager.suspendModule(
      'OCD',
      'ClinicalSafetyOfficer',
      'Adverse event investigation pending validation',
    );

    expect(state.isSuspended).toBe(true);
    expect(state.indicationCode).toBe('OCD');
    expect(state.suspendedBy).toBe('ClinicalSafetyOfficer');
    expect(state.auditEventId).toBeDefined();

    // Query status
    expect(manager.isSuspended('OCD')).toBe(true);
    // Other modules MUST remain unaffected
    expect(manager.isSuspended('MDD')).toBe(false);
    expect(manager.isSuspended('STROKE_MOTOR')).toBe(false);
    expect(manager.isSuspended('NEUROPATHIC_PAIN')).toBe(false);
  });

  it('RESUMPTION LIFECYCLE (§184): Resuming a module clears suspension and logs audit trace', () => {
    const manager = new ModuleKillSwitchManager(repoRoot);

    manager.suspendModule('PTSD', 'SafetyOfficer', 'Temporary safety hold');
    expect(manager.isSuspended('PTSD')).toBe(true);

    const resumeState = manager.resumeModule(
      'PTSD',
      'ClinicalDirector',
      'Validation completed, safety cleared',
    );

    expect(resumeState.isSuspended).toBe(false);
    expect(resumeState.reason).toContain('Validation completed');
    expect(manager.isSuspended('PTSD')).toBe(false);
  });
});
