import React from 'react';
import Link from 'next/link';
import {
  getAllModuleUiDescriptors,
  type IndicationModuleUiDescriptor,
} from '@magniom/presentation';

// ==========================================
// Research Modules Catalogue (§195, §216)
// Experimental module listing with Q-level and Research-only status.
// ==========================================

const MODULE_QUAL_INFO: Record<
  string,
  { qualification_level: string; effective_permission: string }
> = {
  MDD: { qualification_level: 'Q8', effective_permission: 'clinical' },
  PAIN: { qualification_level: 'Q6', effective_permission: 'validation' },
  STROKE_MOTOR: { qualification_level: 'Q5', effective_permission: 'validation' },
  STROKE_APHASIA: { qualification_level: 'Q5', effective_permission: 'validation' },
  OCD: { qualification_level: 'Q5', effective_permission: 'validation' },
  TINNITUS: { qualification_level: 'Q0', effective_permission: 'research' },
  TBI: { qualification_level: 'Q1', effective_permission: 'research' },
  SUD: { qualification_level: 'Q4', effective_permission: 'validation' },
};

export default function ResearchModulesPage() {
  const descriptors = getAllModuleUiDescriptors();
  const researchModules = descriptors.filter((d: IndicationModuleUiDescriptor) => {
    const info = MODULE_QUAL_INFO[d.indication_code];
    return (
      info?.effective_permission === 'research' ||
      d.indication_code === 'TINNITUS' ||
      d.indication_code === 'TBI'
    );
  });

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="research-banner" style={{ margin: 0 }}>
        <strong>RESEARCH MODE — NOT FOR CLINICAL TARGET DECISIONS</strong>
      </div>

      <div>
        <div
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}
        >
          <span className="badge badge-tierexp">RESEARCH ENVIRONMENT</span>
          <span className="badge badge-neutral">Module Catalogue</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Research & Experimental Modules
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Experimental indication modules available for research workflows. Clinical decision
          signing is not available for Research-only modules (§195, §216).
        </p>
      </div>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Research Modules">
            <thead>
              <tr>
                <th scope="col">Module</th>
                <th scope="col">Indication</th>
                <th scope="col">Version</th>
                <th scope="col">Qualification</th>
                <th scope="col">Permission</th>
                <th scope="col">Measurements</th>
              </tr>
            </thead>
            <tbody>
              {researchModules.map((mod: IndicationModuleUiDescriptor) => {
                const info = MODULE_QUAL_INFO[mod.indication_code];
                return (
                  <tr key={mod.indication_module_release_id}>
                    <td>
                      <strong>{mod.indication_name}</strong>
                    </td>
                    <td>
                      <code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                        {mod.indication_code}
                      </code>
                    </td>
                    <td>{mod.indication_module_release_id}</td>
                    <td>
                      <span className="badge badge-tierexp">
                        {info?.qualification_level || 'Q0'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-tierexp">
                        {info?.effective_permission || 'Research Only'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {mod.measurement_sections.map(ms => ms.label).join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/research" className="btn btn-secondary">
          ← Research Home
        </Link>
        <Link href="/research/cases" className="btn btn-secondary">
          Research Cases →
        </Link>
      </div>
    </div>
  );
}
