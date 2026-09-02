'use client';

import React from 'react';
import type { Comparison3DViewModel } from '@magniom/presentation';

interface Comparison3DMatrixProps {
  comparison: Comparison3DViewModel;
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
}

export function Comparison3DMatrix({
  comparison,
  selectedCandidateId,
  onSelectCandidate,
}: Comparison3DMatrixProps) {
  return (
    <div
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      aria-label="3D Multi-Target Spatial Matrix"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            3D Multi-Target Spatial Localization & Redundancy Matrix
          </h3>
          <p
            style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}
          >
            Systematic spatial separation and redundancy assessment across candidate hypotheses.
          </p>
        </div>

        {comparison.redundantPairsCount > 0 ? (
          <span className="badge badge-warning" style={{ fontSize: '0.75rem' }}>
            ⚠ {comparison.redundantPairsCount} Redundant Pair(s) Detected (&lt; 15 mm)
          </span>
        ) : (
          <span className="badge badge-tier1" style={{ fontSize: '0.75rem' }}>
            ✓ All Targets Distinct (&gt; 15 mm)
          </span>
        )}
      </div>

      {/* Candidate Selector Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {comparison.candidates.map(c => {
          const isSelected = c.id === selectedCandidateId;
          return (
            <button
              key={c.id}
              type="button"
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
              onClick={() => onSelectCandidate(c.id)}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: c.markerColor,
                }}
              />
              <strong>{c.roleTitle}:</strong>
              <span>{c.mniFormatted}</span>
            </button>
          );
        })}
      </div>

      {/* Pairwise Distance Matrix Table */}
      <div className="table-responsive">
        <table
          className="table table-sm"
          style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '0.4rem' }}>Candidate Pair</th>
              <th style={{ padding: '0.4rem' }}>Spatial Distance</th>
              <th style={{ padding: '0.4rem' }}>Target Family</th>
              <th style={{ padding: '0.4rem' }}>Redundancy Classification</th>
            </tr>
          </thead>
          <tbody>
            {comparison.pairwiseDistances.map((pair, idx) => (
              <tr
                key={idx}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  background: pair.isRedundant ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                }}
              >
                <td style={{ padding: '0.4rem', fontWeight: 600, color: '#f1f5f9' }}>
                  {pair.candidateAName} <span style={{ color: 'var(--text-muted)' }}>↔</span>{' '}
                  {pair.candidateBName}
                </td>
                <td
                  style={{
                    padding: '0.4rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    color: pair.distanceMm < 15 ? '#f59e0b' : '#38bdf8',
                  }}
                >
                  {pair.distanceMm.toFixed(1)} mm
                </td>
                <td style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>
                  {pair.isRedundant ? 'Identical Target Family' : 'Distinct / Alternative Family'}
                </td>
                <td style={{ padding: '0.4rem' }}>
                  {pair.isRedundant ? (
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                      Redundant (&lt; 15 mm)
                    </span>
                  ) : (
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      Spatially Differentiated
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
