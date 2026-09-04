/**
 * MAGNIOM REQUIREMENT CATALOG SYNCHRONIZER
 *
 * Synchronizes docs/software-requirements/requirement-catalog.json with:
 * - docs/verification/requirement-inventory-v2.json (all 332 v2 requirements)
 * - Retained historical v1 safety requirements (MAG-CLI-001, MAG-UX-031, MAG-SEC-012, etc.)
 * - docs/risk-management/risk-register.json (linking mitigations to hazards)
 *
 * Conforms to:
 * - IEC 62304:2006+AMD1:2015 §5.2
 * - ISO 14971:2019
 * - MAGNIOM-System Requirements Specification v2.0 (§4, §5, §32)
 */

import fs from 'node:fs';
import path from 'node:path';

interface V2InventoryReq {
  id: string;
  domain: string;
  domainLabel: string;
  statement: string;
  safetyClass: 'Critical' | 'Major' | 'Standard';
  verificationMethods: string[];
  srsSection: string;
}

interface CatalogReq {
  id: string;
  domain: string;
  statement: string;
  sourceSpecification: string[];
  safetyClass: string;
  appliesToMode: string;
  verificationMethod: string;
  riskControlIds?: string[];
  status: string;
}

function mapMethod(code: string): string {
  switch (code) {
    case 'UT':
      return 'unit_test';
    case 'IT':
      return 'integration_test';
    case 'ST':
      return 'system_test';
    case 'GC':
      return 'golden_case';
    case 'SV':
      return 'scientific_verification';
    case 'HF':
      return 'human_factors';
    case 'CV':
      return 'clinical_validation';
    case 'I':
      return 'inspection';
    case 'A':
      return 'analysis';
    default:
      return 'unit_test';
  }
}

function main() {
  const repoRoot = path.resolve(process.cwd());
  const catalogPath = path.join(repoRoot, 'docs/software-requirements/requirement-catalog.json');
  const inventoryPath = path.join(repoRoot, 'docs/verification/requirement-inventory-v2.json');
  const riskPath = path.join(repoRoot, 'docs/risk-management/risk-register.json');

  const existingCatalog: { version: string; requirements: CatalogReq[] } = JSON.parse(
    fs.readFileSync(catalogPath, 'utf8'),
  );
  const inventory: { requirements: V2InventoryReq[] } = JSON.parse(
    fs.readFileSync(inventoryPath, 'utf8'),
  );
  const riskRegister: {
    hazards: Array<{ id: string; mitigations: Array<{ requirementId: string }> }>;
  } = JSON.parse(fs.readFileSync(riskPath, 'utf8'));

  // Map hazard mitigations to requirements
  const reqToHazards = new Map<string, Set<string>>();
  for (const h of riskRegister.hazards) {
    for (const m of h.mitigations) {
      if (!reqToHazards.has(m.requirementId)) {
        reqToHazards.set(m.requirementId, new Set());
      }
      reqToHazards.get(m.requirementId)!.add(h.id);
    }
  }

  // Preserve existing requirements map
  const existingMap = new Map<string, CatalogReq>();
  for (const r of existingCatalog.requirements) {
    existingMap.set(r.id, r);
  }

  // Explicit Critical Hazard mappings from SRS §32
  const srsHazardDefaults: Record<string, string[]> = {
    'MAG-SYS': ['HAZ-006', 'HAZ-001'],
    'MAG-CLI': ['HAZ-001', 'HAZ-014'],
    'MAG-IND': ['HAZ-006', 'HAZ-008'],
    'MAG-EVD': ['HAZ-007'],
    'MAG-POL': ['HAZ-006', 'HAZ-008'],
    'MAG-MEA': ['HAZ-003', 'HAZ-018'],
    'MAG-IMG': ['HAZ-002', 'HAZ-009'],
    'MAG-TGT': ['HAZ-001', 'HAZ-019'],
    'MAG-UX': ['HAZ-001', 'HAZ-008'],
    'MAG-DAT': ['HAZ-002', 'HAZ-020'],
    'MAG-SEC': ['HAZ-005'],
    'MAG-WFL': ['HAZ-004'],
    'MAG-AUD': ['HAZ-001', 'HAZ-005'],
    'MAG-REL': ['HAZ-006', 'HAZ-008'],
    'MAG-STR': ['HAZ-009', 'HAZ-010'],
    'MAG-PAI': ['HAZ-010', 'HAZ-015'],
    'MAG-TBI': ['HAZ-006', 'HAZ-009'],
    'MAG-TIN': ['HAZ-011', 'HAZ-008'],
    'MAG-OCD': ['HAZ-012', 'HAZ-013'],
    'MAG-VAL': ['HAZ-006', 'HAZ-008'],
    'MAG-PHE': ['HAZ-004', 'HAZ-014'],
  };

  const combinedReqs: CatalogReq[] = [];
  const processedIds = new Set<string>();

  // 1. Process all 332 v2 inventory requirements
  for (const invReq of inventory.requirements) {
    processedIds.add(invReq.id);
    const domain = invReq.id.split('-')[1];
    const existing = existingMap.get(invReq.id);

    // Hazard bindings
    const hazardSet = new Set<string>();
    if (reqToHazards.has(invReq.id)) {
      for (const h of reqToHazards.get(invReq.id)!) hazardSet.add(h);
    }
    if (existing?.riskControlIds) {
      for (const h of existing.riskControlIds) hazardSet.add(h);
    }
    if (invReq.safetyClass === 'Critical' && hazardSet.size === 0) {
      const defaults = srsHazardDefaults[invReq.domain] || ['HAZ-006'];
      for (const d of defaults) hazardSet.add(d);
    }

    const verificationMethod =
      existing?.verificationMethod || mapMethod(invReq.verificationMethods[0] || 'UT');

    combinedReqs.push({
      id: invReq.id,
      domain,
      statement: invReq.statement,
      sourceSpecification: [`MAGNIOM-System Requirements Specification v2.0 §${invReq.srsSection}`],
      safetyClass: invReq.safetyClass.toLowerCase(),
      appliesToMode: existing?.appliesToMode || (invReq.safetyClass === 'Critical' ? 'all' : 'all'),
      verificationMethod,
      riskControlIds: hazardSet.size > 0 ? Array.from(hazardSet).sort() : undefined,
      status: 'approved',
    });
  }

  // 2. Retain any historical v1 safety requirements that are not in v2 inventory
  for (const [id, req] of existingMap.entries()) {
    if (!processedIds.has(id)) {
      combinedReqs.push(req);
      processedIds.add(id);
    }
  }

  // Sort by requirement ID
  combinedReqs.sort((a, b) => a.id.localeCompare(b.id));

  const outputCatalog = {
    $schema: './requirement-schema.json',
    version: '2.0.0',
    lastUpdated: new Date().toISOString(),
    totalRequirements: combinedReqs.length,
    v2Requirements: inventory.requirements.length,
    retainedV1Requirements: combinedReqs.length - inventory.requirements.length,
    requirements: combinedReqs,
  };

  fs.writeFileSync(catalogPath, JSON.stringify(outputCatalog, null, 2), 'utf8');

  console.log(`✅ Synced requirement catalog to ${catalogPath}`);
  console.log(`   - Total requirements: ${combinedReqs.length}`);
  console.log(`   - v2 requirements: ${inventory.requirements.length}`);
  console.log(
    `   - Retained v1 requirements: ${combinedReqs.length - inventory.requirements.length}`,
  );
}

main();
