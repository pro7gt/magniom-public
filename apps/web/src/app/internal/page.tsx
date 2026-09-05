'use client';

import React from 'react';
import Link from 'next/link';

export default function InternalGovernanceHubPage() {
  const dashboards = [
    {
      title: 'Formal Verification & Q-Level Matrix',
      href: '/internal/verification',
      description:
        'Formal verification baseline criteria, module qualification levels (Q0–Q8), and shell invariants.',
      icon: '🔬',
      badge: 'Specification Conformance',
    },
    {
      title: 'UX Golden Cases Runner',
      href: '/internal/golden-cases',
      description:
        'The 13 Canonical Golden Cases (UX-01 to UX-13) covering MDD, Pain, Stroke, OCD, Tinnitus, and TBI.',
      icon: '🧪',
      badge: 'Formative Evaluation',
    },
    {
      title: 'Cryptographic Release Manifests',
      href: '/internal/releases',
      description:
        'Ed25519-signed MagniomReleaseManifestV2 objects, dual authority signatures, and SBOM verification.',
      icon: '📦',
      badge: 'Release Governance',
    },
    {
      title: 'Scientific Policy & Hard Gates',
      href: '/internal/scientific-policy',
      description:
        'ScientificPolicyRelease specification, bounded parameter governance, and Gates G0–G9 rules.',
      icon: '⚖️',
      badge: 'Algorithm Rules',
    },
    {
      title: 'CI/CD Pipeline Status & SLOs',
      href: '/internal/ci-status',
      description:
        '10-stage delivery pipeline, supply chain provenance, automated regression gates, and defect policy.',
      icon: '🚀',
      badge: 'Enterprise CI/CD',
    },
  ];

  return (
    <div className="internal-hub-workspace" style={{ padding: '32px' }}>
      <header style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>⚙️</span>
          <div>
            <h1
              style={{ margin: 0, fontSize: '1.6rem', color: 'var(--text-main)', fontWeight: 700 }}
            >
              Internal Engineering & Scientific Governance Hub
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '4px 0 0' }}>
              Section 190 &amp; Section 198 Canonical Internal Administration and Verification
              Dashboards
            </p>
          </div>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {dashboards.map(item => (
          <article
            key={item.href}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'border-color 0.2s',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}
              >
                <span style={{ fontSize: '1.75rem' }} aria-hidden="true">
                  {item.icon}
                </span>
                <span className="badge badge-neutral">{item.badge}</span>
              </div>
              <h2
                style={{
                  margin: '0 0 8px',
                  fontSize: '1.15rem',
                  color: 'var(--text-main)',
                  fontWeight: 600,
                }}
              >
                {item.title}
              </h2>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  margin: '0 0 20px',
                }}
              >
                {item.description}
              </p>
            </div>

            <div>
              <Link
                href={item.href}
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Open Dashboard →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
