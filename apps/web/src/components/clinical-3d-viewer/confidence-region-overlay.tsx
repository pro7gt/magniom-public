'use client';

import React from 'react';
import type { ConfidenceRegion3DViewModel } from '@magniom/presentation';

interface ConfidenceRegionOverlayProps {
  confidenceRegion: ConfidenceRegion3DViewModel;
}

export function ConfidenceRegionOverlay({ confidenceRegion }: ConfidenceRegionOverlayProps) {
  return (
    <div className="confidence-region-card" aria-label="Spatial Confidence & Reliability Region">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#34d399' }}>
          Spatial Reliability Region (Section 47 & 115)
        </h4>
        <span className={`badge ${confidenceRegion.badgeClass}`} style={{ fontSize: '0.7rem' }}>
          {confidenceRegion.reliabilityLevel} Stability
        </span>
      </div>

      <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
        {confidenceRegion.description}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: '0.375rem', fontSize: '0.75rem' }}>
        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Dispersion Radius:</span>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginTop: '0.1rem' }}>
            ± {confidenceRegion.dispersionRadiusMm} mm
          </div>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Surface Area:</span>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginTop: '0.1rem' }}>
            ~ {confidenceRegion.surfaceAreaMm2} mm²
          </div>
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)' }}>Coil Scale Ratio:</span>
          <div style={{ fontWeight: 700, color: '#38bdf8', marginTop: '0.1rem' }}>
            {((confidenceRegion.dispersionRadiusMm * 2) / 20).toFixed(2)}x Coil FWHM
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <strong>Safeguard Note: </strong>
        {confidenceRegion.coilContextDescription}
      </div>
    </div>
  );
}
