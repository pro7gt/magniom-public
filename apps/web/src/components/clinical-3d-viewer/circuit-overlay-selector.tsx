'use client';

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
    <div className="circuit-selector-card" aria-label="Therapeutic Circuit Overlays">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f59e0b' }}>
          Therapeutic Circuit Overlay (Section 45 & 46)
        </h4>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          Opacity: {Math.round(opacity * 100)}%
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.75rem' }}>
        <button
          type="button"
          className={`circuit-option-btn ${!activeCircuitId ? 'active' : ''}`}
          onClick={() => onSelectCircuit(undefined)}
        >
          <span style={{ fontWeight: 600 }}>None (Anatomical Surface Only)</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Off</span>
        </button>

        {overlays.map((ov) => {
          const isSelected = activeCircuitId === ov.circuitId;
          return (
            <button
              key={ov.circuitId}
              type="button"
              className={`circuit-option-btn ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectCircuit(ov.circuitId)}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{ov.shortCode}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{ov.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                  {ov.colormap}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {activeCircuitId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', minWidth: '50px' }}>Opacity</span>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => onChangeOpacity(Number.parseFloat(e.target.value))}
            style={{ width: '100%' }}
            aria-label="Circuit Map Surface Opacity"
          />
        </div>
      )}
    </div>
  );
}
