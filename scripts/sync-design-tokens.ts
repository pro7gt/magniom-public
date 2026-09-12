#!/usr/bin/env npx tsx
/**
 * scripts/sync-design-tokens.ts
 *
 * Programmatic Design Token Synchronization Script.
 * Synchronizes @magniom/ui design tokens into apps/web/src/styles/globals.css.
 *
 * Usage:
 *   npx tsx scripts/sync-design-tokens.ts          # Synchronize / write to globals.css
 *   npx tsx scripts/sync-design-tokens.ts --check  # Check for drift (CI exit code 1 on mismatch)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateRootVariablesCss } from '@magniom/ui';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.resolve(__dirname, '..');
const globalsCssPath = path.join(workspaceRoot, 'apps/web/src/styles/globals.css');

const isCheckOnly = process.argv.includes('--check');

function run() {
  if (!fs.existsSync(globalsCssPath)) {
    console.error(`❌ Error: globals.css not found at ${globalsCssPath}`);
    process.exit(1);
  }

  const existingContent = fs.readFileSync(globalsCssPath, 'utf8');

  // Authoritative generated :root CSS from @magniom/ui
  const generatedRootCss = generateRootVariablesCss().trim();

  // Match the existing :root block (including any preceding authority comment banner)
  const rootRegex = /(?:\/\*[\s\S]*?\*\/\s*)?:root\s*\{[^}]*\}/;

  if (!rootRegex.test(existingContent)) {
    console.error('❌ Error: Could not locate :root { ... } block in globals.css');
    process.exit(1);
  }

  const currentRootMatch = existingContent.match(rootRegex)![0].trim();

  if (isCheckOnly) {
    if (currentRootMatch !== generatedRootCss) {
      console.error('❌ Design token drift detected between @magniom/ui and globals.css!');
      console.error('\nExpected (:root from @magniom/ui):\n' + generatedRootCss);
      console.error('\nActual (globals.css):\n' + currentRootMatch);
      console.error('\nRun "npm run tokens:sync" to synchronize tokens.');
      process.exit(1);
    }
    console.log(
      '✅ Design tokens in globals.css are 100% synchronized with @magniom/ui (0 drift).',
    );
    process.exit(0);
  }

  // Write mode: replace existing :root with generated root block
  const updatedContent = existingContent.replace(rootRegex, generatedRootCss);
  fs.writeFileSync(globalsCssPath, updatedContent, 'utf8');

  console.log(`✅ Successfully synchronized design tokens in ${globalsCssPath} from @magniom/ui.`);
}

run();
