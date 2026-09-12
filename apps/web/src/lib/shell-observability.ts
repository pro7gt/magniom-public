/**
 * @magniom/web - Shell Observability & Audit Event System
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§238–240).
 *
 * Rules:
 * - Operational events are for system health / error detection.
 * - Audit events are clinically relevant actions for compliance.
 * - No unnecessary PHI in event payloads.
 * - Product analytics ≠ scientific evidence (§240).
 */

// ==========================================
// 1. Operational Event Types (§238)
// ==========================================

export type ShellOperationalEventType =
  | 'SHELL_CONTEXT_RESOLUTION_FAILED'
  | 'MODULE_AUTHORITY_MISMATCH'
  | 'MODULE_NOT_FOUND'
  | 'CASE_CONTEXT_STALE'
  | 'SIGNING_BLOCKED_STALE_STATE'
  | 'SIGNING_BLOCKED_FAIL_CLOSED'
  | 'SIGNING_BLOCKED_RESEARCH_MODE'
  | 'SIGNING_BLOCKED_NO_AUTHORITY'
  | 'MULTI_TAB_INVALIDATION_DETECTED'
  | 'SESSION_EXPIRY_DURING_SIGNOFF'
  | 'DEEP_LINK_RESOLUTION_FAILED'
  | 'MEASUREMENT_QC_BELOW_THRESHOLD'
  | 'BROWSER_COMPATIBILITY_WARNING';

export interface ShellOperationalEvent {
  readonly eventType: ShellOperationalEventType;
  readonly timestamp: string;
  readonly caseId?: string | undefined;
  readonly indicationCode?: string | undefined;
  readonly moduleReleaseId?: string | undefined;
  readonly diagnosticCode?: string | undefined;
  readonly message: string;
  readonly severity: 'critical' | 'error' | 'warning' | 'info';
  readonly metadata?: Record<string, unknown> | undefined;
}

// ==========================================
// 2. Audit Event Types (§239)
// ==========================================

export type ShellAuditEventType =
  | 'CASE_OPENED'
  | 'CASE_CREATED'
  | 'CASE_INDICATION_SELECTED'
  | 'CASE_INDICATION_SWITCHED'
  | 'MODULE_CONTEXT_RESOLVED'
  | 'PHENOTYPE_APPROVED'
  | 'CLINICAL_CONTEXT_UPDATED'
  | 'MEASUREMENT_REGISTERED'
  | 'MEASUREMENT_QC_COMPLETED'
  | 'MEASUREMENT_REVIEWED'
  | 'TARGET_SLATE_GENERATED'
  | 'TARGET_SLATE_OPENED'
  | 'TARGET_SLATE_REGENERATED'
  | 'TARGET_CANDIDATE_INSPECTED'
  | 'EVIDENCE_DRAWER_OPENED'
  | 'EVIDENCE_OPENED'
  | 'COMPARISON_MATRIX_VIEWED'
  | 'CANDIDATE_COMPARED'
  | 'DECISION_STARTED'
  | 'DECISION_CANDIDATE_SELECTED'
  | 'TARGET_SELECTED'
  | 'DECISION_CANDIDATE_REJECTED'
  | 'NO_TARGET_SELECTED'
  | 'DECISION_CANDIDATE_MODIFIED'
  | 'TARGET_MODIFIED'
  | 'DECISION_SIGNED'
  | 'DECISION_SUPERSEDED'
  | 'NEURONAVIGATION_EXPORTED'
  | 'REPORT_GENERATED'
  | 'FAIL_CLOSED_TRIGGERED'
  | 'FAIL_CLOSED_RESOLVED'
  | 'MODE_CHANGED'
  | 'ORGANISATION_SWITCHED'
  | 'CLINICIAN_AUTHENTICATED'
  | 'CLINICIAN_AUTH_FAILED'
  | 'CLINICIAN_LOGGED_OUT';

export interface ShellAuditEvent {
  readonly eventType: ShellAuditEventType;
  readonly timestamp: string;
  readonly userId: string;
  readonly sessionId: string;
  readonly caseId?: string | undefined;
  readonly caseCode?: string | undefined;
  readonly indicationCode?: string | undefined;
  readonly moduleReleaseId?: string | undefined;
  readonly targetCandidateId?: string | undefined;
  readonly slateId?: string | undefined;
  readonly decisionId?: string | undefined;
  readonly message: string;
  readonly metadata?: Record<string, unknown> | undefined;
}

