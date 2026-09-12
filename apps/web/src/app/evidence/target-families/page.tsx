'use client';

import {
  Breadcrumbs,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ArrowRightIcon,
  ArrowLeftIcon,
  TableEmptyRow,
  PageHeader,
} from '@/components/ui';

import React from 'react';

// ==========================================
// Target Families Browser (§197)
// Browse TargetFamily entries with evidence governance links.
// ==========================================

const TARGET_FAMILIES = [
  { id: 'TF-MDD-L-DLPFC-001', name: 'Left DLPFC — sgACC Convergent', indication: 'MDD', tier: 'Tier 1', tierBadge: 'badge-tier1', geometryType: 'Point / ROI', claimCount: 3, status: 'Active Clinical' },
  { id: 'TF-MDD-REWARD-001', name: 'Reward Circuit — Anhedonia', indication: 'MDD', tier: 'Tier 2', tierBadge: 'badge-tier2', geometryType: 'Point', claimCount: 2, status: 'Active Clinical' },
  { id: 'TF-MDD-DMPFC-001', name: 'Dorsomedial PFC — Anxiosomatic', indication: 'MDD', tier: 'Tier 2', tierBadge: 'badge-tier2', geometryType: 'Point', claimCount: 2, status: 'Active Clinical' },
  { id: 'TF-PAIN-M1-001', name: 'Contralateral M1 — Somatotopic', indication: 'Pain', tier: 'Tier 1', tierBadge: 'badge-tier1', geometryType: 'Somatotopic', claimCount: 2, status: 'Active Clinical' },
  { id: 'TF-STR-M1-001', name: 'Ipsilesional M1 — Motor Recovery', indication: 'Stroke Motor', tier: 'Tier 2', tierBadge: 'badge-tier2', geometryType: 'Somatotopic', claimCount: 2, status: 'Validation' },
  { id: 'TF-OCD-MPFC-001', name: 'mPFC/ACC — Compulsive Circuit', indication: 'OCD', tier: 'Tier 2', tierBadge: 'badge-tier2', geometryType: 'Coil-Field', claimCount: 1, status: 'Active Clinical' },
  { id: 'TF-TINN-AUD-001', name: 'Auditory Cortex — Tinnitus', indication: 'Tinnitus', tier: 'Tier Exp', tierBadge: 'badge-tierexp', geometryType: 'Point / ROI', claimCount: 1, status: 'Research Only' },
];

export default function TargetFamiliesPage() {
  return (
    <div className="container page-container-col">
      <Breadcrumbs
        items={[
          { label: 'Evidence', href: '/evidence' },
          { label: 'Target Families', current: true },
        ]}
      />

      <PageHeader
        eyebrow={
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="tier1">EVIDENCE KNOWLEDGE GRAPH</Badge>
            <Badge variant="neutral">Target Families</Badge>
          </div>
        }
        title="Target Families"
        subtitle="Governed anatomical-functional territories from which candidate targets may be derived (§197)."
      />


      <Card>
        <CardHeader>
          <CardTitle as="h2" className="text-cyan">
            Active Target Family Registry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="comparison-table-wrapper">
            <table className="comparison-table" aria-label="Target Families Registry">
              <thead>
                <tr>
                  <th scope="col">Family ID</th>
                  <th scope="col">Name</th>
                  <th scope="col">Indication</th>
                  <th scope="col">Evidence Tier</th>
                  <th scope="col">Geometry Type</th>
                  <th scope="col">Claims</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {TARGET_FAMILIES.length === 0 ? (
                  <TableEmptyRow
                    colSpan={7}
                    message="No target families registered."
                  />
                ) : (
                  TARGET_FAMILIES.map(tf => (
                    <tr key={tf.id}>
                      <td><code className="text-cyan text-xs">{tf.id}</code></td>
                      <td><strong className="text-sm">{tf.name}</strong></td>
                      <td><Badge variant="neutral">{tf.indication}</Badge></td>
                      <td><Badge className={`${tf.tierBadge}`}>{tf.tier}</Badge></td>
                      <td className="text-sm text-secondary">{tf.geometryType}</td>
                      <td className="text-center">{tf.claimCount}</td>
                      <td>
                        <Badge className={`${tf.status === 'Active Clinical' ? 'badge-tier1' : tf.status === 'Validation' ? 'badge-tier2' : 'badge-tierexp'}`}>
                          {tf.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" href="/evidence"><ArrowLeftIcon size={14} className="mr-1 inline" /> Evidence Library</Button>
        <Button variant="secondary" href="/evidence/claims">Claims <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/evidence/paths">Evidence Paths <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
        <Button variant="secondary" href="/evidence/sources">Sources <ArrowRightIcon size={14} className="ml-1 inline" /></Button>
      </div>
    </div>
  );
}
