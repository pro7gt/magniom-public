'use client';

import React from 'react';

// ==========================================
// Scientific Empty/Error/Processing/Abstention States (§206–211)
// Language must use scientific restraint — no "bad scan", "weak patient", etc. (§182).
// ==========================================

interface ScientificStateProps {
  title: string;
  message: string;
  icon?: string;
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
  const variantStyles: Record<
    'empty' | 'abstention' | 'partial' | 'processing' | 'error',
    { bg: string; border: string; iconColor: string }
  > = {
    empty: {
      bg: 'rgba(255,255,255,0.03)',
      border: 'rgba(255,255,255,0.08)',
      iconColor: 'var(--text-muted)',
    },
    abstention: { bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.3)', iconColor: '#fbbf24' },
    partial: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.3)', iconColor: '#818cf8' },
    processing: {
      bg: 'rgba(59,130,246,0.08)',
      border: 'rgba(59,130,246,0.3)',
      iconColor: '#60a5fa',
    },
    error: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.3)', iconColor: '#f87171' },
  };

  const style = variantStyles[variant] ?? variantStyles.empty;
  const defaultIcons: Record<'empty' | 'abstention' | 'partial' | 'processing' | 'error', string> =
    {
      empty: 'ℹ',
      abstention: '⊘',
      partial: '◐',
      processing: '⏳',
      error: '⚠',
    };

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      style={{
        textAlign: 'center',
        padding: '2.5rem 2rem',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '10px',
        maxWidth: '560px',
        margin: '2rem auto',
      }}
    >
      <span
        aria-hidden="true"
        style={{ fontSize: '2rem', display: 'block', marginBottom: '12px', color: style.iconColor }}
      >
        {icon || defaultIcons[variant]}
      </span>
      <h3
        style={{
          margin: '0 0 8px',
          color: 'var(--text-main)',
          fontSize: '1.1rem',
          fontWeight: 600,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: '0 0 12px',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          lineHeight: 1.5,
        }}
      >
        {message}
      </p>
      {resolution && (
        <p
          style={{
            margin: 0,
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontStyle: 'italic',
          }}
        >
          {resolution}
        </p>
      )}
      {children && <div style={{ marginTop: '16px' }}>{children}</div>}
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
      <div style={{ textAlign: 'left', marginTop: '12px', fontSize: '0.85rem' }}>
        {availableCapabilities.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <strong style={{ color: '#10b981' }}>Available:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              {availableCapabilities.map(c => (
                <li key={c} style={{ color: 'var(--text-secondary)' }}>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
        {missingCapabilities.length > 0 && (
          <div>
            <strong style={{ color: '#ef4444' }}>Missing:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              {missingCapabilities.map(c => (
                <li key={c} style={{ color: 'var(--text-secondary)' }}>
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
