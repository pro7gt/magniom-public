'use client';

import {
  AlertTriangleIcon,
  CheckIcon,
  ArrowLeftRightIcon,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui';

import React from 'react';
import type { Comparison3DViewModel } from '@magniom/presentation';

interface Comparison3DMatrixProps {
  comparison: Comparison3DViewModel;
  selectedCandidateId: string;
  onSelectCandidate: (candidateId: string) => void;
}

export function Comparison3DMatrix({
  comparison,
  selectedCandidateId,
  onSelectCandidate,
}: Comparison3DMatrixProps) {
  return (
    <Card className="flex flex-col gap-4" aria-label="3D Multi-Target Spatial Matrix">
      <CardHeader className="flex justify-between items-center p-0">
        <div>
          <CardTitle as="h3" className="text-base font-bold text-primary">
            3D Multi-Target Spatial Localization & Redundancy Matrix
          </CardTitle>
          <CardDescription className="text-sm text-secondary mt-0.5">
            Systematic spatial separation and redundancy assessment across candidate hypotheses.
          </CardDescription>
        </div>

        {comparison.redundantPairsCount > 0 ? (
          <Badge variant="warning" className="text-xs">
            <AlertTriangleIcon size={12} className="mr-1 inline text-amber" />{' '}
            {comparison.redundantPairsCount} Redundant Pair(s) Detected (&lt; 15 mm)
          </Badge>
        ) : (
          <Badge variant="tier1" className="text-xs">
            <CheckIcon size={12} className="mr-1 inline text-emerald" /> All Targets Distinct (&gt;
            15 mm)
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-4">
        {/* Candidate Selector Chips */}
        <div className="flex flex-wrap gap-2">
          {comparison.candidates.map(c => {
            const isSelected = c.id === selectedCandidateId;
            return (
              <Button
                className={`btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'} flex items-center gap-1.5 text-xs`}
                key={c.id}
                type="button"
                onClick={() => onSelectCandidate(c.id)}
              >
                <span
                  className="w-2 h-2 rounded-full inline-block shrink-0"
                  style={{ background: c.markerColor }}
                />
                <strong>{c.roleTitle}:</strong>
                <span>{c.mniFormatted}</span>
              </Button>
            );
          })}
        </div>

        {/* Pairwise Distance Matrix Table */}
        <div className="comparison-table-wrapper">
          <table
            className="comparison-table table-sm w-full text-xs"
            aria-label="Pairwise Candidate Separation Distance Matrix"
          >
            <thead>
              <tr className="border-b text-left">
                <th className="p-1.5">Candidate Pair</th>
                <th className="p-1.5">Spatial Distance</th>
                <th className="p-1.5">Target Family</th>
                <th className="p-1.5">Redundancy Classification</th>
              </tr>
            </thead>
            <tbody>
              {comparison.pairwiseDistances.map((pair, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-subtle ${pair.isRedundant ? 'bg-rose-500/10' : ''}`}
                >
                  <td className="p-1.5 font-semibold text-primary">
                    {pair.candidateAName}{' '}
                    <ArrowLeftRightIcon size={12} className="text-muted inline mx-1.5" />{' '}
                    {pair.candidateBName}
                  </td>
                  <td
                    className={`p-1.5 font-mono font-bold ${
                      pair.distanceMm < 15 ? 'text-amber' : 'text-cyan'
                    }`}
                  >
                    {pair.distanceMm.toFixed(1)} mm
                  </td>
                  <td className="p-1.5 text-secondary">
                    {pair.isRedundant ? 'Identical Target Family' : 'Distinct / Alternative Family'}
                  </td>
                  <td className="p-1.5">
                    {pair.isRedundant ? (
                      <Badge variant="warning" className="text-xs">
                        Redundant (&lt; 15 mm)
                      </Badge>
                    ) : (
                      <Badge variant="neutral" className="text-xs">
                        Spatially Differentiated
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
