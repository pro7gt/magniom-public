import fs from 'node:fs';
import path from 'node:path';

interface Requirement {
  id: string;
  domain: string;
  statement: string;
  safetyClass: string;
  appliesToMode: string;
  verificationMethod: string;
  riskControlIds?: string[];
  status: string;
}

interface RequirementCatalog {
  version: string;
  requirements: Requirement[];
}

interface RiskRegister {
  version: string;
  hazards: Array<{
    id: string;
    title: string;
    mitigations: Array<{ requirementId: string; description: string }>;
  }>;
}

function verifyRequirements() {
  console.log('🔍 Validating Requirement Catalog & Traceability Matrix...');

  const rootDir = process.cwd();
  const catalogPath = path.join(rootDir, 'docs/software-requirements/requirement-catalog.json');
  const riskPath = path.join(rootDir, 'docs/risk-management/risk-register.json');

  if (!fs.existsSync(catalogPath)) {
    console.error(`❌ Requirement catalog not found at ${catalogPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(riskPath)) {
    console.error(`❌ Risk register not found at ${riskPath}`);
    process.exit(1);
  }

  const catalog: RequirementCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const riskRegister: RiskRegister = JSON.parse(fs.readFileSync(riskPath, 'utf8'));

  const validDomains = new Set([
    'SYS',
    'CLI',
    'PHE',
    'EVD',
    'POL',
    'IMG',
    'TGT',
    'UX',
    'DAT',
    'SEC',
    'WFL',
    'AUD',
    'REL',
    'VAL',
    'IND',
    'MEA',
    'STR',
    'PAI',
    'TBI',
    'TIN',
    'OCD',
    'TNS',
  ]);

  const reqIdRegex = /^MAG-([A-Z]{2,4})-\d{3}$/;
  const requirementIds = new Set<string>();
  const hazardIds = new Set<string>(riskRegister.hazards.map(h => h.id));

  let errors = 0;

  for (const req of catalog.requirements) {
    if (!reqIdRegex.test(req.id)) {
      console.error(`❌ Invalid Requirement ID format: ${req.id}`);
      errors++;
    }

    if (!validDomains.has(req.domain)) {
      console.error(`❌ Invalid domain '${req.domain}' in ${req.id}`);
      errors++;
    }

    if (!req.statement || req.statement.trim().length < 10) {
      console.error(`❌ Incomplete statement in ${req.id}`);
      errors++;
    }

    if (requirementIds.has(req.id)) {
      console.error(`❌ Duplicate Requirement ID: ${req.id}`);
      errors++;
    }
    requirementIds.add(req.id);

    if (req.riskControlIds) {
      for (const hid of req.riskControlIds) {
        if (!hazardIds.has(hid)) {
          console.error(`❌ Requirement ${req.id} references non-existent Hazard ID '${hid}'`);
          errors++;
        }
      }
    }
  }

  for (const hazard of riskRegister.hazards) {
    for (const mit of hazard.mitigations) {
      if (!requirementIds.has(mit.requirementId)) {
        console.error(
          `❌ Hazard ${hazard.id} references non-existent Requirement ID '${mit.requirementId}'`,
        );
        errors++;
      }
    }
  }

  if (errors > 0) {
    console.error(`\n❌ Requirement validation failed with ${errors} error(s).`);
    process.exit(1);
  }

  console.log(
    `✅ All ${requirementIds.size} requirements and ${hazardIds.size} risk controls verified successfully.`,
  );
}

verifyRequirements();
