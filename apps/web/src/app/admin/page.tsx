'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CANONICAL_CLINICAL_SESSION } from '../../lib/release-authority';

// ==========================================
// Administration Workspace (§44)
// Capability-Gated Administration Workspace.
// Only accessible to users with admin authority.
// ==========================================

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'tenants' | 'policies' | 'workers' | 'audit'>('tenants');
  const session = CANONICAL_CLINICAL_SESSION;

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Admin Header (§44) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Administration
            </span>
            <span className="badge badge-clinical" style={{ fontSize: '0.75rem' }}>
              RESTRICTED
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            System Administration & Governance
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Multi-tenancy configuration, scientific policy manifests, worker node health, and audit logging.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/internal/verification" className="btn btn-secondary">
            🔬 Verification Dashboard →
          </Link>
          <Link href="/cases" className="btn btn-secondary">
            ← Cases Registry
          </Link>
        </div>
      </div>

      {/* Admin Tab Navigation */}
      <div className="card" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
        <button
          className={`btn ${activeTab === 'tenants' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('tenants')}
          style={{ fontSize: '0.8125rem' }}
        >
          🏢 Organizations & Sites
        </button>
        <button
          className={`btn ${activeTab === 'policies' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('policies')}
          style={{ fontSize: '0.8125rem' }}
        >
          📜 Scientific Policies & Manifests
        </button>
        <button
          className={`btn ${activeTab === 'workers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('workers')}
          style={{ fontSize: '0.8125rem' }}
        >
          ⚙️ Worker Nodes & Queues
        </button>
        <button
          className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('audit')}
          style={{ fontSize: '0.8125rem' }}
        >
          🔒 Security & RLS Policies
        </button>
      </div>

      {/* Tab 1: Tenants */}
      {activeTab === 'tenants' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0 }}>
            Registered Clinical Organizations & Sites (§26–27)
          </h2>
          <table className="comparison-table" style={{ marginTop: '1rem' }}>
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
                <td><code style={{ color: 'var(--accent-cyan)' }}>org-melb-tms</code></td>
                <td>Melbourne TMS Centre</td>
                <td>Parkville Clinical Neurosciences (Site 1)</td>
                <td><span className="badge badge-clinical">CLINICAL</span></td>
                <td>MDD, PAIN, STROKE_MOTOR</td>
                <td><span className="badge badge-tier1">ACTIVE</span></td>
              </tr>
              <tr>
                <td><code style={{ color: 'var(--accent-cyan)' }}>org-syd-research</code></td>
                <td>Sydney NeuroDiscovery Institute</td>
                <td>Camperdown Advanced Imaging</td>
                <td><span className="badge badge-research">RESEARCH</span></td>
                <td>TINNITUS, TBI, SUD, OCD</td>
                <td><span className="badge badge-tier1">ACTIVE</span></td>
              </tr>
              <tr>
                <td><code style={{ color: 'var(--accent-cyan)' }}>org-bris-val</code></td>
                <td>Queensland Brain Health Centre</td>
                <td>Herston Clinical Research Unit</td>
                <td><span className="badge badge-validation">VALIDATION</span></td>
                <td>ALL (Silent Prospective)</td>
                <td><span className="badge badge-tier1">ACTIVE</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Policies */}
      {activeTab === 'policies' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0 }}>
            Active Scientific Release Manifests (§147)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--text-main)' }}>IMR-MDD-2.0.0</strong>
                <span className="badge badge-tier1">Q8 Clinical</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0' }}>
                Major Depressive Disorder targeting module release with sgACC anti-correlation and dorsomedial prefrontal circuits.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Deterministic Hash: <code>a7f8c2b9...3e41</code>
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--text-main)' }}>IMR-PAIN-2.0.0</strong>
                <span className="badge badge-tier1">Q8 Clinical</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0' }}>
                Neuropathic Pain targeting module utilizing motor cortex somatotopy and thalamocortical dysrhythmia circuits.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Deterministic Hash: <code>b3e189d4...91c2</code>
              </div>
            </div>

            <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ color: 'var(--text-main)' }}>IMR-TINNITUS-2.0.0</strong>
                <span className="badge badge-tierexp">Q4 Research Only</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0' }}>
                Refractory Subjective Tinnitus auditory-limbic network targeting hypothesis. Clinical signing prohibited.
              </p>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Deterministic Hash: <code>c54127ea...f7b3</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Workers */}
      {activeTab === 'workers' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0 }}>
            Background Worker Queues & Pipelines
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div>
                <strong>connectomics-processing-queue</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>fMRI motion scrubbing, bandpass filtering, seed correlation</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-tier1">HEALTHY</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>0 pending / 4 active</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div>
                <strong>target-slate-generator-queue</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deterministic candidate ranking, policy filtering, counterfactual calculation</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-tier1">HEALTHY</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>0 pending / 2 active</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div>
                <strong>audit-log-sync-worker</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Immutable ledger synchronization and multi-tab invalidation broadcast</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="badge badge-tier1">ONLINE</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Synced 4s ago</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'audit' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginTop: 0 }}>
            Row-Level Security & Role Authority Governance
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Current Authenticated User: <strong>{session.user.displayName}</strong> ({session.user.roleTitle})
          </p>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              ✓ <strong>Tenant Isolation:</strong> Data filtered strictly by <code>organisation_id = current_setting(&apos;app.current_organisation_id&apos;)</code>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              ✓ <strong>Signing Capability:</strong> Only users with statutory clinical credentials can execute digital sign-off.
            </div>
            <div style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              ✓ <strong>PHI Protection:</strong> Operational logs exclude patient names, medical record numbers, and scan binaries.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
