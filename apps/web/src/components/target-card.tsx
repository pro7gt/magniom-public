'use client';

import {
  Button,
  Badge,
  AlertTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowRightIcon,
} from '@/components/ui';

import React, { useState } from 'react';
import { CandidateCardViewModel } from '@magniom/presentation';
import { TargetGeometryRenderer } from './target-geometry-renderers';

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
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={`${candidate.isPrimary ? 'badge-role-primary' : 'badge-role-additional'}`}
            >
              {candidate.roleTitle}
            </Badge>
            <span className="text-sm text-secondary font-medium">{candidate.roleSubtitle}</span>
          </div>
          <h3 className="text-base font-bold text-primary mt-1">{candidate.targetName}</h3>
        </div>

        <Badge className={`${candidate.evidenceTierBadgeClass}`}>
          {candidate.evidenceTierLabel}
        </Badge>
      </div>

      {/* Coordinate & Reliability Row */}
      <div className="candidate-coordinate-row">
        <div className="flex items-center gap-2">
          <span className="text-xs text-secondary">MNI:</span>
          <strong className="font-mono text-cyan text-sm">{candidate.coordinateFormatted}</strong>
        </div>

        <Badge className={`${candidate.reliabilityBadge.badgeClass}`}>
          {candidate.reliabilityBadge.label}
        </Badge>
      </div>

      <p className="text-sm text-secondary">{candidate.clinicalPurpose}</p>

      {/* Counterfactual summary preview */}
      {candidate.whatMriChanged.hasPersonalisation && candidate.counterfactualTarget && (
        <div className="counterfactual-box">
          <div className="flex justify-between mb-1">
            <span className="text-secondary">Evidence-Only Baseline:</span>
            <strong className="font-mono">
              {candidate.counterfactualTarget.coordinateFormatted}
            </strong>
          </div>
          <div className="flex justify-between text-cyan">
            <span>Personalisation Displacement:</span>
            <strong>{candidate.whatMriChanged.distanceMovedMm} mm refinement</strong>
          </div>
        </div>
      )}

      {/* Mandatory Counterargument Box */}
      <div className="why-wrong-box">
        <div className="why-wrong-title">
          <AlertTriangleIcon size={14} />
          <span>Why this target may be wrong:</span>
        </div>
        <ul className="why-wrong-list">
          {candidate.whyThisMayBeWrong.slice(0, 2).map((item, idx) => (
            <li key={idx} className="text-rose">
              • {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Expanded Details Section */}
      {isExpanded && (
        <div className="candidate-expanded-section">
          <div>
            <strong className="text-secondary">Scientific Method:</strong>
            <p className="text-primary">{candidate.method.replace(/_/g, ' ')}</p>
          </div>

          <div>
            <strong className="text-secondary">Anatomical Accessibility:</strong>
            <p className="text-primary">
              Depth: {candidate.anatomicalAccessibility.depthMm} mm | Distance to skull:{' '}
              {candidate.anatomicalAccessibility.skullDistanceMm} mm (
              {candidate.anatomicalAccessibility.rating})
            </p>
          </div>

          <div>
            <strong className="text-secondary">Personalisation Rationale:</strong>
            <p className="text-primary">
              {candidate.whatMriChanged.justification || 'Evidence anchor group coordinate.'}
            </p>
          </div>

          {/* Target Geometry Presentation (§112–117) */}
          <div className="mt-1">
            <TargetGeometryRenderer
              geometryType={candidate.geometryType ?? 'point'}
              coordinateFormatted={candidate.coordinateFormatted}
              depthMm={candidate.anatomicalAccessibility.depthMm}
              accessibilityRating={candidate.anatomicalAccessibility.rating}
            />
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="candidate-action-footer">
        <Button
          variant="secondary"
          size="sm"
          onClick={e => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="btn-inspect-details"
        >
          {isExpanded ? (
            <>
              Less details <ChevronUpIcon size={12} />
            </>
          ) : (
            <>
              Inspect details <ChevronDownIcon size={12} />
            </>
          )}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={e => {
            e.stopPropagation();
            onOpenEvidenceDrawer(candidate.id);
          }}
          className="btn-drawer-trigger"
          id={`open-evidence-drawer-${candidate.id}`}
        >
          View Evidence Drawer <ArrowRightIcon size={14} className="ml-1 inline" />
        </Button>
      </div>
    </article>
  );
}
