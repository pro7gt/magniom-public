'use client';

import { Breadcrumbs, Button, Badge, Card, CardContent, TableEmptyRow, ArrowRightIcon, ArrowLeftIcon, PageHeader } from '@/components/ui';

import React from 'react';
import { caseStore } from '../../../lib/case-store';

// ==========================================
// Validation Cases (§196)
// Validation case list filtered by study protocol.
// ==========================================

export default function ValidationCasesPage() {
  const allCases = caseStore.getAllCases();
  const validationCases = allCases.filter(
    c =>
      c.mode === 'VALIDATION' ||
      c.title.toLowerCase().includes('validation') ||
      c.title.toLowerCase().includes('prospective') ||
      c.code === 'MGN-26-0052',
  );

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Validation', href: '/validation' },
          { label: 'Validation Cases', current: true },
        ]}
      />

      <div className="safety-strip safety-strip-validation m-0">
        <strong>VALIDATION ENVIRONMENT (§196):</strong> All cases below operate under controlled study
        protocols. Blinded evaluation rules strictly enforced.
      </div>

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier2">VALIDATION ENVIRONMENT</Badge>
            <Badge variant="neutral">Case Registry</Badge>
          </div>
        }
        title="Validation Cases"
        subtitle="Enrolled cohort cases governed by formal validation study protocols (§196, §217–§227)."
      />


      <Card>
        <CardContent className="p-0">
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Validation Cases">
              <thead>
                <tr>
                  <th scope="col">Case Code</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Study / Protocol</th>
                  <th scope="col">Blinding Status</th>
                  <th scope="col">State</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {validationCases.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong className="font-mono text-cyan">
                        {c.code}
                      </strong>
                    </td>
                    <td>
                      <Badge variant="neutral">{c.indication}</Badge>
                    </td>
                    <td>
                      <strong>{c.title}</strong>
                    </td>
                    <td>
                      <Badge variant="tier2">Silent Prospective (Blinded)</Badge>
                    </td>
                    <td className="text-sm">
                      <Badge variant="tier1">{c.state}</Badge>
                    </td>
                    <td>
                      <Button variant="secondary" href={`/cases/${c.id}`}
                        className="p-1 text-xs">Open Case <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
                    </td>
                  </tr>
                ))}
                {validationCases.length === 0 && (
                  <TableEmptyRow
                    colSpan={6}
                    message="No validation cases currently enrolled."
                    subMessage="New validation cohorts appear here once enrolled."
                  />
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" href="/validation"><ArrowLeftIcon size={14} className="mr-1 inline" /> Validation Home</Button>
        <Button variant="secondary" href="/validation/studies">Studies <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/validation/golden">Golden Cases <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
      </div>
    </div>
  );
}

