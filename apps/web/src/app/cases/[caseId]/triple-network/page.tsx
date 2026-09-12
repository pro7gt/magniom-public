'use client';

import React, { use, useState, useEffect } from 'react';
import {
  Breadcrumbs,
  CaseNotFoundState,
  PageHeader,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui';
import { caseStore } from '../../../../lib/case-store';
import { TripleNetworkPanel } from '@/components/triple-network-panel';
import {
  buildTripleNetworkProfile,
  CANONICAL_CEN_DEFINITION,
  CANONICAL_DMN_DEFINITION,
  CANONICAL_SN_DEFINITION,
} from '@magniom/networks';
import { buildTripleNetworkViewModel } from '@magniom/presentation';

export default function TripleNetworkPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = use(params);
  const caseId = resolvedParams.caseId;
  const [record, setRecord] = useState(() => caseStore.getCaseRecord(caseId));

  useEffect(() => {
    setRecord(caseStore.getCaseRecord(caseId));
    const unsubscribe = caseStore.subscribe(updatedCaseId => {
      if (updatedCaseId === caseId) {
        setRecord(caseStore.getCaseRecord(caseId));
      }
    });
    return () => unsubscribe();
  }, [caseId]);

  if (!record) {
    return (
      <div className="container page-container-col">
        <CaseNotFoundState caseId={caseId} />
      </div>
    );
  }

  // Build canonical profile for case
  const profile = buildTripleNetworkProfile({
    id: `tn-prof-${caseId.slice(0, 8)}`,
    caseId: caseId,
    configurationId: `net-cfg-${caseId.slice(0, 8)}`,
    connectomeRunId: `run-${caseId.slice(0, 8)}`,
    networkDefinitionReleaseId: 'hcp-mmp1-tri-1.0',
    metricReleaseId: '1.0.0',
    withinMeasurements: [
      {
        network_system_id: 'sys-cen',
        network_code: 'CEN',
        metric_code: 'mean_within_fc',
        raw_value: 0.76,
        interpretation_status: 'supportive',
      },
      {
        network_system_id: 'sys-dmn',
        network_code: 'DMN',
        metric_code: 'mean_within_fc',
        raw_value: 0.81,
        interpretation_status: 'supportive',
      },
      {
        network_system_id: 'sys-sn',
        network_code: 'SN',
        metric_code: 'mean_within_fc',
        raw_value: 0.72,
        interpretation_status: 'supportive',
      },
    ],
    pairwiseMeasurements: [
      {
        relationship_id: 'rel-cen-dmn',
        relationship_code: 'CEN_DMN',
        metric_code: 'cross_fc',
        raw_value: -0.42,
        measurement_run_id: 'run-01',
        reliability_profile_id: 'rel-01',
        interpretation_status: 'supportive',
      },
      {
        relationship_id: 'rel-sn-cen',
        relationship_code: 'SN_CEN',
        metric_code: 'cross_fc',
        raw_value: 0.35,
        measurement_run_id: 'run-01',
        reliability_profile_id: 'rel-01',
        interpretation_status: 'supportive',
      },
      {
        relationship_id: 'rel-sn-dmn',
        relationship_code: 'SN_DMN',
        metric_code: 'cross_fc',
        raw_value: -0.15,
        measurement_run_id: 'run-01',
        reliability_profile_id: 'rel-01',
        interpretation_status: 'supportive',
      },
    ],
    reliability: {
      id: `rel-${caseId.slice(0, 8)}`,
      overall_status: 'high',
      clinical_qualification: 'qualified',
      acquisition_quality: { reliability_class: 'high', metric_value: 12.5, limiting_factors: [] },
      preprocessing_reliability: {
        reliability_class: 'high',
        metric_value: 0.12,
        limiting_factors: [],
      },
      within_network_reliability: {
        reliability_class: 'high',
        metric_value: 0.82,
        limiting_factors: [],
      },
      pairwise_reliability: {
        cen_dmn: { reliability_class: 'high', metric_value: 0.85, limiting_factors: [] },
        sn_cen: { reliability_class: 'high', metric_value: 0.8, limiting_factors: [] },
        sn_dmn: { reliability_class: 'high', metric_value: 0.78, limiting_factors: [] },
      },
      normative_compatibility: { reliability_class: 'high', limiting_factors: [] },
      atlas_sensitivity: { reliability_class: 'high', limiting_factors: [] },
      preprocessing_sensitivity: { reliability_class: 'high', limiting_factors: [] },
    },
    evidenceContext: {
      supporting_claim_ids: ['claim-mdd-cen-001', 'claim-mdd-dmn-002', 'claim-mdd-sn-003'],
      negative_claim_ids: [],
      conflicting_claim_ids: [],
      evidence_level_ceiling: 'B',
      applicability: 'strong',
      interpretation:
        'Level B evidence supports systems-level observations for major depressive disorder.',
    },
    clinicalAuthority: 'contextual',
  });

  const viewModel = buildTripleNetworkViewModel(profile);

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Triple-Network Breadcrumb"
        items={[
          { label: record.clinicalCase.caseCode, href: `/cases/${caseId}` },
          { label: 'Triple-Network Systems Architecture', current: true },
        ]}
      />

      <PageHeader
        title="Triple-Network Systems Layer"
        subtitle="Systems-level functional connectomics observing Central Executive, Default Mode, and Salience network architecture (MAGNIOM-Triple-Network Systems Layer v1.0)."
        actions={<Badge variant="neutral">SYSTEMS CONTEXT ONLY</Badge>}
      />

      {/* Main Panel with Progressive Disclosure Tiers */}
      <TripleNetworkPanel viewModel={viewModel} caseId={caseId} defaultExpandedLevel={2} />

      {/* Frozen Canonical Definition References */}
      <Card className="bg-surface-card">
        <CardHeader>
          <CardTitle as="h2" className="text-sm font-bold uppercase text-secondary">
            Frozen Canonical Network Definitions (HCP-MMP1.0 Glasser Parcels §8, §9)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="triple-network-card">
              <span className="font-semibold text-cyan">Central Executive Network (CEN)</span>
              <div className="mt-1 text-secondary text-xs">
                Atlas:{' '}
                <span className="text-primary font-medium">
                  {CANONICAL_CEN_DEFINITION.atlas_id} {CANONICAL_CEN_DEFINITION.atlas_version}
                </span>
              </div>
              <div className="mt-0.5 text-secondary text-xs">
                Parcels:{' '}
                <span className="font-mono text-primary font-medium">
                  {CANONICAL_CEN_DEFINITION.parcel_ids.length} Glasser regions
                </span>
              </div>
              <div className="mt-0.5 text-muted text-xs">
                DLPFC (p9-46v, 8Av, 46, 9-46d), PPC (LIPd, IP1, IP2)
              </div>
            </div>

            <div className="triple-network-card">
              <span className="font-semibold text-amber">Default Mode Network (DMN)</span>
              <div className="mt-1 text-secondary text-xs">
                Atlas:{' '}
                <span className="text-primary font-medium">
                  {CANONICAL_DMN_DEFINITION.atlas_id} {CANONICAL_DMN_DEFINITION.atlas_version}
                </span>
              </div>
              <div className="mt-0.5 text-secondary text-xs">
                Parcels:{' '}
                <span className="font-mono text-primary font-medium">
                  {CANONICAL_DMN_DEFINITION.parcel_ids.length} Glasser regions
                </span>
              </div>
              <div className="mt-0.5 text-muted text-xs">
                PCC/Precuneus (31pv, 7m, POS2), vmPFC/sgACC (10v, 25, s32), Angular Gyrus (PGi, PGs)
              </div>
            </div>

            <div className="triple-network-card">
              <span className="font-semibold text-emerald">Salience Network (SN)</span>
              <div className="mt-1 text-secondary text-xs">
                Atlas:{' '}
                <span className="text-primary font-medium">
                  {CANONICAL_SN_DEFINITION.atlas_id} {CANONICAL_SN_DEFINITION.atlas_version}
                </span>
              </div>
              <div className="mt-0.5 text-secondary text-xs">
                Parcels:{' '}
                <span className="font-mono text-primary font-medium">
                  {CANONICAL_SN_DEFINITION.parcel_ids.length} Glasser regions
                </span>
              </div>
              <div className="mt-0.5 text-muted text-xs">
                Anterior Insula (AVI, FOP4, MI), dACC (a24pr, p32pr, 24dd)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
