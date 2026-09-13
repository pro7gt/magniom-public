'use client';

import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ArrowRightIcon,
  TableEmptyRow,
  PageHeader,
} from '@/components/ui';

import React, { useState, useEffect } from 'react';
import { caseStore } from '../lib/case-store';
import { CANONICAL_CLINICAL_SESSION } from '../lib/release-authority';
import { authStore, type ClinicianAuthSession } from '../lib/auth-store';

export default function ClinicianHomePage() {
  const allCases = caseStore.getAllCases();
  const [activeSession, setActiveSession] = useState<ClinicianAuthSession | null>(() =>
    authStore.getAuthSession(),
  );

  useEffect(() => {
    setActiveSession(authStore.getAuthSession());
    const unsubscribe = authStore.subscribe(updated => {
      setActiveSession(updated);
    });
    return () => unsubscribe();
  }, []);

  const session = activeSession || CANONICAL_CLINICAL_SESSION;

  // Filter urgent / actionable cases
  const activeCases = allCases.slice(0, 5);
  const urgentCase = allCases.find(c => c.id === 'case-ux-g01') || allCases[0];

  return (
    <div className="container page-container-col clinician-home-container">
      {/* 1. Clinician Greeting & Summary Hero (§74, §154) */}
      <section className="home-hero-section" aria-labelledby="home-greeting-heading">
        <PageHeader
          className="home-hero-header"
          eyebrow={
            <Badge variant="clinical" className="greeting-time-badge">
              Specialist Clinical Worklist
            </Badge>
          }
          title={<span id="home-greeting-heading">Good evening, {session.user.displayName}</span>}
          subtitle={
            <span>
              <strong>3 clinical cases</strong> require specialist target review and formulation
              approval today.
            </span>
          }
          actions={
            <div className="hero-quick-actions">
              <Button variant="secondary" href="/cases" id="view-all-cases-hero-btn">
                View All Cases (9)
              </Button>
              <Button variant="secondary" href="/awaiting-review">
                Review Queue{' '}
                <Badge variant="tier3" size="sm">
                  3
                </Badge>
              </Button>
            </div>
          }
        />

        {/* Hero Action Card: Most Urgent Active Case (§74, §154) */}
        {urgentCase && (
          <Card className="urgent-case-hero-card" aria-label="Prioritized Clinical Case">
            <CardHeader className="urgent-card-header">
              <div className="urgent-card-tags">
                <Badge variant="tier1">PRIORITY 1 ACTION</Badge>
                <Badge variant="neutral" className="font-mono">
                  {urgentCase.code}
                </Badge>
                <Badge variant="neutral">{urgentCase.indication}</Badge>
              </div>
              <span className="urgent-time-meta">Updated today · Ready for review</span>
            </CardHeader>

            <CardContent className="urgent-card-body">
              <CardTitle as="h2" className="urgent-card-title">
                Target Slate Ready for Specialist Clinician Review
              </CardTitle>
              <CardDescription className="urgent-card-description">
                <strong>{urgentCase.title}:</strong> High-convergence MDD profile with verified
                sgACC anti-correlation. Evidence baseline and patient-specific connectomic
                refinement qualified.
              </CardDescription>
            </CardContent>

            <CardFooter className="urgent-card-footer">
              <div className="urgent-card-meta">
                <span>
                  Phenotype: <strong className="text-emerald">Approved (SHA-256)</strong>
                </span>
                <span>•</span>
                <span>
                  Connectome: <strong className="text-emerald">Qualified (27.4m BOLD)</strong>
                </span>
                <span>•</span>
                <span>
                  Candidates: <strong className="text-cyan">3 Hypotheses</strong>
                </span>
              </div>
              <div className="urgent-card-actions">
                <Button
                  variant="secondary"
                  href={`/cases/${urgentCase.id}`}
                  id="urgent-case-overview-btn"
                >
                  Case Overview
                </Button>
                <Button
                  variant="primary"
                  href={`/cases/${urgentCase.id}/targets`}
                  id="continue-target-review-btn"
                >
                  Continue Target Review <ArrowRightIcon size={14} className="ml-1 inline" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </section>

      {/* 2. Actionable Worklist Cards: Needs Your Attention (§74, §75) */}
      <section className="home-worklist-section" aria-labelledby="worklist-heading">
        <div className="section-header">
          <h2 id="worklist-heading" className="section-title">
            Needs Your Attention
          </h2>
          <Badge variant="neutral" className="section-count-badge">
            3 Actionable Queues
          </Badge>
        </div>

        <div className="worklist-cards-grid">
          {/* Action Card 1: Phenotype Formulation */}
          <Card className="worklist-action-card">
            <CardHeader className="card-top-meta">
              <Badge variant="tier3">PHENOTYPE CONFIRMATION</Badge>
              <span className="card-case-code">MGN-26-0002</span>
            </CardHeader>
            <CardContent>
              <CardTitle as="h3" className="card-action-title">
                Phenotype Formulation Awaiting Clinician Gating
              </CardTitle>
              <CardDescription className="card-action-text">
                Anxious Depression dual-circuit profile requires specialist priority sign-off prior
                to Target Slate generation.
              </CardDescription>
            </CardContent>
            <CardFooter className="card-action-footer">
              <span className="card-status-label">Anxious Distress • GAD-7: 16</span>
              <Button variant="secondary" size="sm" href="/cases/case-ux-g02/phenotype">
                Review Phenotype <ArrowRightIcon size={14} className="ml-1 inline" />
              </Button>
            </CardFooter>
          </Card>

          {/* Action Card 2: Low Reliability Connectome */}
          <Card className="worklist-action-card">
            <CardHeader className="card-top-meta">
              <Badge variant="tier3">CONNECTOME QUALIFICATION</Badge>
              <span className="card-case-code">MGN-26-0003</span>
            </CardHeader>
            <CardContent>
              <CardTitle as="h3" className="card-action-title">
                Low Reliability Connectome Warning Review
              </CardTitle>
              <CardDescription className="card-action-text">
                Elevated motion artifacts flagged during resting-state scan. Requires specialist
                review of evidence-only fallback.
              </CardDescription>
            </CardContent>
            <CardFooter className="card-action-footer">
              <span className="card-status-label">Low Reliability • Fallback Active</span>
              <Button variant="secondary" size="sm" href="/cases/case-ux-g03/connectome">
                Inspect Connectome <ArrowRightIcon size={14} className="ml-1 inline" />
              </Button>
            </CardFooter>
          </Card>

          {/* Action Card 3: Stale Target Slate */}
          <Card className="worklist-action-card stale-card">
            <CardHeader className="card-top-meta">
              <Badge variant="tier3">STALE TARGET SLATE</Badge>
              <span className="card-case-code">MGN-26-0006</span>
            </CardHeader>
            <CardContent>
              <CardTitle as="h3" className="card-action-title">
                Target Slate Predates Phenotype Update
              </CardTitle>
              <CardDescription className="card-action-text">
                Clinical phenotype was re-approved with updated severity weights. Slate must be
                regenerated before signing.
              </CardDescription>
            </CardContent>
            <CardFooter className="card-action-footer">
              <span className="card-status-label text-amber">Sign Lockout Active</span>
              <Button variant="primary" size="sm" href="/cases/case-ux-g06/targets">
                Regenerate Slate <ArrowRightIcon size={14} className="ml-1 inline" />
              </Button>
            </CardFooter>
          </Card>
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
              Active cases in your clinical service with verified neuroimaging and phenotype
              records.
            </p>
          </div>
          <Button variant="secondary" size="sm" href="/cases">
            View All Cases Registry <ArrowRightIcon size={14} className="ml-1 inline" />
          </Button>
        </div>

        <Card className="cases-table-card">
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
                {activeCases.length === 0 ? (
                  <TableEmptyRow
                    colSpan={6}
                    message="No active clinical cases found."
                    subMessage="Initialize new patient cases from the New Patient Intake workspace."
                  />
                ) : (
                  activeCases.map(c => (
                    <tr key={c.id}>
                      <td>
                        <strong className="font-mono text-cyan">{c.code}</strong>
                      </td>
                      <td>{c.title}</td>
                      <td>
                        <Badge variant="neutral">{c.indication}</Badge>
                      </td>
                      <td>
                        <Badge variant="tier1">{c.state}</Badge>
                      </td>
                      <td>
                        {c.isStale ? (
                          <Badge variant="tier3">STALE SLATE</Badge>
                        ) : (
                          <Badge variant="tier1">CURRENT</Badge>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            href={`/cases/${c.id}`}
                            className="p-1 text-xs"
                          >
                            Overview
                          </Button>
                          <Button
                            variant="primary"
                            href={`/cases/${c.id}/targets`}
                            className="p-1 text-xs"
                          >
                            Target Slate <ArrowRightIcon size={14} className="ml-1 inline" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
