'use client';

import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  MicroscopeIcon,
  FlaskConicalIcon,
  PackageIcon,
  ScaleIcon,
  RocketIcon,
  SettingsIcon,
  ArrowRightIcon,
  PageHeader,
} from '@/components/ui';

import React from 'react';

export default function InternalGovernanceHubPage() {
  const dashboards = [
    {
      title: 'Formal Verification & Q-Level Matrix',
      href: '/internal/verification',
      description:
        'Formal verification baseline criteria, module qualification levels (Q0–Q8), and shell invariants.',
      icon: <MicroscopeIcon size={24} className="text-cyan" />,
      badge: 'Specification Conformance',
    },
    {
      title: 'UX Golden Cases Runner',
      href: '/internal/golden-cases',
      description:
        'The 13 Canonical Golden Cases (UX-01 to UX-13) covering MDD, Pain, Stroke, OCD, Tinnitus, and TBI.',
      icon: <FlaskConicalIcon size={24} className="text-cyan" />,
      badge: 'Formative Evaluation',
    },
    {
      title: 'Cryptographic Release Manifests',
      href: '/internal/releases',
      description:
        'Ed25519-signed MagniomReleaseManifestV2 objects, dual authority signatures, and SBOM verification.',
      icon: <PackageIcon size={24} className="text-cyan" />,
      badge: 'Release Governance',
    },
    {
      title: 'Scientific Policy & Hard Gates',
      href: '/internal/scientific-policy',
      description:
        'ScientificPolicyRelease specification, bounded parameter governance, and Gates G0–G9 rules.',
      icon: <ScaleIcon size={24} className="text-cyan" />,
      badge: 'Algorithm Rules',
    },
    {
      title: 'CI/CD Pipeline Status & SLOs',
      href: '/internal/ci-status',
      description:
        '10-stage delivery pipeline, supply chain provenance, automated regression gates, and defect policy.',
      icon: <RocketIcon size={24} className="text-cyan" />,
      badge: 'Enterprise CI/CD',
    },
  ];

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Internal Operations', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <SettingsIcon size={18} className="text-cyan inline" />
            <Badge variant="neutral" className="uppercase">
              Internal Operations
            </Badge>
          </div>
        }
        title="Internal Engineering & Scientific Governance Hub"
        subtitle="Section 190 & Section 198 Canonical Internal Administration and Verification Dashboards"
      />

      <div className="stat-card-grid">
        {dashboards.map(item => (
          <Card key={item.href} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex justify-between items-start mb-3">
                <span className="inline-flex items-center" aria-hidden="true">
                  {item.icon}
                </span>
                <Badge variant="neutral">{item.badge}</Badge>
              </div>
              <CardTitle as="h2" className="text-lg font-semibold text-primary m-0">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-secondary leading-relaxed m-0">{item.description}</p>
            </CardContent>
            <CardFooter className="pt-4">
              <Button
                variant="secondary"
                size="sm"
                href={item.href}
                className="w-full text-center justify-center"
              >
                Open Dashboard <ArrowRightIcon size={14} className="ml-1 inline" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
