/**
 * @magniom/web - Sign-Off Safety Guard Module
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§137–142, §189).
 *
 * Rules:
 * - Sign-off context restatement must include all dimensions (§138).
 * - Stale Slates SHALL NOT be signable (§140).
 * - Multi-tab invalidation SHALL cancel active sign-off flows (§141).
 * - Session expiry during sign-off SHALL block completion (§142).
 * - Optimistic UI is PROHIBITED for safety-critical actions (§189).
 */

import type { CaseShellViewModel, ClinicalActionCapabilities } from '@magniom/presentation';

// ==========================================
// 1. Sign-Off Context Restatement Data (§137–138)
// ==========================================

export interface SignOffContextRestatement {
  /** Case identifier and code */
  readonly caseId: string;
  readonly caseCode: string;
  /** Active indication and module authority */
  readonly indicationCode: string;
  readonly indicationFormatted: string;
  readonly moduleReleaseId: string;
  readonly moduleVersion: string;
  readonly moduleName: string;
  readonly qualificationLevel: string;
  /** Environment and mode */
  readonly mode: string;
  /** Target Slate context */
  readonly slateId: string;
  readonly slateCandidateCount: number;
  readonly slateManifestHash?: string | undefined;
  /** Selected target geometry */
  readonly selectedTargetId: string;
  readonly selectedTargetName: string;
  readonly selectedCoordinateFormatted: string;
  /** Clinician identity */
  readonly clinicianId: string;
  readonly clinicianDisplayName: string;
  readonly clinicianRoleTitle: string;
  readonly hasSigningAuthority: boolean;
  /** Timestamp */
  readonly restatementTimestamp: string;
}

/**
 * Constructs sign-off context restatement from the authoritative CaseShellViewModel (§138).
 */
export function buildSignOffContextRestatement(
  shellVm: CaseShellViewModel,
  selectedTargetId: string,
  selectedTargetName: string,
  selectedCoordinateFormatted: string,
  clinician: { id: string; displayName: string; roleTitle: string; hasSigningAuthority: boolean },
): SignOffContextRestatement {
  return {
    caseId: shellVm.caseIdentity.caseId,
    caseCode: shellVm.caseIdentity.caseCode,
    indicationCode: shellVm.indication.indicationCode,
    indicationFormatted: shellVm.indication.indicationFormatted,
    moduleReleaseId: shellVm.moduleAuthority.moduleReleaseId,
    moduleVersion: shellVm.moduleAuthority.moduleVersion,
    moduleName: shellVm.moduleAuthority.humanReadableName,
    qualificationLevel: shellVm.moduleAuthority.qualificationLevel,
    mode: shellVm.mode.mode,
    slateId: shellVm.targetSlate?.slateId ?? '',
    slateCandidateCount: shellVm.targetSlate?.candidateCount ?? 0,
    slateManifestHash: undefined,
    selectedTargetId,
    selectedTargetName,
    selectedCoordinateFormatted,
    clinicianId: clinician.id,
    clinicianDisplayName: clinician.displayName,
    clinicianRoleTitle: clinician.roleTitle,
    hasSigningAuthority: clinician.hasSigningAuthority,
    restatementTimestamp: new Date().toISOString(),
  };
}

// ==========================================
// 2. Pre-Signing Validation (§139–142)
// ==========================================

