'use client';

import { Badge, Card, CardHeader, CardTitle, CardDescription } from '@/components/ui';

import React from 'react';
import type { Counterfactual3DViewModel } from '@magniom/presentation';

interface Counterfactual3DOverlayProps {
  counterfactual?: Counterfactual3DViewModel | undefined;
}

export function Counterfactual3DOverlay({ counterfactual }: Counterfactual3DOverlayProps) {
  if (!counterfactual || !counterfactual.hasCounterfactual) {
    return (
      <Card className="bg-surface-card border-dashed">
        <CardHeader className="p-0">
          <CardTitle as="h4" className="text-sm font-semibold text-secondary">
            Evidence-Only Reference Candidate
          </CardTitle>
          <CardDescription className="text-sm text-muted mt-1">
            This candidate represents a standard group evidence anchor without patient-specific
            connectomic displacement.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="counterfactual-card" aria-label="Evidence Counterfactual Comparison">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-bold text-primary">
          Evidence Counterfactual Comparison (Section 65)
        </h4>
        <Badge variant="neutral" className="text-xs">
          Δ {counterfactual.displacementDistanceMm} mm Displacement
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-surface-elevated p-2 rounded-md">
          <div className="text-xs text-muted uppercase">
            ○ Standard Evidence Prior (Without fMRI)
          </div>
          <div className="font-mono font-bold text-sm text-secondary mt-1">
            {counterfactual.baselineMniFormatted}
          </div>
          <div className="text-xs text-secondary mt-0.5">BA46 / Standard Group F3</div>
        </div>

        <div className="bg-surface-elevated p-2 rounded-md border-l-cyan">
          <div className="text-xs text-cyan uppercase">● Connectome-Refined (With fMRI)</div>
          <div className="font-mono font-bold text-sm text-primary mt-1">
            {counterfactual.candidateMniFormatted}
          </div>
          <div className="text-xs text-secondary mt-0.5">Peak Anti-Correlation Focus</div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-xs text-secondary">
        <div className="flex justify-between">
          <span className="text-secondary">Target Family:</span>
          <strong className="text-primary">
            {counterfactual.targetFamilyComparison === 'SAME_FAMILY'
              ? 'Same (Left DLPFC)'
              : 'Different'}
          </strong>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Therapeutic Circuit:</span>
          <strong className="text-primary">
            {counterfactual.therapeuticCircuitComparison === 'SAME_CIRCUIT'
              ? 'Same (sgACC-DLPFC)'
              : 'Different'}
          </strong>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Expected Mechanistic Gain:</span>
          <strong className="text-cyan">{counterfactual.expectedGainText}</strong>
        </div>
      </div>

      <div className="mt-2.5 p-2 bg-surface-card rounded-md text-xs border">
        <strong className="text-cyan">Interpretation: </strong>
        <span className="text-secondary">{counterfactual.interpretationText}</span>
      </div>
    </div>
  );
}
