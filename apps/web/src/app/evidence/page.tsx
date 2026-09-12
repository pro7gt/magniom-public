'use client';

import { Breadcrumbs, Badge, Card, CardHeader, CardTitle, CardContent, PageHeader, Alert, AlertTitle, AlertDescription } from '@/components/ui';

import React, { useState } from 'react';
import { getCanonicalCircuitOverlays } from '@magniom/presentation';

export default function EvidenceLibraryPage() {
  const circuits = getCanonicalCircuitOverlays();
  const [selectedCircuitId, setSelectedCircuitId] = useState<string>(circuits[0]?.circuitId || 'TC-MDD-CONVERGENT-001');

  const activeCircuit = circuits.find((c) => c.circuitId === selectedCircuitId) || circuits[0];

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Evidence Knowledge Graph', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier1">EVIDENCE KNOWLEDGE GRAPH</Badge>
            <Badge variant="neutral">Library Release v1.0.0</Badge>
          </div>
        }
        title="Evidence Claims & Therapeutic Circuit Library"
        subtitle="Curated clinical evidence base, randomized trial findings, and circuit definitions driving candidate target qualification (Section 31)."
      />


      {/* 2-Column Layout: Circuit Selector on Left, Evidence Dossier on Right */}
      <div className="stat-card-grid">
        {/* Left Column: Circuits */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              Therapeutic Circuits ({circuits.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {circuits.map((circ) => {
                 const isSelected = circ.circuitId === selectedCircuitId;
                 return (
                   <div
                     key={circ.circuitId}
                     onClick={() => setSelectedCircuitId(circ.circuitId)}
                     className={`circuit-card ${isSelected ? 'circuit-card-selected' : ''}`}
                   >
                     <div className="flex justify-between items-center">
                       <span className={`font-mono text-xs ${isSelected ? 'text-cyan' : 'text-secondary'}`}>
                         {circ.circuitId}
                       </span>
                       <Badge variant="tier1">Tier 1</Badge>
                     </div>
                     <strong className="text-sm text-primary">{circ.name}</strong>
                     <span className="text-xs text-secondary">Short Code: {circ.shortCode}</span>
                   </div>
                 );
               })}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Active Circuit Dossier */}
        {activeCircuit && (
          <Card className="flex flex-col gap-4">
            <CardHeader>
              <div className="flex gap-2 mb-1">
                <Badge variant="tier1">CANONICAL ANCHOR</Badge>
                <Badge variant="neutral" className="font-mono">{activeCircuit.circuitId}</Badge>
              </div>
              <CardTitle as="h2" className="text-xl font-bold text-primary">
                {activeCircuit.name}
              </CardTitle>
              <p className="text-secondary text-sm mt-1">
                {activeCircuit.description || 'Convergent DLPFC anti-correlation to subgenual anterior cingulate cortex (sgACC, BA25) predictive of antidepressant efficacy.'}
              </p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Alert variant="info">
                <AlertTitle as="h3">
                  Supporting Clinical Evidence &amp; Trial Consensus
                </AlertTitle>
                <AlertDescription>
                  <ul className="m-0 pl-5 text-sm text-secondary flex flex-col gap-1.5">
                    <li>Fox et al. (2012) PNAS — Identification of human brain connectivity markers predicting TMS antidepressant outcome.</li>
                    <li>Weigand et al. (2018) Am J Psychiatry — Prospective validation of resting-state sgACC anti-correlation in 2 distinct clinical cohorts.</li>
                    <li>Cole et al. (2020) Am J Psychiatry — Stanford Neuromodulation Therapy (SNT) protocol circuit targeting.</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <Alert variant="warning">
                <AlertTitle as="h3">
                  Scientific Limitations &amp; Boundary Conditions
                </AlertTitle>
                <AlertDescription>
                  <ul className="m-0 pl-5 text-sm text-secondary flex flex-col gap-1.5">
                    <li>Requires adequate BOLD scan duration (&gt; 10 min usable time) for stable individual-level estimation.</li>
                    <li>High motion or subgenual signal dropout degrades personalization reliability.</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
