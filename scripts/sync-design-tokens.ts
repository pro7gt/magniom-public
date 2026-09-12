#!/usr/bin/env npx tsx
/**
 * scripts/sync-design-tokens.ts
 *
 * Programmatic Design Token Synchronization Script.
 * Synchronizes @magniom/ui design tokens into apps/web/src/styles/globals.css.
 * Handles both light (:root) and dark ([data-theme="dark"]) token blocks.
 *
 * Usage:
 *   npx tsx scripts/sync-design-tokens.ts          # Synchronize / write to globals.css
 *   npx tsx scripts/sync-design-tokens.ts --check  # Check for drift (CI exit code 1 on mismatch)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateRootVariablesCss, generateDarkThemeVariablesCss } from '@magniom/ui';

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

  let existingContent = fs.readFileSync(globalsCssPath, 'utf8');

  // Authoritative generated CSS blocks from @magniom/ui
  const generatedRootCss = generateRootVariablesCss().trim();
  const generatedDarkCss = generateDarkThemeVariablesCss().trim();

  // Match the existing :root block (including any preceding authority comment banner)
  const rootRegex = /(?:\/\*[\s\S]*?\*\/\s*)?:root\s*\{[^}]*\}/;

  // Match the existing [data-theme="dark"] block with its DARK THEME comment banner.
  // Uses a two-pass approach: first locate the comment+block, then extract.
  const darkRegex =
    /\/\* =+\s+DARK THEME TOKENS[\s\S]*?\*\/\s*\[data-theme=["']dark["']\]\s*\{[^}]*\}/;

  if (!rootRegex.test(existingContent)) {
    console.error('❌ Error: Could not locate :root { ... } block in globals.css');
    process.exit(1);
  }

  const currentRootMatch = existingContent.match(rootRegex)![0].trim();
  const currentDarkMatch = darkRegex.test(existingContent)
    ? existingContent.match(darkRegex)![0].trim()
    : null;

  if (isCheckOnly) {
    let hasDrift = false;

    if (currentRootMatch !== generatedRootCss) {
      console.error('❌ Design token drift detected in :root block!');
      console.error(
        '\nExpected (:root from @magniom/ui):\n' + generatedRootCss.slice(0, 200) + '...',
      );
      console.error('\nActual (globals.css):\n' + currentRootMatch.slice(0, 200) + '...');
      hasDrift = true;
    }

    if (currentDarkMatch !== generatedDarkCss) {
      console.error('❌ Design token drift detected in [data-theme="dark"] block!');
      if (currentDarkMatch) {
        console.error('\nExpected:\n' + generatedDarkCss.slice(0, 200) + '...');
        console.error('\nActual:\n' + currentDarkMatch.slice(0, 200) + '...');
      } else {
        console.error('\n[data-theme="dark"] block is missing from globals.css.');
      }
      hasDrift = true;
    }

    if (hasDrift) {
      console.error('\nRun "npm run tokens:sync" to synchronize tokens.');
      process.exit(1);
    }

    console.log(
      '✅ Design tokens in globals.css are 100% synchronized with @magniom/ui (0 drift, light + dark).',
    );
    process.exit(0);
  }

  // Write mode: replace existing :root with generated root block
  let updatedContent = existingContent.replace(rootRegex, generatedRootCss);

  // Replace or insert dark theme block
  if (darkRegex.test(updatedContent)) {
    updatedContent = updatedContent.replace(darkRegex, generatedDarkCss);
  } else {
    // Insert dark block immediately after :root block
    const rootEndIndex = updatedContent.indexOf(generatedRootCss) + generatedRootCss.length;
    updatedContent =
      updatedContent.slice(0, rootEndIndex) +
      '\n\n' +
      generatedDarkCss +
      '\n' +
      updatedContent.slice(rootEndIndex);
  }

  fs.writeFileSync(globalsCssPath, updatedContent, 'utf8');

  console.log(
    `✅ Successfully synchronized design tokens (light + dark) in ${globalsCssPath} from @magniom/ui.`,
  );
}

run();
