'use client';

import React from 'react';
import type { TargetRoiViewModel, ConfidenceRegion3DViewModel } from '@magniom/presentation';

interface CoordinatePanelProps {
  target: TargetRoiViewModel;
  confidenceRegion: ConfidenceRegion3DViewModel;
}

export function CoordinatePanel({ target, confidenceRegion }: CoordinatePanelProps) {
  const isLeft = target.mniCoordinate.x < 0;

  return (
    <div className="coordinate-disclosure-panel" aria-label="Target Coordinates and Anatomical Localisation">
      <div className="coord-row-header">
        <div>
          <span className="badge badge-tier1" style={{ fontSize: '0.7rem' }}>
            {target.candidateRole}
          </span>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
            {target.targetFamily}
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="badge badge-reliability-high">
            {target.accessibilityRating} Depth ({target.depthMm} mm)
          </span>
        </div>
      </div>

      <div className="coord-grid">
        {/* Subject-Space Native Coordinate */}
        <div className="coord-card">
          <span className="coord-label">Subject-Space Centre (Native T1w)</span>
          <div className="coord-val">
            <span>x {target.subjectNativeCoordinate.x >= 0 ? `+${target.subjectNativeCoordinate.x}` : target.subjectNativeCoordinate.x}</span>
            <span>y {target.subjectNativeCoordinate.y >= 0 ? `+${target.subjectNativeCoordinate.y}` : target.subjectNativeCoordinate.y}</span>
            <span>z {target.subjectNativeCoordinate.z >= 0 ? `+${target.subjectNativeCoordinate.z}` : target.subjectNativeCoordinate.z} mm</span>
          </div>
          <span className="coord-meta">Native Coordinate System: RAS</span>
        </div>

        {/* MNI152 Standard Space Reference */}
        <div className="coord-card">
          <span className="coord-label">Standard Reference Template</span>
          <div className="coord-val">
            <span>x {target.mniCoordinate.x >= 0 ? `+${target.mniCoordinate.x}` : target.mniCoordinate.x}</span>
            <span>y {target.mniCoordinate.y >= 0 ? `+${target.mniCoordinate.y}` : target.mniCoordinate.y}</span>
            <span>z {target.mniCoordinate.z >= 0 ? `+${target.mniCoordinate.z}` : target.mniCoordinate.z} mm</span>
          </div>
          <span className="coord-meta">Template: MNI152NLin2009cAsym ({isLeft ? 'Left' : 'Right'} Hemisphere)</span>
        </div>

        {/* Anatomical Atlas Parcel */}
        <div className="coord-card">
          <span className="coord-label">Cortical Parcellation</span>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#e2e8f0', marginTop: '0.25rem' }}>
            {target.primaryHcpParcel}
          </div>
          <span className="coord-meta">DLPFC Gyral Boundary (Surface Area: {target.surfaceAreaMm2} mm²)</span>
        </div>

        {/* Spatial Reliability & Dispersion Envelope */}
        <div className="coord-card">
          <span className="coord-label">Spatial Reliability Envelope</span>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#34d399', marginTop: '0.25rem' }}>
            ± approx. {confidenceRegion.dispersionRadiusMm} mm region
          </div>
          <span className="coord-meta">Coil Spread Context: ~20 mm FWHM figure-8 footprint</span>
        </div>
      </div>

      {/* Coil Normal Orientation Vector */}
      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>
          Coil Normal Orientation Vector: [nx: {target.coilNormal.x.toFixed(2)}, ny: {target.coilNormal.y.toFixed(2)}, nz: {target.coilNormal.z.toFixed(2)}]
        </span>
        <span style={{ fontFamily: 'var(--font-mono)' }}>
          {isLeft ? 'Left Hemisphere Invariant Validated' : 'Right Hemisphere'}
        </span>
      </div>
    </div>
  );
}
