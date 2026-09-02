'use client';

import React from 'react';
import type { Counterfactual3DViewModel } from '@magniom/presentation';

interface Counterfactual3DOverlayProps {
  counterfactual?: Counterfactual3DViewModel | undefined;
}

export function Counterfactual3DOverlay({ counterfactual }: Counterfactual3DOverlayProps) {
  if (!counterfactual || !counterfactual.hasCounterfactual) {
    return (
      <div className="card" style={{ background: '#0e1726', border: '1px dashed #374151' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          Evidence-Only Reference Candidate
        </h4>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          This candidate represents a standard group evidence anchor without patient-specific connectomic displacement.
        </p>
      </div>
    );
  }

  return (
    <div className="counterfactual-card" aria-label="Evidence Counterfactual Comparison">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e2e8f0' }}>
          Evidence Counterfactual Comparison (Section 65)
        </h4>
        <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
          Δ {counterfactual.displacementDistanceMm} mm Displacement
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: '0.375rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            ○ Standard Evidence Prior (Without fMRI)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8125rem', color: '#9ca3af', marginTop: '0.2rem' }}>
            {counterfactual.baselineMniFormatted}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            BA46 / Standard Group F3
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.5rem', borderRadius: '0.375rem', borderLeft: '3px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
            ● Connectome-Refined (With fMRI)
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8125rem', color: '#f8fafc', marginTop: '0.2rem' }}>
            {counterfactual.candidateMniFormatted}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Peak Anti-Correlation Focus
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem', color: '#cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Target Family:</span>
          <strong style={{ color: '#f1f5f9' }}>{counterfactual.targetFamilyComparison === 'SAME_FAMILY' ? 'Same (Left DLPFC)' : 'Different'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Therapeutic Circuit:</span>
          <strong style={{ color: '#f1f5f9' }}>{counterfactual.therapeuticCircuitComparison === 'SAME_CIRCUIT' ? 'Same (sgACC-DLPFC)' : 'Different'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Expected Mechanistic Gain:</span>
          <strong style={{ color: '#38bdf8' }}>{counterfactual.expectedGainText}</strong>
        </div>
      </div>

      <div style={{ marginTop: '0.6rem', padding: '0.5rem', background: '#0a101f', borderRadius: '0.375rem', fontSize: '0.75rem', border: '1px solid #1e293b' }}>
        <strong style={{ color: 'var(--accent-cyan)' }}>Interpretation: </strong>
        <span style={{ color: '#cbd5e1' }}>{counterfactual.interpretationText}</span>
      </div>
    </div>
  );
}
