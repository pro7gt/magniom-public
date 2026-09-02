'use client';

import React, { useState } from 'react';
import { EvidenceDrawerViewModel, StudySourceViewModel } from '@magniom/presentation';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  viewModel: EvidenceDrawerViewModel | null;
}

export function EvidenceDrawer({ isOpen, onClose, viewModel }: EvidenceDrawerProps) {
  const [selectedStudy, setSelectedStudy] = useState<StudySourceViewModel | null>(null);

  if (!isOpen || !viewModel) return null;

  return (
    <div
      className="drawer-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Evidence Drawer"
    >
      <div className="drawer-panel" onClick={e => e.stopPropagation()}>
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '1rem',
          }}
        >
          <div>
            <span className="badge badge-neutral" style={{ marginBottom: '0.25rem' }}>
              EVIDENCE DOSSIER
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {viewModel.candidateName}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {viewModel.roleTitle} • {viewModel.targetFamilyName}
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.625rem' }}
            aria-label="Close Drawer"
          >
            ✕
          </button>
        </div>

        {/* Clinical Claim & Evidence Tier */}
        <div
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
              }}
            >
              Clinical Claim
            </span>
            <span className="badge badge-tier1">{viewModel.evidenceTierLabel}</span>
          </div>
          <strong style={{ fontSize: '0.9375rem', color: 'var(--accent-cyan)' }}>
            {viewModel.clinicalClaimTitle}
          </strong>
          <p style={{ fontSize: '0.8125rem', color: '#e2e8f0' }}>
            {viewModel.clinicalClaimStatement}
          </p>
        </div>

        {/* Evidence Path Hierarchy */}
        <div>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem',
            }}
          >
            Traceable Evidence Provenance Path
          </h3>
          <div className="evidence-path-tree">
            {viewModel.evidencePath.map((node, idx) => (
              <div key={idx} className="evidence-path-node">
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{node.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {node.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strongest Support List */}
        <div className="card" style={{ background: '#0b1622', borderColor: '#1e3a5f' }}>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#38bdf8',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <span>✓</span> Strongest Scientific Support
          </h3>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            {viewModel.strongestSupport.map((item, idx) => (
              <li key={idx} style={{ color: '#cbd5e1' }}>
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Mandatory Conflicting / Limiting Evidence List */}
        <div className="card" style={{ background: '#1c1014', borderColor: '#5c1d24' }}>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: '#f87171',
              marginBottom: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <span>⚠</span> Conflicting / Limiting Evidence & Population Boundaries
          </h3>
          <ul
            style={{
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            {viewModel.conflictingOrLimitingEvidence.map((item, idx) => (
              <li key={idx} style={{ color: '#fca5a5' }}>
                • {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Key Study Sources */}
        <div>
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem',
            }}
          >
            Key Published Clinical Evidence Sources
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {viewModel.studySources.map(study => (
              <div
                key={study.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.375rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--accent-cyan)' }}
                  >
                    {study.citation}
                  </span>
                  <button
                    onClick={() => setSelectedStudy(study)}
                    className="btn btn-secondary"
                    style={{ padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}
                  >
                    View Study Dossier →
                  </button>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>{study.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Study Source Modal */}
        {selectedStudy && (
          <div className="modal-backdrop" onClick={() => setSelectedStudy(null)}>
            <div
              className="modal-dialog"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '680px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '0.75rem',
                }}
              >
                <div>
                  <span className="badge badge-tier1" style={{ marginBottom: '0.25rem' }}>
                    STUDY DOSSIER
                  </span>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    {selectedStudy.citation}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedStudy(null)}
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.5rem' }}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.875rem',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <strong style={{ color: 'var(--accent-cyan)' }}>Clinical Question:</strong>
                  <p style={{ color: '#e2e8f0', marginTop: '0.15rem' }}>
                    {selectedStudy.clinicalQuestion}
                  </p>
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-cyan)' }}>Study Population & Size:</strong>
                  <p style={{ color: '#e2e8f0', marginTop: '0.15rem' }}>
                    {selectedStudy.studyPopulation}
                  </p>
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-cyan)' }}>Targeting & Protocol:</strong>
                  <p style={{ color: '#e2e8f0', marginTop: '0.15rem' }}>
                    Method: {selectedStudy.targetingMethod} | Protocol:{' '}
                    {selectedStudy.protocolDelivered}
                  </p>
                </div>

                <div>
                  <strong style={{ color: 'var(--accent-cyan)' }}>
                    Observed Clinical Outcome:
                  </strong>
                  <p style={{ color: '#e2e8f0', marginTop: '0.15rem' }}>
                    {selectedStudy.clinicalOutcome}
                  </p>
                </div>

                <div
                  style={{
                    background: '#090d16',
                    padding: '0.625rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #1e293b',
                  }}
                >
                  <strong style={{ color: '#34d399' }}>Why Magniom Uses It:</strong>
                  <p style={{ color: '#e2e8f0', marginTop: '0.15rem' }}>
                    {selectedStudy.whyMagniomUsesIt}
                  </p>
                </div>

                <div
                  style={{
                    background: '#1c1014',
                    padding: '0.625rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #5c1d24',
                  }}
                >
                  <strong style={{ color: '#f87171' }}>What It Does Not Prove:</strong>
                  <p style={{ color: '#fca5a5', marginTop: '0.15rem' }}>
                    {selectedStudy.whatItDoesNotProve}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button onClick={() => setSelectedStudy(null)} className="btn btn-secondary">
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
