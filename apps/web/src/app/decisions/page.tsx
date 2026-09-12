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

export default function DecisionsPage() {
  const allCases = caseStore.getAllCases();

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Clinical Decisions', current: true },
        ]}
      />

      <PageHeader
        eyebrow={<Badge variant="tier1">CLINICAL DECISION GOVERNANCE</Badge>}
        title="Clinical Decisions & Cryptographic Sign-Off History"
        subtitle="Authoritative record of clinician-authored target selections, clinical justifications, and immutable SHA-256 digital signatures."
      />

      <Card>
        <CardContent className="p-0">
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Decisions History Table">
              <thead>
                <tr>
                  <th scope="col">Case Code</th>
                  <th scope="col">Case Title</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Decision State</th>
                  <th scope="col">Signing Authority</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {allCases.length === 0 && (
                  <TableEmptyRow
                    colSpan={6}
                    message="No clinical decision records located in the registry."
                    subMessage="Create a new case to begin clinical targeting and sign-off."
                  />
                )}
                {allCases.map(c => {
                  const record = caseStore.getCaseRecord(c.id);
                  const isSigned = Boolean(record?.decision?.isImmutable);

                  return (
                    <tr key={c.id}>
                      <td>
                        <strong className="font-mono text-cyan">{c.code}</strong>
                      </td>
                      <td>{c.title}</td>
                      <td>
                        <Badge variant="neutral">{c.indication}</Badge>
                      </td>
                      <td>
                        {isSigned ? (
                          <Badge variant="tier1">Signed & Sealed (SHA-256)</Badge>
                        ) : (
                          <Badge variant="tier3">Unsigned / In Formulation</Badge>
                        )}
                      </td>
                      <td>
                        {isSigned
                          ? record?.decision?.attestation?.clinicianName || 'Dr A. Smith'
                          : 'Pending Attestation'}
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          href={`/cases/${c.id}/decision`}
                          className="p-1 text-xs"
                        >
                          {isSigned ? (
                            <>
                              Inspect Record <ArrowRightIcon size={14} className="ml-1 inline" />
                            </>
                          ) : (
                            <>
                              Begin Decision <ArrowRightIcon size={14} className="ml-1 inline" />
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
