'use client';

import React from 'react';
import type { EnvironmentMode, ShellSafetyState } from '@magniom/presentation';

interface EnvironmentSafetyStripProps {
  mode?: EnvironmentMode;
  safetyState?: ShellSafetyState;
  failClosedReason?: string;
}

export function EnvironmentSafetyStrip({
  mode = 'CLINICAL',
  safetyState = 'NORMAL',
  failClosedReason,
}: EnvironmentSafetyStripProps) {
  // 1. Fail Closed State takes highest precedence (§25, §203, §236–237)
  if (safetyState === 'FAIL_CLOSED') {
    return (
      <aside
        className="environment-safety-strip fail-closed"
        role="alert"
        aria-label="Fail-Closed Safety Stop Notice"
        style={{
          backgroundColor: '#4a1114',
          color: '#ffdddd',
          borderBottom: '2px solid #e53e3e',
          padding: '10px 16px',
          fontWeight: 500,
        }}
      >
        <div className="safety-strip-content">
          <strong className="safety-strip-title" style={{ color: '#fc8181' }}>
            <span className="warning-icon" aria-hidden="true">
              🛑
            </span>{' '}
            SAFETY SHUTDOWN — CLINICAL TARGETING UNAVAILABLE
          </strong>
          <span className="safety-strip-text" style={{ marginLeft: '12px' }}>
            {failClosedReason ||
              'Scientific configuration verification failed or contradictory module authority detected. Consequential clinical actions locked.'}
          </span>
        </div>
      </aside>
    );
  }

  // 2. Validation Study Environment (§23, §203, §221)
  if (mode === 'VALIDATION' || safetyState === 'BLINDED_VALIDATION') {
    return (
      <aside
        className="environment-safety-strip validation"
        role="region"
        aria-label="Validation Study Safety Notice"
        style={{
          backgroundColor: '#1b3247',
          color: '#bee3f8',
          borderBottom: '2px solid #3182ce',
          padding: '8px 16px',
          fontWeight: 500,
        }}
      >
        <div className="safety-strip-content">
          <strong className="safety-strip-title" style={{ color: '#63b3ed' }}>
            <span className="warning-icon" aria-hidden="true">
              🧪
            </span>{' '}
            VALIDATION BUILD — CONTROLLED STUDY ENVIRONMENT
          </strong>
          <span className="safety-strip-text" style={{ marginLeft: '12px' }}>
            {safetyState === 'BLINDED_VALIDATION'
              ? 'Silent Prospective Study Active: Target Slate generated and sealed for protocol unblinding.'
              : 'Controlled clinical evaluation — target authority restricted strictly by approved study protocol.'}
          </span>
        </div>
      </aside>
    );
  }

  // 3. Research Mode Banner (§22, §203)
  if (mode === 'RESEARCH') {
    return (
      <aside
        className="environment-safety-strip research"
        role="alert"
        aria-label="Research Prototype Safety Notice"
        style={{
          backgroundColor: '#3d2800',
          color: '#fefcbf',
          borderBottom: '2px solid #d69e2e',
          padding: '8px 16px',
          fontWeight: 500,
        }}
      >
        <div className="safety-strip-content">
          <strong className="safety-strip-title" style={{ color: '#faf089' }}>
            <span className="warning-icon" aria-hidden="true">
              ⚠
            </span>{' '}
            RESEARCH MODE — NOT FOR CLINICAL TARGET DECISIONS
          </strong>
          <span className="safety-strip-text" style={{ marginLeft: '12px' }}>
            Experimental outputs are for hypothesis exploration only and must not be used to guide
            patient treatment. Clinical decision sign-off is disabled.
          </span>
        </div>
      </aside>
    );
  }

  // 4. Clinical Mode Banner (§21)
  return (
    <aside
      className="environment-safety-strip clinical"
      role="region"
      aria-label="Clinical Decision Support Notice"
    >
      <div className="safety-strip-content">
        <span className="clinical-cds-icon" aria-hidden="true">
          ℹ
        </span>
        <span className="safety-strip-text">
          <strong>Clinical Decision Support:</strong> Magniom generates candidate Target Slates for
          specialist TMS clinician review. Final targeting authority rests solely with the treating
          clinician.
        </span>
      </div>
    </aside>
  );
}
