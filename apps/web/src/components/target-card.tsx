'use client';

import React, { useState } from 'react';
import { CandidateCardViewModel } from '@magniom/presentation';

interface TargetCardProps {
  candidate: CandidateCardViewModel;
  isSelected?: boolean | undefined;
  onSelect?: (() => void) | undefined;
  onOpenEvidenceDrawer: (candidateId: string) => void;
}

export function TargetCard({
  candidate,
  isSelected,
  onSelect,
  onOpenEvidenceDrawer,
}: TargetCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      className={`candidate-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      aria-label={`Target Candidate ${candidate.roleTitle}`}
    >
      <div className="card-header-row">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span
              className={`badge ${candidate.isPrimary ? 'badge-role-primary' : 'badge-role-additional'}`}
            >
              {candidate.roleTitle}
            </span>
            <span
              style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}
            >
              {candidate.roleSubtitle}
            </span>
          </div>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '0.25rem',
            }}
          >
            {candidate.targetName}
          </h3>
        </div>

        <span className={`badge ${candidate.evidenceTierBadgeClass}`}>
          {candidate.evidenceTierLabel}
        </span>
      </div>

      {/* Coordinate & Reliability Row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(9, 13, 22, 0.6)',
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>MNI:</span>
          <strong
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-cyan)',
              fontSize: '0.875rem',
            }}
          >
            {candidate.coordinateFormatted}
          </strong>
        </div>

        <span className={`badge ${candidate.reliabilityBadge.badgeClass}`}>
          {candidate.reliabilityBadge.label}
        </span>
      </div>

      <p style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>{candidate.clinicalPurpose}</p>

      {/* Counterfactual summary preview */}
      {candidate.whatMriChanged.hasPersonalisation && candidate.counterfactualTarget && (
        <div className="counterfactual-box">
          <div
            style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Evidence-Only Baseline:</span>
            <strong style={{ fontFamily: 'var(--font-mono)' }}>
              {candidate.counterfactualTarget.coordinateFormatted}
            </strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#38bdf8' }}>
            <span>Personalisation Displacement:</span>
            <strong>{candidate.whatMriChanged.distanceMovedMm} mm refinement</strong>
          </div>
        </div>
      )}

      {/* Mandatory Counterargument Box */}
      <div className="why-wrong-box">
        <div className="why-wrong-title">
          <span>⚠</span>
          <span>Why this target may be wrong:</span>
        </div>
        <ul
          style={{
            listStyle: 'none',
            paddingLeft: '0.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}
        >
          {candidate.whyThisMayBeWrong.slice(0, 2).map((item, idx) => (
            <li key={idx} style={{ color: '#fca5a5' }}>
              • {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '0.75rem',
            fontSize: '0.8125rem',
          }}
        >
          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>Scientific Method:</strong>
            <p style={{ color: 'var(--text-primary)' }}>{candidate.method.replace(/_/g, ' ')}</p>
          </div>

          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>Anatomical Accessibility:</strong>
            <p style={{ color: 'var(--text-primary)' }}>
              Depth: {candidate.anatomicalAccessibility.depthMm} mm | Distance to skull:{' '}
              {candidate.anatomicalAccessibility.skullDistanceMm} mm (
              {candidate.anatomicalAccessibility.rating})
            </p>
          </div>

          <div>
            <strong style={{ color: 'var(--text-secondary)' }}>Personalisation Rationale:</strong>
            <p style={{ color: 'var(--text-primary)' }}>
              {candidate.whatMriChanged.justification || 'Evidence anchor group coordinate.'}
            </p>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.5rem',
          marginTop: '0.25rem',
        }}
      >
        <button
          onClick={e => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="btn btn-secondary"
          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
        >
          {isExpanded ? 'Less details ▲' : 'Inspect details ▼'}
        </button>

        <button
          onClick={e => {
            e.stopPropagation();
            onOpenEvidenceDrawer(candidate.id);
          }}
          className="btn btn-secondary"
          style={{
            padding: '0.25rem 0.625rem',
            fontSize: '0.75rem',
            color: 'var(--accent-cyan)',
            borderColor: 'rgba(56, 189, 248, 0.4)',
          }}
          id={`open-evidence-drawer-${candidate.id}`}
        >
          View Evidence Drawer →
        </button>
      </div>
    </article>
  );
}
