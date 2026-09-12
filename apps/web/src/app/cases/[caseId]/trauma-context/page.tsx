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
  ArrowLeftIcon,
  PageHeader,
  Alert,
  Radio,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function TraumaContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [traumaType, setTraumaType] = useState<'civilian' | 'combat' | 'first_responder'>(
    'civilian',
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

  const isCombat = traumaType === 'combat';

  return (
    <div className="container page-container-col">
      {/* Breadcrumbs */}
      <Breadcrumbs
        ariaLabel="Trauma Screening Breadcrumb"
        items={[
          { label: 'Cases', href: '/cases' },
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Trauma Screening & Population Context', current: true },
        ]}
      />

      {/* Header */}
      <PageHeader
        variant="case-workspace"
        title={
          <span className="flex items-center gap-2 flex-wrap">
            <span>Trauma Etiology &amp; Population Screening (§71)</span>
            <Badge variant="tier1">EVIDENCE BOUND</Badge>
          </span>
        }
        subtitle="Identifies trauma category to enforce evidence applicability boundaries without masking anatomical fit."
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/ptsd-context`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> PTSD Battery
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/targets`}>
              Target Slate <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      {/* Conflict Warning Banner (§71) */}
      {isCombat && (
        <Alert
          variant="danger"
          className="mb-6"
          title="Population Applicability Conflict Warning (PTSD_POPULATION_CONFLICT)"
          description="Published randomized trial evidence demonstrates substantial differences in sham response rates and pooled effect sizes between civilian and combat-exposed veteran populations (SMD -0.16, 95% CI -0.42 to 0.10, p = 0.23). Clinical benefit may be attenuated. The Target Engine will preserve this caveat explicitly on generated candidates (§71)."
        />
      )}

      {/* Form / Selection Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle as="h2" className="m-0 text-lg text-primary font-semibold">
            Index Trauma Classification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 mb-6">
            <label className={`radio-card ${traumaType === 'civilian' ? 'radio-card-active' : ''}`}>
              <Radio
                name="traumaType"
                value="civilian"
                checked={traumaType === 'civilian'}
                onChange={() => setTraumaType('civilian')}
              />
              <div>
                <strong className="text-primary text-sm">Civilian Non-Combat Trauma</strong>
                <div className="text-xs text-secondary">
                  Accidental, physical assault, interpersonal, or natural disaster trauma. Level B
                  RCT evidence applies.
                </div>
              </div>
            </label>

            <label className={`radio-card ${traumaType === 'combat' ? 'radio-card-danger' : ''}`}>
              <Radio
                name="traumaType"
                value="combat"
                checked={traumaType === 'combat'}
                onChange={() => setTraumaType('combat')}
              />
              <div>
                <strong className="text-rose text-sm">
                  Combat-Related / Military Veteran Trauma
                </strong>
                <div className="text-xs text-secondary">
                  Operational combat exposure. Triggers evidence applicability conflict disclosure
                  (§71).
                </div>
              </div>
            </label>

            <label
              className={`radio-card ${traumaType === 'first_responder' ? 'radio-card-active' : ''}`}
            >
              <Radio
                name="traumaType"
                value="first_responder"
                checked={traumaType === 'first_responder'}
                onChange={() => setTraumaType('first_responder')}
              />
              <div>
                <strong className="text-primary text-sm">First Responder Trauma</strong>
                <div className="text-xs text-secondary">
                  Police, paramedic, or firefighter cumulative acute secondary trauma exposure.
                </div>
              </div>
            </label>
          </div>

          <Button
            variant="primary"
            onClick={() => {
              const hasActiveSlate = Boolean(
                (record.slate.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
                record.clinicalCase.currentTargetSlateId,
              );
              if (hasActiveSlate) {
                caseStore.setStaleness(
                  caseId,
                  true,
                  'Trauma screening context updated after slate generation',
                  'blocking',
                );
              } else {
                caseStore.notify(caseId);
              }
              setRecord({ ...caseStore.getCaseRecord(caseId)! });
              setIsSaved(true);
              setTimeout(() => setIsSaved(false), 3000);
            }}
            className="w-full"
          >
            {isSaved
              ? 'Trauma Screening Confirmed & Synced'
              : 'Confirm Trauma Screening & Bind to Case'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
