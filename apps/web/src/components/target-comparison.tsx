'use client';

import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Breadcrumbs,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PageHeader,
} from '@/components/ui';

import React, { useState } from 'react';
import {
  ComparisonTableViewModel,
  ConvergenceViewModel,
  Comparison3DViewModel,
} from '@magniom/presentation';
import { Comparison3DMatrix } from './clinical-3d-viewer';

interface TargetComparisonProps {
  caseId: string;
  caseCode?: string;
  tableViewModel: ComparisonTableViewModel;
  convergenceViewModel: ConvergenceViewModel;
  comparison3D?: Comparison3DViewModel | undefined;
}

type SortField = 'role' | 'evidence' | 'domain' | 'reliability';

export function TargetComparison({
  caseId,
  caseCode,
  tableViewModel,
  convergenceViewModel,
  comparison3D,
}: TargetComparisonProps) {
  const [selectedCandId, setSelectedCandId] = useState<string>(
    comparison3D?.candidates[0]?.id || '',
  );
  const [sortField, setSortField] = useState<SortField>('role');
  const [sortAsc, setSortAsc] = useState(true);

  const sortedRows = [...tableViewModel.rows].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'role') comparison = a.roleLabel.localeCompare(b.roleLabel);
    if (sortField === 'evidence')
      comparison = a.evidenceTierLabel.localeCompare(b.evidenceTierLabel);
    if (sortField === 'domain') comparison = a.clinicalDomain.localeCompare(b.clinicalDomain);
    if (sortField === 'reliability')
      comparison = a.reliabilityLabel.localeCompare(b.reliabilityLabel);
    return sortAsc ? comparison : -comparison;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="container page-container-col">
      <Breadcrumbs
        ariaLabel="Comparison Breadcrumb"
        items={[
          { label: caseCode || caseId, href: `/cases/${caseId}` },
          { label: 'Multi-Attribute Comparison', current: true },
        ]}
      />

      <PageHeader
        title="Multi-Attribute Target Candidate Comparison"
        subtitle="Systematic evaluation of competing candidate hypotheses across clinical, biological, and reliability dimensions without forced single-score ranking."
        actions={
          <>
            <Button variant="secondary" href={`/cases/${caseId}/targets`}>
              <ArrowLeftIcon size={14} className="mr-1 inline" /> Return to Target Slate
            </Button>
            <Button
              variant="primary"
              href={`/cases/${caseId}/decision`}
              id="proceed-to-decision-btn"
            >
              Proceed to Clinical Decision <ArrowRightIcon size={14} className="ml-1 inline" />
            </Button>
          </>
        }
      />

      {/* 3D Multi-Target Spatial Matrix */}
      {comparison3D && (
        <Comparison3DMatrix
          comparison={comparison3D}
          selectedCandidateId={selectedCandId}
          onSelectCandidate={setSelectedCandId}
        />
      )}

      {/* Convergence Diagnostic Banner */}
      <Card className="bg-surface-card border-subtle">
        <CardHeader className="flex justify-between items-center mb-2">
          <CardTitle as="h2" className="text-lg font-bold text-cyan">
            Spatial Convergence Diagnostic: {convergenceViewModel.headline}
          </CardTitle>
          <Badge className={`${convergenceViewModel.badgeClass}`}>
            {convergenceViewModel.convergenceLevel} CONVERGENCE
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary">{convergenceViewModel.summary}</p>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <div className="comparison-table-wrapper">
        <table className="comparison-table" aria-label="Target Candidate Comparison Matrix">
          <thead>
            <tr>
              <th className="cursor-pointer" onClick={() => handleSort('role')}>
                Role & Subtitle
                {sortField === 'role' &&
                  (sortAsc ? (
                    <ChevronUpIcon size={12} className="sort-icon" />
                  ) : (
                    <ChevronDownIcon size={12} className="sort-icon" />
                  ))}
              </th>
              <th>Target Family & MNI</th>
              <th className="cursor-pointer" onClick={() => handleSort('evidence')}>
                Evidence Tier
                {sortField === 'evidence' &&
                  (sortAsc ? (
                    <ChevronUpIcon size={12} className="sort-icon" />
                  ) : (
                    <ChevronDownIcon size={12} className="sort-icon" />
                  ))}
              </th>
              <th className="cursor-pointer" onClick={() => handleSort('domain')}>
                Clinical Domain
                {sortField === 'domain' &&
                  (sortAsc ? (
                    <ChevronUpIcon size={12} className="sort-icon" />
                  ) : (
                    <ChevronDownIcon size={12} className="sort-icon" />
                  ))}
              </th>
              <th className="cursor-pointer" onClick={() => handleSort('reliability')}>
                Connectome Reliability
                {sortField === 'reliability' &&
                  (sortAsc ? (
                    <ChevronUpIcon size={12} className="sort-icon" />
                  ) : (
                    <ChevronDownIcon size={12} className="sort-icon" />
                  ))}
              </th>
              <th>Personalisation Displacement</th>
              <th>Anatomical Accessibility</th>
              <th>Primary Clinical Uncertainty</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map(row => (
              <tr key={row.candidateId}>
                <td>
                  <strong className="text-cyan">{row.roleLabel}</strong>
                </td>
                <td>
                  <div>{row.targetFamily}</div>
                  <div className="font-mono text-xs text-secondary">{row.coordinateFormatted}</div>
                </td>
                <td>
                  <Badge className={`${row.evidenceTierBadgeClass}`}>{row.evidenceTierLabel}</Badge>
                </td>
                <td>{row.clinicalDomain}</td>
                <td>
                  <Badge className={`${row.reliabilityBadgeClass}`}>{row.reliabilityLabel}</Badge>
                </td>
                <td>
                  <strong className="text-primary">{row.personalisationDisplacement}</strong>
                </td>
                <td>{row.anatomicalAccessibility}</td>
                <td className="text-rose text-sm">{row.mainUncertainty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Persistent Uncertainty Breakdown Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">
            7-Dimensional Decision Uncertainty Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="stat-card-grid">
            <div className="p-3.5 rounded-lg bg-glass-card text-sm">
              <strong className="text-cyan">1. Evidence Uncertainty:</strong>
              <p className="text-secondary mt-1">
                Level of replicated prospective randomized trial support for candidate target
                family.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-glass-card text-sm">
              <strong className="text-cyan">2. Phenotype Concordance Uncertainty:</strong>
              <p className="text-secondary mt-1">
                Alignment between patient dominant symptom clusters and target circuit biological
                engagement.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-glass-card text-sm">
              <strong className="text-cyan">3. Connectome Reliability Uncertainty:</strong>
              <p className="text-secondary mt-1">
                Test-retest stability across split-half time series and scan-to-scan motion
                variance.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-glass-card text-sm">
              <strong className="text-cyan">4. Spatial Geodesic Uncertainty:</strong>
              <p className="text-secondary mt-1">
                Displacement distance from established group normative reference coordinates.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-glass-card text-sm">
              <strong className="text-cyan">5. Anatomical Accessibility Uncertainty:</strong>
              <p className="text-secondary mt-1">
                Cortical depth and scalp-to-cortex distance affecting induced electric field focus.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-glass-card text-sm">
              <strong className="text-cyan">6. External Validity Uncertainty:</strong>
              <p className="text-secondary mt-1">
                Degree of clinical trial population overlap with specific patient treatment
                resistance history.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
