'use client';

import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardContent,
  TableEmptyRow,
  ArrowRightIcon,
  ArrowLeftIcon,
  PageHeader,
  Alert,
} from '@/components/ui';

import React from 'react';
import { caseStore } from '../../../lib/case-store';

// ==========================================
// Research Cases Registry (§195)
// Research case list with persistent Research shell semantics.
// ==========================================

export default function ResearchCasesPage() {
  const allCases = caseStore.getAllCases();
  const researchCases = allCases.filter(
    c => c.title.toLowerCase().includes('research') || c.code === 'MGN-26-0005',
  );

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Research', href: '/research' },
          { label: 'Research Cases', current: true },
        ]}
      />

      <Alert
        variant="research"
        title="RESEARCH MODE — NOT FOR CLINICAL TARGET DECISIONS:"
        description="All cases in this view operate under Research governance. Clinical decision signing is restricted."
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tierexp">RESEARCH ENVIRONMENT</Badge>
            <Badge variant="neutral">Case Registry</Badge>
          </div>
        }
        title="Research Cases"
        subtitle="Research cases under experimental modules. Experimental outputs must not be used as clinical target authority (§195)."
      />

      <Card>
        <CardContent className="p-0">
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Research Cases">
              <thead>
                <tr>
                  <th scope="col">Case Code</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Research Hypothesis</th>
                  <th scope="col">Module</th>
                  <th scope="col">Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {researchCases.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong className="font-mono text-rose">{c.code}</strong>
                    </td>
                    <td>
                      <Badge variant="neutral">{c.indication}</Badge>
                    </td>
                    <td>{c.title}</td>
                    <td className="text-sm text-secondary">Research Module</td>
                    <td>
                      <Badge variant="tierexp">Research Only</Badge>
                    </td>
                    <td>
                      <Button variant="secondary" href={`/cases/${c.id}`} className="p-1 text-xs">
                        Open <ArrowRightIcon size={14} className="ml-1 inline" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {researchCases.length === 0 && (
                  <TableEmptyRow
                    colSpan={6}
                    message="No research cases currently registered."
                    subMessage="Active research protocols and cases will be displayed here."
                  />
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" href="/research">
          <ArrowLeftIcon size={14} className="mr-1 inline" /> Research Home
        </Button>
        <Button variant="secondary" href="/research/modules">
          Research Modules <ArrowRightIcon size={14} className="ml-1 inline" />
        </Button>
      </div>
    </div>
  );
}
