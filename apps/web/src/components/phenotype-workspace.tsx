'use client';

import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Breadcrumbs,
  Modal,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  PageHeader,
  Alert,
  Select,
  Textarea,
  FormGroup,
  FormLabel,
} from '@/components/ui';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PhenotypeViewModel, PhenotypeDomainRowViewModel } from '@magniom/presentation';

interface PhenotypeWorkspaceProps {
  caseId?: string;
  caseCode?: string;
  initialViewModel: PhenotypeViewModel;
  onApprove: (clinicianNotes: string) => void;
}

export function PhenotypeWorkspace({
  caseId,
  caseCode,
  initialViewModel,
  onApprove,
}: PhenotypeWorkspaceProps) {
  const router = useRouter();
  const [domains, setDomains] = useState<PhenotypeDomainRowViewModel[]>([
    ...initialViewModel.domains,
  ]);
  const [explainerDomain, setExplainerDomain] = useState<PhenotypeDomainRowViewModel | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [clinicianNotes, setClinicianNotes] = useState(initialViewModel.clinicianNotes || '');
  const [isApproving, setIsApproving] = useState(false);

  const handleMovePriority = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= domains.length) return;

    const newDomains = [...domains];
    const src = newDomains[index];
    const dst = newDomains[targetIndex];
    if (!src || !dst) return;

    newDomains[index] = dst;
    newDomains[targetIndex] = src;

    // Re-index priority numbers
    const updated = newDomains.map((d, i) => ({ ...d, clinicalPriority: i + 1 }));
    setDomains(updated);
  };

  const handleImportanceChange = (index: number, importance: 'High' | 'Moderate' | 'Low') => {
    const item = domains[index];
    if (!item) return;
    const newDomains = [...domains];
    newDomains[index] = { ...item, clinicalImportance: importance };
    setDomains(newDomains);
  };

  const handleExecuteApproval = () => {
    setIsApproving(true);
    try {
      onApprove(clinicianNotes);
      setShowApprovalDialog(false);
      router.push(`/cases/${initialViewModel.caseId}/targets`);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Phenotype Breadcrumb"
        items={[
          {
            label: caseCode || caseId || initialViewModel.caseId,
            href: `/cases/${caseId || initialViewModel.caseId}`,
          },
          { label: 'Clinical Phenotype', current: true },
        ]}
      />
      <PageHeader
        title="Clinical Phenotype Workspace"
        subtitle="Formulate and confirm patient symptom burden, treatment priorities, and circuit mappability before target synthesis."
        actions={
          <div className="flex items-center gap-3">
            {initialViewModel.isApproved ? (
              <div className="flex items-center gap-2">
                <Badge variant="tier1">PHENOTYPE SEALED & APPROVED</Badge>
                <span className="text-xs font-mono text-muted">
                  {initialViewModel.snapshotHash?.slice(0, 16)}...
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowApprovalDialog(true)}
                  className="text-xs px-2.5 py-1"
                  title="Re-seal and update clinical phenotype snapshot"
                  id="reapprove-phenotype-btn"
                >
                  Re-seal Formulation
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                onClick={() => setShowApprovalDialog(true)}
                id="approve-phenotype-btn"
              >
                Approve Phenotype for Target Analysis{' '}
                <ArrowRightIcon size={14} className="ml-1 inline" />
              </Button>
            )}
          </div>
        }
      />

      {/* Safety Callout: Clinical Importance != Targetability */}
      <Alert variant="info" title="Fundamental Principle (MAG-SAFE-001):">
        Clinically important does not necessarily mean independently targetable. Domains with direct
        circuit mapping inform specific candidate hypotheses; non-mappable domains inform overall
        prognosis and priority weighting.
      </Alert>

      <div className="phenotype-layout-grid">
        {/* Left: Symptom Domain Severity & Circuit Mappings */}
        <Card>
          <CardHeader className="flex justify-between items-center mb-4 border-b pb-3">
            <CardTitle as="h2" className="text-lg font-semibold">
              Symptom Domain Formulation
            </CardTitle>
            <span className="text-sm text-secondary">
              Mappable to Circuits:{' '}
              <strong>
                {initialViewModel.targetMappableCount} / {initialViewModel.totalDomainCount}
              </strong>
            </span>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-3">
              {domains.map((domain, index) => {
                const isDirect = domain.circuitMappingStatus === 'Direct';
                const isPartial = domain.circuitMappingStatus === 'Partial';

                return (
                  <div
                    key={domain.id}
                    className="bg-surface-elevated border rounded-lg p-3.5 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{domain.domainName}</span>
                        <Badge
                          className={
                            domain.severityLabel === 'Severe' || domain.severityLabel === 'Extreme'
                              ? 'badge-tier3'
                              : 'badge-neutral'
                          }
                        >
                          {domain.severityLabel} (Score {domain.score}/10)
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            isDirect ? 'badge-tier1' : isPartial ? 'badge-tierexp' : 'badge-neutral'
                          }
                        >
                          Circuit Mapping: {domain.circuitMappingStatus}
                        </Badge>
                        {isDirect && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setExplainerDomain(domain)}
                            className="px-2 py-0.5 text-xs"
                          >
                            Why Mappable?
                          </Button>
                        )}
                      </div>
                    </div>

                    {domain.mappedCircuitName && (
                      <div className="text-sm text-secondary flex gap-2">
                        <span>Target Circuit:</span>
                        <strong className="text-primary">{domain.mappedCircuitName}</strong>
                        <span>({domain.evidenceTierBadge})</span>
                      </div>
                    )}

                    {/* Priority & Reordering Row */}
                    <div className="flex justify-between items-center border-t-subtle pt-2 mt-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span>
                          Priority <strong>#{domain.clinicalPriority}</strong>
                        </span>
                        <span>•</span>
                        <span>Importance:</span>
                        <Select
                          value={domain.clinicalImportance}
                          onChange={e => handleImportanceChange(index, e.target.value as any)}
                          className="px-1.5 py-0.5 text-xs w-auto"
                        >
                          <option value="High">High</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Low">Low</option>
                        </Select>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMovePriority(index, 'up')}
                          disabled={index === 0}
                          aria-label={`Move ${domain.domainName} up`}
                          className="p-1 inline-flex items-center"
                        >
                          <ChevronUpIcon size={12} />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMovePriority(index, 'down')}
                          disabled={index === domains.length - 1}
                          aria-label={`Move ${domain.domainName} down`}
                          className="p-1 inline-flex items-center"
                        >
                          <ChevronDownIcon size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Patient Goals & Clinician Formulation Notes */}
        <div className="page-container-col">
          <Card>
            <CardHeader>
              <CardTitle as="h2" className="text-lg font-semibold mb-3">
                Patient Functional Goals
              </CardTitle>
              <CardDescription className="mb-3">
                Goals influence clinical priority ordering but do not map directly to cortical
                coordinate systems.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-none flex flex-col gap-2 text-sm">
                {initialViewModel.patientGoals.map((goal, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-cyan">•</span>
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle as="h2" className="text-lg font-semibold mb-3">
                Clinical Formulation Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormGroup>
                <FormLabel htmlFor="clinician-notes" className="text-sm text-secondary">
                  Document contextual clinical formulation and justification:
                </FormLabel>
                <Textarea
                  id="clinician-notes"
                  value={clinicianNotes}
                  onChange={e => setClinicianNotes(e.target.value)}
                  placeholder="Enter clinical rationale, safety observations, and patient presentation context..."
                />
              </FormGroup>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Phenotype Evidence Explainer Modal */}
      <Modal
        isOpen={Boolean(explainerDomain)}
        onClose={() => setExplainerDomain(null)}
        title={explainerDomain ? `Why is ${explainerDomain.domainName} Target-Mappable?` : ''}
        maxWidth="560px"
      >
        {explainerDomain && (
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <span className="text-secondary text-xs uppercase tracking-wide">
                Evidence Status
              </span>
              <p className="font-semibold text-cyan">{explainerDomain.evidenceTierBadge}</p>
            </div>

            <div>
              <strong className="text-emerald">What this means:</strong>
              <p className="text-primary mt-1">
                A symptom-specific therapeutic circuit ({explainerDomain.mappedCircuitName}) has
                been identified in replicated neuroimaging trials and demonstrated prospective
                response in MDD patients exhibiting high burden in this specific domain.
              </p>
            </div>

            <div>
              <strong className="text-rose">What this does not mean:</strong>
              <p className="text-primary mt-1">
                This is not a standalone diagnostic biomarker, nor does it guarantee universal
                superiority over established Tier 1 left DLPFC baseline coordinates for unstratified
                patient presentations.
              </p>
            </div>

            <div className="flex justify-end mt-2">
              <Button variant="secondary" onClick={() => setExplainerDomain(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve Phenotype Modal */}
      <Modal
        isOpen={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        title="Confirm Phenotype Approval"
        maxWidth="560px"
      >
        <div className="text-sm flex flex-col gap-3">
          <p className="text-primary">
            You are approving the clinical symptom formulation for{' '}
            <strong>{initialViewModel.primaryDiagnosis}</strong>.
          </p>

          <div className="bg-primary border rounded-lg p-3.5">
            <div className="flex justify-between mb-2">
              <span className="text-secondary">Highest Treatment Priority:</span>
              <strong>{domains[0]?.domainName}</strong>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-secondary">Direct Circuit Mappings:</span>
              <strong>{initialViewModel.targetMappableCount} circuits</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Safety Clearance:</span>
              <span className="text-emerald font-semibold">Cleared for TMS</span>
            </div>
          </div>

          <Alert
            variant="warning"
            className="text-xs"
            description="Magniom will seal this snapshot with a deterministic SHA-256 hash. Later modifications to clinically material priorities will mark downstream Target Slates as stale."
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <Button
            variant="secondary"
            onClick={() => setShowApprovalDialog(false)}
            disabled={isApproving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleExecuteApproval}
            disabled={isApproving}
            id="confirm-phenotype-approval-btn"
          >
            {isApproving ? (
              'Sealing Snapshot...'
            ) : (
              <>
                Confirm & Generate Slate <ArrowRightIcon size={14} className="ml-1 inline" />
              </>
            )}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
