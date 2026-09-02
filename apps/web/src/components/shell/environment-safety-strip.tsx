'use client';

import React from 'react';
import type { EnvironmentMode } from '@magniom/presentation';

interface EnvironmentSafetyStripProps {
  mode?: EnvironmentMode;
}

export function EnvironmentSafetyStrip({ mode = 'CLINICAL' }: EnvironmentSafetyStripProps) {
  if (mode === 'RESEARCH') {
    return (
      <aside
        className="environment-safety-strip research"
        role="alert"
        aria-label="Research Prototype Safety Notice"
      >
        <div className="safety-strip-content">
          <strong className="safety-strip-title">
            <span className="warning-icon" aria-hidden="true">⚠</span> RESEARCH PROTOTYPE — NOT FOR CLINICAL USE
          </strong>
          <span className="safety-strip-text">
            Experimental outputs are for hypothesis exploration only and must not be used to guide patient treatment.
          </span>
        </div>
      </aside>
    );
  }

  // Clinical Mode Safety Strip
  return (
    <aside
      className="environment-safety-strip clinical"
      role="region"
      aria-label="Clinical Decision Support Notice"
    >
      <div className="safety-strip-content">
        <span className="clinical-cds-icon" aria-hidden="true">ℹ</span>
        <span className="safety-strip-text">
          <strong>Clinical Decision Support:</strong> Magniom generates candidate Target Slates for specialist TMS clinician review. Final targeting authority rests solely with the treating clinician.
        </span>
      </div>
    </aside>
  );
}
