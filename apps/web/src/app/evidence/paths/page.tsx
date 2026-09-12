'use client';

import { Breadcrumbs, Button, Badge, Card, CardHeader, CardTitle, CardContent, ArrowRightIcon, ArrowLeftIcon, ArrowDownIcon, PageHeader } from '@/components/ui';

import React from 'react';

// ==========================================
// Evidence Paths Browser (§197)
// Visualisation of the governed path from Indication -> Claim -> Circuit -> TargetFamily -> Candidate.
// ==========================================

const EVIDENCE_PATHS = [
  {
    id: 'EP-MDD-CONVERGENT',
    nodes: [
      { type: 'INDICATION', label: 'Major Depressive Disorder', description: 'DSM-5 / ICD-11 criteria with treatment resistance' },
      { type: 'CLAIM', label: 'sgACC Anti-Correlation Claim', description: 'Antidepressant response ∝ functional connectivity to BA25' },
      { type: 'CIRCUIT', label: 'sgACC-DLPFC Convergent Circuit', description: 'Subgenual cingulate to fronto-parietal network' },
      { type: 'TARGET_FAMILY', label: 'Left DLPFC (TF-MDD-L-DLPFC-001)', description: 'Prefrontal territory spanning BA9/BA46' },
      { type: 'CANDIDATE', label: 'Connectivity-Refined Coordinate', description: 'Patient-specific FC refinement from evidence baseline' },
    ],
  },
  {
    id: 'EP-MDD-REWARD',
    nodes: [
      { type: 'INDICATION', label: 'Major Depressive Disorder', description: 'With prominent anhedonia' },
      { type: 'CLAIM', label: 'Reward Circuit Modulation Claim', description: 'Ventromedial–striatal circuit addresses anhedonic burden' },
      { type: 'CIRCUIT', label: 'Reward / Striatal-mPFC Circuit', description: 'Motivational network architecture' },
      { type: 'TARGET_FAMILY', label: 'Reward Circuit (TF-MDD-REWARD-001)', description: 'Dorsomedial PFC / reward modulation territory' },
      { type: 'CANDIDATE', label: 'Symptom-Circuit Target', description: 'Anhedonia-specific FC-guided target' },
    ],
  },
  {
    id: 'EP-PAIN-SOMATOTOPIC',
    nodes: [
      { type: 'INDICATION', label: 'Neuropathic Pain', description: 'Intractable chronic neuropathic pain' },
      { type: 'CLAIM', label: 'Contralateral M1 Pain Reduction', description: 'Motor cortex stimulation reduces pain via descending inhibition' },
      { type: 'CIRCUIT', label: 'Cortico-Thalamic Pain Modulation', description: 'M1 to thalamic relay circuit' },
      { type: 'TARGET_FAMILY', label: 'Contralateral M1 (TF-PAIN-M1-001)', description: 'Somatotopic motor representation' },
      { type: 'CANDIDATE', label: 'Motor-Map Refined Target', description: 'Patient-specific somatotopic refinement' },
    ],
  },
];

const NODE_BORDER_CLASSES: Record<string, string> = {
  INDICATION: 'border-l-indigo',
  CLAIM: 'border-l-cyan',
  CIRCUIT: 'border-l-emerald',
  TARGET_FAMILY: 'border-l-amber',
  CANDIDATE: 'border-l-rose',
};

const NODE_BADGE_VARIANTS: Record<string, 'indication' | 'claim' | 'circuit' | 'target-family' | 'candidate'> = {
  INDICATION: 'indication',
  CLAIM: 'claim',
  CIRCUIT: 'circuit',
  TARGET_FAMILY: 'target-family',
  CANDIDATE: 'candidate',
};

export default function EvidencePathsPage() {
  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Evidence', href: '/evidence' },
          { label: 'Evidence Paths', current: true },
        ]}
      />

      <PageHeader
        eyebrow={<Badge variant="neutral" className="uppercase">Evidence Architecture</Badge>}
        title="Evidence-to-Target Paths (§197)"
        subtitle="Auditable trace graph showing the governed path from Clinical Indication through Scientific Claim, Circuit Architecture, and Target Family to Patient Candidate Target."
      />

      <div className="flex flex-col gap-6">
        {EVIDENCE_PATHS.map(path => (
          <Card key={path.id}>
            <CardHeader className="flex justify-between items-center">
              <CardTitle as="h2" className="text-base font-bold text-cyan">
                {path.id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                {path.nodes.map((node, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      className={`flex items-start gap-3 p-3 bg-surface-elevated rounded-md ${NODE_BORDER_CLASSES[node.type] || 'border-l-cyan'}`}
                    >
                      <Badge
                        variant={NODE_BADGE_VARIANTS[node.type] || 'neutral'}
                        className="text-xs font-bold shrink-0 min-w-28 text-center justify-center"
                      >
                        {node.type.replace('_', ' ')}
                      </Badge>
                      <div>
                        <strong className="text-sm text-primary">{node.label}</strong>
                        <p className="mt-0.5 text-xs text-secondary">
                          {node.description}
                        </p>
                      </div>
                    </div>
                  {idx < path.nodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDownIcon size={14} className="text-muted" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" href="/evidence"><ArrowLeftIcon size={14} className="mr-1 inline" /> Evidence Library</Button>
        <Button variant="secondary" href="/evidence/claims">Claims <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/evidence/target-families">Target Families <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
      </div>
    </div>
  );
}
