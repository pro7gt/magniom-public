/**
 * @magniom/web - Deep Link Context Resolution Engine
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§143–146).
 *
 * Rules:
 * - Deep links must reconstruct full context (user, org, case, indication, module, workflow, currentness) from URL.
 * - Failure to resolve context must produce a descriptive error, not a broken UI.
 * - Historical Slate views must preserve the generation-time context (indication, module, policy, evidence, measurements, decision).
 */

import { caseStore } from './case-store';
import { resolveCaseShellContext } from './shell-authority';
import type { CaseShellViewModel } from '@magniom/presentation';
import { emitOperationalEvent } from './shell-observability';

// ==========================================
// 1. Deep Link Resolution Types
// ==========================================

export type DeepLinkResolutionStatus =
  | 'resolved'
  | 'case_not_found'
  | 'indication_not_found'
  | 'module_not_permitted'
  | 'slate_not_found'
  | 'decision_not_found'
  | 'session_invalid'
  | 'unknown_error';

export interface DeepLinkResolutionResult {
  readonly status: DeepLinkResolutionStatus;
  readonly shellVm?: CaseShellViewModel | undefined;
  readonly caseId?: string | undefined;
  readonly caseIndicationId?: string | undefined;
  readonly targetPath?: string | undefined;
  readonly errorMessage?: string | undefined;
  readonly errorTitle?: string | undefined;
  readonly suggestedAction?: string | undefined;
}

// ==========================================
// 2. URL Pattern Parsing
// ==========================================

interface ParsedDeepLink {
  readonly caseId?: string | undefined;
  readonly caseIndicationId?: string | undefined;
  readonly subRoute?: string | undefined;
  readonly slateId?: string | undefined;
  readonly candidateId?: string | undefined;
  readonly decisionId?: string | undefined;
}

/**
 * Parses a deep link URL path into structured components.
 */
export function parseDeepLinkPath(pathname: string): ParsedDeepLink {
  // /cases/[caseId]/...
  const caseMatch = pathname.match(/^\/cases\/([^/]+)/);
  const caseId = caseMatch?.[1];

  // /cases/[caseId]/indications/[caseIndicationId]/...
  const indicationMatch = pathname.match(/\/indications\/([^/]+)/);
  const caseIndicationId = indicationMatch?.[1];

  // Extract sub-route after caseId (or after indicationId)
  let subRoute: string | undefined;
  if (caseIndicationId) {
    const afterIndication = pathname.match(/\/indications\/[^/]+\/(.+)/);
    subRoute = afterIndication?.[1];
  } else if (caseId) {
    const afterCase = pathname.match(/\/cases\/[^/]+\/(.+)/);
    subRoute = afterCase?.[1];
  }

  // Extract specific IDs from query params or path segments
  const slateMatch = pathname.match(/slate[=/]([a-zA-Z0-9-]+)/);
  const candidateMatch = pathname.match(/candidate[=/]([a-zA-Z0-9-]+)/);
  const decisionMatch = pathname.match(/decision[=/]([a-zA-Z0-9-]+)/);

  return {
    caseId: caseId !== 'new' ? caseId : undefined,
    caseIndicationId,
    subRoute,
    slateId: slateMatch?.[1],
    candidateId: candidateMatch?.[1],
    decisionId: decisionMatch?.[1],
  };
}

// ==========================================
// 3. Context Resolution (§143)
// ==========================================

/**
 * Resolves full context from a deep link URL path (§143).
 * Reconstructs user authority, organisation, Case, CaseIndication, mode, module,
 * workflow state, and currentness from the URL.
 */
