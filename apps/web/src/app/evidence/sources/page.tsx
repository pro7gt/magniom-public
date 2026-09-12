'use client';

import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ArrowRightIcon,
  ArrowLeftIcon,
  TableEmptyRow,
  PageHeader,
} from '@/components/ui';

import React from 'react';

// ==========================================
// Evidence Sources Browser (§197)
// Source inspection with full citation, DOI, clinical question.
// ==========================================

const CANONICAL_SOURCES = [
  { id: 'SRC-FOX-2012', citation: 'Fox MD et al. (2012) PNAS 109(8):E438-E445', title: 'Efficacy of TMS targets for depression related to intrinsic functional connectivity with the subgenual cingulate.', year: 2012, journal: 'Proc Natl Acad Sci USA', doi: '10.1073/pnas.1120275109', clinicalQuestion: 'Does DLPFC-sgACC connectivity predict antidepressant response?', usedByIndications: ['MDD'] },
  { id: 'SRC-WEIGAND-2018', citation: 'Weigand A et al. (2018) Am J Psychiatry 175(12):1214-1222', title: 'Prospective validation of resting-state connectivity targets.', year: 2018, journal: 'Am J Psychiatry', doi: '10.1176/appi.ajp.2018.17111222', clinicalQuestion: 'Does prospective sgACC anti-correlation predict individual clinical response?', usedByIndications: ['MDD'] },
  { id: 'SRC-COLE-2020', citation: 'Cole EJ et al. (2020) Am J Psychiatry 177(8):716-726', title: 'Stanford Neuromodulation Therapy circuit targeting.', year: 2020, journal: 'Am J Psychiatry', doi: '10.1176/appi.ajp.2019.19070720', clinicalQuestion: 'Does accelerated, connectivity-guided iTBS produce rapid antidepressant response?', usedByIndications: ['MDD'] },
  { id: 'SRC-BLUMBERGER-2022', citation: 'Blumberger DM et al. (2022) Lancet 399:771-782', title: 'Effectiveness of theta burst vs high-frequency rTMS in depression.', year: 2022, journal: 'The Lancet', doi: '10.1016/S0140-6736(22)00012-3', clinicalQuestion: 'Is standard evidence-anchored prefrontal TMS effective without individualised connectivity?', usedByIndications: ['MDD'] },
  { id: 'SRC-LEFAUCHEUR-2020', citation: 'Lefaucheur JP et al. (2020) Clin Neurophysiol 131(2):474-528', title: 'Evidence-based guidelines on rTMS for pain treatment.', year: 2020, journal: 'Clin Neurophysiol', doi: '10.1016/j.clinph.2019.11.002', clinicalQuestion: 'What is the evidence for M1 rTMS in chronic neuropathic pain?', usedByIndications: ['Pain'] },
  { id: 'SRC-HARVEY-2018', citation: 'Harvey RL et al. (2018) Neurorehabil Neural Repair 32(6-7):600-612', title: 'rTMS for motor recovery after stroke.', year: 2018, journal: 'Neurorehabil Neural Repair', doi: '10.1177/1545968318770133', clinicalQuestion: 'Does rTMS enhance motor recovery in post-stroke patients?', usedByIndications: ['Stroke Motor'] },
];

export default function EvidenceSourcesPage() {
  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Evidence', href: '/evidence' },
          { label: 'Evidence Sources', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier1">EVIDENCE KNOWLEDGE GRAPH</Badge>
            <Badge variant="neutral">Sources</Badge>
          </div>
        }
        title="Evidence Sources"
        subtitle="Primary scientific literature supporting MAGNIOM evidence claims and target qualification (§197)."
      />


      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Canonical Primary Citations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Evidence Sources Registry">
              <thead>
                <tr>
                  <th scope="col">Source ID</th>
                  <th scope="col">Citation</th>
                  <th scope="col">Clinical Question</th>
                  <th scope="col">Journal</th>
                  <th scope="col">Year</th>
                  <th scope="col">Indications</th>
                </tr>
              </thead>
              <tbody>
                {CANONICAL_SOURCES.length === 0 ? (
                  <TableEmptyRow
                    colSpan={6}
                    message="No canonical evidence sources registered."
                  />
                ) : (
                  CANONICAL_SOURCES.map(src => (
                    <tr key={src.id}>
                      <td><code className="text-cyan text-xs">{src.id}</code></td>
                      <td>
                        <strong className="text-sm">{src.title}</strong>
                        <div className="text-xs text-muted mt-0.5">
                          {src.citation}
                        </div>
                        {src.doi && (
                          <div className="text-xs text-cyan mt-0.5">
                            DOI: {src.doi}
                          </div>
                        )}
                      </td>
                      <td className="text-sm text-secondary">{src.clinicalQuestion}</td>
                      <td className="text-sm">{src.journal}</td>
                      <td className="text-center">{src.year}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {src.usedByIndications.map(ind => (
                            <Badge variant="neutral" key={ind} className="text-xs">{ind}</Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" href="/evidence"><ArrowLeftIcon size={14} className="mr-1 inline" /> Evidence Library</Button>
        <Button variant="secondary" href="/evidence/claims">Claims <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/evidence/paths">Evidence Paths <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/evidence/target-families">Target Families <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
      </div>
    </div>
  );
}
