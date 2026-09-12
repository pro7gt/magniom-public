'use client';

import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Breadcrumbs,
  CaseNotFoundState,
  ArrowRightIcon,
  ArrowLeftIcon,
  PageHeader,
} from '@/components/ui';

import React, { use, useState, useEffect } from 'react';
import { caseStore } from '../../../../lib/case-store';

export default function AuditPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
    return () => unsubscribe();
  }, [caseId]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
  }

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Audit Trail Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Decision Audit Trail', current: true },
        ]}
      />
      <PageHeader
        title="Cryptographic Audit Log & Decision Hash Verification"
        subtitle="Tamper-evident chronological audit trail for clinical governance and regulatory compliance (IEC 62304 / ISO 14971)."
        actions={
          <div className="flex gap-3">
            <Button variant="secondary" href={`/cases/${caseId}/decision`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Return to Decision
            </Button>
            <Button variant="primary" href={`/cases/${caseId}/targets`}>
              Target Slate Workspace <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </div>
        }
      />

      {/* Decision Integrity Summary Card */}
      <Card className="bg-surface-card border-subtle">
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Cryptographic Integrity & Digital Signature Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid-cards-240 text-sm">
            <div>
              <span className="text-secondary">Phenotype Snapshot Hash:</span>
              <div className="font-mono text-emerald mt-1">
                {record.phenotype.snapshotHash || 'Not Sealed (Draft)'}
              </div>
            </div>
            <div>
              <span className="text-secondary">Target Slate Manifest Hash:</span>
              <div className="font-mono text-cyan mt-1">
                {record.slate.deterministicManifestHash}
              </div>
            </div>
            <div>
              <span className="text-secondary">Decision Digital Signature Hash:</span>
              <div
                className={`font-mono mt-1 ${record.decision?.isImmutable ? 'text-amber' : 'text-muted'}`}
              >
                {record.decision?.digitalSignatureHash || 'Awaiting Specialist Signature'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Event Timeline */}
      <Card>
        <CardHeader>
          <CardTitle as="h2">Chronological Audit Event Stream</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {record.auditEvents.map((evt, idx) => (
              <div key={evt.id} className="audit-event-card">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="neutral">#{idx + 1}</Badge>
                    <strong className="text-cyan text-sm">{evt.eventType}</strong>
                  </div>
                  <pre className="audit-event-json">{JSON.stringify(evt.details, null, 2)}</pre>
                </div>

                <div className="text-right text-xs text-muted font-mono whitespace-nowrap">
                  {new Date(evt.occurredAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
