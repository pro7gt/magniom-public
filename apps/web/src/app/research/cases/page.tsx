'use client';

import React from 'react';
import Link from 'next/link';
import { caseStore } from '../../../lib/case-store';

// ==========================================
// Research Cases Registry (§195)
// Research case list with persistent Research shell semantics.
// ==========================================

export default function ResearchCasesPage() {
  const allCases = caseStore.getAllCases();
  const researchCases = allCases.filter(
    c => c.title.toLowerCase().includes('research') || c.code === 'MGN-26-0005',
  );

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="research-banner" style={{ margin: 0 }}>
        <strong>RESEARCH MODE — NOT FOR CLINICAL TARGET DECISIONS:</strong> All cases in this view
        operate under Research governance. Clinical decision signing is restricted.
      </div>

      <div>
        <div
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}
        >
          <span className="badge badge-tierexp">RESEARCH ENVIRONMENT</span>
          <span className="badge badge-neutral">Case Registry</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Research Cases
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Research cases under experimental modules. Experimental outputs must not be used as
          clinical target authority (§195).
        </p>
      </div>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Research Cases">
            <thead>
              <tr>
                <th scope="col">Case Code</th>
                <th scope="col">Indication</th>
                <th scope="col">Research Hypothesis</th>
                <th scope="col">Module</th>
                <th scope="col">Status</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {researchCases.map(c => (
                <tr key={c.id}>
                  <td>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#f87171' }}>
                      {c.code}
                    </strong>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{c.indication}</span>
                  </td>
                  <td>{c.title}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Research Module
                  </td>
                  <td>
                    <span className="badge badge-tierexp">Research Only</span>
                  </td>
                  <td>
                    <Link
                      href={`/cases/${c.id}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
              {researchCases.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}
                  >
                    No research cases currently registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/research" className="btn btn-secondary">
          ← Research Home
        </Link>
        <Link href="/research/modules" className="btn btn-secondary">
          Research Modules →
        </Link>
      </div>
    </div>
  );
}
