'use client';

import React, { useState } from 'react';
import { getCanonicalCircuitOverlays } from '@magniom/presentation';

export default function EvidenceLibraryPage() {
  const circuits = getCanonicalCircuitOverlays();
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>(circuits[0]?.circuitId || 'TC-MDD-CONVERGENT-001');

  const activeCircuit = circuits.find((c) => c.circuitId === selectedCircuitId) || circuits[0];

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier1">EVIDENCE KNOWLEDGE GRAPH</span>
          <span className="badge badge-neutral">Library Release v1.0.0</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Evidence Claims &amp; Therapeutic Circuit Library
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Curated clinical evidence base, randomized trial findings, and circuit definitions driving candidate target qualification (Section 31).
        </p>
      </div>

      {/* 2-Column Layout: Circuit Selector on Left, Evidence Dossier on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Circuits */}
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
            Therapeutic Circuits ({circuits.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {circuits.map((circ) => {
              const isSelected = circ.circuitId === selectedCircuitId;
              return (
                <div
                  key={circ.circuitId}
                  onClick={() => setSelectedCircuitId(circ.circuitId)}
                  style={{
                    background: isSelected ? '#172554' : 'var(--bg-surface-elevated)',
                    border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    padding: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: isSelected ? '#38bdf8' : 'var(--text-secondary)' }}>
                      {circ.circuitId}
                    </span>
                    <span className="badge badge-tier1">Tier 1</span>
                  </div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{circ.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Short Code: {circ.shortCode}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Circuit Dossier */}
        {activeCircuit && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-tier1">CANONICAL ANCHOR</span>
                <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>{activeCircuit.circuitId}</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {activeCircuit.name}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {activeCircuit.description || 'Convergent DLPFC anti-correlation to subgenual anterior cingulate cortex (sgACC, BA25) predictive of antidepressant efficacy.'}
              </p>
            </div>

            <div style={{ background: '#090d16', border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                Supporting Clinical Evidence &amp; Trial Consensus
              </h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <li>Fox et al. (2012) PNAS — Identification of human brain connectivity markers predicting TMS antidepressant outcome.</li>
                <li>Weigand et al. (2018) Am J Psychiatry — Prospective validation of resting-state sgACC anti-correlation in 2 distinct clinical cohorts.</li>
                <li>Cole et al. (2020) Am J Psychiatry — Stanford Neuromodulation Therapy (SNT) protocol circuit targeting.</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '0.5rem', padding: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>
                Scientific Limitations &amp; Boundary Conditions
              </h3>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <li>Requires adequate BOLD scan duration (&gt; 10 min usable time) for stable individual-level estimation.</li>
                <li>High motion or subgenual signal dropout degrades personalization reliability.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
