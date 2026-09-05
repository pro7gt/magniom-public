'use client';

import React from 'react';
import Link from 'next/link';

// ==========================================
// Evidence Sources Browser (§197)
// Source inspection with full citation, DOI, clinical question.
// ==========================================

const CANONICAL_SOURCES = [
  { id: 'SRC-FOX-2012', citation: 'Fox MD et al. (2012) PNAS 109(8):E438-E445', title: 'Efficacy of TMS targets for depression related to intrinsic functional connectivity with the subgenual cingulate.', year: 2012, journal: 'Proc Natl Acad Sci USA', doi: '10.1073/pnas.1120275109', clinicalQuestion: 'Does DLPFC-sgACC connectivity predict antidepressant response?', usedByIndications: ['MDD'] },
  { id: 'SRC-WEIGAND-2018', citation: 'Weigand A et al. (2018) Am J Psychiatry 175(12):1214-1222', title: 'Prospective validation of resting-state connectivity targets.', year: 2018, journal: 'Am J Psychiatry', doi: '10.1176/appi.ajp.2018.17111222', clinicalQuestion: 'Does prospective sgACC anti-correlation predict individual clinical response?', usedByIndications: ['MDD'] },
  { id: 'SRC-COLE-2020', citation: 'Cole EJ et al. (2020) Am J Psychiatry 177(8):716-726', title: 'Stanford Neuromodulation Therapy circuit targeting.', year: 2020, journal: 'Am J Psychiatry', doi: '10.1176/appi.ajp.2019.19070720', clinicalQuestion: 'Does accelerated, connectivity-guided iTBS produce rapid antidepressant response?', usedByIndications: ['MDD'] },
  { id: 'SRC-BLUMBERGER-2022', citation: 'Blumberger DM et al. (2022) Lancet 399:771-782', title: 'Effectiveness of theta burst vs high-frequency rTMS in depression.', year: 2022, journal: 'The Lancet', doi: '10.1016/S0140-6736(22)00012-3', clinicalQuestion: 'Is standard evidence-anchored prefrontal TMS effective without individualised connectivity?', usedByIndications: ['MDD'] },
  { id: 'SRC-LEFAUCHEUR-2020', citation: 'Lefaucheur JP et al. (2020) Clin Neurophysiol 131(2):474-528', title: 'Evidence-based guidelines on rTMS for pain treatment.', year: 2020, journal: 'Clin Neurophysiol', doi: '10.1016/j.clinph.2019.11.002', clinicalQuestion: 'What is the evidence for M1 rTMS in chronic neuropathic pain?', usedByIndications: ['Pain'] },
  { id: 'SRC-HARVEY-2018', citation: 'Harvey RL et al. (2018) Neurorehabil Neural Repair 32(6-7):600-612', title: 'rTMS for motor recovery after stroke.', year: 2018, journal: 'Neurorehabil Neural Repair', doi: '10.1177/1545968318770133', clinicalQuestion: 'Does rTMS enhance motor recovery in post-stroke patients?', usedByIndications: ['Stroke Motor'] },
];

export default function EvidenceSourcesPage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
          <span className="badge badge-tier1">EVIDENCE KNOWLEDGE GRAPH</span>
          <span className="badge badge-neutral">Sources</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Evidence Sources
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Primary scientific literature supporting MAGNIOM evidence claims and target qualification (§197).
        </p>
      </div>

      <div className="card">
        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Evidence Sources Registry">
            <thead>
              <tr>
                <th scope="col">Source ID</th>
                <th scope="col">Citation</th>
                <th scope="col">Clinical Question</th>
                <th scope="col">Journal</th>
                <th scope="col">Year</th>
                <th scope="col">Indications</th>
              </tr>
            </thead>
            <tbody>
              {CANONICAL_SOURCES.map(src => (
                <tr key={src.id}>
                  <td><code style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>{src.id}</code></td>
                  <td>
                    <strong style={{ fontSize: '0.85rem' }}>{src.title}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {src.citation}
                    </div>
                    {src.doi && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '2px' }}>
                        DOI: {src.doi}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{src.clinicalQuestion}</td>
                  <td style={{ fontSize: '0.85rem' }}>{src.journal}</td>
                  <td style={{ textAlign: 'center' }}>{src.year}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {src.usedByIndications.map(ind => (
                        <span key={ind} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{ind}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Link href="/evidence" className="btn btn-secondary">← Evidence Library</Link>
        <Link href="/evidence/claims" className="btn btn-secondary">Claims →</Link>
        <Link href="/evidence/paths" className="btn btn-secondary">Evidence Paths →</Link>
        <Link href="/evidence/target-families" className="btn btn-secondary">Target Families →</Link>
      </div>
    </div>
  );
}
