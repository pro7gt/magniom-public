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
// Validation Studies (§196)
// Validation study listing with protocol status.
// Not available to ordinary Clinical users unless required.
// ==========================================

const VALIDATION_STUDIES = [
  { id: 'VS-MDD-SILENT-001', title: 'MDD Silent Prospective Study', module: 'MDD Module 2.0', protocol: 'Silent Prospective Q5', participants: 42, status: 'Active', phase: 'Enrollment' },
  { id: 'VS-PAIN-CAV-001', title: 'Neuropathic Pain Clinician-Assisted Validation', module: 'Pain Module 1.0', protocol: 'Clinician-Assisted Q6', participants: 18, status: 'Active', phase: 'Data Collection' },
  { id: 'VS-STR-MOTOR-001', title: 'Stroke Motor Module Validation', module: 'Stroke Motor 1.0', protocol: 'Standard Q5', participants: 24, status: 'Planning', phase: 'Protocol Design' },
];

export default function ValidationStudiesPage() {
  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Validation', href: '/validation' },
          { label: 'Validation Studies', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier2">VALIDATION ENVIRONMENT</Badge>
            <Badge variant="neutral">Study Registry</Badge>
          </div>
        }
        title="Validation Studies"
        subtitle="Controlled validation studies under study protocol governance. Clinical authority restricted by protocol (§196)."
      />


      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Active Validation Studies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Validation Studies">
              <thead>
                <tr>
                  <th scope="col">Study ID</th>
                  <th scope="col">Title</th>
                  <th scope="col">Module</th>
                  <th scope="col">Protocol</th>
                  <th scope="col">Participants</th>
                  <th scope="col">Phase</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {VALIDATION_STUDIES.length === 0 ? (
                  <TableEmptyRow
                    colSpan={7}
                    message="No validation studies found."
                  />
                ) : (
                  VALIDATION_STUDIES.map(s => (
                    <tr key={s.id}>
                      <td><code className="text-cyan text-xs">{s.id}</code></td>
                      <td><strong className="text-sm">{s.title}</strong></td>
                      <td className="text-sm">{s.module}</td>
                      <td><Badge variant="tier2" className="text-xs">{s.protocol}</Badge></td>
                      <td className="text-center">{s.participants}</td>
                      <td className="text-sm text-secondary">{s.phase}</td>
                      <td>
                        <Badge className={`${s.status === 'Active' ? 'badge-tier1' : 'badge-neutral'}`}>
                          {s.status}
                        </Badge>
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
        <Button variant="secondary" href="/validation"><ArrowLeftIcon size={14} className="mr-1 inline" /> Validation Home</Button>
        <Button variant="secondary" href="/validation/cases">Validation Cases <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/validation/modules">Module Qualification <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/validation/golden">Golden Cases <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
      </div>
    </div>
  );
}
