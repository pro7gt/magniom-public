/**
 * MAGNIOM SRS REQUIREMENT EXTRACTOR v2.0
 *
 * Parses the System Requirements Specification v2.0 (or v1.0) to extract
 * all formal MAG-*-NNN requirements, classifying each by domain, safety class,
 * and verification method.
 *
 * Outputs:
 * - docs/verification/requirement-inventory-v2.json
 * - docs/verification/requirement-inventory.json (active inventory)
 *
 * Usage: tsx scripts/verification/extract-srs-requirements.ts [--v1]
 */

import fs from 'node:fs';
import path from 'node:path';

export interface SrsRequirement {
  id: string;
  domain: string;
  domainLabel: string;
  title?: string;
  statement: string;
  safetyClass: 'Critical' | 'Major' | 'Standard';
  verificationMethods: string[];
  srsSection: string;
}

export const DOMAIN_LABELS: Record<string, string> = {
  'MAG-SYS': 'System-wide',
  'MAG-CLI': 'Clinical Workflow & Authority',
  'MAG-IND': 'Indication-Module Governance',
  'MAG-PHE': 'Phenotype & Clinical Context',
  'MAG-EVD': 'Evidence Knowledge System',
  'MAG-POL': 'Scientific Policy',
  'MAG-MEA': 'Multimodal Measurement',
  'MAG-IMG': 'Neuroimaging/Connectomics',
  'MAG-TGT': 'Target Engine',
  'MAG-UX': 'Clinician Workspace / Human Factors',
  'MAG-DAT': 'Canonical Data / Integrity',
  'MAG-SEC': 'Security / Privacy',
  'MAG-WFL': 'Workflow / Jobs / State Transitions',
  'MAG-AUD': 'Audit / Provenance',
  'MAG-REL': 'Release / Version / Configuration',
  'MAG-STR': 'Stroke Recovery & Aphasia',
  'MAG-PAI': 'Chronic Neuropathic Pain',
  'MAG-TBI': 'Traumatic Brain Injury',
  'MAG-TIN': 'Chronic Tinnitus',
  'MAG-OCD': 'Obsessive-Compulsive Disorder',
  'MAG-VAL': 'Verification and Validation',
};

export const DOMAIN_SECTIONS_V2: Record<string, string> = {
  'MAG-SYS': 'SRS §9 System-wide',
  'MAG-CLI': 'SRS §10 Clinical',
  'MAG-IND': 'SRS §11 Indication-Module Governance',
  'MAG-PHE': 'SRS §12 Phenotype & Clinical Context',
  'MAG-EVD': 'SRS §13 Evidence Knowledge',
  'MAG-POL': 'SRS §14 Scientific Policy',
  'MAG-MEA': 'SRS §15 Multimodal Measurement',
  'MAG-IMG': 'SRS §16 Neuroimaging',
  'MAG-TGT': 'SRS §17 Target Engine',
  'MAG-UX': 'SRS §18 Clinician UX',
  'MAG-DAT': 'SRS §19 Canonical Data',
  'MAG-SEC': 'SRS §20 Security',
  'MAG-WFL': 'SRS §21 Workflow',
  'MAG-AUD': 'SRS §22 Audit',
  'MAG-REL': 'SRS §23 Release',
  'MAG-STR': 'SRS §24 Stroke',
  'MAG-PAI': 'SRS §25 Neuropathic Pain',
  'MAG-TBI': 'SRS §26 Traumatic Brain Injury',
  'MAG-TIN': 'SRS §27 Tinnitus',
  'MAG-OCD': 'SRS §28 Obsessive-Compulsive Disorder',
  'MAG-VAL': 'SRS §30 Verification & Validation',
};