export function resolveDeepLinkContext(pathname: string): DeepLinkResolutionResult {
  const parsed = parseDeepLinkPath(pathname);

  // No case ID = global route, no case-level context needed
  if (!parsed.caseId) {
    return {
      status: 'resolved',
      targetPath: pathname,
    };
  }

  // Attempt to load case
  const record = caseStore.getCaseRecord(parsed.caseId);
  if (!record) {
    emitOperationalEvent('DEEP_LINK_RESOLUTION_FAILED', {
      message: `Case ${parsed.caseId} not found during deep link resolution.`,
      severity: 'warning',
      caseId: parsed.caseId,
      diagnosticCode: 'DL-CASE-404',
    });

    return {
      status: 'case_not_found',
      caseId: parsed.caseId,
      errorTitle: 'Case Not Found',
      errorMessage: `The case "${parsed.caseId}" could not be found. It may have been archived, transferred to another organisation, or does not exist.`,
      suggestedAction: 'Return to the Cases list and verify the case identifier.',
    };
  }

  // Resolve CaseIndication if specified
  if (parsed.caseIndicationId) {
    const matchingIndication = record.availableIndications.find(
      i => i.caseIndicationId === parsed.caseIndicationId,
    );
    if (!matchingIndication) {
      emitOperationalEvent('DEEP_LINK_RESOLUTION_FAILED', {
        message: `CaseIndication ${parsed.caseIndicationId} not found for case ${parsed.caseId}.`,
        severity: 'warning',
        caseId: parsed.caseId,
        diagnosticCode: 'DL-IND-404',
      });

      return {
        status: 'indication_not_found',
        caseId: parsed.caseId,
        caseIndicationId: parsed.caseIndicationId,
        errorTitle: 'Indication Not Found',
        errorMessage: `The specified indication context "${parsed.caseIndicationId}" is not registered for this case. It may have been removed or the link may be outdated.`,
        suggestedAction: 'Navigate to the Case Overview and select an available indication.',
      };
    }
  }

  // Resolve shell VM
  const shellVm = resolveCaseShellContext({
    caseId: parsed.caseId,
    activePath: pathname,
    targetCaseIndicationId: parsed.caseIndicationId,
  });

  if (!shellVm) {
    emitOperationalEvent('SHELL_CONTEXT_RESOLUTION_FAILED', {
      message: `Shell context resolution returned null for case ${parsed.caseId}.`,
      severity: 'error',
      caseId: parsed.caseId,
      diagnosticCode: 'DL-SHELL-NULL',
    });

    return {
      status: 'unknown_error',
      caseId: parsed.caseId,
      errorTitle: 'Context Resolution Failed',
      errorMessage:
        'The system was unable to reconstruct the clinical context for this deep link. This may indicate a configuration error.',
      suggestedAction: 'Contact system support if this persists.',
    };
  }

  // §144: Check module permission
  if (shellVm.safetyState === 'FAIL_CLOSED') {
    return {
      status: 'module_not_permitted',
      shellVm,
      caseId: parsed.caseId,
      caseIndicationId: parsed.caseIndicationId,
      targetPath: pathname,
      errorTitle: 'Module Authority Conflict',
      errorMessage:
        'The indication module governing this case is not authorised for the current deployment mode. Clinical targeting actions are locked.',
      suggestedAction: 'Contact system support or switch to Research Mode if applicable.',
    };
  }

  return {
    status: 'resolved',
    shellVm,
    caseId: parsed.caseId,
    caseIndicationId: parsed.caseIndicationId,
    targetPath: pathname,
  };
}

// ==========================================
// 4. Historical Slate View (§145–146)
// ==========================================

export interface HistoricalSlateContext {
  readonly slateId: string;
  readonly caseId: string;
  readonly indicationCode: string;
  readonly moduleReleaseId: string;
  readonly generationTimestamp: string;
  readonly isHistorical: true;
  readonly generationContextNote: string;
}

/**
 * Constructs historical Slate context metadata (§145–146).
 * Historical Slate views preserve the indication, module, policy, evidence,
 * measurements, and decision context that was active at generation time.
 */
export function buildHistoricalSlateContext(
  slateId: string,
  caseId: string,
  indicationCode: string,
  moduleReleaseId: string,
  generationTimestamp: string,
): HistoricalSlateContext {
  return {
    slateId,
    caseId,
    indicationCode,
    moduleReleaseId,
    generationTimestamp,
    isHistorical: true,
    generationContextNote:
      `This is a historical view of Target Slate ${slateId}, ` +
      `generated under module ${moduleReleaseId} at ${generationTimestamp}. ` +
      `The clinical context, evidence library, and measurements active at generation time are preserved.`,
  };
}
