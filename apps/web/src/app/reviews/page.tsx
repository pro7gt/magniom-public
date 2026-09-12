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
import Link from 'next/link';
import { caseStore } from '../../lib/case-store';

export default function ReviewsWorklistPage() {
  const allCases = caseStore.getAllCases();
  const queueCases = allCases.filter(
    c => c.state === 'target_slate_ready' || c.state === 'phenotype_ready' || c.isStale,
  );

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Clinician Review Worklist', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier3">ACTIONABLE QUEUE</Badge>
            <Badge variant="neutral">{queueCases.length} Cases Pending</Badge>
          </div>
        }
        title="Clinician Review & Sign-Off Worklist (§190)"
        subtitle="Active cases requiring clinical phenotype approval, target slate comparison, or electronic decision sign-off."
        actions={
          <Button variant="secondary" href="/cases">
            All Cases Registry
          </Button>
        }
      />

      <Card className="p-4 bg-glass-subtle">
        <CardContent className="p-0">
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Awaiting Review Cases Table">
              <thead>
                <tr>
                  <th scope="col" className="p-3">
                    Case Code
                  </th>
                  <th scope="col" className="p-3">
                    Indication
                  </th>
                  <th scope="col" className="p-3">
                    Pending Review Task
                  </th>
                  <th scope="col" className="p-3">
                    Status
                  </th>
                  <th scope="col" className="p-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {queueCases.length === 0 && (
                  <TableEmptyRow
                    colSpan={5}
                    message="No clinical cases currently pending review."
                    subMessage="All active cases have completed clinical targets and signed decisions."
                  />
                )}
                {queueCases.map(c => (
                  <tr key={c.id} className="border-b border-subtle">
                    <td className="p-3 font-mono font-semibold">
                      <Link href={`/cases/${c.id}`} className="text-cyan">
                        {c.code}
                      </Link>
                    </td>
                    <td className="p-3">
                      <Badge variant="neutral">{c.indication}</Badge>
                    </td>
                    <td className="p-3 text-sm">
                      {c.isStale
                        ? 'Stale Slate Regeneration Required'
                        : c.state === 'phenotype_ready'
                          ? 'Phenotype Approval Pending'
                          : 'Target Slate Decision Required'}
                    </td>
                    <td className="p-3">
                      {c.isStale ? (
                        <Badge variant="tier3">Stale</Badge>
                      ) : (
                        <Badge variant="tier2">Action Req</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <Button
                        variant="primary"
                        size="sm"
                        href={`/cases/${c.id}/targets`}
                        className="text-xs"
                      >
                        Review Targets <ArrowRightIcon size={14} className="ml-1 inline" />
                      </Button>
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
