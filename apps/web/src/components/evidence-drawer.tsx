'use client';

import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  XIcon,
  CheckIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
} from '@/components/ui';

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
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <Badge variant="neutral" className="mb-1">
              EVIDENCE DOSSIER
            </Badge>
            <h2 className="text-xl font-bold text-primary">{viewModel.candidateName}</h2>
            <p className="text-sm text-secondary">
              {viewModel.roleTitle} • {viewModel.targetFamilyName}
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={onClose}
            className="px-2.5 py-1"
            aria-label="Close Drawer"
          >
            <XIcon size={16} />
          </Button>
        </div>

        {/* Clinical Claim & Evidence Tier */}
        <div className="bg-surface-elevated border rounded-lg p-4 flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-secondary uppercase">Clinical Claim</span>
            <Badge variant="tier1">{viewModel.evidenceTierLabel}</Badge>
          </div>
          <strong className="text-base text-cyan">{viewModel.clinicalClaimTitle}</strong>
          <p className="text-sm text-primary">{viewModel.clinicalClaimStatement}</p>
        </div>

        {/* Evidence Path Hierarchy */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-secondary mb-3">
            Traceable Evidence Provenance Path
          </h3>
          <div className="evidence-path-tree">
            {viewModel.evidencePath.map((node, idx) => (
              <div key={idx} className="evidence-path-node">
                <div className="font-semibold text-primary">{node.label}</div>
                <div className="text-xs text-secondary">{node.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Strongest Support List */}
        <Card className="bg-surface-card border-subtle">
          <CardHeader className="p-0 mb-2">
            <CardTitle as="h3" className="text-sm font-bold text-cyan flex items-center gap-1.5">
              <CheckIcon size={14} /> Strongest Scientific Support
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="list-none flex flex-col gap-2 text-sm">
              {viewModel.strongestSupport.map((item, idx) => (
                <li key={idx} className="text-secondary">
                  • {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Mandatory Conflicting / Limiting Evidence List */}
        <Card className="bg-surface-card border-rose">
          <CardHeader className="p-0 mb-2">
            <CardTitle as="h3" className="text-sm font-bold text-rose flex items-center gap-1.5">
              <AlertTriangleIcon size={14} /> Conflicting / Limiting Evidence & Population
              Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="list-none flex flex-col gap-2 text-sm">
              {viewModel.conflictingOrLimitingEvidence.map((item, idx) => (
                <li key={idx} className="text-rose">
                  • {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Key Study Sources */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wide text-secondary mb-3">
            Key Published Clinical Evidence Sources
          </h3>
          <div className="flex flex-col gap-3">
            {viewModel.studySources.map(study => (
              <div
                key={study.id}
                className="bg-surface-elevated border rounded-lg p-3 flex flex-col gap-1.5"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-sm text-cyan">{study.citation}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedStudy(study)}
                    className="px-2 py-0.5 text-xs"
                  >
                    View Study Dossier <ArrowRightIcon size={14} className="ml-1 inline" />
                  </Button>
                </div>
                <p className="text-xs text-secondary">{study.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Study Dossier Deep-Dive Modal */}
        <Modal
          isOpen={Boolean(selectedStudy)}
          onClose={() => setSelectedStudy(null)}
          title={selectedStudy ? selectedStudy.citation : ''}
          maxWidth="680px"
        >
          {selectedStudy && (
            <div>
              <Badge variant="tier1" className="mb-3">
                STUDY DOSSIER
              </Badge>

              <div className="flex flex-col gap-3.5 text-sm">
                <div>
                  <strong className="text-cyan">Clinical Question:</strong>
                  <p className="text-primary mt-0.5">{selectedStudy.clinicalQuestion}</p>
                </div>

                <div>
                  <strong className="text-cyan">Study Population & Size:</strong>
                  <p className="text-primary mt-0.5">{selectedStudy.studyPopulation}</p>
                </div>

                <div>
                  <strong className="text-cyan">Targeting & Protocol:</strong>
                  <p className="text-primary mt-0.5">
                    Method: {selectedStudy.targetingMethod} | Protocol:{' '}
                    {selectedStudy.protocolDelivered}
                  </p>
                </div>

                <div>
                  <strong className="text-cyan">Observed Clinical Outcome:</strong>
                  <p className="text-primary mt-0.5">{selectedStudy.clinicalOutcome}</p>
                </div>

                <div className="bg-primary p-2.5 rounded-md border">
                  <strong className="text-emerald">Why Magniom Uses It:</strong>
                  <p className="text-primary mt-0.5">{selectedStudy.whyMagniomUsesIt}</p>
                </div>

                <div className="bg-surface-card p-2.5 rounded-md border-rose">
                  <strong className="text-rose">What It Does Not Prove:</strong>
                  <p className="text-rose mt-0.5">{selectedStudy.whatItDoesNotProve}</p>
                </div>
              </div>

              <div className="flex justify-end mt-5">
                <Button variant="secondary" onClick={() => setSelectedStudy(null)}>
                  Close Dossier
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
