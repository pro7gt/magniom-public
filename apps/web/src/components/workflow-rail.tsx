'use client';

import React from 'react';
import Link from 'next/link';
import type { WorkflowViewModel, WorkflowStepViewModel } from '@magniom/presentation';

export type WorkflowStage =
  | 'overview'
  | 'assessment'
  | 'context'
  | 'phenotype'
  | 'measurements'
  | 'imaging'
  | 'connectome'
  | 'targets'
  | 'compare'
  | 'decision'
  | 'audit';

interface WorkflowRailProps {
  caseId: string;
  activeStage?: WorkflowStage | undefined;
  caseState?: string | undefined;
  isPhenotypeApproved?: boolean | undefined;
  isDecisionSigned?: boolean | undefined;
  workflow?: WorkflowViewModel | undefined;
}

export function WorkflowRail({
  caseId,
  activeStage = 'overview',
  caseState = 'target_slate_ready',
  isPhenotypeApproved = true,
  isDecisionSigned = false,
  workflow,
}: WorkflowRailProps) {
  // If v2 dynamic WorkflowViewModel is provided, render directly from view model (§83–87)
  if (workflow && workflow.steps.length > 0) {
    return (
      <nav aria-label="Clinical Case Dynamic Workflow Rail" className="workflow-rail">
        {workflow.steps.map((step: WorkflowStepViewModel, idx: number) => {
          const isCurrent = step.state === 'current';
          const isComplete = step.state === 'complete';
          const isActionReq = step.state === 'action_required';

          return (
            <React.Fragment key={step.id}>
              {!step.isAccessible ? (
                <span
                  className="workflow-step locked"
                  title="Complete prerequisites to access step"
                  aria-disabled="true"
                >
                  <span className="step-symbol" aria-hidden="true">
                    {step.stateSymbol}
                  </span>
                  <span>
                    {step.stepNumber}. {step.label}
                  </span>
                </span>
              ) : (
                <Link
                  href={step.path}
                  className={`workflow-step ${isCurrent ? 'active' : ''} ${isComplete ? 'completed' : ''} ${isActionReq ? 'action-required' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className="step-symbol" aria-hidden="true">
                    {step.stateSymbol}
                  </span>
                  <span>
                    {step.stepNumber}. {step.label}
                  </span>
                </Link>
              )}

              {idx < workflow.steps.length - 1 && (
                <span className="workflow-connector" aria-hidden="true">
                  →
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  }

  // Fallback backward-compatible rail
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
      isCompleted:
        isDecisionSigned ||
        ['target_slate_ready', 'clinician_review', 'decision_signed'].includes(caseState),
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
                <span className="step-symbol" aria-hidden="true">
                  {icon}
                </span>
                <span>{step.label}</span>
              </span>
            ) : (
              <Link
                href={step.path}
                className={`workflow-step ${isActive ? 'active' : ''} ${step.isCompleted ? 'completed' : ''}`}
                aria-current={isActive ? 'step' : undefined}
              >
                <span className="step-symbol" aria-hidden="true">
                  {icon}
                </span>
                <span>{step.label}</span>
              </Link>
            )}

            {idx < steps.length - 1 && (
              <span className="workflow-connector" aria-hidden="true">
                →
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
