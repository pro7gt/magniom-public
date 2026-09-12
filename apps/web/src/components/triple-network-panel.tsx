'use client';

import React, { useState } from 'react';
import type { TripleNetworkProfileViewModel } from '@magniom/presentation';
import {
  Badge,
  Button,
  AlertTriangleIcon,
  ArrowRightIcon,
  ArrowLeftRightIcon,
} from '@/components/ui';

interface TripleNetworkPanelProps {
  viewModel: TripleNetworkProfileViewModel;
  caseId?: string;
  defaultExpandedLevel?: 1 | 2 | 3;
}

export function TripleNetworkPanel({
  viewModel,
  caseId,
  defaultExpandedLevel = 1,
}: TripleNetworkPanelProps) {
  const [disclosureLevel, setDisclosureLevel] = useState<1 | 2 | 3>(defaultExpandedLevel);
  const [activeRel, setActiveRel] = useState<'cen_dmn' | 'sn_cen' | 'sn_dmn'>('cen_dmn');

  return (
    <section aria-label="Triple-Network Systems Context" className="triple-network-panel">
      {/* Non-Causal Clinical Disclaimer Banner (§73) */}
      <div role="note" aria-label="Clinical Disclaimer" className="triple-network-disclaimer">
        <AlertTriangleIcon size={16} className="flex-shrink-0 text-warning" />
        <div>
          <strong className="text-warning">CLINICAL NOTICE (§73): </strong>
          {viewModel.nonCausalDisclaimer}
        </div>
      </div>

      {/* Header Row: Title, Authority Status, Reliability Badge */}
      <div className="triple-network-header">
        <div>
          <div className="triple-network-title-group">
            <span className="triple-network-indicator" aria-hidden="true" />
            <h2 className="text-base font-bold text-primary">
              Triple-Network Systems Architecture
            </h2>
            <span className="text-xs text-muted">v{viewModel.version}</span>
          </div>
          <p className="text-xs text-secondary mt-1">
            CEN (Central Executive) · DMN (Default Mode) · SN (Salience)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Authority Disclosure (§76) */}
          <Badge variant="neutral">{viewModel.clinicalAuthorityLabel}</Badge>

          {/* Reliability Badge (§44) */}
          <Badge className={viewModel.reliability.badgeClass}>
            {viewModel.reliability.label} RELIABILITY
          </Badge>
        </div>
      </div>

      {/* Progressive Disclosure Controls (§75) */}
      <div className="triple-network-controls">
        <div
          className="triple-network-tier-group"
          role="tablist"
          aria-label="Progressive Disclosure Tiers"
        >
          <Button
            type="button"
            size="sm"
            variant={disclosureLevel === 1 ? 'primary' : 'ghost'}
            onClick={() => setDisclosureLevel(1)}
            aria-selected={disclosureLevel === 1}
            role="tab"
          >
            Tier 1: Summary
          </Button>
          <Button
            type="button"
            size="sm"
            variant={disclosureLevel === 2 ? 'primary' : 'ghost'}
            onClick={() => setDisclosureLevel(2)}
            aria-selected={disclosureLevel === 2}
            role="tab"
          >
            Tier 2: Relational Triangle & Metrics
          </Button>
          <Button
            type="button"
            size="sm"
            variant={disclosureLevel === 3 ? 'primary' : 'ghost'}
            onClick={() => setDisclosureLevel(3)}
            aria-selected={disclosureLevel === 3}
            role="tab"
          >
            Tier 3: Audit & Evidence
          </Button>
        </div>

        {caseId && (
          <Button
            variant="ghost"
            size="sm"
            href={`/cases/${caseId}/triple-network`}
            className="text-cyan font-medium"
          >
            Full Systems View <ArrowRightIcon size={12} className="ml-1" />
          </Button>
        )}
      </div>

      {/* TIER 1: Summary Overview */}
      <div className="triple-network-grid">
        <div className="triple-network-card">
          <div className="flex justify-between text-xs text-muted">
            <span>Primary Interaction</span>
            <span className="font-mono text-cyan font-semibold">
              {viewModel.relationships.cen_dmn.couplingFormatted}
            </span>
          </div>
          <div className="mt-1 font-semibold text-primary text-sm">
            {viewModel.relationships.cen_dmn.name}
          </div>
          <div className="mt-1 text-xs text-secondary">
            Segregation Index:{' '}
            <span className="font-mono text-primary">
              {viewModel.relationships.cen_dmn.segregationFormatted}
            </span>
          </div>
        </div>

        <div className="triple-network-card">
          <div className="flex justify-between text-xs text-muted">
            <span>Salience Modulation</span>
            <span className="font-mono text-cyan font-semibold">
              {viewModel.relationships.sn_cen.couplingFormatted}
            </span>
          </div>
          <div className="mt-1 font-semibold text-primary text-sm">
            {viewModel.relationships.sn_cen.name}
          </div>
          <div className="mt-1 text-xs text-secondary">
            Status:{' '}
            <span className="capitalize text-primary">{viewModel.relationships.sn_cen.status}</span>
          </div>
        </div>

        <div className="triple-network-card">
          <div className="flex justify-between text-xs text-muted">
            <span>Default Attenuation</span>
            <span className="font-mono text-cyan font-semibold">
              {viewModel.relationships.sn_dmn.couplingFormatted}
            </span>
          </div>
          <div className="mt-1 font-semibold text-primary text-sm">
            {viewModel.relationships.sn_dmn.name}
          </div>
          <div className="mt-1 text-xs text-secondary">
            Status:{' '}
            <span className="capitalize text-primary">{viewModel.relationships.sn_dmn.status}</span>
          </div>
        </div>
      </div>

      {/* TIER 2: Relational Triangle & Detailed Node Cards */}
      {disclosureLevel >= 2 && (
        <div className="triple-network-audit-box">
          <h3 className="text-xs font-bold text-secondary uppercase mb-2">
            Pairwise Relational Geometry (Non-Collapsible Multi-Network Representation §4, §16)
          </h3>

          {/* Interactive Relational Triangle Representation */}
          <div className="triple-network-triangle">
            <div className="triple-network-triangle-nodes">
              {/* CEN Node */}
              <div className="triple-network-node triple-network-node-cen">
                <div className="triple-network-node-circle">CEN</div>
                <span className="text-xs font-medium text-secondary mt-1">Executive</span>
                <span className="font-mono text-xs text-cyan">
                  {viewModel.networks.cen.integrityFormatted}
                </span>
              </div>

              {/* DMN Node */}
              <div className="triple-network-node triple-network-node-dmn">
                <div className="triple-network-node-circle">DMN</div>
                <span className="text-xs font-medium text-secondary mt-1">Default Mode</span>
                <span className="font-mono text-xs text-amber">
                  {viewModel.networks.dmn.integrityFormatted}
                </span>
              </div>
            </div>

            {/* SN Node (Apex Bottom) */}
            <div className="triple-network-node triple-network-node-sn">
              <div className="triple-network-node-circle">SN</div>
              <span className="text-xs font-medium text-secondary mt-1">Salience / Switch</span>
              <span className="font-mono text-xs text-emerald">
                {viewModel.networks.sn.integrityFormatted}
              </span>
            </div>

            {/* Pairwise Relationship Switcher Buttons */}
            <div className="triple-network-rel-grid">
              <Button
                type="button"
                variant={activeRel === 'cen_dmn' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveRel('cen_dmn')}
                className="w-full flex flex-col items-center py-2"
              >
                <span className="font-semibold flex items-center gap-1">
                  CEN <ArrowLeftRightIcon size={10} /> DMN
                </span>
                <span className="font-mono text-xs mt-0.5">
                  r = {viewModel.relationships.cen_dmn.couplingFormatted}
                </span>
              </Button>

              <Button
                type="button"
                variant={activeRel === 'sn_cen' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveRel('sn_cen')}
                className="w-full flex flex-col items-center py-2"
              >
                <span className="font-semibold flex items-center gap-1">
                  SN <ArrowLeftRightIcon size={10} /> CEN
                </span>
                <span className="font-mono text-xs mt-0.5">
                  r = {viewModel.relationships.sn_cen.couplingFormatted}
                </span>
              </Button>

              <Button
                type="button"
                variant={activeRel === 'sn_dmn' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveRel('sn_dmn')}
                className="w-full flex flex-col items-center py-2"
              >
                <span className="font-semibold flex items-center gap-1">
                  SN <ArrowLeftRightIcon size={10} /> DMN
                </span>
                <span className="font-mono text-xs mt-0.5">
                  r = {viewModel.relationships.sn_dmn.couplingFormatted}
                </span>
              </Button>
            </div>

            {/* Selected Relationship Interpretation */}
            <div className="triple-network-card mt-3">
              <strong className="text-primary">{viewModel.relationships[activeRel].name}:</strong>{' '}
              <span className="text-secondary text-xs">
                {viewModel.relationships[activeRel].interpretation}
              </span>
            </div>
          </div>

          {/* Within-Network Node Breakdown */}
          <div className="triple-network-grid">
            <div className="triple-network-card">
              <div className="text-xs font-semibold text-cyan">{viewModel.networks.cen.name}</div>
              <div className="text-xs text-secondary mt-1">
                Within-Network Integrity:{' '}
                <span className="font-mono text-primary">
                  {viewModel.networks.cen.integrityFormatted}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">{viewModel.networks.cen.interpretation}</p>
            </div>

            <div className="triple-network-card">
              <div className="text-xs font-semibold text-amber">{viewModel.networks.dmn.name}</div>
              <div className="text-xs text-secondary mt-1">
                Within-Network Integrity:{' '}
                <span className="font-mono text-primary">
                  {viewModel.networks.dmn.integrityFormatted}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">{viewModel.networks.dmn.interpretation}</p>
            </div>

            <div className="triple-network-card">
              <div className="text-xs font-semibold text-emerald">{viewModel.networks.sn.name}</div>
              <div className="text-xs text-secondary mt-1">
                Within-Network Integrity:{' '}
                <span className="font-mono text-primary">
                  {viewModel.networks.sn.integrityFormatted}
                </span>
              </div>
              <p className="text-xs text-muted mt-1">{viewModel.networks.sn.interpretation}</p>
            </div>
          </div>
        </div>
      )}

      {/* TIER 3: Audit Trail, Deterministic Digest & Evidence */}
      {disclosureLevel >= 3 && (
        <div className="triple-network-audit-box text-xs">
          <h3 className="text-xs font-bold text-secondary uppercase mb-2">
            System Lineage & Deterministic Audit Trail (§50, §51, §78)
          </h3>

          <div className="triple-network-card font-mono text-xs mb-3">
            <div className="flex justify-between text-secondary py-0.5">
              <span>Profile ID:</span>
              <span className="text-primary">{viewModel.profileId}</span>
            </div>
            <div className="flex justify-between text-secondary py-0.5">
              <span>SHA-256 Digest:</span>
              <span className="text-cyan">{viewModel.profileHash}</span>
            </div>
            <div className="flex justify-between text-secondary py-0.5">
              <span>Evidence Ceiling:</span>
              <span className="text-emerald font-semibold">
                Level {viewModel.evidenceContext.evidenceLevelCeiling} (Strictly Enforced)
              </span>
            </div>
            <div className="flex justify-between text-secondary py-0.5">
              <span>Clinical Qualification:</span>
              <span className="text-primary">{viewModel.reliability.clinicalQualification}</span>
            </div>
          </div>

          {/* Interpretation Facts & Disclosures */}
          <div className="flex flex-col gap-2">
            <div className="font-semibold text-primary">
              Synthesized Systems Interpretation ({viewModel.interpretationConfidence} confidence):
            </div>
            <p className="text-secondary">{viewModel.interpretationSummary}</p>

            {viewModel.supportingFacts.length > 0 && (
              <div>
                <div className="font-medium text-emerald">Supporting Observations:</div>
                <ul className="text-secondary pl-5 mt-0.5">
                  {viewModel.supportingFacts.map((fact, idx) => (
                    <li key={idx}>• {fact}</li>
                  ))}
                </ul>
              </div>
            )}

            {viewModel.limitations.length > 0 && (
              <div>
                <div className="font-medium text-danger">Technical & Clinical Limitations:</div>
                <ul className="text-muted pl-5 mt-0.5">
                  {viewModel.limitations.map((lim, idx) => (
                    <li key={idx}>• {lim}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
