'use client';

import React from 'react';

export default function HelpGuidancePage() {
  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div
          style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}
        >
          <span className="badge badge-tier1">CLINICIAN USER GUIDE</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Clinical & Scientific Guidance
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Reference guide for TMS specialists explaining Magniom workflow phases, evidence tiers,
          spatial reliability, and regulatory safety guardrails (Section 134).
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Card 1: 6-Phase Clinical Sequence */}
        <div className="card">
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            The 6-Phase Clinical Reasoning Sequence
          </h2>
          <ol
            style={{
              paddingLeft: '1.25rem',
              fontSize: '0.8125rem',
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <li>
              <strong>UNDERSTAND:</strong> Review referral indication and clinical baseline symptom
              domains.
            </li>
            <li>
              <strong>QUALIFY:</strong> Confirm symptom priorities and qualify individual MRI/fMRI
              technical quality.
            </li>
            <li>
              <strong>MEASURE:</strong> Inspect patient-specific connectomic anti-correlations and
              reliability regions.
            </li>
            <li>
              <strong>COMPARE:</strong> Evaluate counterfactual displacement against standard group
              priors.
            </li>
            <li>
              <strong>REVIEW:</strong> Scrutinize balanced supporting vs conflicting evidence and
              &quot;Why this may be wrong&quot;.
            </li>
            <li>
              <strong>DECIDE:</strong> Author structured clinical reasoning, attest compliance, and
              digitally sign.
            </li>
          </ol>
        </div>

        {/* Card 2: Evidence Tiers */}
        <div className="card">
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            Evidence Tiers (T1–T4 &amp; T-Exp)
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              fontSize: '0.8125rem',
            }}
          >
            <div>
              <span className="badge badge-tier1" style={{ marginRight: '0.5rem' }}>
                Tier 1
              </span>
              <span>
                <strong>Established:</strong> Replicated prospective randomized trials &amp;
                international consensus.
              </span>
            </div>
            <div>
              <span className="badge badge-tier2" style={{ marginRight: '0.5rem' }}>
                Tier 2
              </span>
              <span>
                <strong>Prospectively Supported:</strong> Prospective trials with circuit engagement
                metrics.
              </span>
            </div>
            <div>
              <span className="badge badge-tier3" style={{ marginRight: '0.5rem' }}>
                Tier 3
              </span>
              <span>
                <strong>Retrospectively Supported:</strong> Retrospective cohorts or clinical
                registries.
              </span>
            </div>
            <div>
              <span className="badge badge-tierexp" style={{ marginRight: '0.5rem' }}>
                Tier Exp
              </span>
              <span>
                <strong>Research Only:</strong> Hypothesis-generating. Strictly blocked from
                clinical signing.
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Counterfactual Analysis */}
        <div className="card">
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            Counterfactual Baseline &amp; Geodesic Deltas
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            Whenever Magniom computes a personalized candidate, it renders the evidence-only
            standard group baseline (e.g. standard F3 / BA46) alongside the proposed target.
            Clinicians can inspect the exact Euclidean/geodesic displacement in millimeters and
            expected circuit gains.
          </p>
        </div>

        {/* Card 4: Staleness & Safety Locks */}
        <div className="card">
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--accent-cyan)',
              marginBottom: '0.75rem',
            }}
          >
            Staleness &amp; Signing Lockouts
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.6' }}>
            If a clinician modifies the phenotype or updates scanning runs after a Target Slate has
            been generated, the slate is immediately flagged as <strong>STALE</strong>. Digital
            signing is disabled server-side and in the UI until the slate is regenerated.
          </p>
        </div>
      </div>

      {/* Non-Marketing Statement (§161) */}
      <div
        className="card"
        style={{
          borderLeft: '4px solid var(--accent-cyan)',
          backgroundColor: 'rgba(56, 189, 248, 0.05)',
        }}
      >
        <p
          style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}
        >
          <strong>Scientific Principle:</strong> MAGNIOM structures evidence, clinical context, and
          qualified patient-specific measurements into target hypotheses for specialist review. It
          does not substitute for specialist neuroanatomical judgment or clinical decision-making
          (§161).
        </p>
      </div>

      {/* Glossary v2 (§160) */}
      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <span className="badge badge-neutral" style={{ marginBottom: '0.25rem' }}>
            Specification §160
          </span>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '0.25rem',
            }}
          >
            Clinical &amp; Scientific Architecture Glossary v2
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Authoritative definitions for core entities, context models, target geometries, and
            scientific safeguards in the v2 application shell.
          </p>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table" aria-label="Glossary v2 Terms">
            <thead>
              <tr>
                <th scope="col" style={{ width: '220px' }}>
                  Term
                </th>
                <th scope="col">Definition &amp; Clinical Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>CaseIndication</strong>
                </td>
                <td>
                  The formal clinical indication binding a patient case to a certified targeting
                  module (e.g. MDD, Neuropathic Pain, Stroke Motor Recovery) with its own context
                  model and workflow (§13, §63).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>IndicationModuleRelease</strong>
                </td>
                <td>
                  The versioned, validated bundle specifying context requirements, measurement
                  pipelines, target families, and UI descriptors for an indication (§16, §217).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>EvidencePath</strong>
                </td>
                <td>
                  The structured epistemological chain tracing justification from Indication →
                  Clinical Claim → Circuit → Target Family → Candidate Target (§107, §123).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>DiseaseStageContext</strong>
                </td>
                <td>
                  Temporal or progression staging of the condition (e.g. subacute vs chronic stroke,
                  acute depressive episode) that qualifies or constrains candidate applicability
                  (§73, §102).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>LesionContext</strong>
                </td>
                <td>
                  Patient-specific structural pathology description, lesion masks, and overlap
                  checks ensuring no target is placed within necrotic tissue or compromised circuits
                  (§74, §103).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>MeasurementBundle</strong>
                </td>
                <td>
                  The aggregated collection of imaging, electrophysiological, or audiological
                  acquisitions required by an indication module with associated quality control
                  scores (§97, §188).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>ReliabilityBundle</strong>
                </td>
                <td>
                  Empirical reproducibility and test-retest consistency metrics (e.g. split-half
                  reliability, ICC) determining whether a measurement may drive candidate ranking
                  (§100, §121).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>TreatmentContext</strong>
                </td>
                <td>
                  Concomitant therapy status (e.g. concurrent psychotherapy, speech therapy, motor
                  task pairing, symptom provocation) required for valid protocol delivery (§75,
                  §104).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>TargetGeometry</strong>
                </td>
                <td>
                  The spatial representation of a candidate target: point coordinate, surface ROI,
                  somatotopic map, coil-field induced E-field, or distributed network (§112–117).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Somatotopic Target</strong>
                </td>
                <td>
                  A target geometry parameterized by body somatotopy (e.g. M1 hand knob, leg
                  representation) derived from motor mapping or anatomical landmarks (§113).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Coil-Field Target</strong>
                </td>
                <td>
                  A target geometry defined by the volumetric electrical field (E-field) induced by
                  a specific coil type and orientation rather than an idealized focal point (§115).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Patient-specific Refinement</strong>
                </td>
                <td>
                  Displacement of a target candidate from the group evidence baseline driven by
                  qualified, highly reproducible individual connectomic or functional measurements
                  (§119).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Evidence Baseline</strong>
                </td>
                <td>
                  The established, consensus-supported standard target coordinate or territory
                  against which all personalized refinements are measured and compared (§118, §125).
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Research Hypothesis</strong>
                </td>
                <td>
                  An exploratory candidate target generated by experimental modules (Q0–Q2) or under
                  research protocols; strictly excluded from clinical digital signing (§120, §139).
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
