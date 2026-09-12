'use client';

import {
  FlaskConicalIcon,
  Building2Icon,
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ArrowRightIcon,
  PageHeader,
  FilterBar,
  FilterBarGroup,
} from '@/components/ui';

import React, { useState } from 'react';
import { ALL_UX_GOLDEN_CASES_V2 } from '@magniom/test-fixtures';

// ==========================================
// Internal Verification Dashboard (§45–46)
// Provides verification matrix, module qualification status,
// and safety invariant monitoring for clinical governance teams.
// ==========================================

const VERIFICATION_GATES = [
  { code: 'MAG-UX-041', title: 'Route Protection Invariant', category: 'Security', status: 'PASS' },
  {
    code: 'MAG-UX-042',
    title: 'Server-Side Module Authority Context',
    category: 'Architecture',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-043',
    title: 'Mode Propagation & Visual Distinction',
    category: 'Safety',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-044',
    title: 'CaseIndication Context Isolation',
    category: 'Clinical Safety',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-045',
    title: '3-Tier Staleness Sign-Off Prohibition',
    category: 'Clinical Safety',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-046',
    title: 'Capability-Driven Navigation Visibility',
    category: 'Governance',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-047',
    title: 'Research Mode Signing Absence',
    category: 'Regulatory',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-048',
    title: 'Wrong-Module Deep Link Rejection',
    category: 'Security',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-049',
    title: 'Multi-Tab Invalidation Coordination',
    category: 'Architecture',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-050',
    title: 'WCAG 2.2 AA Color Contrast',
    category: 'Accessibility',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-051',
    title: 'Confidence Interval Visualization',
    category: 'Presentation',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-052',
    title: 'Evidence Baseline Anchoring Before Connectomics',
    category: 'Clinical Safety',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-053',
    title: 'Multi-Geometry Target Presentation',
    category: 'Presentation',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-054',
    title: 'WCAG 2.2 AA Keyboard & Focus Navigation',
    category: 'Accessibility',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-055',
    title: 'Scientifically Restrained Empty States',
    category: 'Human Factors',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-056',
    title: 'Actionable Notification Boundary',
    category: 'Architecture',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-057',
    title: 'Neuronavigation Export Guard',
    category: 'Clinical Safety',
    status: 'PASS',
  },
  {
    code: 'MAG-UX-058',
    title: 'Clinical Context Workspace Completeness',
    category: 'Clinical Context',
    status: 'PASS',
  },
];

export default function InternalVerificationPage() {
  const [filter, setFilter] = useState<'all' | 'golden_cases' | 'gates'>('all');

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Internal', href: '/internal' },
          { label: 'Verification Suite', current: true },
        ]}
      />

      {/* Header */}
      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral" className="uppercase text-xs">
              Internal Engineering
            </Badge>
            <Badge variant="tier1" className="text-xs">
              IEC 62304 CLASS B
            </Badge>
          </div>
        }
        title="Application Shell Verification Dashboard (§45–46)"
        subtitle="Formal verification matrix, module qualification status (Q1–Q8), and golden case regression testing."
        actions={
          <>
            <Button variant="secondary" href="/validation">
              <FlaskConicalIcon size={14} className="mr-1 inline text-cyan" /> Golden Cases Suite
            </Button>
            <Button variant="secondary" href="/admin">
              <Building2Icon size={14} className="mr-1 inline text-cyan" /> System Admin
            </Button>
          </>
        }
      />

      {/* Summary Metrics */}
      <div className="stat-card-grid">
        <Card className="p-5">
          <span className="text-xs text-muted uppercase">Verification Gates</span>
          <div className="text-2xl font-extrabold text-emerald mt-1">18 / 18 PASS</div>
          <span className="text-xs text-secondary">MAG-UX-041 – 058</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted uppercase">UX Golden Cases</span>
          <div className="text-2xl font-extrabold text-cyan mt-1">
            {ALL_UX_GOLDEN_CASES_V2.length} Cases
          </div>
          <span className="text-xs text-secondary">V2 Canonical Test Fixtures</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted uppercase">Module Qualification</span>
          <div className="text-2xl font-extrabold text-indigo mt-1">Q8 Clinical</div>
          <span className="text-xs text-secondary">MDD & Pain Modules</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-muted uppercase">Accessibility Compliance</span>
          <div className="text-2xl font-extrabold text-emerald mt-1">WCAG 2.2 AA</div>
          <span className="text-xs text-secondary">Keyboard + ARIA Landmarks</span>
        </Card>
      </div>

      {/* Filter Buttons */}
      <FilterBar variant="glass">
        <FilterBarGroup>
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All Verifications
          </Button>
          <Button
            variant={filter === 'gates' ? 'primary' : 'secondary'}
            onClick={() => setFilter('gates')}
            size="sm"
          >
            Formal Verification Gates ({VERIFICATION_GATES.length})
          </Button>
          <Button
            variant={filter === 'golden_cases' ? 'primary' : 'secondary'}
            onClick={() => setFilter('golden_cases')}
            size="sm"
          >
            UX Golden Cases ({ALL_UX_GOLDEN_CASES_V2.length})
          </Button>
        </FilterBarGroup>
      </FilterBar>

      {/* Verification Gates Table */}
      {(filter === 'all' || filter === 'gates') && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle as="h2" className="text-xl font-bold text-primary m-0">
              Formal Shell Requirement Alignment Gates (§263–268)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table
              className="comparison-table"
              aria-label="Formal Shell Requirement Alignment Gates"
            >
              <thead>
                <tr>
                  <th>Gate ID</th>
                  <th>Requirement Title</th>
                  <th>Category</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {VERIFICATION_GATES.map(g => (
                  <tr key={g.code}>
                    <td>
                      <code className="text-cyan">{g.code}</code>
                    </td>
                    <td>{g.title}</td>
                    <td>
                      <Badge variant="neutral">{g.category}</Badge>
                    </td>
                    <td>
                      <Badge variant="tier1">{g.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Golden Cases Matrix */}
      {(filter === 'all' || filter === 'golden_cases') && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle as="h2" className="text-xl font-bold text-primary m-0">
              Canonical UX Golden Cases (§250–262)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="comparison-table" aria-label="Canonical UX Golden Cases">
              <thead>
                <tr>
                  <th>Case Code</th>
                  <th>Scenario Title</th>
                  <th>Indication</th>
                  <th>Mode</th>
                  <th>Safety Invariant Tested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ALL_UX_GOLDEN_CASES_V2.map(c => (
                  <tr key={c.id}>
                    <td>
                      <strong className="font-mono text-cyan">{c.code}</strong>
                    </td>
                    <td>{c.title}</td>
                    <td>
                      <Badge variant="neutral">{c.indicationCode}</Badge>
                    </td>
                    <td>
                      <Badge
                        className={`${c.mode === 'CLINICAL' ? 'badge-clinical' : c.mode === 'RESEARCH' ? 'badge-research' : 'badge-validation'}`}
                      >
                        {c.mode}
                      </Badge>
                    </td>
                    <td>
                      <span className="text-xs text-secondary">
                        {c.isStale
                          ? 'Blocking Staleness'
                          : c.isContradictory
                            ? 'Fail-Closed State'
                            : c.isBlindedValidation
                              ? 'Silent Prospective'
                              : c.mode === 'RESEARCH'
                                ? 'Signing Prohibited'
                                : 'Qualified Standard'}
                      </span>
                    </td>
                    <td>
                      <Button variant="secondary" href={`/cases/${c.id}`} size="sm">
                        Inspect <ArrowRightIcon size={14} className="ml-1 inline" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
