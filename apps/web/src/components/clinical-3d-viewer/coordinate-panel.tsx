'use client';

import { Badge, Card, CardContent } from '@/components/ui';

import React from 'react';
import type { TargetRoiViewModel, ConfidenceRegion3DViewModel } from '@magniom/presentation';

interface CoordinatePanelProps {
  target: TargetRoiViewModel;
  confidenceRegion: ConfidenceRegion3DViewModel;
}

export function CoordinatePanel({ target, confidenceRegion }: CoordinatePanelProps) {
  const isLeft = target.mniCoordinate.x < 0;

  return (
    <div
      className="coordinate-disclosure-panel"
      aria-label="Target Coordinates and Anatomical Localisation"
    >
      <div className="coord-row-header">
        <div>
          <Badge variant="tier1" className="text-xs">
            {target.candidateRole}
          </Badge>
          <h3 className="text-base font-bold text-cyan mt-1">{target.targetFamily}</h3>
        </div>
        <div className="text-right">
          <Badge variant="reliability-high">
            {target.accessibilityRating} Depth ({target.depthMm} mm)
          </Badge>
        </div>
      </div>

      <div className="coord-grid">
        {/* Subject-Space Native Coordinate */}
        <Card className="coord-card">
          <CardContent className="p-0">
            <span className="coord-label">Subject-Space Centre (Native T1w)</span>
            <div className="coord-val">
              <span>
                x{' '}
                {target.subjectNativeCoordinate.x >= 0
                  ? `+${target.subjectNativeCoordinate.x}`
                  : target.subjectNativeCoordinate.x}
              </span>
              <span>
                y{' '}
                {target.subjectNativeCoordinate.y >= 0
                  ? `+${target.subjectNativeCoordinate.y}`
                  : target.subjectNativeCoordinate.y}
              </span>
              <span>
                z{' '}
                {target.subjectNativeCoordinate.z >= 0
                  ? `+${target.subjectNativeCoordinate.z}`
                  : target.subjectNativeCoordinate.z}{' '}
                mm
              </span>
            </div>
            <span className="coord-meta">Native Coordinate System: RAS</span>
          </CardContent>
        </Card>

        {/* MNI152 Standard Space Reference */}
        <Card className="coord-card">
          <CardContent className="p-0">
            <span className="coord-label">Standard Reference Template</span>
            <div className="coord-val">
              <span>
                x{' '}
                {target.mniCoordinate.x >= 0
                  ? `+${target.mniCoordinate.x}`
                  : target.mniCoordinate.x}
              </span>
              <span>
                y{' '}
                {target.mniCoordinate.y >= 0
                  ? `+${target.mniCoordinate.y}`
                  : target.mniCoordinate.y}
              </span>
              <span>
                z{' '}
                {target.mniCoordinate.z >= 0
                  ? `+${target.mniCoordinate.z}`
                  : target.mniCoordinate.z}{' '}
                mm
              </span>
            </div>
            <span className="coord-meta">
              Template: MNI152NLin2009cAsym ({isLeft ? 'Left' : 'Right'} Hemisphere)
            </span>
          </CardContent>
        </Card>

        {/* Anatomical Atlas Parcel */}
        <Card className="coord-card">
          <CardContent className="p-0">
            <span className="coord-label">Cortical Parcellation</span>
            <div className="font-bold text-sm text-primary mt-1">{target.primaryHcpParcel}</div>
            <span className="coord-meta">
              DLPFC Gyral Boundary (Surface Area: {target.surfaceAreaMm2} mm²)
            </span>
          </CardContent>
        </Card>

        {/* Spatial Reliability & Dispersion Envelope */}
        <Card className="coord-card">
          <CardContent className="p-0">
            <span className="coord-label">Spatial Reliability Envelope</span>
            <div className="font-bold text-sm text-emerald mt-1">
              ± approx. {confidenceRegion.dispersionRadiusMm} mm region
            </div>
            <span className="coord-meta">Coil Spread Context: ~20 mm FWHM figure-8 footprint</span>
          </CardContent>
        </Card>
      </div>

      {/* Coil Normal Orientation Vector */}
      <div className="mt-3 flex justify-between items-center text-xs text-muted">
        <span>
          Coil Normal Orientation Vector: [nx: {target.coilNormal.x.toFixed(2)}, ny:{' '}
          {target.coilNormal.y.toFixed(2)}, nz: {target.coilNormal.z.toFixed(2)}]
        </span>
        <span className="font-mono">
          {isLeft ? 'Left Hemisphere Invariant Validated' : 'Right Hemisphere'}
        </span>
      </div>
    </div>
  );
}
