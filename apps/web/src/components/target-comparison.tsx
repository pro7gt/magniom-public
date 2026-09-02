'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ComparisonTableViewModel,
  ConvergenceViewModel,
  Comparison3DViewModel,
} from '@magniom/presentation';
import { Comparison3DMatrix } from './clinical-3d-viewer';

interface TargetComparisonProps {
  caseId: string;
  tableViewModel: ComparisonTableViewModel;
  convergenceViewModel: ConvergenceViewModel;
  comparison3D?: Comparison3DViewModel | undefined;
}

type SortField = 'role' | 'evidence' | 'domain' | 'reliability';

export function TargetComparison({
  caseId,
  tableViewModel,
  convergenceViewModel,
  comparison3D,
}: TargetComparisonProps) {
  const [selectedCandId, setSelectedCandId] = useState<string>(
    comparison3D?.candidates[0]?.id || '',
  );
  const [sortField, setSortField] = useState<SortField>('role');
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedRows = [...tableViewModel.rows].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'role') {
      cmp = a.roleLabel.localeCompare(b.roleLabel);
    } else if (sortField === 'evidence') {
      cmp = a.evidenceTierLabel.localeCompare(b.evidenceTierLabel);
    } else if (sortField === 'domain') {
      cmp = a.clinicalDomain.localeCompare(b.clinicalDomain);
    } else if (sortField === 'reliability') {
      cmp = a.reliabilityLabel.localeCompare(b.reliabilityLabel);
    }
    return sortAsc ? cmp : -cmp;
  });

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.25rem',
            }}
          >
            Multi-Attribute Target Candidate Comparison
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Systematic evaluation of competing candidate hypotheses across clinical, biological, and
            reliability dimensions without forced single-score ranking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href={`/cases/${caseId}/targets`} className="btn btn-secondary">
            ← Return to Target Slate
          </Link>
          <Link
            href={`/cases/${caseId}/decision`}
            className="btn btn-primary"
            id="proceed-to-decision-btn"
          >
            Proceed to Clinical Decision →
          </Link>
        </div>
      </div>

      {/* 3D Multi-Target Spatial Matrix */}
      {comparison3D && (
        <Comparison3DMatrix
          comparison={comparison3D}
          selectedCandidateId={selectedCandId}
          onSelectCandidate={setSelectedCandId}
        />
      )}

      {/* Convergence Diagnostic Banner */}
      <div className="card" style={{ background: '#0d1527', borderColor: '#1e3a5f' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
            Spatial Convergence Diagnostic: {convergenceViewModel.headline}
          </h2>
          <span className={`badge ${convergenceViewModel.badgeClass}`}>
            {convergenceViewModel.convergenceLevel} CONVERGENCE
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>{convergenceViewModel.summary}</p>
      </div>

      {/* Comparison Table */}
      <div className="comparison-table-wrapper">
        <table className="comparison-table" aria-label="Target Candidate Comparison Matrix">
          <thead>
            <tr>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('role')}>
                Role & Subtitle {sortField === 'role' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th>Target Family & MNI</th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('evidence')}>
                Evidence Tier {sortField === 'evidence' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('domain')}>
                Clinical Domain {sortField === 'domain' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th style={{ cursor: 'pointer' }} onClick={() => handleSort('reliability')}>
                Connectome Reliability {sortField === 'reliability' ? (sortAsc ? '▲' : '▼') : ''}
              </th>
              <th>Personalisation Displacement</th>
              <th>Anatomical Accessibility</th>
              <th>Primary Clinical Uncertainty</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(row => (
              <tr key={row.candidateId}>
                <td>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{row.roleLabel}</strong>
                </td>
                <td>
                  <div>{row.targetFamily}</div>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {row.coordinateFormatted}
                  </div>
                </td>
                <td>
                  <span className={`badge ${row.evidenceTierBadgeClass}`}>
                    {row.evidenceTierLabel}
                  </span>
                </td>
                <td>{row.clinicalDomain}</td>
                <td>
                  <span className={`badge ${row.reliabilityBadgeClass}`}>
                    {row.reliabilityLabel}
                  </span>
                </td>
                <td>
                  <strong style={{ color: '#e2e8f0' }}>{row.personalisationDisplacement}</strong>
                </td>
                <td>{row.anatomicalAccessibility}</td>
                <td style={{ color: '#fca5a5', fontSize: '0.8125rem' }}>{row.mainUncertainty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Persistent Uncertainty Breakdown Grid */}
      <div className="card">
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          7-Dimensional Decision Uncertainty Matrix
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            <strong style={{ color: 'var(--accent-cyan)' }}>1. Evidence Uncertainty:</strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Level of replicated prospective randomized trial support for candidate target family.
            </p>
          </div>
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            <strong style={{ color: 'var(--accent-cyan)' }}>
              2. Phenotype Concordance Uncertainty:
            </strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Alignment between patient dominant symptom clusters and target circuit biological
              engagement.
            </p>
          </div>
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            <strong style={{ color: 'var(--accent-cyan)' }}>
              3. Connectome Reliability Uncertainty:
            </strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Test-retest stability across split-half time series and scan-to-scan motion variance.
            </p>
          </div>
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            <strong style={{ color: 'var(--accent-cyan)' }}>
              4. Spatial Geodesic Uncertainty:
            </strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Displacement distance from established group normative reference coordinates.
            </p>
          </div>
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            <strong style={{ color: 'var(--accent-cyan)' }}>
              5. Anatomical Accessibility Uncertainty:
            </strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Cortical depth and scalp-to-cortex distance affecting induced electric field focus.
            </p>
          </div>
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            <strong style={{ color: 'var(--accent-cyan)' }}>
              6. External Validity Uncertainty:
            </strong>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Degree of clinical trial population overlap with specific patient treatment resistance
              history.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
