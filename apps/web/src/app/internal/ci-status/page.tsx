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
  PageHeader,
} from '@/components/ui';

import React from 'react';

// ==========================================
// Internal CI/CD Status Dashboard (§198)
// CI/CD pipeline status for engineering teams.
// ==========================================

export default function InternalCIStatusPage() {
  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Internal', href: '/internal' },
          { label: 'CI Pipeline Status', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <Badge variant="neutral" className="uppercase">
            Internal Engineering
          </Badge>
        }
        title="CI/CD Pipeline Status (§198)"
        subtitle="Continuous integration and deployment pipeline monitoring. Safety-relevant UX changes trigger expanded regression and human-factors impact assessment (§269)."
      />

      <div className="grid grid-cols-auto-fit gap-4">
        <Card className="p-5">
          <CardHeader className="p-0">
            <CardTitle as="h2" className="text-xs text-muted uppercase">
              Build Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-extrabold text-emerald mt-1">PASS</div>
            <span className="text-xs text-secondary">All pipelines green</span>
          </CardContent>
        </Card>
        <Card className="p-5">
          <CardHeader className="p-0">
            <CardTitle as="h2" className="text-xs text-muted uppercase">
              Test Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-extrabold text-cyan mt-1">94.2%</div>
            <span className="text-xs text-secondary">Shell + Authority + Domain</span>
          </CardContent>
        </Card>
        <Card className="p-5">
          <CardHeader className="p-0">
            <CardTitle as="h2" className="text-xs text-muted uppercase">
              Visual Regression
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-2xl font-extrabold text-emerald mt-1">0 Diffs</div>
            <span className="text-xs text-secondary">Safety-critical snapshots</span>
          </CardContent>
        </Card>
      </div>

      <Button variant="secondary" href="/internal/verification">
        <ArrowLeftIcon size={14} className="mr-1 inline" /> Verification Dashboard
      </Button>
    </div>
  );
}
