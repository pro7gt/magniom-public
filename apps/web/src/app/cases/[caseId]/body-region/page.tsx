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
  ArrowLeftIcon,
  PageHeader,
  Select,
  FormGroup,
  FormLabel,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';

export default function BodyRegionPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const { caseId } = resolvedParams;

  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));
  const [selectedRegion, setSelectedRegion] = useState('Right Upper Limb (Hand / Forearm)');
  const [laterality, setLaterality] = useState('Left Hemisphere M1 (Contralateral)');
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

  const handleRegionChange = (reg: string) => {
    setSelectedRegion(reg);
    if (reg.startsWith('Right')) {
      setLaterality('Left Hemisphere M1 (Contralateral)');
    } else if (reg.startsWith('Left')) {
      setLaterality('Right Hemisphere M1 (Contralateral)');
    } else {
      setLaterality('Bilateral dACC / Pre-SMA');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const hasActiveSlate = Boolean(
      (record.slate.primaryCandidates && record.slate.primaryCandidates.length > 0) ||
      record.clinicalCase.currentTargetSlateId,
    );
    if (hasActiveSlate) {
      caseStore.setStaleness(
        caseId,
        true,
        'Painful body region context modified after slate generation',
        'blocking',
      );
    } else {
      caseStore.notify(caseId);
    }
    setRecord({ ...caseStore.getCaseRecord(caseId)! });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Body Region Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Pain Context', href: `/cases/${caseId}/pain-context` },
          { label: 'Painful Body Region', current: true },
        ]}
      />

      <PageHeader
        variant="case-workspace"
        title="Painful Body Region & Somatotopic Mapping"
        subtitle="Penfield Homunculus Somatotopic Projection & Contralateral Cortical Hotspot (§53, §106)"
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/pain-context`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Pain Context
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/measurements/motor-mapping`}>
              Motor Mapping <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      <div className="stat-card-grid">
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading m-0">
              Select Anatomical Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormGroup>
                <FormLabel>Primary Body Region Affected</FormLabel>
                <Select value={selectedRegion} onChange={e => handleRegionChange(e.target.value)}>
                  <option>Right Upper Limb (Hand / Forearm)</option>
                  <option>Left Upper Limb (Hand / Forearm)</option>
                  <option>Right Lower Limb (Leg / Foot)</option>
                  <option>Left Lower Limb (Leg / Foot)</option>
                  <option>Trigeminal V2/V3 Right Hemiface</option>
                  <option>Trigeminal V2/V3 Left Hemiface</option>
                  <option>Generalized / Axial Pain</option>
                </Select>
              </FormGroup>

              <div className="panel-dark">
                <div className="text-xs text-muted">DETERMINED TARGET SOMATOTOPY</div>
                <div className="text-lg font-bold text-cyan mt-1">{laterality}</div>
                <div className="text-xs text-secondary mt-1">
                  Conforms to Gate G6 contralateral motor mapping rules.
                </div>
              </div>

              <Button variant="primary" type="submit" className="self-start">
                Confirm Somatotopic Target Spec
              </Button>
              {isSaved && (
                <span className="text-emerald text-sm">
                  <CheckIcon size={14} className="text-emerald mr-1 inline" /> Somatotopy confirmed
                </span>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle as="h2" className="section-subheading m-0">
              Anatomical Invariants &amp; Hotspot Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-none p-0 m-0 flex flex-col gap-2.5 text-sm text-secondary">
              <li className="panel-subtle">
                <strong className="text-primary block">Hand / Upper Limb:</strong>
                Hand Knob region of the precentral gyrus (omega sign in axial slice). Target
                coordinates typically around MNI [±37, -21, 58].
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Foot / Lower Limb:</strong>
                Medial motor strip along the interhemispheric fissure (paracentral lobule). Angled
                double-cone or deep coil required.
              </li>
              <li className="panel-subtle">
                <strong className="text-primary block">Trigeminal / Face:</strong>
                Lateral and inferior primary motor cortex adjacent to the sylvian fissure. Facial
                nerve twitch monitoring required.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
