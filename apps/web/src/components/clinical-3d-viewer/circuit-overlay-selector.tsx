'use client';

import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  RangeSlider,
} from '@/components/ui';

import React from 'react';
import type { CircuitOverlayViewModel } from '@magniom/presentation';

interface CircuitOverlaySelectorProps {
  overlays: readonly CircuitOverlayViewModel[];
  activeCircuitId?: string | undefined;
  onSelectCircuit: (circuitId: string | undefined) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
}

export function CircuitOverlaySelector({
  overlays,
  activeCircuitId,
  onSelectCircuit,
  opacity,
  onChangeOpacity,
}: CircuitOverlaySelectorProps) {
  return (
    <Card className="circuit-selector-card" aria-label="Therapeutic Circuit Overlays">
      <CardHeader className="flex justify-between items-center mb-2">
        <CardTitle as="h3" className="text-sm font-semibold">
          Therapeutic Circuit Overlay (§52)
        </CardTitle>
        <span className="text-xs text-muted">
          {activeCircuitId ? 'Active Map' : 'None Selected'}
        </span>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col gap-1.5 mb-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className={`circuit-option-btn ${!activeCircuitId ? 'active' : ''}`}
            onClick={() => onSelectCircuit(undefined)}
          >
            <span className="font-semibold">None (Anatomical Surface Only)</span>
            <span className="text-xs text-muted">Off</span>
          </Button>

          {overlays.map(ov => {
            const isSelected = activeCircuitId === ov.circuitId;
            return (
              <Button
                key={ov.circuitId}
                type="button"
                variant="secondary"
                size="sm"
                className={`circuit-option-btn ${isSelected ? 'active' : ''}`}
                onClick={() => onSelectCircuit(ov.circuitId)}
              >
                <div>
                  <div className="font-semibold text-sm">{ov.shortCode}</div>
                  <div className="text-xs text-secondary">{ov.name}</div>
                </div>
                <div className="text-right">
                  <Badge variant="neutral" className="text-xs">
                    {ov.colormap}
                  </Badge>
                </div>
              </Button>
            );
          })}
        </div>

        {activeCircuitId && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-secondary min-w-12">Opacity</span>
            <RangeSlider
              min={0.1}
              max={1.0}
              step={0.05}
              value={opacity}
              onChange={e => onChangeOpacity(Number.parseFloat(e.target.value))}
              aria-label="Circuit Map Surface Opacity"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