// Explicit Critical Requirements established in v2 normative text and Section 32 Hazard Drivers
const EXPLICIT_CRITICAL_IDS = new Set<string>([
  // System & Clinical Authority
  'MAG-SYS-041',
  'MAG-SYS-043',
  'MAG-SYS-044',
  'MAG-SYS-045',
  'MAG-SYS-046',
  'MAG-SYS-047',
  'MAG-SYS-048',
  'MAG-SYS-050',
  'MAG-SYS-051',
  'MAG-SYS-052',
  'MAG-CLI-041',
  'MAG-CLI-043',
  'MAG-CLI-044',
  'MAG-CLI-045',
  'MAG-CLI-047',
  'MAG-CLI-048',
  'MAG-CLI-049',
  'MAG-CLI-051',
  'MAG-CLI-052',
  // Indication Module Governance
  'MAG-IND-001',
  'MAG-IND-002',
  'MAG-IND-011',
  'MAG-IND-012',
  'MAG-IND-013',
  'MAG-IND-017',
  'MAG-IND-027',
  'MAG-IND-028',
  'MAG-IND-030',
  // Evidence & Policy
  'MAG-EVD-041',
  'MAG-EVD-043',
  'MAG-EVD-045',
  'MAG-EVD-048',
  'MAG-POL-041',
  'MAG-POL-042',
  'MAG-POL-044',
  'MAG-POL-046',
  // Multimodal Measurement & Imaging
  'MAG-MEA-001',
  'MAG-MEA-002',
  'MAG-MEA-005',
  'MAG-MEA-010',
  'MAG-MEA-011',
  'MAG-IMG-041',
  'MAG-IMG-042',
  'MAG-IMG-044',
  // Target Engine
  'MAG-TGT-041',
  'MAG-TGT-042',
  'MAG-TGT-050',
  'MAG-TGT-051',
  // UX, Data, Security, Audit, Release
  'MAG-UX-041',
  'MAG-UX-042',
  'MAG-UX-045',
  'MAG-DAT-041',
  'MAG-DAT-042',
  'MAG-SEC-041',
  'MAG-SEC-042',
  'MAG-AUD-041',
  'MAG-REL-041',
  'MAG-REL-042',
  // Indication-Specific Critical (Stroke, Pain, TBI, Tinnitus, OCD)
  'MAG-STR-002',
  'MAG-STR-003',
  'MAG-STR-004',
  'MAG-STR-010',
  'MAG-STR-011',
  'MAG-STR-019',
  'MAG-STR-023',
  'MAG-STR-025',
  'MAG-PAI-004',
  'MAG-PAI-005',
  'MAG-PAI-006',
  'MAG-PAI-008',
  'MAG-PAI-009',
  'MAG-PAI-017',
  'MAG-TBI-003',
  'MAG-TBI-004',
  'MAG-TBI-007',
  'MAG-TBI-008',
  'MAG-TBI-009',
  'MAG-TBI-014',
  'MAG-TBI-018',
  'MAG-TIN-007',
  'MAG-TIN-008',
  'MAG-TIN-010',
  'MAG-TIN-011',
  'MAG-TIN-018',
  'MAG-OCD-001',
  'MAG-OCD-003',
  'MAG-OCD-004',
  'MAG-OCD-006',
  'MAG-OCD-009',
  'MAG-OCD-010',
  'MAG-OCD-011',
  'MAG-OCD-017',
  // Validation
  'MAG-VAL-041',
  'MAG-VAL-042',
  'MAG-VAL-043',
  'MAG-VAL-044',
]);

const DOMAIN_DEFAULT_VERIFICATION: Record<string, string[]> = {
  'MAG-SYS': ['IT', 'ST', 'GC'],
  'MAG-CLI': ['IT', 'ST', 'HF'],
  'MAG-IND': ['UT', 'IT', 'ST', 'GC', 'SV'],
  'MAG-PHE': ['UT', 'IT'],
  'MAG-EVD': ['UT', 'IT', 'SV'],
  'MAG-POL': ['UT', 'IT', 'SV'],
  'MAG-MEA': ['UT', 'IT', 'GC', 'SV'],
  'MAG-IMG': ['UT', 'IT', 'GC', 'SV'],
  'MAG-TGT': ['UT', 'IT', 'GC', 'SV'],
  'MAG-UX': ['ST', 'HF'],
  'MAG-DAT': ['UT', 'IT'],
  'MAG-SEC': ['IT', 'ST', 'SV'],
  'MAG-WFL': ['IT', 'ST'],
  'MAG-AUD': ['IT', 'ST'],
  'MAG-REL': ['IT', 'ST', 'SV'],
  'MAG-STR': ['UT', 'IT', 'GC', 'SV'],
  'MAG-PAI': ['UT', 'IT', 'GC', 'SV'],
  'MAG-TBI': ['UT', 'IT', 'GC', 'SV'],
  'MAG-TIN': ['UT', 'IT', 'GC', 'SV'],
  'MAG-OCD': ['UT', 'IT', 'GC', 'SV'],
  'MAG-VAL': ['GC', 'ST', 'SV'],
};

