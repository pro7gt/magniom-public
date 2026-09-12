'use client';

import { Badge, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui';

import React from 'react';
import type { ConfidenceRegion3DViewModel } from '@magniom/presentation';

interface ConfidenceRegionOverlayProps {
  confidenceRegion: ConfidenceRegion3DViewModel;
}

export function ConfidenceRegionOverlay({ confidenceRegion }: ConfidenceRegionOverlayProps) {
  return (
    <Card className="confidence-region-card" aria-label="Spatial Confidence & Reliability Region">
      <CardHeader className="p-0 mb-2">
        <div className="flex justify-between items-center mb-1">
          <CardTitle as="h4" className="text-sm font-bold text-emerald">
            Spatial Reliability Region (Section 47 & 115)
          </CardTitle>
          <Badge className={`${confidenceRegion.badgeClass} text-xs`}>
            {confidenceRegion.reliabilityLevel} Stability
          </Badge>
        </div>
        <CardDescription className="text-sm text-secondary">
          {confidenceRegion.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-2 bg-surface-elevated p-2 rounded-md text-xs">
          <div>
            <span className="text-secondary">Dispersion Radius:</span>
            <div className="font-bold text-primary mt-0.5">
              ± {confidenceRegion.dispersionRadiusMm} mm
            </div>
          </div>

          <div>
            <span className="text-secondary">Surface Area:</span>
            <div className="font-bold text-primary mt-0.5">
              ~ {confidenceRegion.surfaceAreaMm2} mm²
            </div>
          </div>

          <div>
            <span className="text-secondary">Coil Scale Ratio:</span>
            <div className="font-bold text-cyan mt-0.5">
              {((confidenceRegion.dispersionRadiusMm * 2) / 20).toFixed(2)}x Coil FWHM
            </div>
          </div>
        </div>

        <div className="mt-2 text-xs text-muted">
          <strong>Safeguard Note: </strong>
          {confidenceRegion.coilContextDescription}
        </div>
      </CardContent>
    </Card>
  );
}
