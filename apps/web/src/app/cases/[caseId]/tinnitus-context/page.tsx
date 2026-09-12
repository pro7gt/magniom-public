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
  RangeSlider,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { EnvironmentSafetyStrip } from '@/components/shell';
import { caseStore } from '../../../../lib/case-store';

export default function TinnitusContextPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [tfiScore, setTfiScore] = useState(58);
  const [pitchKHz, setPitchKHz] = useState(6.0);
  const [loudnessDbSl, setLoudnessDbSl] = useState(12);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    return caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
  }, [caseId]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    caseStore.approvePhenotype(
      caseId,
      'clin-specialist-001',
      `Tinnitus: TFI ${tfiScore}/100, Pitch: ${pitchKHz} kHz, Loudness: ${loudnessDbSl} dB SL`,
    );
    setIsSaved(true);
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Tinnitus Profile Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Subjective Tinnitus Profile', current: true },
        ]}
      />

      {/* Research Mode Safety Banner (§20–25) */}
      <EnvironmentSafetyStrip
        mode="RESEARCH"
        className="mb-5"
        title="RESEARCH MODE ONLY (IMR-TINNITUS-2.0.0 · Q0 Qualification Level)"
        description="This indication module is restricted to exploratory investigation. Generated target coordinates are research hypotheses and SHALL NOT be used for unapproved clinical treatment."
      />

      <PageHeader
        variant="case-workspace"
        title="Subjective Tinnitus Psychoacoustic Profile"
        subtitle="TFI Severity, Psychoacoustic Pitch/Loudness Matching & Auditory Cortex Mapping (§56, §93)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/measurements/audiology`}>
              Audiology & MML <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/targets`}>
              Research Hypotheses <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      <div className="stat-card-grid">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Psychoacoustic Baselines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>
                  Tinnitus Functional Index (TFI): <strong>{tfiScore} / 100</strong>
                </FormLabel>
                <RangeSlider
                  min={0}
                  max={100}
                  value={tfiScore}
                  onChange={e => setTfiScore(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>0 (Mild)</span>
                  <span>25–50 (Moderate)</span>
                  <span>&gt; 50 (Significant Problem)</span>
                </div>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Pitch Match Center Frequency: <strong>{pitchKHz} kHz</strong>
                </FormLabel>
                <RangeSlider
                  min={1}
                  max={12}
                  step={0.2}
                  value={pitchKHz}
                  onChange={e => setPitchKHz(Number(e.target.value))}
                />
                <div className="flex justify-between text-xs text-muted">
                  <span>1 kHz (Low)</span>
                  <span>6 kHz (Typical Pure Tone)</span>
                  <span>12 kHz (Ultra-High)</span>
                </div>
              </FormGroup>

              <FormGroup>
                <FormLabel>
                  Loudness Sensation Level: <strong>{loudnessDbSl} dB SL</strong>
                </FormLabel>
                <RangeSlider
                  min={1}
                  max={25}
                  value={loudnessDbSl}
                  onChange={e => setLoudnessDbSl(Number(e.target.value))}
                />
              </FormGroup>

              <Button variant="primary" type="submit" className="self-start">
                Save Tinnitus Baseline
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Baseline recorded
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-cyan">
              Auditory Cortex & Non-Auditory Network Targets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="rule-list">
              <li className="panel-subtle">
                <strong className="text-primary block">
                  Primary Auditory Cortex (A1 / Heschl&apos;s Gyrus):
                </strong>
                Inhibitory low-frequency (1 Hz) rTMS directed to left temporoparietal cortex (area
                T3/P3) to dampen hyperactive auditory tonotopic phantom inputs.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">
                  Dorsolateral Prefrontal Cortex (DLPFC):
                </strong>
                Dual-site stimulation protocol targeting left DLPFC + temporoparietal junction to
                modulate affective distress and auditory attention allocation.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
