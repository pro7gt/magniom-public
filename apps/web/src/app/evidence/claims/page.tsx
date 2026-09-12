'use client';

import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardContent,
  ArrowRightIcon,
  ArrowLeftIcon,
  TableEmptyRow,
  PageHeader,
  FilterBar,
  FilterBarGroup,
  FilterBarSelect,
  FilterBarActions,
} from '@/components/ui';

import React, { useState } from 'react';

// ==========================================
// Evidence Claims Browser (§197)
// Browse approved evidence claims filtered by indication,
// tier, and governance status.
// ==========================================

const CANONICAL_CLAIMS = [
  {
    id: 'CLM-MDD-SGACC-001',
    title: 'sgACC Anti-Correlation Efficacy Claim',
    indication: 'MDD',
    tier: 'T1',
    tierLabel: 'Tier 1 — Established',
    tierBadge: 'badge-tier1',
    statement: 'Antidepressant response scales with functional connectivity to Brodmann area 25 (subgenual anterior cingulate cortex).',
    governanceStatus: 'Approved',
    lastReviewed: '2026-06-15',
    sourceCount: 12,
  },
  {
    id: 'CLM-MDD-REWARD-001',
    title: 'Reward Circuit Anhedonia Claim',
    indication: 'MDD',
    tier: 'T2',
    tierLabel: 'Tier 2 — Prospectively Supported',
    tierBadge: 'badge-tier2',
    statement: 'Ventromedial–striatal circuit modulation addresses anhedonic symptom burden.',
    governanceStatus: 'Approved',
    lastReviewed: '2026-07-01',
    sourceCount: 6,
  },
  {
    id: 'CLM-PAIN-M1-001',
    title: 'Contralateral M1 Neuropathic Pain Claim',
    indication: 'Pain',
    tier: 'T1',
    tierLabel: 'Tier 1 — Established',
    tierBadge: 'badge-tier1',
    statement: 'Contralateral primary motor cortex stimulation reduces neuropathic pain intensity via descending inhibitory modulation.',
    governanceStatus: 'Approved',
    lastReviewed: '2026-08-01',
    sourceCount: 9,
  },
  {
    id: 'CLM-STR-M1-001',
    title: 'Ipsilesional M1 Motor Recovery Claim',
    indication: 'Stroke Motor',
    tier: 'T1',
    tierLabel: 'Tier 1 — Established',
    tierBadge: 'badge-tier1',
    statement: 'Excitatory rTMS of ipsilesional primary motor cortex promotes motor recovery following subcortical ischemic stroke.',
    governanceStatus: 'Approved',
    lastReviewed: '2026-07-12',
    sourceCount: 15,
  },
  {
    id: 'CLM-STR-BROCA-001',
    title: 'Broca Area Language Plasticity Claim',
    indication: 'Stroke Aphasia',
    tier: 'T2',
    tierLabel: 'Tier 2 — Prospectively Supported',
    tierBadge: 'badge-tier2',
    statement: 'Targeting preserved perilesional language nodes enhances naming recovery when paired with concurrent speech therapy.',
    governanceStatus: 'Approved',
    lastReviewed: '2026-05-20',
    sourceCount: 7,
  },
  {
    id: 'CLM-OCD-SMA-001',
    title: 'SMA Inhibitory Control Claim',
    indication: 'OCD',
    tier: 'T1',
    tierLabel: 'Tier 1 — Established',
    tierBadge: 'badge-tier1',
    statement: 'Low-frequency stimulation of supplementary motor area reduces Y-BOCS scores by modulating hyperactive CSTC loop.',
    governanceStatus: 'Approved',
    lastReviewed: '2026-06-28',
    sourceCount: 5,
  },
  {
    id: 'CLM-TINNITUS-AUD-001',
    title: 'Auditory Cortex Tinnitus Hypothesis',
    indication: 'Tinnitus',
    tier: 'T_EXP',
    tierLabel: 'Tier Exp — Research Only',
    tierBadge: 'badge-tierexp',
    statement: 'Auditory cortex inhibitory stimulation may reduce tinnitus perception — evidence remains conflicting.',
    governanceStatus: 'Research Review',
    lastReviewed: '2026-08-15',
    sourceCount: 4,
  },
];

