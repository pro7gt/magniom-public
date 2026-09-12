'use client';

import React, { use, useState, useEffect } from 'react';
import {
  CheckIcon,
  Breadcrumbs,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CaseNotFoundState,
  ArrowRightIcon,
  PageHeader,
  Alert,
  Select,
  Input,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function DiseaseStagePage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [stageCode, setStageCode] = useState(() => record?.diseaseStage?.stageCode || 'CHRONIC');
  const [daysSinceEvent, setDaysSinceEvent] = useState(240);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const r = caseStore.getCaseRecord(caseId);
    setRecord(r);
    if (r?.diseaseStage?.stageCode) {
      setStageCode(r.diseaseStage.stageCode);
    }
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        const updated = caseStore.getCaseRecord(caseId);
        setRecord(updated);
        if (updated?.diseaseStage?.stageCode) {
          setStageCode(updated.diseaseStage.stageCode);
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

  const isEligible = stageCode === 'CHRONIC' || stageCode === 'SUBACUTE';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    caseStore.updateDiseaseStage(caseId, {
      stageCode,
      stageLabel:
        stageCode === 'CHRONIC'
          ? 'Chronic (>6 months)'
          : stageCode === 'SUBACUTE'
            ? 'Subacute (2 weeks–6 months)'
            : 'Acute (<2 weeks)',
      determinationMethod: 'Clinical records & neuroimaging confirmation',
      isSubacuteOrAcute: stageCode !== 'CHRONIC',
    });
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Disease Stage Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Disease Chronicity & Stage', current: true },
        ]}
      />

      <PageHeader
        variant="case-workspace"
        title="Disease Chronicity & Stage Qualification"
        subtitle="Hard Gate G2 Temporal Qualification & Stage Eligibility (§54, §93)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/lesion`}>
              Lesion Mapping <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/targets`}>
              Target Slate <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      <div className="stat-card-grid">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Configure Disease Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>Chronicity Classification</FormLabel>
                <Select value={stageCode} onChange={e => setStageCode(e.target.value)}>
                  <option value="CHRONIC">Chronic Post-Stroke (&gt; 6 Months Post-Onset)</option>
                  <option value="SUBACUTE">Subacute Phase (14 Days – 6 Months Post-Onset)</option>
                  <option value="ACUTE">Acute Phase (&lt; 14 Days Post-Onset) — PROHIBITED</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Days Since Index Vascular Event: <strong>{daysSinceEvent} days</strong>
                </FormLabel>
                <Input
                  type="number"
                  min="1"
                  max="3650"
                  value={daysSinceEvent}
                  onChange={e => setDaysSinceEvent(Number(e.target.value))}
                />
              </FormGroup>

              <Alert
                variant={isEligible ? 'success' : 'danger'}
                title={
                  isEligible
                    ? 'Gate G2 Passed: Protocol Eligible'
                    : 'Gate G2 Rejection: Acute Stage Prohibited'
                }
                description={
                  isEligible
                    ? 'Chronic or subacute post-stroke status qualifies for outpatient rTMS neuromodulation protocol.'
                    : 'Acute post-stroke TMS (<14 days) is strictly prohibited due to seizure risk and penumbral hemodynamic instability.'
                }
              />

              <Button variant="primary" type="submit" className="self-start">
                Save Stage Certification
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Disease stage updated
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Scientific Rationale & Stage Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="rule-list">
              <li className="panel-subtle">
                <strong className="text-primary block">Chronic (&gt; 6 months):</strong>
                Spontaneous recovery plateau reached. Interhemispheric transcallosal inhibition is
                established and maladaptive; targeted rTMS promotes late-stage cortical
                reorganization.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Subacute (2 wks – 6 mos):</strong>
                Heightened neuroplastic window. Facilitatory stimulation to ipsilesional motor
                networks must be paired with daily physical/occupational therapy within 60 minutes.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Acute (&lt; 2 weeks):</strong>
                Precluded by ISO 14971 Risk Control RC-STR-002 to avoid disruption of ischemic
                penumbra revascularization.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
