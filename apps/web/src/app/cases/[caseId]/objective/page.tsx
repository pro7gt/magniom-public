'use client';

import React, { use, useState, useEffect } from 'react';
import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CaseNotFoundState,
  ArrowRightIcon,
  PageHeader,
  Alert,
  Input,
  Select,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';
import { resolveCaseShellContext } from '../../../../lib/shell-authority';
import type { CaseShellViewModel } from '@magniom/presentation';

export default function ClinicalObjectivePage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [burdenInput, setBurdenInput] = useState('');
  const [priorityInput, setPriorityInput] = useState(1);

  useEffect(() => {
    const r = caseStore.getCaseRecord(caseId);
    setRecord(r);
    if (r?.clinicalObjective) {
      setTitleInput(r.clinicalObjective.title);
      setBurdenInput(r.clinicalObjective.burdenScoreText || '');
      setPriorityInput(r.clinicalObjective.priorityRank || 1);
    }
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        const updated = caseStore.getCaseRecord(caseId);
        setRecord(updated);
        if (updated?.clinicalObjective) {
          setTitleInput(updated.clinicalObjective.title);
          setBurdenInput(updated.clinicalObjective.burdenScoreText || '');
          setPriorityInput(updated.clinicalObjective.priorityRank || 1);
        }
      }
    });
    return () => unsubscribe();
  }, [caseId]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
  }

  const shellVm: CaseShellViewModel | null = resolveCaseShellContext({ caseId });
  const indication = shellVm?.indication;
  const moduleAuthority = shellVm?.moduleAuthority;
  const effectiveObjective = record.clinicalObjective;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    caseStore.updateClinicalObjective(caseId, {
      id: record.clinicalObjective?.id || `obj-${caseId}-${Date.now()}`,
      title: titleInput.trim(),
      priorityRank: priorityInput,
      burdenScoreText: burdenInput.trim() || undefined,
      isEvidenceMappable: record.clinicalObjective?.isEvidenceMappable ?? true,
    });

    setIsEditing(false);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
  };

  return (
    <div className="container page-container-col max-w-5xl mx-auto p-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        ariaLabel="Breadcrumb"
        items={[
          { label: 'Case Overview', href: `/cases/${caseId}` },
          { label: 'Clinical Context', href: `/cases/${caseId}/context` },
          { label: 'Clinical Objective', current: true },
        ]}
      />

      {/* Header (§72, §95) */}
      <PageHeader
        title="Clinical Objective Formulation"
        subtitle={
          <>
            Defines the clinical target intention governing Target Slate calculation and ranking for{' '}
            <strong>{indication?.indicationFormatted || record.clinicalCase.indicationCode}</strong>
            .
          </>
        }
        actions={
          moduleAuthority && (
            <Badge
              className={`${moduleAuthority.isClinicalAuthorised ? 'badge-tier1' : moduleAuthority.isResearchOnly ? 'badge-tierexp' : 'badge-tier2'}`}
              title={`Module: ${moduleAuthority.humanReadableName} (${moduleAuthority.moduleVersion})`}
            >
              {moduleAuthority.permissionLabel}
            </Badge>
          )
        }
      />

      {/* Normative Principle Alert (§95) */}
      <Alert
        variant="info"
        className="mb-6"
        title="§95 Clinical Objective First:"
        description="Each target workspace SHALL keep visible what the candidate is intended to address. A target should never become a decontextualised coordinate."
      />

      {/* Main Content Grid */}
      <div className="grid-cards-320">
        {/* Active Clinical Objective Card */}
        <Card className="context-card" aria-labelledby="active-objective-heading">
          <CardHeader>
            <CardTitle
              as="h2"
              id="active-objective-heading"
              className="m-0 text-lg text-cyan font-semibold"
            >
              Active Objective Specification
            </CardTitle>
            {!isEditing && (
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => {
                  if (effectiveObjective) {
                    setTitleInput(effectiveObjective.title);
                    setBurdenInput(effectiveObjective.burdenScoreText || '');
                    setPriorityInput(effectiveObjective.priorityRank || 1);
                  }
                  setIsEditing(true);
                }}
                className="text-xs py-1 px-2.5"
              >
                {effectiveObjective ? 'Edit Objective' : 'Formulate Objective'}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSave} className="flex flex-col gap-4">
                <FormGroup>
                  <FormLabel htmlFor="obj-title" required>
                    Objective Title / Intention
                  </FormLabel>
                  <Input
                    id="obj-title"
                    type="text"
                    value={titleInput}
                    onChange={e => setTitleInput(e.target.value)}
                    placeholder="e.g., Left DLPFC-SGC Circuit Modulation for MDD Remission"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="obj-priority">Priority Rank</FormLabel>
                  <Select
                    id="obj-priority"
                    value={priorityInput}
                    onChange={e => setPriorityInput(Number(e.target.value))}
                  >
                    <option value={1}>1 (Primary Clinical Target)</option>
                    <option value={2}>2 (Secondary Adjunctive)</option>
                    <option value={3}>3 (Exploratory / Alternative)</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="obj-burden">Symptom / Burden Metric</FormLabel>
                  <Input
                    id="obj-burden"
                    type="text"
                    value={burdenInput}
                    onChange={e => setBurdenInput(e.target.value)}
                    placeholder="e.g., MADRS: 34 (Severe depression), HAM-D: 26"
                  />
                </FormGroup>

                <div className="flex gap-2.5 mt-2">
                  <Button variant="primary" type="submit" className="text-sm py-1.5 px-3.5">
                    Save Objective
                  </Button>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-sm py-1.5 px-3.5"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : effectiveObjective ? (
              <div>
                <p className="m-0 mb-3 text-lg font-semibold text-primary">
                  {effectiveObjective.title}
                </p>
                <div className="flex gap-2 flex-wrap mb-4">
                  <Badge variant="neutral" className="text-xs">
                    Priority Rank: #{effectiveObjective.priorityRank}
                  </Badge>
                  <Badge
                    className={`${effectiveObjective.isEvidenceMappable ? 'badge-tier1' : 'badge-neutral'} text-xs`}
                  >
                    {effectiveObjective.isEvidenceMappable
                      ? 'Evidence Mappable'
                      : 'Not Directly Mapped'}
                  </Badge>
                </div>
                {effectiveObjective.burdenScoreText && (
                  <div className="p-2.5 px-3.5 bg-glass-card rounded border border-subtle">
                    <span className="text-xs text-muted block uppercase tracking-wide">
                      Symptom Burden Baseline
                    </span>
                    <p className="mt-1 mb-0 text-secondary text-sm">
                      {effectiveObjective.burdenScoreText}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted italic mb-4">
                  No clinical objective has been formulated for this case. Clinical formulation must
                  precede algorithmic Target Slate generation.
                </p>
                <Button
                  variant="primary"
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-sm"
                >
                  Formulate Clinical Objective Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Context Relationships & Invariants */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle as="h2" className="m-0 text-base text-primary font-semibold">
                Governing Clinical Invariants
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="m-0 pl-5 text-sm text-secondary flex flex-col gap-2">
                <li>
                  <strong>Clinical Formulation Precedence (§7):</strong> Algorithmic candidate
                  generation cannot proceed until clinical objective is established.
                </li>
                <li>
                  <strong>No Cross-Indication Reuse (§67):</strong> Objective modifications for{' '}
                  {record.clinicalCase.indicationCode} do not alter other registered indications.
                </li>
                <li>
                  <strong>Staleness Invalidation (§78):</strong> Modifying the clinical objective
                  invalidates any existing Target Slate to prevent mismatched targeting.
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-3 flex-wrap">
            <Button
              variant="secondary"
              href={`/cases/${caseId}/context`}
              className="flex-1 text-center py-2.5"
            >
              View Full Clinical Context
            </Button>
            <Button
              variant="primary"
              href={`/cases/${caseId}/targets`}
              className="flex-1 text-center py-2.5"
            >
              Inspect Target Slate <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