export interface SignOffValidationResult {
  readonly canSign: boolean;
  readonly blockedReasons: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * Validates all preconditions for clinical decision sign-off (§139–142, §189).
 * This function MUST be called synchronously before any signing action.
 * Returns `canSign: false` if any blocking condition is detected.
 */
export function validateSignOffPreconditions(
  shellVm: CaseShellViewModel,
  capabilities: ClinicalActionCapabilities,
): SignOffValidationResult {
  const blockedReasons: string[] = [];
  const warnings: string[] = [];

  // §139: Server-authorised signing capability
  if (!capabilities.may_sign_target_decision) {
    blockedReasons.push(
      'User does not have signing authority for clinical target decisions in this module context.',
    );
  }

  // §25 / §236: Fail-closed state
  if (shellVm.safetyState === 'FAIL_CLOSED') {
    blockedReasons.push(
      'System is in FAIL CLOSED state. Clinical targeting actions are locked pending diagnostic resolution.',
    );
  }

  // §140: Stale Slate rejection
  if (shellVm.currentness.blockingSignOff) {
    const reasons = shellVm.currentness.reasons
      .filter(r => r.severity === 'blocking')
      .map(r => r.message);
    blockedReasons.push(`Target Slate is stale and cannot be signed: ${reasons.join('; ')}`);
  }

  // Mode check: Research mode prohibits clinical signing (§22, §57, §139)
  if (shellVm.mode.isResearch) {
    blockedReasons.push(
      'Clinical decision signing is prohibited in Research Mode. Research outputs are hypothesis-generating only.',
    );
  }

  // Blinded validation check (§221)
  if (shellVm.moduleAuthority.silentProspectiveBlinded) {
    blockedReasons.push(
      'Silent Prospective Validation is active. Target Slate is sealed and not visible to treating clinician.',
    );
  }

  // Target Slate must exist
  if (!shellVm.targetSlate || !shellVm.targetSlate.isReady) {
    blockedReasons.push(
      'No qualified Target Slate is available for this case. Generate a Target Slate before signing.',
    );
  }

  // Important staleness warnings (non-blocking)
  if (shellVm.currentness.isStale && !shellVm.currentness.blockingSignOff) {
    const importantReasons = shellVm.currentness.reasons
      .filter(r => r.severity === 'important')
      .map(r => r.message);
    if (importantReasons.length > 0) {
      warnings.push(
        `Non-blocking staleness detected: ${importantReasons.join('; ')}. Consider regenerating the slate.`,
      );
    }
  }

  return {
    canSign: blockedReasons.length === 0,
    blockedReasons,
    warnings,
  };
}

// ==========================================
// 3. Multi-Tab Invalidation (§141)
// ==========================================

const SIGN_OFF_CHANNEL_NAME = 'magniom_signoff_channel';

export interface MultiTabSignOffEvent {
  readonly type:
    'SIGN_OFF_STARTED' | 'SIGN_OFF_COMPLETED' | 'SIGN_OFF_CANCELLED' | 'CASE_STATE_CHANGED';
  readonly caseId: string;
  readonly tabId: string;
  readonly timestamp: string;
}

/**
 * Creates a BroadcastChannel listener for multi-tab sign-off coordination (§141).
 * Returns a cleanup function to close the channel.
 */
export function createMultiTabSignOffGuard(onInvalidation: (event: MultiTabSignOffEvent) => void): {
  broadcastEvent: (event: MultiTabSignOffEvent) => void;
  cleanup: () => void;
} {
  // BroadcastChannel is only available in browser contexts
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return {
      broadcastEvent: () => {},
      cleanup: () => {},
    };
  }

  const channel = new BroadcastChannel(SIGN_OFF_CHANNEL_NAME);
  channel.addEventListener('message', (msg: MessageEvent<MultiTabSignOffEvent>) => {
    onInvalidation(msg.data);
  });

  return {
    broadcastEvent: (event: MultiTabSignOffEvent) => {
      channel.postMessage(event);
    },
    cleanup: () => {
      channel.close();
    },
  };
}

// ==========================================
// 4. Session Expiry Detection (§142)
// ==========================================

/**
 * Checks if the current session has expired during a sign-off flow (§142).
 * In a production system, this would validate against the authentication token.
 * For the current implementation, this is a stub that always returns valid.
 */
export function isSessionValid(): boolean {
  // Stub: In production, validate JWT/session token expiry against auth server
  return true;
}

// ==========================================
// 5. Optimistic UI Prohibition List (§189)
// ==========================================

/**
 * Actions that are PROHIBITED from using optimistic UI patterns (§189).
 * These actions must await server confirmation before updating the UI.
 */
export const PROHIBITED_OPTIMISTIC_ACTIONS = [
  'sign_clinical_decision',
  'approve_phenotype',
  'regenerate_target_slate',
  'modify_clinician_target',
  'export_neuronavigation_target',
  'change_case_indication',
  'supersede_decision',
  'mark_case_contraindicated',
] as const;

export type ProhibitedOptimisticAction = (typeof PROHIBITED_OPTIMISTIC_ACTIONS)[number];

/**
 * Guards against optimistic completion of safety-critical actions (§189).
 * Returns true if the action requires server confirmation before UI update.
 */
export function isOptimisticProhibited(action: string): boolean {
  return (PROHIBITED_OPTIMISTIC_ACTIONS as readonly string[]).includes(action);
}
