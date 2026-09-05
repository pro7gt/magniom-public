import React from 'react';
import Link from 'next/link';
import { getAllModuleUiDescriptors, type IndicationModuleUiDescriptor } from '@magniom/presentation';

// ==========================================
// Validation Module Qualification (§196)
// Module Q-level progression dashboard.
// ==========================================

const MODULE_QUAL_INFO: Record<string, { qualification_level: string; effective_permission: string; is_authorised: boolean }> = {
  MDD: { qualification_level: 'Q8', effective_permission: 'clinical', is_authorised: true },
  PAIN: { qualification_level: 'Q6', effective_permission: 'validation', is_authorised: false },
  STROKE_MOTOR: { qualification_level: 'Q5', effective_permission: 'validation', is_authorised: false },
  STROKE_APHASIA: { qualification_level: 'Q5', effective_permission: 'validation', is_authorised: false },
  OCD: { qualification_level: 'Q5', effective_permission: 'validation', is_authorised: false },
  TINNITUS: { qualification_level: 'Q0', effective_permission: 'research', is_authorised: false },
  TBI: { qualification_level: 'Q1', effective_permission: 'research', is_authorised: false },
  SUD: { qualification_level: 'Q4', effective_permission: 'validation', is_authorised: false },
};

export default function ValidationModulesPage() {
  const descriptors = getAllModuleUiDescriptors();

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier2">VALIDATION ENVIRONMENT</span>
          <span className="badge badge-neutral">Module Qualification</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Module Qualification Status
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Q-level progression for all indication modules (Q0–Q8). Clinical authorisation requires full compatibility configuration (§196, §71).
        </p>
      </div>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Module Qualification Status">
            <thead>
              <tr>
                <th scope="col">Module</th>
                <th scope="col">Indication</th>
                <th scope="col">Version</th>
                <th scope="col">Q-Level</th>
                <th scope="col">Permission</th>
                <th scope="col">Clinical Authority</th>
              </tr>
            </thead>
            <tbody>
              {descriptors.map((mod: IndicationModuleUiDescriptor) => {
                const info = MODULE_QUAL_INFO[mod.indication_code] || {
                  qualification_level: 'Q0',
                  effective_permission: 'research',
                  is_authorised: false,
                };
                return (
                  <tr key={mod.indication_module_release_id}>
                    <td><strong>{mod.indication_name}</strong></td>
                    <td><code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{mod.indication_code}</code></td>
                    <td>{mod.indication_module_release_id}</td>
                    <td>
                      <span className={`badge ${info.qualification_level === 'Q8' ? 'badge-tier1' : info.qualification_level >= 'Q5' ? 'badge-tier2' : 'badge-tierexp'}`}>
                        {info.qualification_level}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${info.effective_permission === 'clinical' ? 'badge-tier1' : info.effective_permission === 'validation' ? 'badge-tier2' : 'badge-tierexp'}`}>
                        {info.effective_permission}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {info.is_authorised ? 'Authorised' : 'Not authorised for Clinical targeting'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/validation" className="btn btn-secondary">← Validation Home</Link>
        <Link href="/validation/studies" className="btn btn-secondary">Studies →</Link>
        <Link href="/validation/golden" className="btn btn-secondary">Golden Cases →</Link>
      </div>
    </div>
  );
}
