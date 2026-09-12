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
  TableEmptyRow,
  PageHeader,
  Alert,
} from '@/components/ui';

import React from 'react';
import { caseStore } from '../../lib/case-store';

export default function ResearchWorkspacePage() {
  const allCases = caseStore.getAllCases();
  const researchCases = allCases.filter(
    c => c.title.toLowerCase().includes('research') || c.code === 'MGN-26-0005',
  );

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Research Workspace', current: true },
        ]}
      />

      {/* Research Mode Warning Banner (§13, §155) */}
      <Alert
        variant="research"
        title="RESEARCH MODE — NOT FOR CLINICAL USE:"
        description="Experimental neuroimaging and exploratory circuit targets. Clinical decision signing is strictly restricted in this environment."
      />

      <PageHeader
        eyebrow={<Badge variant="tierexp">RESEARCH ENVIRONMENT</Badge>}
        title="Research & Exploratory Neuroimaging Workspace"
        subtitle="Experimental connectomic hypotheses, novel symptom-to-circuit formulations, and Tier-Exp exploratory targets (Section 32)."
      />

      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Active Research Cases
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Research Cases Table">
              <thead>
                <tr>
                  <th scope="col">Case Code</th>
                  <th scope="col">Research Hypothesis</th>
                  <th scope="col">Modality</th>
                  <th scope="col">Safety Constraints</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {researchCases.length === 0 ? (
                  <TableEmptyRow
                    colSpan={5}
                    message="No active research cases found."
                    subMessage="New exploratory neuroimaging cases can be provisioned through the Intake Workspace."
                  />
                ) : (
                  researchCases.map(c => (
                    <tr key={c.id}>
                      <td>
                        <strong className="font-mono text-rose">{c.code}</strong>
                      </td>
                      <td>{c.title}</td>
                      <td>
                        <Badge variant="neutral">rs-fMRI BOLD + DTI</Badge>
                      </td>
                      <td>
                        <Badge variant="tierexp">Clinical Sign Lockout</Badge>
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          href={`/cases/${c.id}/targets`}
                          className="p-1 text-xs"
                        >
                          Open Research Slate <ArrowRightIcon size={14} className="ml-1 inline" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
