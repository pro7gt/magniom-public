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
import { getCanonicalCircuitOverlays } from '@magniom/presentation';

export default function EvidenceCircuitsPage() {
  const circuits = getCanonicalCircuitOverlays();

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Evidence', href: '/evidence' },
          { label: 'Therapeutic Circuits', current: true },
        ]}
      />

      {/* Header */}
      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier1">EVIDENCE KNOWLEDGE GRAPH</Badge>
            <Badge variant="neutral">Therapeutic Circuits (§197)</Badge>
          </div>
        }
        title="Therapeutic Circuit Library"
        subtitle="Anatomical networks, connectomic circuits, and neurofunctional pathways linking clinical objectives to target geometries."
      />


      {/* Circuits Grid */}
      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Active Therapeutic Circuits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Therapeutic Circuits">
              <thead>
                <tr>
                  <th scope="col">Circuit ID</th>
                  <th scope="col">Circuit Name</th>
                  <th scope="col">Short Code</th>
                  <th scope="col">Evidence Tier</th>
                  <th scope="col">Primary Target Node</th>
                  <th scope="col">Downstream Network</th>
                </tr>
              </thead>
              <tbody>
                {circuits.length === 0 ? (
                  <TableEmptyRow
                    colSpan={6}
                    message="No therapeutic circuits registered."
                  />
                ) : (
                  circuits.map(c => (
                    <tr key={c.circuitId}>
                      <td>
                        <strong className="font-mono text-cyan">
                          {c.circuitId}
                        </strong>
                      </td>
                      <td><strong>{c.name}</strong></td>
                      <td><code className="text-xs">{c.shortCode}</code></td>
                      <td>
                        <Badge variant="tier1">Tier 1</Badge>
                      </td>
                      <td className="text-sm">
                        {c.circuitId.includes('MDD')
                          ? 'Left DLPFC (BA46/9)'
                          : c.circuitId.includes('PAIN')
                            ? 'Contralateral M1'
                            : c.circuitId.includes('OCD')
                              ? 'Bilateral dACC / dmPFC'
                              : c.circuitId.includes('PTSD')
                                ? 'Right DLPFC'
                                : 'Perilesional Left Frontotemporal'}
                      </td>
                      <td className="text-sm text-secondary">
                        {c.description || 'Subgenual ACC (sgACC, BA25) anti-correlation network'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Links */}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" href="/evidence"><ArrowLeftIcon size={14} className="mr-1 inline" /> Evidence Library</Button>
        <Button variant="secondary" href="/evidence/claims">Claims <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/evidence/paths">Evidence Paths <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/evidence/target-families">Target Families <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/evidence/sources">Sources <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
      </div>
    </div>
  );
}

