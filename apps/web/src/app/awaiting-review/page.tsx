'use client';

import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardContent,
  ArrowRightIcon,
  TableEmptyRow,
  PageHeader,
} from '@/components/ui';

import React from 'react';
import { caseStore } from '../../lib/case-store';

export default function AwaitingReviewPage() {
  const allCases = caseStore.getAllCases();
  const queueCases = allCases.filter(
    c => c.state === 'target_slate_ready' || c.state === 'phenotype_ready' || c.isStale,
  );

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Awaiting Review', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier3">ACTIONABLE QUEUE</Badge>
            <Badge variant="neutral">{queueCases.length} Cases Pending</Badge>
          </div>
        }
        title="Awaiting Specialist Clinician Review"
        subtitle="Cases prioritized for specialist targeting review, phenotype verification, or treatment formulation sign-off."
      />

      <Card>
        <CardContent className="p-0">
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Awaiting Review Cases Table">
              <thead>
                <tr>
                  <th scope="col">Case Code</th>
                  <th scope="col">Case Title / Indication</th>
                  <th scope="col">Review Action</th>
                  <th scope="col">Priority</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {queueCases.length === 0 && (
                  <TableEmptyRow
                    colSpan={5}
                    message="No cases awaiting review."
                    subMessage="All active clinical cases are up to date."
                  />
                )}
                {queueCases.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong className="font-mono text-cyan">{c.code}</strong>
                    </td>
                    <td>
                      <strong>{c.title}</strong>
                      <div className="text-xs text-secondary">{c.indication}</div>
                    </td>
                    <td>
                      {c.isStale ? (
                        <Badge variant="tier3">Stale Slate Regeneration</Badge>
                      ) : c.state === 'phenotype_ready' ? (
                        <Badge variant="tier2">Phenotype Approval Required</Badge>
                      ) : (
                        <Badge variant="tier1">Target Slate Review Ready</Badge>
                      )}
                    </td>
                    <td>
                      {c.isStale ? (
                        <Badge variant="tierexp">URGENT</Badge>
                      ) : (
                        <Badge variant="neutral">NORMAL</Badge>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          href={`/cases/${c.id}/targets`}

                          className="p-1 text-xs"
                        >
                          Enter Review <ArrowRightIcon size={14} className="ml-1 inline" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
