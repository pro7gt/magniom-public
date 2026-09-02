'use client';

import React from 'react';

export default function HelpGuidancePage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}
        >
          <span className="badge badge-tier1">CLINICIAN USER GUIDE</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Clinical & Scientific Guidance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Reference guide for TMS specialists explaining Magniom workflow phases, evidence tiers,
          spatial reliability, and regulatory safety guardrails (Section 134).
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Card 1: 6-Phase Clinical Sequence */}
        <div className="card">
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            The 6-Phase Clinical Reasoning Sequence
          </h2>
          <ol
            style={{
              paddingLeft: '1.25rem',
              fontSize: '0.8125rem',
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <li>
              <strong>UNDERSTAND:</strong> Review referral indication and clinical baseline symptom
              domains.
            </li>
            <li>
              <strong>QUALIFY:</strong> Confirm symptom priorities and qualify individual MRI/fMRI
              technical quality.
            </li>
            <li>
              <strong>MEASURE:</strong> Inspect patient-specific connectomic anti-correlations and
              reliability regions.
            </li>
            <li>
              <strong>COMPARE:</strong> Evaluate counterfactual displacement against standard group
              priors.
            </li>
            <li>
              <strong>REVIEW:</strong> Scrutinize balanced supporting vs conflicting evidence and
              &quot;Why this may be wrong&quot;.
            </li>
            <li>
              <strong>DECIDE:</strong> Author structured clinical reasoning, attest compliance, and
              digitally sign.
            </li>
          </ol>
        </div>

        {/* Card 2: Evidence Tiers */}
        <div className="card">
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            Evidence Tiers (T1–T4 &amp; T-Exp)
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            <div>
              <span className="badge badge-tier1" style={{ marginRight: '0.5rem' }}>
                Tier 1
              </span>
              <span>
                <strong>Established:</strong> Replicated prospective randomized trials &amp;
                international consensus.
              </span>
            </div>
            <div>
              <span className="badge badge-tier2" style={{ marginRight: '0.5rem' }}>
                Tier 2
              </span>
              <span>
                <strong>Prospectively Supported:</strong> Prospective trials with circuit engagement
                metrics.
              </span>
            </div>
            <div>
              <span className="badge badge-tier3" style={{ marginRight: '0.5rem' }}>
                Tier 3
              </span>
              <span>
                <strong>Retrospectively Supported:</strong> Retrospective cohorts or clinical
                registries.
              </span>
            </div>
            <div>
              <span className="badge badge-tierexp" style={{ marginRight: '0.5rem' }}>
                Tier Exp
              </span>
              <span>
                <strong>Research Only:</strong> Hypothesis-generating. Strictly blocked from
                clinical signing.
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Counterfactual Analysis */}
        <div className="card">
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            Counterfactual Baseline &amp; Geodesic Deltas
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            Whenever Magniom computes a personalized candidate, it renders the evidence-only
            standard group baseline (e.g. standard F3 / BA46) alongside the proposed target.
            Clinicians can inspect the exact Euclidean/geodesic displacement in millimeters and
            expected circuit gains.
          </p>
        </div>

        {/* Card 4: Staleness & Safety Locks */}
        <div className="card">
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            Staleness &amp; Signing Lockouts
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            If a clinician modifies the phenotype or updates scanning runs after a Target Slate has
            been generated, the slate is immediately flagged as <strong>STALE</strong>. Digital
            signing is disabled server-side and in the UI until the slate is regenerated.
          </p>
        </div>
      </div>
    </div>
  );
}
