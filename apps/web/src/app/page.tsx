'use client';

import React from 'react';
import Link from 'next/link';
import { caseStore } from '../lib/case-store';
import { CANONICAL_CLINICAL_SESSION } from '../lib/release-authority';

export default function ClinicianHomePage() {
  const allCases = caseStore.getAllCases();
  const session = CANONICAL_CLINICAL_SESSION;

  // Filter urgent / actionable cases
  const activeCases = allCases.slice(0, 5);
  const urgentCase = allCases.find((c) => c.id === 'case-ux-g01') || allCases[0];

  return (
    <div className="clinician-home-container">
      {/* 1. Clinician Greeting & Summary Hero (§74, §154) */}
      <section className="home-hero-section" aria-labelledby="home-greeting-heading">
        <div className="home-hero-header">
          <div className="greeting-group">
            <span className="greeting-time-badge">Specialist Clinical Worklist</span>
            <h1 id="home-greeting-heading" className="greeting-title">
              Good evening, {session.user.displayName}
            </h1>
            <p className="greeting-subtitle">
              <strong>3 clinical cases</strong> require specialist target review and formulation approval today.
            </p>
          </div>

          <div className="hero-quick-actions">
            <Link href="/cases" className="btn btn-secondary" id="view-all-cases-hero-btn">
              View All Cases (9)
            </Link>
            <Link href="/awaiting-review" className="btn btn-secondary">
              Review Queue <span className="badge badge-tier3 badge-tiny">3</span>
            </Link>
          </div>
        </div>

        {/* Hero Action Card: Most Urgent Active Case (§74, §154) */}
        {urgentCase && (
          <div className="urgent-case-hero-card" aria-label="Prioritized Clinical Case">
            <div className="urgent-card-header">
              <div className="urgent-card-tags">
                <span className="badge badge-tier1">PRIORITY 1 ACTION</span>
                <span className="badge badge-neutral" style={{ fontFamily: 'var(--font-mono)' }}>
                  {urgentCase.code}
                </span>
                <span className="badge badge-neutral">{urgentCase.indication}</span>
              </div>
              <span className="urgent-time-meta">Updated today · Ready for review</span>
            </div>

            <div className="urgent-card-body">
              <h2 className="urgent-card-title">
                Target Slate Ready for Specialist Clinician Review
              </h2>
              <p className="urgent-card-description">
                <strong>{urgentCase.title}:</strong> High-convergence MDD profile with verified sgACC anti-correlation. Evidence baseline and patient-specific connectomic refinement qualified.
              </p>
            </div>

            <div className="urgent-card-footer">
              <div className="urgent-card-meta">
                <span>Phenotype: <strong className="text-emerald">Approved (SHA-256)</strong></span>
                <span>•</span>
                <span>Connectome: <strong className="text-emerald">Qualified (27.4m BOLD)</strong></span>
                <span>•</span>
                <span>Candidates: <strong className="text-cyan">3 Hypotheses</strong></span>
              </div>
              <div className="urgent-card-actions">
                <Link
                  href={`/cases/${urgentCase.id}`}
                  className="btn btn-secondary"
                  id="urgent-case-overview-btn"
                >
                  Case Overview
                </Link>
                <Link
                  href={`/cases/${urgentCase.id}/targets`}
                  className="btn btn-primary"
                  id="continue-target-review-btn"
                >
                  Continue Target Review →
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2. Actionable Worklist Cards: Needs Your Attention (§74, §75) */}
      <section className="home-worklist-section" aria-labelledby="worklist-heading">
        <div className="section-header">
          <h2 id="worklist-heading" className="section-title">
            Needs Your Attention
          </h2>
          <span className="section-count-badge">3 Actionable Queues</span>
        </div>

        <div className="worklist-cards-grid">
          {/* Action Card 1: Phenotype Formulation */}
          <div className="worklist-action-card">
            <div className="card-top-meta">
              <span className="badge badge-tier3">PHENOTYPE CONFIRMATION</span>
              <span className="card-case-code">MGN-26-0002</span>
            </div>
            <h3 className="card-action-title">Phenotype Formulation Awaiting Clinician Gating</h3>
            <p className="card-action-text">
              Anxious Depression dual-circuit profile requires specialist priority sign-off prior to Target Slate generation.
            </p>
            <div className="card-action-footer">
              <span className="card-status-label">Anxious Distress • GAD-7: 16</span>
              <Link href="/cases/case-ux-g02/phenotype" className="btn btn-secondary btn-sm">
                Review Phenotype →
              </Link>
            </div>
          </div>

          {/* Action Card 2: Low Reliability Connectome */}
          <div className="worklist-action-card">
            <div className="card-top-meta">
              <span className="badge badge-tier3">CONNECTOME QUALIFICATION</span>
              <span className="card-case-code">MGN-26-0003</span>
            </div>
            <h3 className="card-action-title">Low Reliability Connectome Warning Review</h3>
            <p className="card-action-text">
              Elevated motion artifacts flagged during resting-state scan. Requires specialist review of evidence-only fallback.
            </p>
            <div className="card-action-footer">
              <span className="card-status-label">Low Reliability • Fallback Active</span>
              <Link href="/cases/case-ux-g03/connectome" className="btn btn-secondary btn-sm">
                Inspect Connectome →
              </Link>
            </div>
          </div>

          {/* Action Card 3: Stale Target Slate */}
          <div className="worklist-action-card stale-card">
            <div className="card-top-meta">
              <span className="badge badge-tier3">STALE TARGET SLATE</span>
              <span className="card-case-code">MGN-26-0006</span>
            </div>
            <h3 className="card-action-title">Target Slate Predates Phenotype Update</h3>
            <p className="card-action-text">
              Clinical phenotype was re-approved with updated severity weights. Slate must be regenerated before signing.
            </p>
            <div className="card-action-footer">
              <span className="card-status-label text-amber">Sign Lockout Active</span>
              <Link href="/cases/case-ux-g06/targets" className="btn btn-primary btn-sm">
                Regenerate Slate →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recent Clinical Cases Registry (§74, §154) */}
      <section className="home-recent-cases-section" aria-labelledby="recent-cases-heading">
        <div className="section-header">
          <div>
            <h2 id="recent-cases-heading" className="section-title">
              Recent Clinical Cases
            </h2>
            <p className="section-subtitle">
              Active cases in your clinical service with verified neuroimaging and phenotype records.
            </p>
          </div>
          <Link href="/cases" className="btn btn-secondary btn-sm">
            View All Cases Registry →
          </Link>
        </div>

        <div className="card cases-table-card">
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Recent Clinical Cases Table">
              <thead>
                <tr>
                  <th scope="col">Case Code</th>
                  <th scope="col">Case Title</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Clinical Stage</th>
                  <th scope="col">Slate Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeCases.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        {c.code}
                      </strong>
                    </td>
                    <td>{c.title}</td>
                    <td>
                      <span className="badge badge-neutral">{c.indication}</span>
                    </td>
                    <td>
                      <span className="badge badge-tier1">{c.state}</span>
                    </td>
                    <td>
                      {c.isStale ? (
                        <span className="badge badge-tier3">STALE SLATE</span>
                      ) : (
                        <span className="badge badge-tier1">CURRENT</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          href={`/cases/${c.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Overview
                        </Link>
                        <Link
                          href={`/cases/${c.id}/targets`}
                          className="btn btn-primary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                        >
                          Target Slate →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