export default function EvidenceClaimsPage() {
  const [indicationFilter, setIndicationFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const indications = Array.from(new Set(CANONICAL_CLAIMS.map(c => c.indication)));
  const filtered = CANONICAL_CLAIMS.filter(c => {
    if (indicationFilter !== 'all' && c.indication !== indicationFilter) return false;
    if (tierFilter !== 'all' && c.tier !== tierFilter) return false;
    return true;
  });

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Evidence', href: '/evidence' },
          { label: 'Evidence Claims', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier1">EVIDENCE KNOWLEDGE GRAPH</Badge>
            <Badge variant="neutral">Claims Registry</Badge>
          </div>
        }
        title="Evidence Claims"
        subtitle="Approved scientific claims governing target family eligibility. Each claim is independently governed and version-controlled (§197)."
      />

      {/* Filters */}
      <FilterBar>
        <FilterBarGroup label="Indication:" htmlFor="claims-indication-filter">
          <FilterBarSelect
            id="claims-indication-filter"
            value={indicationFilter}
            onChange={e => setIndicationFilter(e.target.value)}
          >
            <option value="all">All Indications</option>
            {indications.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </FilterBarSelect>
        </FilterBarGroup>
        <FilterBarGroup label="Tier:" htmlFor="claims-tier-filter">
          <FilterBarSelect
            id="claims-tier-filter"
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
          >
            <option value="all">All Tiers</option>
            <option value="T1">Tier 1 — Established</option>
            <option value="T2">Tier 2 — Prospectively Supported</option>
            <option value="T3">Tier 3 — Retrospectively Supported</option>
            <option value="T_EXP">Tier Exp — Research Only</option>
          </FilterBarSelect>
        </FilterBarGroup>
        <FilterBarActions>
          <span className="filter-bar-count">
            Showing {filtered.length} of {CANONICAL_CLAIMS.length} claims
          </span>
        </FilterBarActions>
      </FilterBar>

      {/* Claims Table */}
      <Card>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Evidence Claims Registry">
              <thead>
                <tr>
                  <th scope="col">Claim ID</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Claim Title</th>
                  <th scope="col">Evidence Tier</th>
                  <th scope="col">Governance</th>
                  <th scope="col">Sources</th>
                  <th scope="col">Last Reviewed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <TableEmptyRow
                    colSpan={7}
                    message="No evidence claims match current filter criteria."
                  />
                ) : (
                  filtered.map(claim => (
                    <tr key={claim.id}>
                      <td>
                        <code className="text-cyan text-xs">{claim.id}</code>
                      </td>
                      <td><Badge variant="neutral">{claim.indication}</Badge></td>
                      <td>
                        <strong className="text-sm">{claim.title}</strong>
                        <div className="text-xs text-secondary mt-0.5">
                          {claim.statement}
                        </div>
                      </td>
                      <td><Badge className={`${claim.tierBadge}`}>{claim.tierLabel}</Badge></td>
                      <td>
                        <Badge className={`${claim.governanceStatus === 'Approved' ? 'badge-tier1' : 'badge-tierexp'}`}>
                          {claim.governanceStatus}
                        </Badge>
                      </td>
                      <td className="text-center">{claim.sourceCount}</td>
                      <td className="text-xs text-secondary">{claim.lastReviewed}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button variant="secondary" href="/evidence"><ArrowLeftIcon size={14} className="mr-1 inline" /> Evidence Library</Button>
        <Button variant="secondary" href="/evidence/paths">Evidence Paths <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/evidence/target-families">Target Families <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/evidence/sources">Sources <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
      </div>
    </div>
  );
}
