'use client';

import {
  LockIcon,
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ArrowLeftIcon,
  TableEmptyRow,
  PageHeader,
} from '@/components/ui';

import React from 'react';
import { getAuthoritativeReleaseContext } from '../../../lib/release-authority';

// ==========================================
// Internal Releases Dashboard (§198)
// Release manifest browser (modules, policies, evidence libraries).
// ==========================================

export default function InternalReleasesPage() {
  const releaseContext = getAuthoritativeReleaseContext();

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Internal', href: '/internal' },
          { label: 'Releases & Provenance', current: true },
        ]}
      />

      <PageHeader
        eyebrow={<Badge variant="neutral" className="uppercase">Internal Engineering</Badge>}
        title="Release Manifests (§198)"
        subtitle="Authoritative subsystem releases with integrity digests. Never include in ordinary clinician navigation."
      />


      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Build: {releaseContext.buildId}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Releases and Subsystem Integrity Digests">
              <thead>
                <tr>
                  <th>Subsystem</th>
                  <th>Version</th>
                  <th>SHA-256</th>
                  <th>Status</th>
                  <th>Change Control</th>
                </tr>
              </thead>
              <tbody>
                {releaseContext.subsystems.length === 0 ? (
                  <TableEmptyRow
                    colSpan={5}
                    message="No subsystem release manifests found."
                  />
                ) : (
                  releaseContext.subsystems.map(sub => (
                    <tr key={sub.subsystemName}>
                      <td><strong>{sub.subsystemName}</strong></td>
                      <td><Badge variant="neutral">{sub.version}</Badge></td>
                      <td><span className="font-mono text-xs text-cyan">{sub.sha256DigestFull}</span></td>
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

      <Button variant="secondary" href="/internal/verification"><ArrowLeftIcon size={14} className="mr-1 inline" /> Verification Dashboard</Button>
    </div>
  );
}
