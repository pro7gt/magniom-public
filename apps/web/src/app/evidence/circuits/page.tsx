'use client';

import React from 'react';
import Link from 'next/link';
import { getCanonicalCircuitOverlays } from '@magniom/presentation';

export default function EvidenceCircuitsPage() {
  const circuits = getCanonicalCircuitOverlays();

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier1">EVIDENCE KNOWLEDGE GRAPH</span>
          <span className="badge badge-neutral">Therapeutic Circuits (§197)</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Therapeutic Circuit Library
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Anatomical networks, connectomic circuits, and neurofunctional pathways linking clinical objectives to target geometries.
        </p>
      </div>

      {/* Circuits Grid */}
      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Therapeutic Circuits">
            <thead>
              <tr>
                <th scope="col">Circuit ID</th>
                <th scope="col">Circuit Name</th>
                <th scope="col">Short Code</th>
                <th scope="col">Evidence Tier</th>
                <th scope="col">Primary Target Node</th>
                <th scope="col">Downstream Network</th>
              </tr>
            </thead>
            <tbody>
              {circuits.map(c => (
                <tr key={c.circuitId}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                      {c.circuitId}
                    </strong>
                  </td>
                  <td><strong>{c.name}</strong></td>
                  <td><code style={{ fontSize: '0.8rem' }}>{c.shortCode}</code></td>
                  <td>
                    <span className="badge badge-tier1">Tier 1</span>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {c.circuitId.includes('MDD')
                      ? 'Left DLPFC (BA46/9)'
                      : c.circuitId.includes('PAIN')
                        ? 'Contralateral M1'
                        : c.circuitId.includes('OCD')
                          ? 'Bilateral dACC / dmPFC'
                          : c.circuitId.includes('PTSD')
                            ? 'Right DLPFC'
                            : 'Perilesional Left Frontotemporal'}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {c.description || 'Subgenual ACC (sgACC, BA25) anti-correlation network'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link href="/evidence" className="btn btn-secondary">← Evidence Library</Link>
        <Link href="/evidence/claims" className="btn btn-secondary">Claims →</Link>
        <Link href="/evidence/paths" className="btn btn-secondary">Evidence Paths →</Link>
        <Link href="/evidence/target-families" className="btn btn-secondary">Target Families →</Link>
        <Link href="/evidence/sources" className="btn btn-secondary">Sources →</Link>
      </div>
    </div>
  );
}
