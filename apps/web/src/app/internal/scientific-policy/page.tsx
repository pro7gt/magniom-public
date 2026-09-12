'use client';

import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardContent,
  ArrowLeftIcon,
  PageHeader,
} from '@/components/ui';

import React from 'react';

// ==========================================
// Internal Scientific Policy Dashboard (§198)
// Scientific policy configuration viewer.
// ==========================================

export default function InternalScientificPolicyPage() {
  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Internal', href: '/internal' },
          { label: 'Scientific Policy', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <Badge variant="neutral" className="uppercase">
            Internal Engineering
          </Badge>
        }
        title="Scientific Policy Configuration (§198)"
        subtitle="Active scientific policies governing module behaviour, evidence eligibility, and target ranking parameters. Never include in ordinary clinician navigation."
      />

      <Card className="p-12 text-center">
        <CardContent>
          <p className="text-secondary text-base m-0">
            Scientific policy administration is managed through the controlled governance workflow.
          </p>
          <p className="text-muted text-sm mt-2 mb-0">
            Active policies are resolved server-side and cannot be modified through the frontend
            interface. Policy changes require requirements impact review, risk review, and
            regression testing (§3).
          </p>
        </CardContent>
      </Card>

      <Button variant="secondary" href="/internal/verification">
        <ArrowLeftIcon size={14} className="mr-1 inline" /> Verification Dashboard
      </Button>
    </div>
  );
}
