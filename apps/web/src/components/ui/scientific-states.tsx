'use client';

import React from 'react';

import { InfoIcon, AlertTriangleIcon, RefreshCwIcon, AlertOctagonIcon, CircleIcon } from './icon';
import { Button } from './button';

// ==========================================
// Scientific Empty/Error/Processing/Abstention States (§206–211)
// Language must use scientific restraint — no "bad scan", "weak patient", etc. (§182).
// ==========================================

export interface ScientificStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  resolution?: string;
  variant?: 'empty' | 'abstention' | 'partial' | 'processing' | 'error';
  children?: React.ReactNode;
}

/**
 * Renders a domain-specific state card using scientifically restrained language (§206–211).
 */
export function ScientificState({
  title,
  message,
  icon,
  resolution,
  variant = 'empty',
  children,
}: ScientificStateProps) {
  const defaultIcons: Record<
    'empty' | 'abstention' | 'partial' | 'processing' | 'error',
    React.ReactNode
  > = {
    empty: <InfoIcon size={24} />,
    abstention: <AlertOctagonIcon size={24} />,
    partial: <CircleIcon size={24} />,
    processing: <RefreshCwIcon size={24} />,
    error: <AlertTriangleIcon size={24} />,
  };

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={`scientific-state scientific-state-${variant}`}
    >
      <span aria-hidden="true" className="scientific-state-icon">
        {icon || defaultIcons[variant]}
      </span>
      <h3 className="scientific-state-title">{title}</h3>
      <p className="scientific-state-message">{message}</p>
      {resolution && <p className="scientific-state-resolution">{resolution}</p>}
      {children && <div className="scientific-state-actions mt-3">{children}</div>}
    </div>
  );
}

// ==========================================
// Pre-built canonical states
// ==========================================

/** §206 — Empty Target Slate state */
export function EmptyTargetSlateState() {
  return (
    <ScientificState
      variant="empty"
      title="No Target Slate Available"
      message="A Target Slate has not yet been generated for this case. The targeting module requires approved clinical context and qualified measurements before candidate targets can be computed."
      resolution="Complete the Clinical Context formulation and ensure all required measurement modalities are qualified."
    />
  );
}

/** §207 — Abstention state: system chose not to generate targets */
export function AbstentionState({ reason }: { reason?: string }) {
  return (
    <ScientificState
      variant="abstention"
      title="Target Generation Abstained"
      message={
        reason ||
        'The targeting engine determined that reliable candidate targets cannot be generated for this case under current conditions. This may occur when measurement quality is below the required threshold or when clinical context is outside the validated applicability scope of the active module.'
      }
      resolution="Review measurement quality reports and clinical context for discrepancies. If appropriate, consult the module specification for eligibility criteria."
    />
  );
}

/** §208 — Partial capability state */
export function PartialCapabilityState({
  availableCapabilities,
  missingCapabilities,
}: {
  availableCapabilities: string[];
  missingCapabilities: string[];
}) {
  return (
    <ScientificState
      variant="partial"
      title="Partial Targeting Capability"
      message={`This case has ${availableCapabilities.length} of ${availableCapabilities.length + missingCapabilities.length} required capabilities. The targeting module is operating with reduced functionality.`}
      resolution="Ensure all required measurement modalities are available and qualified to restore full targeting capability."
    >
      <div className="text-left mt-3 text-sm">
        {availableCapabilities.length > 0 && (
          <div className="mb-2">
            <strong className="text-emerald">Available:</strong>
            <ul className="mt-1 ml-4 p-0">
              {availableCapabilities.map(c => (
                <li key={c} className="text-secondary">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
        {missingCapabilities.length > 0 && (
          <div>
            <strong className="text-rose">Missing:</strong>
            <ul className="mt-1 ml-4 p-0">
              {missingCapabilities.map(c => (
                <li key={c} className="text-secondary">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ScientificState>
  );
}

/** §209 — Domain-specific processing state */
export function ProcessingState({
  operationName,
  detail,
}: {
  operationName: string;
  detail?: string;
}) {
  return (
    <ScientificState
      variant="processing"
      title={`${operationName} In Progress`}
      message={
        detail ||
        'The requested operation is being processed. Clinical targeting outputs will be available upon completion.'
      }
      resolution="This page will update automatically when processing completes."
    />
  );
}

/** §211 — Error state */
export function ErrorState({
  title,
  message,
  diagnosticCode,
}: {
  title?: string;
  message?: string;
  diagnosticCode?: string;
}) {
  return (
    <ScientificState
      variant="error"
      title={title || 'Operation Failed'}
      message={
        message ||
        'An error occurred during the requested operation. This may be due to a transient system issue or an unexpected configuration state.'
      }
      resolution={
        diagnosticCode
          ? `Diagnostic code: ${diagnosticCode}. Contact system support if this persists.`
          : 'If this issue persists, contact system support with the relevant case identifier.'
      }
    />
  );
}

/** §207 — Empty evidence state */
export function EmptyEvidenceState() {
  return (
    <ScientificState
      variant="empty"
      title="No Evidence Claims Available"
      message="No approved evidence claims have been registered for the active indication module in this deployment. Evidence claims are published through the canonical Evidence Library."
      resolution="Verify the active indication module has an associated evidence release."
    />
  );
}

/** Empty case list state */
export function EmptyCaseListState() {
  return (
    <ScientificState
      variant="empty"
      title="No Cases Found"
      message="No clinical cases match the current filter criteria, or no cases have been created in this organisation."
      resolution="Create a new case or adjust the active filters."
    />
  );
}

/** §206 — Canonical fallback state when a requested case record cannot be found */
export function CaseNotFoundState({ caseId }: { caseId?: string }) {
  return (
    <ScientificState
      variant="empty"
      title="Case Record Unavailable"
      message={
        caseId
          ? `The requested clinical case identifier (${caseId}) could not be located in the current repository partition or the record has been archived.`
          : 'The requested clinical case record could not be located in the active session repository.'
      }
      resolution="Verify the case identifier or return to the clinical case repository registry."
    >
      <div className="flex justify-center gap-2 mt-4">
        <Button variant="secondary" href="/cases">
          Return to Case Registry
        </Button>
      </div>
    </ScientificState>
  );
}
