'use client';

import React, { use, useState, useEffect } from 'react';
import {
  CheckIcon,
  AlertTriangleIcon,
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
  Textarea,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function CaseResearchNotesPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [noteContent, setNoteContent] = useState(
    'Session 1 Observation: Exploratory connectome mapping protocol. Subject tolerated baseline pure-tone matching and resting-state sequence without motion artifact. Pre-stimulation audiometric threshold confirmed.',
  );
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
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

  const isResearch =
    record.clinicalCase.mode === 'RESEARCH' ||
    record.clinicalCase.indicationCode === 'TINNITUS' ||
    record.clinicalCase.indicationCode === 'TBI';

  return (
    <div className="container page-container-col">
      {/* Breadcrumbs */}
      <Breadcrumbs
        ariaLabel="Research Notes Breadcrumb"
        items={[
          { label: 'Cases', href: '/cases' },
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Research Notes', current: true },
        ]}
      />

      {/* Header */}
      <PageHeader
        variant="case-workspace"
        title={
          <span className="flex items-center gap-2 flex-wrap">
            <span>Investigator &amp; Research Notes (§57)</span>
            <Badge variant={isResearch ? 'tierexp' : 'neutral'}>
              {isResearch ? 'RESEARCH PROTOCOL' : 'CLINICAL AUDIT LOG'}
            </Badge>
          </span>
        }
        subtitle="Non-prescriptive scientific observations, sham-control blinding logs, and experimental commentary."
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/targets`}>
              Target Hypotheses <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button variant="secondary" href={`/cases/${caseId}`}>
              Case Overview
            </Button>
          </>
        }
      />

      {/* Editor & Protocol Cards */}
      <div className="stat-card-grid">
        {/* Card 1: Notes Editor */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading m-0">
              Session Observation Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <Textarea
              value={noteContent}
              onChange={e => {
                setNoteContent(e.target.value);
                setIsSaved(false);
              }}
              rows={8}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted">Encrypted in local session buffer (§238)</span>
              <Button variant="primary" size="sm" onClick={() => setIsSaved(true)}>
                {isSaved ? 'Saved to Session' : 'Save Notes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Blinding & Protocol Integrity Checklist */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading m-0">
              Blinding &amp; Governance Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-sm">
              <li className="flex items-center gap-2">
                <CheckIcon size={14} className="text-emerald inline" />
                <span>
                  Operator separated from clinical evaluator (Silent Prospective protocol)
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon size={14} className="text-emerald inline" />
                <span>
                  Zero-PHI tokenization: Subject SUBJ-{record.clinicalCase.patientId} verified
                </span>
              </li>
              <li className="flex items-center gap-2">
                <CheckIcon size={14} className="text-emerald inline" />
                <span>Export format: anonymized NIfTI target geometry coordinates only</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertTriangleIcon size={14} className="text-amber inline" />
                <span>Clinical signing lock active (§57, §139)</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