// ==========================================
// 3. Event Emitter
// ==========================================

type OperationalEventHandler = (event: ShellOperationalEvent) => void;
type AuditEventHandler = (event: ShellAuditEvent) => void;

const operationalHandlers: OperationalEventHandler[] = [];
const auditHandlers: AuditEventHandler[] = [];

/**
 * Registers a handler for operational events (§238).
 */
export function onOperationalEvent(handler: OperationalEventHandler): () => void {
  operationalHandlers.push(handler);
  return () => {
    const idx = operationalHandlers.indexOf(handler);
    if (idx >= 0) operationalHandlers.splice(idx, 1);
  };
}

/**
 * Registers a handler for audit events (§239).
 */
export function onAuditEvent(handler: AuditEventHandler): () => void {
  auditHandlers.push(handler);
  return () => {
    const idx = auditHandlers.indexOf(handler);
    if (idx >= 0) auditHandlers.splice(idx, 1);
  };
}

/**
 * Emits an operational event to all registered handlers (§238).
 */
export function emitOperationalEvent(
  eventType: ShellOperationalEventType,
  options: {
    message: string;
    severity: ShellOperationalEvent['severity'];
    caseId?: string | undefined;
    indicationCode?: string | undefined;
    moduleReleaseId?: string | undefined;
    diagnosticCode?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
  },
): void {
  const event: ShellOperationalEvent = {
    eventType,
    timestamp: new Date().toISOString(),
    caseId: options.caseId,
    indicationCode: options.indicationCode,
    moduleReleaseId: options.moduleReleaseId,
    diagnosticCode: options.diagnosticCode,
    message: options.message,
    severity: options.severity,
    metadata: options.metadata,
  };

  for (const handler of operationalHandlers) {
    try {
      handler(event);
    } catch {
      // Observability handlers must not throw
    }
  }

  // Also log to console in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const prefix =
      event.severity === 'critical' || event.severity === 'error' ? '[CRITICAL]' : '[WARN]';
    console.warn(`[MAGNIOM-OPS] ${prefix} ${event.eventType}: ${event.message}`, event.metadata);
  }
}

/**
 * Emits an audit event to all registered handlers (§239).
 */
export function emitAuditEvent(
  eventType: ShellAuditEventType,
  options: {
    message: string;
    userId?: string | undefined;
    sessionId?: string | undefined;
    caseId?: string | undefined;
    caseCode?: string | undefined;
    indicationCode?: string | undefined;
    moduleReleaseId?: string | undefined;
    targetCandidateId?: string | undefined;
    slateId?: string | undefined;
    decisionId?: string | undefined;
    metadata?: Record<string, unknown> | undefined;
  },
): void {
  const event: ShellAuditEvent = {
    eventType,
    timestamp: new Date().toISOString(),
    userId: options.userId || 'anonymous',
    sessionId: options.sessionId || 'session-unknown',
    caseId: options.caseId,
    caseCode: options.caseCode,
    indicationCode: options.indicationCode,
    moduleReleaseId: options.moduleReleaseId,
    targetCandidateId: options.targetCandidateId,
    slateId: options.slateId,
    decisionId: options.decisionId,
    message: options.message,
    metadata: options.metadata,
  };

  for (const handler of auditHandlers) {
    try {
      handler(event);
    } catch {
      // Audit handlers must not throw
    }
  }

  // Development logging
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.info(`[MAGNIOM-AUDIT] ${event.eventType}: ${event.message}`, event.metadata);
  }
}

// ==========================================
// 4. Analytics Boundary (§240)
// ==========================================

/**
 * IMPORTANT: Product analytics events are strictly separated from scientific evidence
 * and clinical audit events (§240). Product analytics data MUST NOT be used to
 * derive, modify, or validate scientific claims about targeting efficacy.
 *
 * This function is provided as a boundary marker. In production, analytics
 * events would be routed to a separate analytics pipeline.
 */
export function emitProductAnalyticsEvent(
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  // In production: route to analytics pipeline (Mixpanel, Amplitude, etc.)
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.debug(`[MAGNIOM-ANALYTICS] ${eventName}`, properties);
  }
}
