'use client';

import {
  Breadcrumbs,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ArrowRightIcon,
  PageHeader,
} from '@/components/ui';

import React from 'react';

export default function HelpGuidancePage() {
  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Clinical Guidance', current: true },
        ]}
      />

      <PageHeader
        eyebrow={<Badge variant="tier1">CLINICIAN USER GUIDE</Badge>}
        title="Clinical & Scientific Guidance"
        subtitle="Reference guide for TMS specialists explaining Magniom workflow phases, evidence tiers, spatial reliability, and regulatory safety guardrails (Section 134)."
      />

      <div className="stat-card-grid">
        {/* Card 1: 6-Phase Clinical Sequence */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              The 6-Phase Clinical Reasoning Sequence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="pl-5 text-sm text-secondary flex flex-col gap-2">
              <li>
                <strong>UNDERSTAND:</strong> Review referral indication and clinical baseline
                symptom domains.
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
                <strong>COMPARE:</strong> Evaluate counterfactual displacement against standard
                group priors.
              </li>
              <li>
                <strong>REVIEW:</strong> Scrutinize balanced supporting vs conflicting evidence and
                &quot;Why this may be wrong&quot;.
              </li>
              <li>
                <strong>DECIDE:</strong> Author structured clinical reasoning, attest compliance,
                and digitally sign.
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Card 2: Evidence Tiers */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              Evidence Tiers (T1–T4 &amp; T-Exp)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="tier1">Tier 1</Badge>
              <span>
                <strong>Established:</strong> Replicated prospective randomized trials &amp;
                international consensus.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="tier2">Tier 2</Badge>
              <span>
                <strong>Prospectively Supported:</strong> Prospective trials with circuit engagement
                metrics.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="tier3">Tier 3</Badge>
              <span>
                <strong>Retrospectively Supported:</strong> Retrospective cohorts or clinical
                registries.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="tierexp">Tier Exp</Badge>
              <span>
                <strong>Research Only:</strong> Hypothesis-generating. Strictly blocked from
                clinical signing.
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Counterfactual Analysis */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              Counterfactual Baseline &amp; Geodesic Deltas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary leading-relaxed">
              Whenever Magniom computes a personalized candidate, it renders the evidence-only
              standard group baseline (e.g. standard F3 / BA46) alongside the proposed target.
              Clinicians can inspect the exact Euclidean/geodesic displacement in millimeters and
              expected circuit gains.
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Staleness & Safety Locks */}
        <Card>
          <CardHeader>
            <CardTitle as="h2" className="text-lg font-bold text-cyan">
              Staleness &amp; Signing Lockouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-secondary leading-relaxed">
              If a clinician modifies the phenotype or updates scanning runs after a Target Slate
              has been generated, the slate is immediately flagged as <strong>STALE</strong>.
              Digital signing is disabled server-side and in the UI until the slate is regenerated.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Non-Marketing Statement (§161) */}
      <Card className="border-l-4 border-l-cyan bg-cyan/5">
        <CardContent>
          <p className="text-sm text-primary leading-relaxed m-0">
            <strong>Scientific Principle:</strong> MAGNIOM structures evidence, clinical context,
            and qualified patient-specific measurements into target hypotheses for specialist
            review. It does not substitute for specialist neuroanatomical judgment or clinical
            decision-making (§161).
          </p>
        </CardContent>
      </Card>

      {/* Glossary v2 (§160) */}
      <Card>
        <CardHeader>
          <div className="mb-1">
            <Badge variant="neutral">Specification §160</Badge>
          </div>
          <CardTitle as="h2" className="text-xl font-bold text-primary">
            Clinical &amp; Scientific Architecture Glossary v2
          </CardTitle>
          <CardDescription>
            Authoritative definitions for core entities, context models, target geometries, and
            scientific safeguards in the v2 application shell.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Glossary v2 Terms">
              <thead>
                <tr>
                  <th scope="col" className="w-56">
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
                    The structured epistemological chain tracing justification from Indication{' '}
                    <ArrowRightIcon size={11} className="inline text-muted" /> Clinical Claim{' '}
                    <ArrowRightIcon size={11} className="inline text-muted" /> Circuit{' '}
                    <ArrowRightIcon size={11} className="inline text-muted" /> Target Family{' '}
                    <ArrowRightIcon size={11} className="inline text-muted" /> Candidate Target
                    (§107, §123).
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>DiseaseStageContext</strong>
                  </td>
                  <td>
                    Temporal or progression staging of the condition (e.g. subacute vs chronic
                    stroke, acute depressive episode) that qualifies or constrains candidate
                    applicability (§73, §102).
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>LesionContext</strong>
                  </td>
                  <td>
                    Patient-specific structural pathology description, lesion masks, and overlap
                    checks ensuring no target is placed within necrotic tissue or compromised
                    circuits (§74, §103).
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
                    A target geometry defined by the volumetric electrical field (E-field) induced
                    by a specific coil type and orientation rather than an idealized focal point
                    (§115).
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
                    against which all personalized refinements are measured and compared (§118,
                    §125).
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Research Hypothesis</strong>
                  </td>
                  <td>
                    An exploratory candidate target generated by experimental modules (Q0–Q2) or
                    under research protocols; strictly excluded from clinical digital signing (§120,
                    §139).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
