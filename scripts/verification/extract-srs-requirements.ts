/**
 * MAGNIOM SRS REQUIREMENT EXTRACTOR
 *
 * Parses the System Requirements Specification v1.0 to extract all formal
 * MAG-*-NNN requirements, classifying each by domain, safety class, and
 * verification method.
 *
 * Output: docs/verification/requirement-inventory.json
 *
 * Usage: tsx scripts/verification/extract-srs-requirements.ts
 */

import fs from 'node:fs';
import path from 'node:path';

interface SrsRequirement {
  id: string;
  domain: string;
  domainLabel: string;
  statement: string;
  safetyClass: 'Critical' | 'Major' | 'Standard' | 'Unknown';
  verificationMethods: string[];
  srsSection: string;
}

const DOMAIN_LABELS: Record<string, string> = {
  'MAG-SYS': 'System-wide',
  'MAG-CLI': 'Clinical Workflow & Authority',
  'MAG-PHE': 'Phenotype',
  'MAG-EVD': 'Evidence Knowledge System',
  'MAG-POL': 'Scientific Policy',
  'MAG-IMG': 'Neuroimaging/Connectomics',
  'MAG-TGT': 'Target Engine',
  'MAG-UX': 'Clinician Workspace / Human Factors',
  'MAG-DAT': 'Canonical Data / Integrity',
  'MAG-SEC': 'Security / Privacy',
  'MAG-WFL': 'Workflow / Jobs / State Transitions',
  'MAG-AUD': 'Audit / Provenance',
  'MAG-REL': 'Release / Version / Configuration',
  'MAG-VAL': 'Verification and Validation',
};

const DOMAIN_SECTIONS: Record<string, string> = {
  'MAG-SYS': 'SRS §8 System-wide + §22–23',
  'MAG-CLI': 'SRS §9 Clinical',
  'MAG-PHE': 'SRS §10 Phenotype',
  'MAG-EVD': 'SRS §11 Evidence Knowledge',
  'MAG-POL': 'SRS §12 Scientific Policy',
  'MAG-IMG': 'SRS §13 Neuroimaging',
  'MAG-TGT': 'SRS §14 Target Engine',
  'MAG-UX': 'SRS §15 Clinician Workspace',
  'MAG-DAT': 'SRS §16 Canonical Data',
  'MAG-SEC': 'SRS §17 Security',
  'MAG-WFL': 'SRS §18 Workflow',
  'MAG-AUD': 'SRS §19 Audit',
  'MAG-REL': 'SRS §20 Release',
  'MAG-VAL': 'SRS §21 Verification & Validation',
};

