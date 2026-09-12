'use client';

import {
  MicroscopeIcon,
  Building2Icon,
  BookOpenIcon,
  SettingsIcon,
  LockIcon,
  CheckIcon,
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ArrowRightIcon,
  ArrowLeftIcon,
  PageHeader,
} from '@/components/ui';

import React, { useState } from 'react';
import { CANONICAL_CLINICAL_SESSION } from '../../lib/release-authority';

// ==========================================
// Administration Workspace (§44)
// Capability-Gated Administration Workspace.
// Only accessible to users with admin authority.
// ==========================================

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'tenants' | 'policies' | 'workers' | 'audit'>(
    'tenants',
  );
  const session = CANONICAL_CLINICAL_SESSION;

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'System Administration', current: true },
        ]}
      />

      {/* Admin Header (§44) */}
      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="neutral" className="uppercase text-xs">
              Administration
            </Badge>
            <Badge variant="clinical" className="text-xs">
              RESTRICTED
            </Badge>
          </div>
        }
        title="System Administration & Governance"
        subtitle="Multi-tenancy configuration, scientific policy manifests, worker node health, and audit logging."
        actions={
          <>
            <Button variant="secondary" href="/internal/verification">
              <MicroscopeIcon size={16} className="mr-1 inline text-cyan" />
              Verification Dashboard <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
            <Button variant="secondary" href="/cases">
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Cases Registry
            </Button>
          </>
        }
      />

      {/* Admin Tab Navigation */}
      <Card className="flex flex-wrap gap-2 p-2 bg-glass-subtle">
        <Button
          variant={activeTab === 'tenants' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('tenants')}
          size="sm"
        >
          <Building2Icon size={16} className="mr-1 inline text-cyan" /> Organizations & Sites
        </Button>
        <Button
          variant={activeTab === 'policies' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('policies')}
          size="sm"
        >
          <BookOpenIcon size={16} className="mr-1 inline text-cyan" /> Scientific Policies &
          Manifests
        </Button>
        <Button
          variant={activeTab === 'workers' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('workers')}
          size="sm"
        >
          <SettingsIcon size={16} className="mr-1 inline text-cyan" /> Worker Nodes & Queues
        </Button>
        <Button
          variant={activeTab === 'audit' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('audit')}
          size="sm"
        >
          <LockIcon size={16} className="mr-1 inline text-cyan" /> Security & RLS Policies
        </Button>
      </Card>

      {/* Tab 1: Tenants */}
      {activeTab === 'tenants' && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle as="h2" className="text-xl font-bold text-primary m-0">
              Registered Clinical Organizations & Sites (§26–27)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table
              className="comparison-table"
              aria-label="Registered Clinical Organizations & Sites"
            >
              <thead>
                <tr>
                  <th>Organization ID</th>
                  <th>Organization Name</th>
                  <th>Active Sites</th>
                  <th>Mode Permission</th>
                  <th>Assigned Modules</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code className="text-cyan">org-melb-tms</code>
                  </td>
                  <td>Melbourne TMS Centre</td>
                  <td>Parkville Clinical Neurosciences (Site 1)</td>
                  <td>
                    <Badge variant="clinical">CLINICAL</Badge>
                  </td>
                  <td>MDD, PAIN, STROKE_MOTOR</td>
                  <td>
                    <Badge variant="tier1">ACTIVE</Badge>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code className="text-cyan">org-syd-research</code>
                  </td>
                  <td>Sydney NeuroDiscovery Institute</td>
                  <td>Camperdown Advanced Imaging</td>
                  <td>
                    <Badge variant="research">RESEARCH</Badge>
                  </td>
                  <td>TINNITUS, TBI, SUD, OCD</td>
                  <td>
                    <Badge variant="tier1">ACTIVE</Badge>
                  </td>
                </tr>
                <tr>
                  <td>
                    <code className="text-cyan">org-bris-val</code>
                  </td>
                  <td>Queensland Brain Health Centre</td>
                  <td>Herston Clinical Research Unit</td>
                  <td>
                    <Badge variant="validation">VALIDATION</Badge>
                  </td>
                  <td>ALL (Silent Prospective)</td>
                  <td>
                    <Badge variant="tier1">ACTIVE</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Policies */}
      {activeTab === 'policies' && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle as="h2" className="text-xl font-bold text-primary m-0">
              Active Scientific Release Manifests (§147)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="stat-card-grid">
              <div className="p-4 rounded-lg bg-glass-subtle border border-subtle">
                <div className="flex justify-between items-center">
                  <strong className="text-primary">IMR-MDD-2.0.0</strong>
                  <Badge variant="tier1">Q8 Clinical</Badge>
                </div>
                <p className="text-xs text-secondary my-2">
                  Major Depressive Disorder targeting module release with sgACC anti-correlation and
                  dorsomedial prefrontal circuits.
                </p>
                <div className="text-xs text-muted">
                  Deterministic Hash: <code>a7f8c2b9...3e41</code>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-glass-subtle border border-subtle">
                <div className="flex justify-between items-center">
                  <strong className="text-primary">IMR-PAIN-2.0.0</strong>
                  <Badge variant="tier1">Q8 Clinical</Badge>
                </div>
                <p className="text-xs text-secondary my-2">
                  Neuropathic Pain targeting module utilizing motor cortex somatotopy and
                  thalamocortical dysrhythmia circuits.
                </p>
                <div className="text-xs text-muted">
                  Deterministic Hash: <code>b3e189d4...91c2</code>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-glass-subtle border border-subtle">
                <div className="flex justify-between items-center">
                  <strong className="text-primary">IMR-TINNITUS-2.0.0</strong>
                  <Badge variant="tierexp">Q4 Research Only</Badge>
                </div>
                <p className="text-xs text-secondary my-2">
                  Refractory Subjective Tinnitus auditory-limbic network targeting hypothesis.
                  Clinical signing prohibited.
                </p>
                <div className="text-xs text-muted">
                  Deterministic Hash: <code>c54127ea...f7b3</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Workers */}
      {activeTab === 'workers' && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle as="h2" className="text-xl font-bold text-primary m-0">
              Background Worker Queues & Pipelines
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-glass-subtle border border-subtle">
                <div>
                  <strong>connectomics-processing-queue</strong>
                  <div className="text-xs text-muted">
                    fMRI motion scrubbing, bandpass filtering, seed correlation
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="tier1">HEALTHY</Badge>
                  <span className="text-xs text-secondary">0 pending / 4 active</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-glass-subtle border border-subtle">
                <div>
                  <strong>target-slate-generator-queue</strong>
                  <div className="text-xs text-muted">
                    Deterministic candidate ranking, policy filtering, counterfactual calculation
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="tier1">HEALTHY</Badge>
                  <span className="text-xs text-secondary">0 pending / 2 active</span>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-glass-subtle border border-subtle">
                <div>
                  <strong>audit-log-sync-worker</strong>
                  <div className="text-xs text-muted">
                    Immutable ledger synchronization and multi-tab invalidation broadcast
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="tier1">ONLINE</Badge>
                  <span className="text-xs text-secondary">Synced 4s ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'audit' && (
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle as="h2" className="text-xl font-bold text-primary m-0">
              Row-Level Security & Role Authority Governance
            </CardTitle>
            <CardDescription className="text-sm text-secondary mt-1">
              Current Authenticated User: <strong>{session.user.displayName}</strong> (
              {session.user.roleTitle})
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col gap-2 text-sm">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckIcon size={14} className="text-emerald mr-1 inline" />{' '}
                <strong>Tenant Isolation:</strong> Data filtered strictly by{' '}
                <code>
                  organisation_id = current_setting(&apos;app.current_organisation_id&apos;)
                </code>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckIcon size={14} className="text-emerald mr-1 inline" />{' '}
                <strong>Signing Capability:</strong> Only users with statutory clinical credentials
                can execute digital sign-off.
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckIcon size={14} className="text-emerald mr-1 inline" />{' '}
                <strong>PHI Protection:</strong> Operational logs exclude patient names, medical
                record numbers, and scan binaries.
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
