'use client';

import React from 'react';
import Link from 'next/link';
import { caseStore } from '../../lib/case-store';

export default function ResearchWorkspacePage() {
  const allCases = caseStore.getAllCases();
  const researchCases = allCases.filter(
    c => c.title.toLowerCase().includes('research') || c.code === 'MGN-26-0005',
  );

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Research Mode Warning Banner (§13, §155) */}
      <div className="research-banner" style={{ margin: 0 }}>
        <strong>RESEARCH MODE — NOT FOR CLINICAL USE:</strong> Experimental neuroimaging and
        exploratory circuit targets. Clinical decision signing is strictly restricted in this
        environment.
      </div>

      <div>
        <div
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}
        >
          <span className="badge badge-tierexp">RESEARCH ENVIRONMENT</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Research & Exploratory Neuroimaging Workspace
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Experimental connectomic hypotheses, novel symptom-to-circuit formulations, and Tier-Exp
          exploratory targets (Section 32).
        </p>
      </div>

      <div className="card">
        <h2
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: 'var(--accent-cyan)',
          }}
        >
          Active Research Cases
        </h2>

        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Research Cases Table">
            <thead>
              <tr>
                <th scope="col">Case Code</th>
                <th scope="col">Research Hypothesis</th>
                <th scope="col">Modality</th>
                <th scope="col">Safety Constraints</th>
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
                  <td>{c.title}</td>
                  <td>
                    <span className="badge badge-neutral">rs-fMRI BOLD + DTI</span>
                  </td>
                  <td>
                    <span className="badge badge-tierexp">Clinical Sign Lockout</span>
                  </td>
                  <td>
                    <Link
                      href={`/cases/${c.id}/targets`}
                      className="btn btn-primary"
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                    >
                      Open Research Slate →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