function extractRequirements(srsPath: string): SrsRequirement[] {
  const content = fs.readFileSync(srsPath, 'utf8');
  const lines = content.split('\n');
  const requirements: SrsRequirement[] = [];
  const seenIds = new Set<string>();

  // Parse table rows: | MAG-XXX-NNN | statement | class | verify |
  const tableRowRegex = /^\|\s*\*{0,2}`?(MAG-[A-Z]+-\d+)`?\*{0,2}\s*\|\s*\*{0,2}(.*?)\*{0,2}\s*\|\s*(Critical|Major|Standard)?\s*\|\s*(.*?)\s*\|/;

  // Parse standalone requirement blocks: ### MAG-XXX-NNN
  const standaloneHeaderRegex = /^###\s+(MAG-[A-Z]+-\d+)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Try table row format
    const tableMatch = line.match(tableRowRegex);
    if (tableMatch) {
      const id = tableMatch[1].replace(/[`*]/g, '');
      if (!seenIds.has(id)) {
        seenIds.add(id);
        const domain = id.replace(/-\d+$/, '');
        const verifyStr = tableMatch[4]?.trim() || '';
        requirements.push({
          id,
          domain,
          domainLabel: DOMAIN_LABELS[domain] || domain,
          statement: tableMatch[2].replace(/\*{1,2}/g, '').trim(),
          safetyClass: (tableMatch[3] as SrsRequirement['safetyClass']) || 'Unknown',
          verificationMethods: verifyStr.split(/[,\s]+/).filter(Boolean),
          srsSection: DOMAIN_SECTIONS[domain] || 'Unknown',
        });
      }
      continue;
    }

    // Try standalone header format (§22–23 non-functional requirements)
    const standaloneMatch = line.match(standaloneHeaderRegex);
    if (standaloneMatch) {
      const id = standaloneMatch[1];
      if (!seenIds.has(id)) {
        seenIds.add(id);
        const domain = id.replace(/-\d+$/, '');
        // Read next non-empty lines for statement
        let statement = '';
        let safetyClass: SrsRequirement['safetyClass'] = 'Unknown';
        let verificationMethods: string[] = [];

        for (let j = i + 1; j < Math.min(i + 20, lines.length); j++) {
          const nextLine = lines[j].trim();
          if (nextLine.startsWith('**Class:**')) {
            const classMatch = nextLine.match(/\*\*Class:\*\*\s*(Critical|Major|Standard)/);
            if (classMatch) safetyClass = classMatch[1] as SrsRequirement['safetyClass'];
          } else if (nextLine.startsWith('**Verification:**')) {
            const verifyMatch = nextLine.match(/\*\*Verification:\*\*\s*(.*)/);
            if (verifyMatch) {
              verificationMethods = verifyMatch[1]
                .replace(/[.*]/g, '')
                .split(/[,\s]+/)
                .filter(Boolean);
            }
          } else if (
            nextLine.length > 10 &&
            !nextLine.startsWith('###') &&
            !nextLine.startsWith('```') &&
            !nextLine.startsWith('---') &&
            !nextLine.startsWith('|') &&
            !nextLine.startsWith('#') &&
            statement.length < 200
          ) {
            if (!statement) {
              statement = nextLine.replace(/^(MAGNIOM\s+)?SHALL\s+(NOT\s+)?/i, '').replace(/\*{1,2}/g, '');
            }
          }
        }

        requirements.push({
          id,
          domain,
          domainLabel: DOMAIN_LABELS[domain] || domain,
          statement: statement || `(Standalone requirement — see SRS)`,
          safetyClass,
          verificationMethods,
          srsSection: DOMAIN_SECTIONS[domain] || 'SRS §22+',
        });
      }
    }
  }

  return requirements.sort((a, b) => a.id.localeCompare(b.id));
}

function main(): void {
  const repoRoot = path.resolve(process.cwd());
  const srsPath = path.join(
    repoRoot,
    'public/guides/MAGNIOM-System Requirements Specification v1.0.md'
  );

  if (!fs.existsSync(srsPath)) {
    console.error(`❌ SRS not found at: ${srsPath}`);
    process.exit(1);
  }

  console.log('🔬 MAGNIOM SRS REQUIREMENT EXTRACTOR');
  console.log('=====================================\n');

  const requirements = extractRequirements(srsPath);

  // Domain summary
  const domainCounts: Record<string, { total: number; critical: number; major: number }> = {};
  for (const req of requirements) {
    if (!domainCounts[req.domain]) {
      domainCounts[req.domain] = { total: 0, critical: 0, major: 0 };
    }
    domainCounts[req.domain].total++;
    if (req.safetyClass === 'Critical') domainCounts[req.domain].critical++;
    if (req.safetyClass === 'Major') domainCounts[req.domain].major++;
  }

  console.log('Domain Breakdown:');
  console.log('─────────────────────────────────────────────');
  for (const [domain, counts] of Object.entries(domainCounts).sort()) {
    console.log(
      `  ${domain.padEnd(12)} ${String(counts.total).padStart(3)} total  (${String(counts.critical).padStart(2)} Critical, ${String(counts.major).padStart(2)} Major)`
    );
  }
  console.log('─────────────────────────────────────────────');
  console.log(
    `  ${'TOTAL'.padEnd(12)} ${String(requirements.length).padStart(3)} requirements\n`
  );

  // Write output
  const outputPath = path.join(repoRoot, 'docs/verification/requirement-inventory.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        srsVersion: '1.0',
        extractionDate: new Date().toISOString(),
        totalRequirements: requirements.length,
        domainSummary: domainCounts,
        requirements,
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(`📄 Requirement inventory written to: ${outputPath}`);
  console.log(`   ${requirements.length} requirements extracted across ${Object.keys(domainCounts).length} domains.\n`);
}

main();
