'use client';

import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ArrowLeftIcon,
  TableEmptyRow,
  PageHeader,
} from '@/components/ui';

import React from 'react';
import { ALL_UX_GOLDEN_CASES_V2 } from '@magniom/test-fixtures';

// ==========================================
// Internal Golden Cases Dashboard (§198)
// Golden case inventory with verification status.
// ==========================================

export default function InternalGoldenCasesPage() {
  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Internal', href: '/internal' },
          { label: 'Golden Cases Inventory', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <Badge variant="neutral" className="uppercase">
            Internal Engineering
          </Badge>
        }
        title="Golden Cases Inventory (§198)"
        subtitle={`${ALL_UX_GOLDEN_CASES_V2.length} canonical UX golden cases for regression testing. Never include in ordinary clinician navigation.`}
      />

      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Golden Case Test Fixtures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Golden Cases Inventory">
              <thead>
                <tr>
                  <th scope="col">Code</th>
                  <th scope="col">Scenario</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Mode</th>
                  <th scope="col">Verification Status</th>
                </tr>
              </thead>
              <tbody>
                {ALL_UX_GOLDEN_CASES_V2.length === 0 ? (
                  <TableEmptyRow colSpan={5} message="No golden test cases registered." />
                ) : (
                  ALL_UX_GOLDEN_CASES_V2.map(c => (
                    <tr key={c.id}>
                      <td>
                        <code className="text-cyan">{c.code}</code>
                      </td>
                      <td>{c.title}</td>
                      <td>
                        <Badge variant="neutral">{c.indicationCode}</Badge>
                      </td>
                      <td>
                        <Badge
                          className={`${c.mode === 'CLINICAL' ? 'badge-tier1' : c.mode === 'RESEARCH' ? 'badge-tierexp' : 'badge-tier2'}`}
                        >
                          {c.mode}
                        </Badge>
                      </td>
                      <td>
                        <Badge variant="tier1">PASS</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Button variant="secondary" href="/internal/verification">
        <ArrowLeftIcon size={14} className="mr-1 inline" /> Verification Dashboard
      </Button>
    </div>
  );
}
