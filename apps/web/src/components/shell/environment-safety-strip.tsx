'use client';

import React from 'react';
import type { EnvironmentMode, ShellSafetyState } from '@magniom/presentation';
import { AlertOctagonIcon, FlaskConicalIcon, AlertTriangleIcon, InfoIcon } from '@/components/ui';

interface EnvironmentSafetyStripProps {
  mode?: EnvironmentMode;
  safetyState?: ShellSafetyState;
  failClosedReason?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function EnvironmentSafetyStrip({
  mode = 'CLINICAL',
  safetyState = 'NORMAL',
  failClosedReason,
  title,
  description,
  className = '',
}: EnvironmentSafetyStripProps) {
  // 1. Fail Closed State takes highest precedence (§25, §203, §236–237)
  if (safetyState === 'FAIL_CLOSED') {
    return (
      <aside
        className={`environment-safety-strip fail-closed px-4 py-2.5 font-medium ${className}`.trim()}
        role="alert"
        aria-label="Fail-Closed Safety Stop Notice"
      >
        <div className="safety-strip-content">
          <strong className="safety-strip-title text-rose inline-flex items-center gap-1.5">
            <span className="warning-icon inline-flex items-center" aria-hidden="true">
              <AlertOctagonIcon size={16} />
            </span>{' '}
            {title || 'SAFETY SHUTDOWN — CLINICAL TARGETING UNAVAILABLE'}
          </strong>
          <span className="safety-strip-text ml-3">
            {description ||
              failClosedReason ||
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
        className={`environment-safety-strip validation px-4 py-2 font-medium ${className}`.trim()}
        role="region"
        aria-label="Validation Study Safety Notice"
      >
        <div className="safety-strip-content">
          <strong className="safety-strip-title text-cyan inline-flex items-center gap-1.5">
            <span className="warning-icon inline-flex items-center" aria-hidden="true">
              <FlaskConicalIcon size={16} />
            </span>{' '}
            {title || 'VALIDATION BUILD — CONTROLLED STUDY ENVIRONMENT'}
          </strong>
          <span className="safety-strip-text ml-3">
            {description ||
              (safetyState === 'BLINDED_VALIDATION'
                ? 'Silent Prospective Study Active: Target Slate generated and sealed for protocol unblinding.'
                : 'Controlled clinical evaluation — target authority restricted strictly by approved study protocol.')}
          </span>
        </div>
      </aside>
    );
  }

  // 3. Research Mode Banner (§22, §203)
  if (mode === 'RESEARCH') {
    return (
      <aside
        className={`environment-safety-strip research px-4 py-2 font-medium ${className}`.trim()}
        role="alert"
        aria-label="Research Prototype Safety Notice"
      >
        <div className="safety-strip-content">
          <strong className="safety-strip-title text-amber inline-flex items-center gap-1.5">
            <span className="warning-icon inline-flex items-center" aria-hidden="true">
              <AlertTriangleIcon size={16} />
            </span>{' '}
            {title || 'RESEARCH MODE — NOT FOR CLINICAL TARGET DECISIONS'}
          </strong>
          <span className="safety-strip-text ml-3">
            {description ||
              'Experimental outputs are for hypothesis exploration only and must not be used to guide patient treatment. Clinical decision sign-off is disabled.'}
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
        <span className="clinical-cds-icon inline-flex items-center" aria-hidden="true">
          <InfoIcon size={16} />
        </span>
        <span className="safety-strip-text">
          <strong>Clinical Decision Support:</strong> Magniom generates candidate Target Slates for
          specialist TMS clinician review. Final targeting authority rests solely with the treating
          psychiatrist or neurologist (§21).
        </span>
      </div>
    </aside>
  );
}
