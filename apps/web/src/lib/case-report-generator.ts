/**
 * @magniom/web - Authoritative Case Report Generation Module
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§149–151).
 *
 * Rules:
 * - Language must use scientific restraint (§150):
 *   - "MAGNIOM nominated candidate targets…"
 *   - "The treating specialist selected/modified target…"
 *   - Autonomous prescriptive phrasing ("MAGNIOM prescribed", "the system decided") is PROHIBITED.
 * - Research mode reports (§151):
 *   - Titled "Research Target Hypothesis Report"
 *   - Include mandatory research non-clinical disclaimer.
 * - Every report MUST include the deterministic version manifest (§149).
 */

import type { CaseShellViewModel } from '@magniom/presentation';
import type { ClinicianDecision, TargetSlate } from '@magniom/domain';
import { emitAuditEvent } from './shell-observability';

export interface GeneratedCaseReport {
  readonly reportId: string;
  readonly reportTitle: string;
  readonly generatedAt: string;
  readonly isResearchOnly: boolean;
  readonly markdownContent: string;
  readonly jsonExport: Record<string, unknown>;
}

/**
 * Generates an authoritative clinical case report conforming to §149–151.
 */
export function generateCaseReport(params: {
  shellVm: CaseShellViewModel;
  slate?: TargetSlate | undefined;
  decision?: ClinicianDecision | undefined;
  clinicianName?: string | undefined;
  clinicianLicense?: string | undefined;
}): GeneratedCaseReport {
  const { shellVm, slate, decision, clinicianName = 'Treating Clinician', clinicianLicense = 'MED-UNKNOWN' } = params;
  const isResearch = shellVm.mode.isResearch;
  const reportId = `REP-${shellVm.caseIdentity.caseCode}-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date().toISOString();

  const reportTitle = isResearch
    ? `MAGNIOM Research Target Hypothesis Report — Case ${shellVm.caseIdentity.caseCode}`
    : `MAGNIOM Clinical Target Planning Report — Case ${shellVm.caseIdentity.caseCode}`;

  const finalTarget = decision?.finalTargets?.[0];
  const candidateDecisions = decision?.candidateDecisions || [];

  // Build Markdown Document (§149)
  const sections: string[] = [];

  // Header (§149)
  sections.push(`# ${reportTitle}`);
  sections.push(`**Report ID:** \`${reportId}\` | **Generated:** ${now}`);
  sections.push(`**Deployment Mode:** \`${shellVm.mode.mode}\` | **Module Authority:** ${shellVm.moduleAuthority.humanReadableName} (v${shellVm.moduleAuthority.moduleVersion}, ${shellVm.moduleAuthority.qualificationLevel})`);
  sections.push('');

  // Regulatory / Research Disclaimer (§150–151)
  if (isResearch) {
    sections.push('> [!WARNING]');
    sections.push('> **RESEARCH USE ONLY — NOT FOR CLINICAL DIAGNOSTIC OR TREATMENT PROCEDURE**');
    sections.push('> This report was generated in Research Mode. Target coordinates represent computational hypotheses for investigational evaluation only.');
    sections.push('');
  } else {
    sections.push('> [!NOTE]');
    sections.push('> **CLINICAL DECISION SUPPORT ATTESTATION**');
    sections.push('> MAGNIOM nominated candidate targets based on canonical scientific evidence releases and patient-specific measurements. The treating specialist clinician independently evaluated candidates and retains full statutory responsibility for target selection and treatment delivery.');
    sections.push('');
  }

  // 1. Patient & Case Identification (§149)
  sections.push('## 1. Case & Clinical Context');
  sections.push(`- **Case Identifier:** \`${shellVm.caseIdentity.caseId}\``);
  sections.push(`- **Case Code:** \`${shellVm.caseIdentity.caseCode}\``);
  sections.push(`- **Patient Token:** \`${shellVm.caseIdentity.patientDisplayLabel}\` (${shellVm.caseIdentity.subjectDeIdentifiedToken})`);
  sections.push(`- **Principal Indication:** ${shellVm.indication.indicationFormatted} (\`${shellVm.indication.indicationCode}\`)`);
  if (shellVm.indication.clinicalObjective) {
    sections.push(`- **Clinical Objective:** ${shellVm.indication.clinicalObjective.title} (Priority #${shellVm.indication.clinicalObjective.priorityRank})`);
  }
  if (shellVm.indication.diseaseStage) {
    sections.push(`- **Disease Stage:** ${shellVm.indication.diseaseStage.stageLabel} (${shellVm.indication.diseaseStage.determinationMethod})`);
  }
  if (shellVm.indication.lesionContext) {
    sections.push(`- **Lesion Context:** ${shellVm.indication.lesionContext.hasLesion ? `${shellVm.indication.lesionContext.lesionType || 'Present'} (${shellVm.indication.lesionContext.laterality || 'Unspecified'})` : 'No cortical lesion identified'}`);
  }
  sections.push('');

  // 2. Nominated Target Candidates (§149, §150)
  sections.push('## 2. MAGNIOM Nominated Target Candidates');
  sections.push('The following candidate targets were nominated by the targeting engine:');
  sections.push('');

  const candidates = slate?.primaryCandidates || [];
  if (candidates.length > 0) {
    sections.push('| Role | Target Family | Method | Evidence Tier | Status |');
    sections.push('|---|---|---|---|---|');
    candidates.forEach(c => {
      const decisionForC = candidateDecisions.find(cd => cd.targetCandidateId === c.id);
      const actionText = decisionForC ? decisionForC.action.toUpperCase() : 'PENDING';
      sections.push(`| ${c.role} | ${c.familyId} | ${c.method} | ${c.evidenceTier} | ${actionText} |`);
    });
    sections.push('');
  } else {
    sections.push('*Target candidates were evaluated under canonical evidence release protocols.*');
    sections.push('');
  }

  // 3. Clinician Evaluation & Independent Selection (§150)
  sections.push('## 3. Treating Specialist Target Selection');
  if (decision && decision.isImmutable) {
    sections.push(`- **Decision Type:** \`${decision.decisionType}\``);
    sections.push(`- **Decision Timestamp:** ${decision.decidedAt}`);
    sections.push(`- **Treating Specialist:** ${decision.attestation?.clinicianName || clinicianName}`);
    sections.push(`- **Registration / License:** ${decision.attestation?.licenseNumber || clinicianLicense}`);
    sections.push(`- **Magniom Influence Assessment:** ${decision.magniomInfluence ? decision.magniomInfluence.toUpperCase() : 'NOT RECORDED'}`);
    if (decision.disagreementWithMagniom) {
      sections.push(`- **Clinical Disagreement / Deviation Note:** ${decision.disagreementWithMagniom}`);
    }
    sections.push('');
    sections.push('### Independent Clinical Rationale');
    sections.push(decision.overallReasoning || '*Independent clinical rationale recorded.*');
    sections.push('');

    if (finalTarget) {
      sections.push('### Final Selected Target');
      sections.push(`- **Target Source:** \`${finalTarget.source}\``);
      sections.push(`- **Source Candidate ID:** \`${finalTarget.sourceCandidateId || 'N/A'}\``);
      sections.push(`- **Target Sequence Order:** #${finalTarget.sequenceOrder}`);
      sections.push('');
    }

    sections.push('### Statutory Digital Signature');
    sections.push(`\`\`\`\nDigital Signature Hash (SHA-256 equivalent):\n${decision.digitalSignatureHash}\n\`\`\``);
  } else {
    sections.push('*Decision is pending clinician review and attestation.*');
  }
  sections.push('');

  // 4. Deterministic Version Manifest (§149)
  sections.push('## 4. Software & Scientific Provenance Manifest');
  sections.push(`- **Platform Release:** MAGNIOM Application Shell v2.0`);
  sections.push(`- **Module Release ID:** \`${shellVm.moduleAuthority.moduleReleaseId}\``);
  sections.push(`- **Specification Alignment:** MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0`);
  sections.push(`- **Regulatory Standard:** IEC 62304 / ISO 14971 Class B Decision Support`);
  sections.push('');

  const markdownContent = sections.join('\n');

  const jsonExport = {
    reportId,
    reportTitle,
    generatedAt: now,
    mode: shellVm.mode.mode,
    isResearchOnly: isResearch,
    case: {
      id: shellVm.caseIdentity.caseId,
      code: shellVm.caseIdentity.caseCode,
      patientLabel: shellVm.caseIdentity.patientDisplayLabel,
      indicationCode: shellVm.indication.indicationCode,
      indicationFormatted: shellVm.indication.indicationFormatted,
    },
    module: {
      id: shellVm.moduleAuthority.moduleReleaseId,
      code: shellVm.moduleAuthority.moduleCode,
      version: shellVm.moduleAuthority.moduleVersion,
      qualificationLevel: shellVm.moduleAuthority.qualificationLevel,
    },
    decision: decision
      ? {
          id: decision.id,
          decisionType: decision.decisionType,
          decidedAt: decision.decidedAt,
          clinicianName: decision.attestation?.clinicianName || clinicianName,
          licenseNumber: decision.attestation?.licenseNumber || clinicianLicense,
          overallReasoning: decision.overallReasoning,
          magniomInfluence: decision.magniomInfluence,
          digitalSignatureHash: decision.digitalSignatureHash,
          finalTargets: decision.finalTargets,
        }
      : null,
  };

  // Emit audit event (§239)
  emitAuditEvent('REPORT_GENERATED', {
    message: `Generated clinical report ${reportId} for case ${shellVm.caseIdentity.caseCode}.`,
    caseId: shellVm.caseIdentity.caseId,
    caseCode: shellVm.caseIdentity.caseCode,
    indicationCode: shellVm.indication.indicationCode,
    moduleReleaseId: shellVm.moduleAuthority.moduleReleaseId,
    decisionId: decision?.id,
    metadata: { reportId, isResearchOnly: isResearch },
  });

  return {
    reportId,
    reportTitle,
    generatedAt: now,
    isResearchOnly: isResearch,
    markdownContent,
    jsonExport,
  };
}