export function extractV2Requirements(srsPath: string): SrsRequirement[] {
  const content = fs.readFileSync(srsPath, 'utf8');
  const lines = content.split('\n');
  const requirements: SrsRequirement[] = [];
  const seenIds = new Set<string>();

  let currentSection = 'SRS §2 System Invariants';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const secMatch = line.match(/^#\s+(\d+\..*)/);
    if (secMatch) {
      currentSection = secMatch[1];
    }

    // 1. Table rows: | **MAG-XXX-NNN** | statement | class | verify |
    const tableMatch = line.match(
      /^\|\s*\*{0,2}`?(MAG-[A-Z]+-\d+)`?\*{0,2}\s*\|\s*(.*?)\s*\|\s*(Critical|Major|Standard)?\s*(?:\|\s*(.*?)\s*)?\|/,
    );
    if (tableMatch) {
      const id = tableMatch[1];
      if (!seenIds.has(id)) {
        seenIds.add(id);
        const domain = id.replace(/-\d+$/, '');
        const statement = tableMatch[2].replace(/\*{1,2}/g, '').trim();
        let safetyClass: SrsRequirement['safetyClass'] = (tableMatch[3] as any) || 'Standard';
        if (EXPLICIT_CRITICAL_IDS.has(id)) {
          safetyClass = 'Critical';
        }

        const verifyStr = (tableMatch[4] || '').trim();
        const verificationMethods = verifyStr
          ? verifyStr.split(/[,\s]+/).filter(Boolean)
          : DOMAIN_DEFAULT_VERIFICATION[domain] || ['UT'];

        requirements.push({
          id,
          domain,
          domainLabel: DOMAIN_LABELS[domain] || domain,
          statement,
          safetyClass,
          verificationMethods,
          srsSection: currentSection || DOMAIN_SECTIONS_V2[domain] || 'SRS v2',
        });
      }
      continue;
    }

    // 2. Standalone headers: ## MAG-XXX-NNN — Title
    const headMatch = line.match(/^##\s+(MAG-[A-Z]+-\d+)(?:\s*—\s*(.*))?/);
    if (headMatch) {
      const id = headMatch[1];
      if (!seenIds.has(id)) {
        seenIds.add(id);
        const domain = id.replace(/-\d+$/, '');
        const title = (headMatch[2] || '').trim();

        let statement = '';
        let safetyClass: SrsRequirement['safetyClass'] = EXPLICIT_CRITICAL_IDS.has(id)
          ? 'Critical'
          : 'Standard';
        let verificationMethods: string[] = DOMAIN_DEFAULT_VERIFICATION[domain] || ['UT'];

        for (let j = i + 1; j < Math.min(i + 30, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine.startsWith('## ') || nextLine.startsWith('# ')) break;

          if (nextLine.match(/^\*\*(Critical|Major|Standard)\*\*/i)) {
            safetyClass = nextLine.replace(/\*/g, '').trim() as any;
            continue;
          }

          const verifyMatch = nextLine.match(/^\*\*Verification:\*\*\s*(.*)/i);
          if (verifyMatch) {
            verificationMethods = verifyMatch[1]
              .replace(/[.*]/g, '')
              .split(/[,\s]+/)
              .filter(Boolean);
            continue;
          }

          if (nextLine.startsWith('```text') || nextLine.startsWith('```')) {
            let block = '';
            for (let k = j + 1; k < Math.min(j + 20, lines.length); k++) {
              if (lines[k].trim().startsWith('```')) {
                j = k;
                break;
              }
              block += (block ? ' ' : '') + lines[k].trim();
            }
            if (block && !statement) statement = block;
            continue;
          }

          if (
            nextLine.length > 5 &&
            !statement &&
            !nextLine.startsWith('---') &&
            !nextLine.startsWith('|')
          ) {
            statement = nextLine.replace(/\*{1,2}/g, '');
          }
        }

        requirements.push({
          id,
          domain,
          domainLabel: DOMAIN_LABELS[domain] || domain,
          title: title || undefined,
          statement: statement || `(Requirement definition in ${currentSection})`,
          safetyClass,
          verificationMethods,
          srsSection: currentSection || DOMAIN_SECTIONS_V2[domain] || 'SRS v2',
        });
      }
    }
  }

  return requirements.sort((a, b) => a.id.localeCompare(b.id));
}

function main(): void {
  const repoRoot = path.resolve(process.cwd());
  const args = process.argv.slice(2);
  const useV1 = args.includes('--v1');

  const srsRelPath = useV1
    ? 'public/guides_v1/MAGNIOM-System Requirements Specification v1.0.md'
    : 'public/guides/MAGNIOM-System Requirements Specification v2.0.md';

  const srsPath = path.join(repoRoot, srsRelPath);

  if (!fs.existsSync(srsPath)) {
    console.error(`❌ SRS not found at: ${srsPath}`);
    process.exit(1);
  }

  console.log('🔬 MAGNIOM SRS REQUIREMENT EXTRACTOR v2.0');
  console.log('=========================================\n');
  console.log(`Extracting requirements from: ${srsRelPath}\n`);

  const requirements = extractV2Requirements(srsPath);

  const domainCounts: Record<
    string,
    { total: number; critical: number; major: number; standard: number }
  > = {};
  for (const req of requirements) {
    if (!domainCounts[req.domain]) {
      domainCounts[req.domain] = { total: 0, critical: 0, major: 0, standard: 0 };
    }
    domainCounts[req.domain].total++;
    if (req.safetyClass === 'Critical') domainCounts[req.domain].critical++;
    else if (req.safetyClass === 'Major') domainCounts[req.domain].major++;
    else domainCounts[req.domain].standard++;
  }

  console.log('Domain Breakdown:');
  console.log('─────────────────────────────────────────────────────────────');
  for (const [domain, counts] of Object.entries(domainCounts).sort()) {
    console.log(
      `  ${domain.padEnd(10)} ${String(counts.total).padStart(3)} total  (${String(counts.critical).padStart(2)} Critical, ${String(counts.major).padStart(2)} Major, ${String(counts.standard).padStart(2)} Standard) — ${DOMAIN_LABELS[domain] || domain}`,
    );
  }
  console.log('─────────────────────────────────────────────────────────────');
  const totalCritical = requirements.filter(r => r.safetyClass === 'Critical').length;
  const totalMajor = requirements.filter(r => r.safetyClass === 'Major').length;
  const totalStandard = requirements.filter(r => r.safetyClass === 'Standard').length;
  console.log(
    `  ${'TOTAL'.padEnd(10)} ${String(requirements.length).padStart(3)} requirements (${totalCritical} Critical, ${totalMajor} Major, ${totalStandard} Standard)\n`,
  );

  // Write outputs
  const v2OutputPath = path.join(repoRoot, 'docs/verification/requirement-inventory-v2.json');
  const defaultOutputPath = path.join(repoRoot, 'docs/verification/requirement-inventory.json');

  const payload = {
    srsVersion: useV1 ? '1.0' : '2.0',
    extractionDate: new Date().toISOString(),
    sourceFile: srsRelPath,
    totalRequirements: requirements.length,
    criticalCount: totalCritical,
    majorCount: totalMajor,
    standardCount: totalStandard,
    domainSummary: domainCounts,
    requirements,
  };

  fs.mkdirSync(path.dirname(v2OutputPath), { recursive: true });
  fs.writeFileSync(v2OutputPath, JSON.stringify(payload, null, 2), 'utf8');
  fs.writeFileSync(defaultOutputPath, JSON.stringify(payload, null, 2), 'utf8');

  console.log(`📄 Requirement inventory written to:`);
  console.log(`   - ${v2OutputPath}`);
  console.log(`   - ${defaultOutputPath}\n`);
}

if (process.argv[1] && process.argv[1].endsWith('extract-srs-requirements.ts')) {
  main();
}
