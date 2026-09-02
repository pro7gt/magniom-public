'use client';

import React from 'react';
import Link from 'next/link';

export type WorkflowStage =
  | 'overview'
  | 'assessment'
  | 'phenotype'
  | 'imaging'
  | 'connectome'
  | 'targets'
  | 'compare'
  | 'decision'
  | 'audit';

interface WorkflowRailProps {
  caseId: string;
  activeStage: WorkflowStage;
  caseState: string;
  isPhenotypeApproved: boolean;
  isDecisionSigned: boolean;
}

export function WorkflowRail({
  caseId,
  activeStage,
  caseState,
  isPhenotypeApproved,
  isDecisionSigned,
}: WorkflowRailProps) {
  const steps: Array<{
    id: WorkflowStage;
    label: string;
    path: string;
    isCompleted: boolean;
    isLocked: boolean;
  }> = [
    {
      id: 'overview',
      label: '1. Overview',
      path: `/cases/${caseId}`,
      isCompleted: true,
      isLocked: false,
    },
    {
      id: 'phenotype',
      label: '2. Phenotype',
      path: `/cases/${caseId}/phenotype`,
      isCompleted: isPhenotypeApproved,
      isLocked: false,
    },
    {
      id: 'targets',
      label: '3. Target Slate',
      path: `/cases/${caseId}/targets`,
      isCompleted: isDecisionSigned || ['target_slate_ready', 'clinician_review', 'decision_signed'].includes(caseState),
      isLocked: !isPhenotypeApproved && caseState === 'draft',
    },
    {
      id: 'compare',
      label: '4. Comparison',
      path: `/cases/${caseId}/compare`,
      isCompleted: isDecisionSigned,
      isLocked: !isPhenotypeApproved && caseState === 'draft',
    },
    {
      id: 'decision',
      label: '5. Clinical Decision',
      path: `/cases/${caseId}/decision`,
      isCompleted: isDecisionSigned,
      isLocked: !isPhenotypeApproved && caseState === 'draft',
    },
    {
      id: 'audit',
      label: '6. Immutable Audit',
      path: `/cases/${caseId}/audit`,
      isCompleted: isDecisionSigned,
      isLocked: false,
    },
  ];

  return (
    <nav aria-label="Clinical Case Workflow Rail" className="workflow-rail">
      {steps.map((step, idx) => {
        const isActive = activeStage === step.id;
        const icon = step.isCompleted ? '✓' : isActive ? '●' : '○';

        return (
          <React.Fragment key={step.id}>
            {step.isLocked ? (
              <span className="workflow-step locked" title="Complete earlier steps to unlock">
                <span>{icon}</span>
                <span>{step.label}</span>
              </span>
            ) : (
              <Link
                href={step.path}
                className={`workflow-step ${step.isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
              >
                <span>{icon}</span>
                <span>{step.label}</span>
              </Link>
            )}
            {idx < steps.length - 1 && <span className="workflow-arrow">→</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
