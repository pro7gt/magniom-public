'use client';

import {
  LockIcon,
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  TableEmptyRow,
  PageHeader,
} from '@/components/ui';

import React from 'react';
import { FormativeReviewHarness } from '../../components/formative-review-harness';
import { caseStore } from '../../lib/case-store';
import { getAuthoritativeReleaseContext } from '../../lib/release-authority';

export default function ValidationSuitePage() {
  const releaseContext = getAuthoritativeReleaseContext();

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Validation Suite', current: true },
        ]}
      />

      {/* Page Header */}
      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="tier1">
              ENGINEERING & HUMAN-FACTORS VALIDATION
            </Badge>
            <Badge variant="neutral" className="font-mono">
              {releaseContext.buildId}
            </Badge>
          </div>
        }
        title="UX Golden Cases Suite & Formative Human-Factors Harness"
        subtitle="Dedicated engineering verification environment for testing clinician workflow states, safety mitigations, counterfactual inspectability, and Formative Human-Factors Round 1 critical tasks (IEC 62366-1 / FDA Human Factors Guidance)."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              caseStore.resetToGoldenCases();
              window.location.reload();
            }}
          >
            Reset Store to Golden Cases
          </Button>
        }
      />


      {/* Formative Evaluation Harness Component */}
      <FormativeReviewHarness />

      {/* Subsystem Freeze Attestation Manifest Card */}
      <Card className="border-subtle">
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Verification Build Baseline Manifest (M3 Frozen)
          </CardTitle>
          <CardDescription>
            Authoritative subsystem digests sealed on {new Date(releaseContext.freezeTimestamp).toLocaleDateString()}.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Verification Build Baseline Manifest">
              <thead>
                <tr>
                  <th>Subsystem</th>
                  <th>Version</th>
                  <th>SHA-256 Digest</th>
                  <th>Status</th>
                  <th>Change Control</th>
                </tr>
              </thead>
              <tbody>
                {releaseContext.subsystems.length === 0 ? (
                  <TableEmptyRow
                    colSpan={5}
                    message="No subsystem digests registered in verification baseline."
                  />
                ) : (
                  releaseContext.subsystems.map((sub) => (
                    <tr key={sub.subsystemName}>
                      <td><strong>{sub.subsystemName}</strong></td>
                      <td><Badge variant="neutral">{sub.version}</Badge></td>
                      <td>
                        <span className="font-mono text-xs text-cyan">
                          {sub.sha256DigestFull}
                        </span>
                      </td>
                      <td><Badge variant="tier1">{sub.status}</Badge></td>
                      <td>{sub.isChangeControlLocked ? <Badge variant="neutral"><LockIcon size={12} className="mr-1 inline" /> Locked</Badge> : 'Unlocked'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
