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
import { ALL_UX_GOLDEN_CASES_V2 } from '@magniom/test-fixtures';

// ==========================================
// Golden Cases Verification (§196, §250–262)
// Golden case verification status dashboard.
// ==========================================

export default function GoldenCasesPage() {
  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Validation', href: '/validation' },
          { label: 'Golden Cases', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier2">VALIDATION ENVIRONMENT</Badge>
            <Badge variant="neutral">Golden Cases</Badge>
          </div>
        }
        title="UX Golden Cases"
        subtitle="Canonical test fixtures for shell verification, human-factors testing, and safety invariant regression (§250–262)."
      />


      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Golden Case Test Fixtures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Golden Cases">
              <thead>
                <tr>
                  <th scope="col">Case Code</th>
                  <th scope="col">Scenario</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Mode</th>
                  <th scope="col">Safety Invariant</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {ALL_UX_GOLDEN_CASES_V2.length === 0 ? (
                  <TableEmptyRow
                    colSpan={6}
                    message="No golden cases found."
                  />
                ) : (
                  ALL_UX_GOLDEN_CASES_V2.map(c => (
                    <tr key={c.id}>
                      <td><strong className="font-mono text-cyan">{c.code}</strong></td>
                      <td>{c.title}</td>
                      <td><Badge variant="neutral">{c.indicationCode}</Badge></td>
                      <td>
                        <Badge className={`${c.mode === 'CLINICAL' ? 'badge-tier1' : c.mode === 'RESEARCH' ? 'badge-tierexp' : 'badge-tier2'}`}>
                          {c.mode}
                        </Badge>
                      </td>
                      <td className="text-xs text-secondary">
                        {c.isStale ? 'Blocking Staleness' : c.isContradictory ? 'Fail-Closed' : c.isBlindedValidation ? 'Silent Prospective' : c.mode === 'RESEARCH' ? 'Signing Prohibited' : 'Standard'}
                      </td>
                      <td>
                        <Button variant="secondary" href={`/cases/${c.id}`} className="p-1 text-xs">Inspect <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
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
        <Button variant="secondary" href="/validation/studies">Studies <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/validation/modules">Module Qualification <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
      </div>
    </div>
  );
}
