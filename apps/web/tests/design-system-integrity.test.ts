/**
 * @magniom/web - Design System Integrity & Conformance Test Suite
 *
 * Automated regression guard verifying:
 * 1. 100% of CSS custom properties (var(--...)) referenced in apps/web/src exist in globals.css (:root).
 * 2. All canonical UI primitives and badge classes are defined and exported.
 * 3. @magniom/ui design tokens are synchronized with globals.css custom properties.
 * 4. Required workspace and button utilities are defined in CSS.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { fileURLToPath } from 'url';
import { CLINICAL_THEME_TOKENS, CSS_THEME_VARIABLES, generateRootVariablesCss } from '@magniom/ui';
import {
  Button,
  Badge,
  Card,
  Breadcrumbs,
  Modal,
  Icon,
  CheckIcon,
  AlertTriangleIcon,
  XIcon,
  InfoIcon,
  LockIcon,
  SearchIcon,
  ArrowDownIcon,
  ArrowLeftRightIcon,
  ScientificState,
  CaseNotFoundState,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  TableEmptyRow,
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  AlertIcon,
  FilterBar,
  FilterBarRow,
  FilterBarGroup,
  FilterBarLabel,
  FilterBarSearch,
  FilterBarSelect,
  FilterBarActions,
  Input,
  Select,
  Textarea,
  Checkbox,
  RangeSlider,
  Radio,
  FormGroup,
  FormLabel,
} from '../src/components/ui';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webSrcRoot = path.resolve(__dirname, '../src');
const globalsCssPath = path.join(webSrcRoot, 'styles/globals.css');

describe('MAGNIOM Design System & Token Integrity Suite', () => {
  const cssContent = fs.readFileSync(globalsCssPath, 'utf8');

  // Extract all CSS variable names defined in :root
  const rootMatch = cssContent.match(/:root\s*\{([^}]+)\}/);
  const rootBlock = rootMatch && rootMatch[1] ? rootMatch[1] : '';
  const definedVars = new Set<string>(
    Array.from(rootBlock.matchAll(/(--[a-zA-Z0-9\-_]+)\s*:/g), m => m[1]!),
  );

  // Extract all class selectors defined in globals.css
  const definedClasses = new Set(
    Array.from(cssContent.matchAll(/\.([a-zA-Z][a-zA-Z0-9\-_]*)/g), m => m[1]),
  );

  it('declares all required core theme tokens in :root', () => {
    expect(definedVars.has('--bg-primary')).toBe(true);
    expect(definedVars.has('--bg-surface')).toBe(true);
    expect(definedVars.has('--bg-surface-card')).toBe(true);
    expect(definedVars.has('--border-color')).toBe(true);
    expect(definedVars.has('--accent-cyan')).toBe(true);
    expect(definedVars.has('--accent-emerald')).toBe(true);
    expect(definedVars.has('--accent-amber')).toBe(true);
    expect(definedVars.has('--accent-rose')).toBe(true);
    expect(definedVars.has('--text-primary')).toBe(true);
    expect(definedVars.has('--text-secondary')).toBe(true);
    expect(definedVars.has('--font-sans')).toBe(true);
    expect(definedVars.has('--font-mono')).toBe(true);
    expect(definedVars.has('--font-size-xs')).toBe(true);
    expect(definedVars.has('--font-size-sm')).toBe(true);
    expect(definedVars.has('--font-size-base')).toBe(true);
    expect(definedVars.has('--font-size-lg')).toBe(true);
    expect(definedVars.has('--font-size-xl')).toBe(true);
    expect(definedVars.has('--font-size-2xl')).toBe(true);
  });

  it('declares all aliased custom properties in :root to prevent rendering fallbacks', () => {
    expect(definedVars.has('--text-main')).toBe(true);
    expect(definedVars.has('--accent-green')).toBe(true);
    expect(definedVars.has('--accent-red')).toBe(true);
    expect(definedVars.has('--accent-yellow')).toBe(true);
    expect(definedVars.has('--bg-card')).toBe(true);
    expect(definedVars.has('--card-bg')).toBe(true);
    expect(definedVars.has('--card-border')).toBe(true);
    expect(definedVars.has('--transitions-card')).toBe(true);
  });

  it('guarantees zero undefined var(--...) custom properties in web app source code', () => {
    const varRegex = /var\((--[a-zA-Z0-9\-_]+)[,\)]/g;
    const missingVars: { file: string; variable: string }[] = [];

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (
          entry.name.endsWith('.tsx') ||
          entry.name.endsWith('.ts') ||
          entry.name.endsWith('.css')
        ) {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const match of content.matchAll(varRegex)) {
            const v = match[1];
            if (v && !definedVars.has(v)) {
              missingVars.push({ file: path.relative(webSrcRoot, fullPath), variable: v });
            }
          }
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      missingVars,
      `Found undefined CSS variables:\n${JSON.stringify(missingVars, null, 2)}`,
    ).toEqual([]);
  });

  it('defines all environment mode and safety badges in globals.css', () => {
    expect(definedClasses.has('badge')).toBe(true);
    expect(definedClasses.has('badge-clinical')).toBe(true);
    expect(definedClasses.has('badge-research')).toBe(true);
    expect(definedClasses.has('badge-validation')).toBe(true);
    expect(definedClasses.has('badge-tier1')).toBe(true);
    expect(definedClasses.has('badge-tier2')).toBe(true);
    expect(definedClasses.has('badge-tier3')).toBe(true);
    expect(definedClasses.has('badge-tierexp')).toBe(true);
    expect(definedClasses.has('badge-warning')).toBe(true);
    expect(definedClasses.has('badge-danger')).toBe(true);
    // Convergence badges emitted by presentation package
    expect(definedClasses.has('badge-convergence-high')).toBe(true);
    expect(definedClasses.has('badge-convergence-moderate')).toBe(true);
    expect(definedClasses.has('badge-convergence-low')).toBe(true);
    // Mode badges emitted by presentation adapters
    expect(definedClasses.has('mode-badge-clinical')).toBe(true);
    expect(definedClasses.has('mode-badge-research')).toBe(true);
    expect(definedClasses.has('mode-badge-validation')).toBe(true);
    expect(definedClasses.has('mode-badge-failclosed')).toBe(true);
  });

  it('defines modal dialog and sub-element classes in globals.css', () => {
    expect(definedClasses.has('modal-backdrop')).toBe(true);
    expect(definedClasses.has('modal-dialog')).toBe(true);
    expect(definedClasses.has('modal-header')).toBe(true);
    expect(definedClasses.has('modal-title')).toBe(true);
    expect(definedClasses.has('modal-body')).toBe(true);
    expect(definedClasses.has('modal-close-btn')).toBe(true);
  });

  it('defines button size and variant classes in globals.css', () => {
    expect(definedClasses.has('btn')).toBe(true);
    expect(definedClasses.has('btn-primary')).toBe(true);
    expect(definedClasses.has('btn-secondary')).toBe(true);
    expect(definedClasses.has('btn-danger')).toBe(true);
    expect(definedClasses.has('btn-ghost')).toBe(true);
    expect(definedClasses.has('btn-sm')).toBe(true);
    expect(definedClasses.has('btn-lg')).toBe(true);
    expect(definedClasses.has('btn-group')).toBe(true);
  });

  it('defines standardized workspace layout containers in globals.css', () => {
    expect(definedClasses.has('container')).toBe(true);
    expect(definedClasses.has('clinical-context-workspace')).toBe(true);
    expect(definedClasses.has('case-evidence-workspace')).toBe(true);
    expect(definedClasses.has('measurements-workspace')).toBe(true);
    expect(definedClasses.has('measurement-detail-workspace')).toBe(true);
    expect(definedClasses.has('workspace-3col')).toBe(true);
  });

  it('defines alert callout primitive classes in globals.css', () => {
    expect(definedClasses.has('alert')).toBe(true);
    expect(definedClasses.has('alert-info')).toBe(true);
    expect(definedClasses.has('alert-warning')).toBe(true);
    expect(definedClasses.has('alert-danger')).toBe(true);
    expect(definedClasses.has('alert-success')).toBe(true);
    expect(definedClasses.has('alert-research')).toBe(true);
    expect(definedClasses.has('alert-neutral')).toBe(true);
    expect(definedClasses.has('alert-icon')).toBe(true);
    expect(definedClasses.has('alert-content')).toBe(true);
    expect(definedClasses.has('alert-title')).toBe(true);
    expect(definedClasses.has('alert-description')).toBe(true);
    expect(definedClasses.has('alert-actions')).toBe(true);
  });

  it('exports all shared UI primitives from components/ui', () => {
    expect(Button).toBeDefined();
    expect(Badge).toBeDefined();
    expect(Card).toBeDefined();
    expect(Breadcrumbs).toBeDefined();
    expect(Modal).toBeDefined();
    expect(Alert).toBeDefined();
    expect(AlertTitle).toBeDefined();
    expect(AlertDescription).toBeDefined();
    expect(AlertActions).toBeDefined();
    expect(AlertIcon).toBeDefined();
    expect(FilterBar).toBeDefined();
    expect(FilterBarRow).toBeDefined();
    expect(FilterBarGroup).toBeDefined();
    expect(FilterBarLabel).toBeDefined();
    expect(FilterBarSearch).toBeDefined();
    expect(FilterBarSelect).toBeDefined();
    expect(FilterBarActions).toBeDefined();
  });

  it('defines filter bar primitive and utility classes in globals.css', () => {
    expect(definedClasses.has('filter-bar')).toBe(true);
    expect(definedClasses.has('filter-bar-card')).toBe(true);
    expect(definedClasses.has('filter-bar-glass')).toBe(true);
    expect(definedClasses.has('filter-bar-inline')).toBe(true);
    expect(definedClasses.has('filter-bar-stacked')).toBe(true);
    expect(definedClasses.has('filter-bar-row')).toBe(true);
    expect(definedClasses.has('filter-bar-row-divider')).toBe(true);
    expect(definedClasses.has('filter-control')).toBe(true);
    expect(definedClasses.has('filter-label')).toBe(true);
    expect(definedClasses.has('filter-select')).toBe(true);
    expect(definedClasses.has('filter-search-wrapper')).toBe(true);
    expect(definedClasses.has('filter-search-icon')).toBe(true);
    expect(definedClasses.has('filter-search-input')).toBe(true);
    expect(definedClasses.has('filter-bar-actions')).toBe(true);
    expect(definedClasses.has('filter-bar-count')).toBe(true);
  });

  it('guarantees 0 uncomposed Card className="filter-bar" usages across apps/web/src', () => {
    const legacyCardFilterRegex = /<Card[^>]*className=["'][^"']*filter-bar[^"']*["']/;
    const violations: { file: string; line: number; text: string }[] = [];

    function scanDir(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.name.endsWith('.tsx') && !entry.name.includes('test')) {
          const lines = fs.readFileSync(full, 'utf8').split('\n');
          lines.forEach((lineText, idx) => {
            if (legacyCardFilterRegex.test(lineText)) {
              violations.push({
                file: path.relative(webSrcRoot, full),
                line: idx + 1,
                text: lineText.trim(),
              });
            }
          });
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      violations,
      `Found legacy <Card className="filter-bar"> usages; replace with canonical <FilterBar> primitive:\n${JSON.stringify(violations, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 0 legacy alert banner classes in JSX/TSX files across apps/web/src', () => {
    const legacyBannerRegex = /\b(warning-banner|info-banner|research-banner|gate-banner)\b/;
    const violations: { file: string; line: number; text: string }[] = [];

    function scanDir(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.name.endsWith('.tsx') && !entry.name.includes('test')) {
          const lines = fs.readFileSync(full, 'utf8').split('\n');
          lines.forEach((lineText, idx) => {
            if (
              legacyBannerRegex.test(lineText) &&
              !lineText.trim().startsWith('//') &&
              !lineText.trim().startsWith('/*') &&
              !lineText.includes('id=')
            ) {
              violations.push({
                file: path.relative(webSrcRoot, full),
                line: idx + 1,
                text: lineText.trim(),
              });
            }
          });
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      violations,
      `Found legacy alert banner classes; replace with canonical <Alert> primitive:\n${JSON.stringify(violations, null, 2)}`,
    ).toEqual([]);
  });

  it('synchronizes @magniom/ui tokens with globals.css custom properties with zero drift', () => {
    // 0. Base token alignment
    expect(CSS_THEME_VARIABLES['--bg-primary']).toBe(CLINICAL_THEME_TOKENS.colors.background);
    expect(CSS_THEME_VARIABLES['--accent-cyan']).toBe(CLINICAL_THEME_TOKENS.colors.primary);

    // 1. All CSS_THEME_VARIABLES are present in globals.css :root
    for (const [varName, varVal] of Object.entries(CSS_THEME_VARIABLES)) {
      expect(definedVars.has(varName), `Missing CSS variable ${varName} in globals.css :root`).toBe(
        true,
      );
      expect(rootBlock).toContain(`${varName}: ${varVal};`);
    }

    // 2. The entire :root block exactly matches the programmatic generator
    const rootRegex = /(?:\/\*[\s\S]*?\*\/\s*)?:root\s*\{[^}]*\}/;
    const currentRootMatch = cssContent.match(rootRegex)?.[0].trim();
    const expectedRoot = generateRootVariablesCss().trim();
    expect(currentRootMatch).toBe(expectedRoot);
  });

  it('enforces active direct consumption of @magniom/ui across web application components', () => {
    const uiConsumers: string[] = [];
    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (
          entry.name.endsWith('.tsx') ||
          (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts'))
        ) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes("from '@magniom/ui'")) {
            uiConsumers.push(path.relative(webSrcRoot, fullPath));
          }
        }
      }
    }
    scanDir(webSrcRoot);
    expect(
      uiConsumers.length,
      `Expected at least 3 components directly consuming @magniom/ui, found: ${JSON.stringify(uiConsumers)}`,
    ).toBeGreaterThanOrEqual(3);
  });

  it('guarantees zero ad-hoc breadcrumb nav elements and enforces <Breadcrumbs> component usage', () => {
    const rawNavBreadcrumbRegex = /<nav[^>]*aria-label=["'][^"']*Breadcrumb[^"']*["']/i;
    const violations: string[] = [];

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (
          entry.name.endsWith('.tsx') &&
          !fullPath.includes('components/ui/breadcrumbs.tsx')
        ) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (rawNavBreadcrumbRegex.test(content)) {
            violations.push(path.relative(webSrcRoot, fullPath));
          }
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      violations,
      `Found ad-hoc breadcrumbs without using <Breadcrumbs> component:\n${JSON.stringify(violations, null, 2)}`,
    ).toEqual([]);
  });

  it('enforces extensive adoption of shared Button and Badge primitives across pages', () => {
    let buttonConsumers = 0;
    let badgeConsumers = 0;
    const rawBtnRegex = /<(?:button|Link)[^>]*className=["'][^"']*btn\s+btn-[^"']*["']/g;
    const rawViolations: { file: string; match: string }[] = [];

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.name.endsWith('.tsx') && !fullPath.includes('components/ui/')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('<Button')) buttonConsumers++;
          if (content.includes('<Badge')) badgeConsumers++;

          // Check for raw btn classes in app pages
          if (fullPath.includes('/app/')) {
            const matches = content.match(rawBtnRegex);
            if (matches) {
              for (const m of matches) {
                rawViolations.push({ file: path.relative(webSrcRoot, fullPath), match: m });
              }
            }
          }
        }
      }
    }

    scanDir(webSrcRoot);
    expect(buttonConsumers, 'Expected at least 70 files consuming <Button>').toBeGreaterThanOrEqual(
      70,
    );
    expect(badgeConsumers, 'Expected at least 60 files consuming <Badge>').toBeGreaterThanOrEqual(
      60,
    );
    expect(
      rawViolations,
      `Found unmigrated raw button/link elements with btn class:\n${JSON.stringify(rawViolations, null, 2)}`,
    ).toEqual([]);
  });

  it('defines all canonical form control classes in globals.css', () => {
    expect(definedClasses.has('form-group')).toBe(true);
    expect(definedClasses.has('form-label')).toBe(true);
    expect(definedClasses.has('form-select')).toBe(true);
    expect(definedClasses.has('form-input')).toBe(true);
    expect(definedClasses.has('form-textarea')).toBe(true);
    expect(definedClasses.has('form-range')).toBe(true);
    expect(definedClasses.has('form-checkbox')).toBe(true);
    expect(definedClasses.has('form-radio')).toBe(true);
  });

  it('enforces extensive adoption of <Card> primitive and guarantees zero raw card divs in app pages', () => {
    let cardConsumers = 0;
    const rawCardViolations: string[] = [];
    const rawStyledSectionViolations: string[] = [];

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.name.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('<Card')) {
            cardConsumers++;
          }
          if (fullPath.includes('/app/')) {
            const divMatches = content.matchAll(/<div[^>]*className=["\x27]([^"\x27]*)["\x27]/g);
            for (const m of divMatches) {
              if (m[1]) {
                const classes = m[1].trim().split(/\s+/);
                if (classes.includes('card')) {
                  rawCardViolations.push(path.relative(webSrcRoot, fullPath));
                }
              }
            }
            const sectionTags = content.match(/<section[\s\S]*?>/g) || [];
            const styled = sectionTags.filter(
              t =>
                t.includes('style=') && (t.includes('background') || t.includes('backgroundColor')),
            );
            if (styled.length > 0) {
              rawStyledSectionViolations.push(path.relative(webSrcRoot, fullPath));
            }
          }
        }
      }
    }

    scanDir(webSrcRoot);
    expect(cardConsumers, 'Expected at least 65 files consuming <Card>').toBeGreaterThanOrEqual(65);
    expect(
      rawCardViolations,
      `Found raw <div className="card"> in app pages:\n${JSON.stringify(rawCardViolations, null, 2)}`,
    ).toEqual([]);
    expect(
      rawStyledSectionViolations,
      `Found raw <section> elements with inline background styling in app pages:\n${JSON.stringify(rawStyledSectionViolations, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees zero hardcoded hex colors in TSX/TS source files across apps/web/src', () => {
    const hexRegex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
    const hexViolations: { file: string; matches: string[] }[] = [];

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (
          (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) &&
          !fullPath.endsWith('.d.ts')
        ) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const matches = content.match(hexRegex);
          if (matches) {
            hexViolations.push({ file: path.relative(webSrcRoot, fullPath), matches });
          }
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      hexViolations,
      `Found hardcoded hex colors in source files:\n${JSON.stringify(hexViolations, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees zero hardcoded hex colors in globals.css outside :root', () => {
    const hexRegex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
    const lines = cssContent.split('\n');

    let inRoot = false;
    let rootEndLine = -1;
    let depth = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (line.includes(':root')) inRoot = true;
      if (inRoot) {
        for (const ch of line) {
          if (ch === '{') depth++;
          else if (ch === '}') {
            depth--;
            if (depth === 0) {
              rootEndLine = i + 1;
              inRoot = false;
              break;
            }
          }
        }
      }
    }

    expect(rootEndLine).toBeGreaterThan(0);

    const outsideRootHexes: { lineNum: number; line: string; hex: string }[] = [];
    for (let i = rootEndLine; i < lines.length; i++) {
      const line = lines[i]!;
      const matches = line.match(hexRegex);
      if (matches) {
        for (const h of matches) {
          outsideRootHexes.push({ lineNum: i + 1, line: line.trim(), hex: h });
        }
      }
    }

    expect(
      outsideRootHexes,
      `Found hardcoded hex colors in globals.css outside :root:\n${JSON.stringify(outsideRootHexes, null, 2)}`,
    ).toEqual([]);
  });

  function extractTags(content: string, tagName: string): string[] {
    const tags: string[] = [];
    let idx = 0;
    while ((idx = content.indexOf('<' + tagName, idx)) !== -1) {
      const nextChar = content[idx + tagName.length + 1];
      if (
        nextChar !== ' ' &&
        nextChar !== '\t' &&
        nextChar !== '\n' &&
        nextChar !== '\r' &&
        nextChar !== '>'
      ) {
        idx += tagName.length + 1;
        continue;
      }
      let endIdx = idx + tagName.length + 1;
      let inQuote = false;
      let quoteChar = '';
      let braceDepth = 0;
      while (endIdx < content.length) {
        const ch = content[endIdx];
        if (!inQuote) {
          if (ch === '{') braceDepth++;
          else if (ch === '}') braceDepth--;
          else if (ch === '"' || ch === "'" || ch === '`') {
            inQuote = true;
            quoteChar = ch;
          } else if (ch === '>' && braceDepth === 0) {
            endIdx++;
            break;
          }
        } else {
          if (ch === quoteChar && content[endIdx - 1] !== '\\') {
            inQuote = false;
          }
        }
        endIdx++;
      }
      tags.push(content.substring(idx, endIdx));
      idx = endIdx;
    }
    return tags;
  }

  it('guarantees zero raw <button> elements across all application pages and components (enforces <Button> primitive)', () => {
    const rawButtons: { file: string; tags: string[] }[] = [];

    function scanAllSources(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanAllSources(fullPath);
        } else if (
          entry.name.endsWith('.tsx') &&
          !fullPath.includes('components/ui/button.tsx') &&
          !fullPath.includes('components/ui/modal.tsx') &&
          !fullPath.includes('components/ui/filter-bar.tsx')
        ) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const btns = extractTags(content, 'button');
          if (btns.length > 0) {
            rawButtons.push({
              file: path.relative(webSrcRoot, fullPath),
              tags: btns.map(b => b.replace(/\s+/g, ' ').substring(0, 100)),
            });
          }
        }
      }
    }

    scanAllSources(webSrcRoot);
    expect(
      rawButtons,
      `Found raw <button> tags across application sources:\n${JSON.stringify(rawButtons, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees zero raw badge spans across all application pages and components (enforces <Badge> primitive)', () => {
    const rawBadges: { file: string; matches: string[] }[] = [];
    const badgeRegex = /<span[^>]*className=["'][^"']*badge[^"']*["']/g;

    function scanAllSources(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanAllSources(fullPath);
        } else if (entry.name.endsWith('.tsx') && !fullPath.includes('components/ui/badge.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const matches = content.match(badgeRegex);
          if (matches) {
            rawBadges.push({ file: path.relative(webSrcRoot, fullPath), matches });
          }
        }
      }
    }

    scanAllSources(webSrcRoot);
    expect(
      rawBadges,
      `Found raw badge spans across application sources:\n${JSON.stringify(rawBadges, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees zero raw <input>, <select>, or <textarea> HTML elements across all application pages and components (enforces canonical form primitives)', () => {
    const rawFormElements: { file: string; tags: string[] }[] = [];

    function scanAllSources(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanAllSources(fullPath);
        } else if (entry.name.endsWith('.tsx') && !fullPath.includes('components/ui/')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const inputs = extractTags(content, 'input');
          const selects = extractTags(content, 'select');
          const textareas = extractTags(content, 'textarea');
          const allRaw = [...inputs, ...selects, ...textareas];
          if (allRaw.length > 0) {
            rawFormElements.push({
              file: path.relative(webSrcRoot, fullPath),
              tags: allRaw.map(t => t.replace(/\s+/g, ' ').substring(0, 80)),
            });
          }
        }
      }
    }

    scanAllSources(webSrcRoot);
    expect(
      rawFormElements,
      `Found raw <input>, <select>, or <textarea> elements across application sources; use canonical form primitives from @/components/ui:\n${JSON.stringify(rawFormElements, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 100% of content-rendering application pages declare an authoritative <h1> element', () => {
    const appPagesDir = path.join(webSrcRoot, 'app');
    const missingH1Pages: string[] = [];
    let contentPageCount = 0;

    function scanAppPages(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanAppPages(fullPath);
        } else if (entry.name === 'page.tsx') {
          const content = fs.readFileSync(fullPath, 'utf8');
          // Exclude server redirect pages that perform navigation redirects without rendering HTML
          const isRedirectPage = content.includes('redirect(') && !/<[A-Za-z][^>]*>/.test(content);
          if (!isRedirectPage) {
            contentPageCount++;
            const hasDirectH1 =
              /<h1[\s>]|<CardTitle\b[^>]*\bas=["']h1["']|<PageHeader\b|<PageHeaderTitle\b/.test(
                content,
              ) ||
              content.includes('TargetComparison') ||
              content.includes('DecisionWorkspace') ||
              content.includes('PhenotypeWorkspace') ||
              content.includes('TargetSlateWorkspace');
            if (!hasDirectH1) {
              missingH1Pages.push(path.relative(appPagesDir, fullPath));
            }
          }
        }
      }
    }

    scanAppPages(appPagesDir);
    expect(contentPageCount).toBe(64);
    expect(
      missingH1Pages,
      `Found content pages lacking authoritative <h1>:\n${JSON.stringify(missingH1Pages, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 100% of content-rendering pages adopt canonical PageHeader or CardTitle primitives', () => {
    const nonCompliantPages: string[] = [];
    const appPagesDir = path.resolve(__dirname, '../src/app');

    function scan(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.name === 'page.tsx') {
          const content = fs.readFileSync(fullPath, 'utf8');
          const isRedirectPage = content.includes('redirect(') && !/<[A-Za-z][^>]*>/.test(content);
          if (!isRedirectPage) {
            const usesCanonicalHeader =
              content.includes('<PageHeader') ||
              content.includes('<CardTitle as="h1"') ||
              content.includes('TargetComparison') ||
              content.includes('DecisionWorkspace') ||
              content.includes('PhenotypeWorkspace') ||
              content.includes('TargetSlateWorkspace');
            if (!usesCanonicalHeader) {
              nonCompliantPages.push(path.relative(appPagesDir, fullPath));
            }
          }
        }
      }
    }

    scan(appPagesDir);
    expect(
      nonCompliantPages,
      `Found content pages lacking canonical PageHeader primitives:\n${JSON.stringify(nonCompliantPages, null, 2)}`,
    ).toEqual([]);
  });

  it('defines the 6 canonical typography utility classes in globals.css', () => {
    expect(definedClasses.has('text-xs')).toBe(true);
    expect(definedClasses.has('text-sm')).toBe(true);
    expect(definedClasses.has('text-base')).toBe(true);
    expect(definedClasses.has('text-lg')).toBe(true);
    expect(definedClasses.has('text-xl')).toBe(true);
    expect(definedClasses.has('text-2xl')).toBe(true);
  });

  it('guarantees 100% of inline fontSize declarations conform to the 6 authoritative typography tokens', () => {
    const canonicalSizes = new Set([
      '0.75rem',
      '0.875rem',
      '1rem',
      '1.125rem',
      '1.25rem',
      '1.5rem',
    ]);
    const arbitraryUsages: { file: string; size: string; line: number }[] = [];

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (
          entry.name.endsWith('.tsx') ||
          (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts'))
        ) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((lineText, idx) => {
            const regex = /fontSize:\s*(['"])([^'"]+)\1/g;
            let match;
            while ((match = regex.exec(lineText)) !== null) {
              const size = match[2];
              if (size && !canonicalSizes.has(size)) {
                arbitraryUsages.push({
                  file: path.relative(webSrcRoot, fullPath),
                  size,
                  line: idx + 1,
                });
              }
            }
          });
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      arbitraryUsages,
      `Found non-canonical arbitrary fontSize declarations:\n${JSON.stringify(arbitraryUsages, null, 2)}`,
    ).toEqual([]);
  });

  it('defines canonical layout, alignment, and gap utility classes in globals.css', () => {
    // Layout & Display
    expect(definedClasses.has('flex')).toBe(true);
    expect(definedClasses.has('inline-flex')).toBe(true);
    expect(definedClasses.has('grid')).toBe(true);
    expect(definedClasses.has('block')).toBe(true);
    expect(definedClasses.has('inline-block')).toBe(true);
    expect(definedClasses.has('hidden')).toBe(true);

    // Flex modifiers & alignment
    expect(definedClasses.has('flex-row')).toBe(true);
    expect(definedClasses.has('flex-col')).toBe(true);
    expect(definedClasses.has('flex-wrap')).toBe(true);
    expect(definedClasses.has('flex-1')).toBe(true);
    expect(definedClasses.has('items-center')).toBe(true);
    expect(definedClasses.has('items-start')).toBe(true);
    expect(definedClasses.has('items-end')).toBe(true);
    expect(definedClasses.has('justify-between')).toBe(true);
    expect(definedClasses.has('justify-center')).toBe(true);
    expect(definedClasses.has('justify-end')).toBe(true);

    // Gap scale
    expect(definedClasses.has('gap-1')).toBe(true);
    expect(definedClasses.has('gap-2')).toBe(true);
    expect(definedClasses.has('gap-3')).toBe(true);
    expect(definedClasses.has('gap-4')).toBe(true);
    expect(definedClasses.has('gap-6')).toBe(true);
    expect(definedClasses.has('gap-8')).toBe(true);

    // Colors & typography weights
    expect(definedClasses.has('text-primary')).toBe(true);
    expect(definedClasses.has('text-secondary')).toBe(true);
    expect(definedClasses.has('text-muted')).toBe(true);
    expect(definedClasses.has('text-cyan')).toBe(true);
    expect(definedClasses.has('text-emerald')).toBe(true);
    expect(definedClasses.has('text-amber')).toBe(true);
    expect(definedClasses.has('text-rose')).toBe(true);
    expect(definedClasses.has('font-bold')).toBe(true);
    expect(definedClasses.has('font-semibold')).toBe(true);
    expect(definedClasses.has('font-medium')).toBe(true);
    expect(definedClasses.has('font-mono')).toBe(true);

    // Composite workflow layouts
    expect(definedClasses.has('page-container-col')).toBe(true);
    expect(definedClasses.has('page-header-row')).toBe(true);
    expect(definedClasses.has('page-fallback-empty')).toBe(true);
    expect(definedClasses.has('stat-card-grid')).toBe(true);
    expect(definedClasses.has('case-workspace-header')).toBe(true);
  });

  it('enforces systemic reduction of inline styles and adoption of utility classes', () => {
    let totalInlineBlocks = 0;
    const standaloneSecondaryUsages: string[] = [];

    function scanDir(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (entry.name.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const matches = content.match(/style=\{\{[^}]+\}\}/g) || [];
          totalInlineBlocks += matches.length;

          if (content.includes("style={{ color: 'var(--text-secondary)' }}")) {
            standaloneSecondaryUsages.push(path.relative(webSrcRoot, fullPath));
          }
        }
      }
    }

    scanDir(webSrcRoot);
    // Liquidated from 2,017 inline blocks down to <= 10 (only dynamic WebGL canvas & patient marker colors remain)
    expect(
      totalInlineBlocks,
      'Expected inline style blocks to be liquidated below 10',
    ).toBeLessThanOrEqual(10);
    expect(
      standaloneSecondaryUsages,
      'Expected zero standalone text-secondary inline styles',
    ).toEqual([]);
  });

  it('verifies Phase 5 liquidated component utilities and tokens are defined in globals.css', () => {
    const requiredPhase5Classes = [
      'notification-container',
      'notification-popover',
      'notification-item',
      'phenotype-layout-grid',
      'candidate-coordinate-row',
      'candidate-expanded-section',
      'candidate-action-footer',
      'why-wrong-list',
      'spec-list',
      'grid-cards-320',
      'grid-cards-240',
      'grid-cards-200',
      'grid-cards-340',
      'measurement-card-qualified',
      'measurement-card-failed',
      'indication-chip',
      'indication-chip-active',
      'indication-module-card',
      'circuit-card',
      'radio-card',
      'audit-event-card',
      'center-card-box',
      'fullpage-center-layout',
      'root-error-body',
      'w-20',
      'grid-cols-2',
      'capitalize',
      'flex-1',
      'border-dashed',
      'whitespace-nowrap',
      'sort-icon',
    ];

    for (const cls of requiredPhase5Classes) {
      expect(definedClasses.has(cls), `Expected class .${cls} to be defined in globals.css`).toBe(
        true,
      );
    }
  });

  it('verifies core migrated components and case pages have zero inline styles', () => {
    const fullyLiquidatedFiles = [
      'components/case-header.tsx',
      'components/shell/global-sidebar.tsx',
      'components/shell/magniom-top-bar.tsx',
      'components/shell/environment-safety-strip.tsx',
      'components/evidence-drawer.tsx',
      'components/phenotype-workspace.tsx',
      'components/decision-workspace.tsx',
      'components/notification-system.tsx',
      'components/target-slate-workspace.tsx',
      'components/target-card.tsx',
      'components/target-comparison.tsx',
      'components/ui/scientific-states.tsx',
      'components/clinical-3d-viewer/circuit-overlay-selector.tsx',
      'components/clinical-3d-viewer/confidence-region-overlay.tsx',
      'components/clinical-3d-viewer/viewer-controls.tsx',
      'components/clinical-3d-viewer/counterfactual-3d-overlay.tsx',
      'components/clinical-3d-viewer/coordinate-panel.tsx',
      'components/formative-review-harness.tsx',
      'components/target-geometry-renderers.tsx',
      'app/cases/page.tsx',
      'app/reviews/page.tsx',
      'app/help/page.tsx',
      'app/research/cases/page.tsx',
      'app/internal/ci-status/page.tsx',
      'app/evidence/paths/page.tsx',
      'app/validation/studies/[studyId]/page.tsx',
      'app/cases/[caseId]/targets/page.tsx',
      'app/cases/[caseId]/measurements/[modality]/page.tsx',
      'app/cases/[caseId]/measurements/page.tsx',
      'app/cases/[caseId]/objective/page.tsx',
      'app/cases/[caseId]/context/page.tsx',
      'app/cases/[caseId]/evidence/page.tsx',
      'app/cases/[caseId]/indications/page.tsx',
      'app/cases/[caseId]/ptsd-context/page.tsx',
      'app/cases/[caseId]/trauma-context/page.tsx',
      'app/cases/[caseId]/treatment/page.tsx',
      'app/cases/[caseId]/outcomes/page.tsx',
      'app/cases/[caseId]/body-region/page.tsx',
      'app/cases/[caseId]/cue-context/page.tsx',
      'app/cases/[caseId]/imaging/page.tsx',
      'app/cases/[caseId]/notes/page.tsx',
      'app/cases/[caseId]/pain-context/page.tsx',
      'app/cases/[caseId]/ocd-context/page.tsx',
      'app/cases/[caseId]/provocation-context/page.tsx',
      'app/cases/[caseId]/aphasia-context/page.tsx',
      'app/cases/[caseId]/slt-context/page.tsx',
      'app/cases/[caseId]/substance-context/page.tsx',
      'app/cases/[caseId]/audit/page.tsx',
      'app/cases/[caseId]/assessment/page.tsx',
      'app/not-found.tsx',
      'app/global-error.tsx',
    ];

    for (const relPath of fullyLiquidatedFiles) {
      const fullPath = path.join(webSrcRoot, relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.match(/style=\{\{/g) || [];
      expect(
        matches.length,
        `Expected ${relPath} to have 0 inline styles, found ${matches.length}`,
      ).toBe(0);
    }
  });

  it('enforces Phase 2 semantic heading hierarchy normalization and single h1 per workspace', () => {
    // 1. Verify case-header.tsx has no h1 tag, ensuring child pages serve as sole authoritative h1
    const caseHeaderPath = path.join(webSrcRoot, 'components', 'case-header.tsx');
    const caseHeaderContent = fs.readFileSync(caseHeaderPath, 'utf8');
    expect(caseHeaderContent.includes('<h1')).toBe(false);
    expect(caseHeaderContent.includes('case-header-indication')).toBe(true);

    // 2. Scan all .tsx files under apps/web/src/app for heading level skips
    const skippedPages: { file: string; skip: string; sequence: string }[] = [];
    function scanPages(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanPages(fullPath);
        } else if (entry.name.endsWith('.tsx')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const matches: string[] = [];
          const headingRegex =
            /<(h[1-6])\b[^>]*>|<CardTitle\b([^>]*)|<PageHeaderTitle\b|<PageHeader\b/g;
          for (const m of content.matchAll(headingRegex)) {
            if (m[1]) {
              matches.push(m[1]);
            } else if (m[2] !== undefined) {
              const asMatch = m[2].match(/\bas=["'](h[1-6])["']/);
              matches.push(asMatch && asMatch[1] ? asMatch[1] : 'h3');
            } else {
              matches.push('h1');
            }
          }
          if (matches.length > 0) {
            const levels = matches.map(m => parseInt(m.replace('h', ''), 10));
            let prev = 0;
            for (const l of levels) {
              if (prev > 0 && l > prev + 1) {
                skippedPages.push({
                  file: path.relative(webSrcRoot, fullPath),
                  skip: `h${prev}->h${l}`,
                  sequence: matches.join(' -> '),
                });
                break;
              }
              prev = l;
            }
          }
        }
      }
    }

    scanPages(path.join(webSrcRoot, 'app'));
    expect(
      skippedPages,
      `Found pages skipping heading levels without intermediate descriptors:\n${JSON.stringify(skippedPages, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 100% of non-redirect content pages across all application routes render <Breadcrumbs>', () => {
    const appDir = path.join(webSrcRoot, 'app');
    function findContentPages(dir: string): string[] {
      let results: string[] = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(findContentPages(fullPath));
        } else if (
          entry.name === 'page.tsx' ||
          entry.name === 'not-found.tsx' ||
          entry.name === 'error.tsx'
        ) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const allPages = findContentPages(appDir);
    const missingBreadcrumbs: string[] = [];

    for (const p of allPages) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes('redirect(') && !/<[A-Za-z]/.test(content)) continue;
      const rel = path.relative(appDir, p);
      if (rel === 'page.tsx') continue; // Root home page is the root of the hierarchy

      const hasBreadcrumbs =
        content.includes('Breadcrumbs') ||
        content.includes('TargetComparison') ||
        content.includes('DecisionWorkspace') ||
        content.includes('PhenotypeWorkspace') ||
        content.includes('TargetSlateWorkspace');
      if (!hasBreadcrumbs) {
        missingBreadcrumbs.push(rel);
      }
    }

    expect(
      missingBreadcrumbs,
      `Found content pages lacking Breadcrumbs navigation:\n${JSON.stringify(missingBreadcrumbs, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees zero unmanaged platform emojis or unicode symbols across application TSX sources', () => {
    const emojiRegex =
      /[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}-\u{2B55}]/u;
    const emojiViolations: { file: string; match: string }[] = [];

    function scanDir(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.name.endsWith('.tsx')) {
          const content = fs.readFileSync(full, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, idx) => {
            const m = line.match(emojiRegex);
            if (m) {
              emojiViolations.push({
                file: `${path.relative(webSrcRoot, full)}:${idx + 1}`,
                match: m[0]!,
              });
            }
          });
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      emojiViolations,
      `Found unmanaged emojis/unicode glyphs in TSX files:\n${JSON.stringify(emojiViolations, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 100% of content-rendering pages use canonical .container.page-container-col', () => {
    const appDir = path.join(webSrcRoot, 'app');
    const missingContainers: string[] = [];

    function scan(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(full);
        } else if (
          entry.name === 'page.tsx' ||
          entry.name === 'not-found.tsx' ||
          entry.name === 'error.tsx' ||
          entry.name === 'global-error.tsx'
        ) {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes('redirect(') && !/<[A-Za-z]/.test(content)) continue;
          if (!content.includes('container page-container-col')) {
            missingContainers.push(path.relative(appDir, full));
          }
        }
      }
    }

    scan(appDir);
    expect(
      missingContainers,
      `Found pages not consuming canonical .container.page-container-col:\n${JSON.stringify(missingContainers, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees zero references to deprecated workspace container classes in tsx pages', () => {
    const deprecatedClasses = [
      'clinical-context-workspace',
      'case-evidence-workspace',
      'case-indications-workspace',
      'measurements-workspace',
      'measurement-detail-workspace',
      'internal-hub-workspace',
      'research-case-indication-workspace',
      'research-notes-workspace',
      'ptsd-context-workspace',
      'trauma-context-workspace',
      'clinical-objective-workspace',
      'new-case-wizard',
      'not-found-page',
      'error-page',
    ];

    const violations: { file: string; deprecatedClass: string }[] = [];
    function scan(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(full);
        } else if (entry.name.endsWith('.tsx')) {
          const content = fs.readFileSync(full, 'utf8');
          for (const cls of deprecatedClasses) {
            if (content.includes(cls)) {
              violations.push({
                file: path.relative(webSrcRoot, full),
                deprecatedClass: cls,
              });
            }
          }
        }
      }
    }

    scan(webSrcRoot);
    expect(
      violations,
      `Found deprecated workspace container classes in TSX pages:\n${JSON.stringify(violations, null, 2)}`,
    ).toEqual([]);
  });

  it('exports all canonical vector SVG icon primitives and Icon component from @/components/ui', () => {
    expect(typeof Icon).toBe('function');
    expect(typeof CheckIcon).toBe('function');
    expect(typeof AlertTriangleIcon).toBe('function');
    expect(typeof XIcon).toBe('function');
    expect(typeof InfoIcon).toBe('function');
    expect(typeof LockIcon).toBe('function');
    expect(typeof SearchIcon).toBe('function');
  });

  it('exports ScientificState and CaseNotFoundState from @/components/ui', () => {
    expect(typeof ScientificState).toBe('function');
    expect(typeof CaseNotFoundState).toBe('function');
  });

  it('guarantees 100% of case subpages adopt CaseNotFoundState in fallback states (zero raw "Case not found" or "page-fallback-empty")', () => {
    const casesDir = path.join(webSrcRoot, 'app/cases/[caseId]');
    const rawFallbackViolations: { file: string; match: string }[] = [];

    function findPages(dir: string): string[] {
      let results: string[] = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(findPages(full));
        } else if (entry.name === 'page.tsx') {
          results.push(full);
        }
      }
      return results;
    }

    const allPages = findPages(casesDir);

    for (const p of allPages) {
      const content = fs.readFileSync(p, 'utf8');
      if (content.includes('redirect(')) continue;

      if (content.includes('Case not found.') || content.includes('page-fallback-empty')) {
        rawFallbackViolations.push({
          file: path.relative(webSrcRoot, p),
          match: 'Found raw unstandardised fallback',
        });
      }

      // Assert that if record is checked, CaseNotFoundState is used
      if (content.includes('if (!record)')) {
        expect(
          content.includes('CaseNotFoundState'),
          `Page ${path.relative(webSrcRoot, p)} has if (!record) check but does not use CaseNotFoundState`,
        ).toBe(true);
      }
    }

    expect(
      rawFallbackViolations,
      `Found case subpages with raw unstandardised fallbacks:\n${JSON.stringify(rawFallbackViolations, null, 2)}`,
    ).toEqual([]);
  });

  it('verifies canonical Modal component is actively consumed across workflows with zero ad-hoc dialog implementations', () => {
    // Assert Modal is exported
    expect(typeof Modal).toBe('function');

    // Assert active consumers of Modal exist in the codebase
    const modalConsumers = [
      'components/case-header.tsx',
      'components/phenotype-workspace.tsx',
      'components/shell/version-manifest-disclosure.tsx',
      'components/evidence-drawer.tsx',
    ];

    for (const consumer of modalConsumers) {
      const fullPath = path.join(webSrcRoot, consumer);
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content.includes('<Modal'), `Expected ${consumer} to consume <Modal>`).toBe(true);
    }
  });

  it('exports Card compound sub-primitives and TableEmptyRow from @/components/ui', () => {
    expect(typeof CardHeader).toBe('function');
    expect(typeof CardTitle).toBe('function');
    expect(typeof CardDescription).toBe('function');
    expect(typeof CardContent).toBe('function');
    expect(typeof CardFooter).toBe('function');
    expect(typeof TableEmptyRow).toBe('function');
  });

  it('enforces active direct consumption of Card compound sub-primitives across key workflow views', () => {
    const pagesToCheck = [
      'app/page.tsx',
      'app/help/page.tsx',
      'app/admin/page.tsx',
      'app/internal/page.tsx',
    ];

    for (const relPath of pagesToCheck) {
      const fullPath = path.join(webSrcRoot, relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      expect(content.includes('<CardHeader'), `Expected ${relPath} to consume <CardHeader>`).toBe(
        true,
      );
      expect(content.includes('<CardTitle'), `Expected ${relPath} to consume <CardTitle>`).toBe(
        true,
      );
      expect(content.includes('<CardContent'), `Expected ${relPath} to consume <CardContent>`).toBe(
        true,
      );
    }
  });

  it('guarantees 100% adoption of Card compound primitives across all 58 card-using application pages', () => {
    const appDir = path.join(webSrcRoot, 'app');
    const unmigratedPages: string[] = [];
    let cardPageCount = 0;

    function scan(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(full);
        } else if (entry.name === 'page.tsx') {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes('<Card')) {
            cardPageCount++;
            const hasCompound = content.includes('<CardHeader') || content.includes('<CardContent');
            if (!hasCompound) {
              unmigratedPages.push(path.relative(appDir, full));
            }
          }
        }
      }
    }

    scan(appDir);
    expect(cardPageCount).toBe(58);
    expect(
      unmigratedPages,
      `Found application pages using bare <Card> without compound primitives:\n${JSON.stringify(unmigratedPages, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 100% adoption of Card compound primitives across ALL 72 card-using files in apps/web/src', () => {
    const unmigratedFiles: string[] = [];
    let cardFileCount = 0;

    function scanAll(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanAll(full);
        } else if (entry.name.endsWith('.tsx') && !full.includes('/ui/')) {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes('<Card')) {
            cardFileCount++;
            const hasCompound = content.includes('<CardHeader') || content.includes('<CardContent');
            if (!hasCompound) {
              unmigratedFiles.push(path.relative(webSrcRoot, full));
            }
          }
        }
      }
    }

    scanAll(webSrcRoot);
    expect(cardFileCount).toBe(72);
    expect(
      unmigratedFiles,
      `Found source files using bare <Card> without compound primitives:\n${JSON.stringify(unmigratedFiles, null, 2)}`,
    ).toEqual([]);
  });

  it('enforces 100% Breadcrumbs coverage on all non-redirect content pages across app directory', () => {
    const appDir = path.join(webSrcRoot, 'app');
    const missingBreadcrumbs: string[] = [];

    function findPages(dir: string): string[] {
      const results: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...findPages(fullPath));
        } else if (
          entry.name === 'page.tsx' ||
          entry.name === 'not-found.tsx' ||
          entry.name === 'error.tsx'
        ) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const pages = findPages(appDir);
    for (const pagePath of pages) {
      const relPath = path.relative(webSrcRoot, pagePath);
      // Root home landing page ('/') is root of navigation and does not render breadcrumbs
      if (relPath === 'app/page.tsx') continue;

      const content = fs.readFileSync(pagePath, 'utf8');
      // Ignore pure redirect pages
      if (content.includes('redirect(')) continue;

      // Check if page directly renders <Breadcrumbs or delegates to a workspace component with embedded Breadcrumbs
      let hasBreadcrumbs = content.includes('<Breadcrumbs');
      if (!hasBreadcrumbs) {
        if (
          content.includes('<TargetComparison') ||
          content.includes('<DecisionWorkspace') ||
          content.includes('<PhenotypeWorkspace')
        ) {
          hasBreadcrumbs = true;
        }
      }

      if (!hasBreadcrumbs) {
        missingBreadcrumbs.push(relPath);
      }
    }

    expect(
      missingBreadcrumbs,
      `Found content pages missing Breadcrumbs component:\n${JSON.stringify(missingBreadcrumbs, null, 2)}`,
    ).toEqual([]);
  });

  it('enforces 0 emojis or unmanaged unicode glyphs across all tsx/ts files in apps/web/src', () => {
    const emojiRegex =
      /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/u;
    const emojiViolations: { file: string; line: number; match: string }[] = [];

    function scanFiles(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanFiles(fullPath);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          // Skip test file itself
          if (entry.name.includes('test')) continue;
          const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
          lines.forEach((line, idx) => {
            const m = line.match(emojiRegex);
            if (m) {
              emojiViolations.push({
                file: path.relative(webSrcRoot, fullPath),
                line: idx + 1,
                match: m[0],
              });
            }
          });
        }
      }
    }

    scanFiles(webSrcRoot);
    expect(
      emojiViolations,
      `Found unmanaged emojis in apps/web/src:\n${JSON.stringify(emojiViolations, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 0 phantom CSS classes across all JSX elements in apps/web/src', () => {
    const classRegex = /\.((?:[a-zA-Z0-9\-_]|\\.)+)/g;
    const definedCssClasses = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = classRegex.exec(cssContent)) !== null) {
      definedCssClasses.add(m[1]!.replace(/\\/g, ''));
    }

    const ignoredTokens = new Set([
      'current',
      'complete',
      'research',
      'clinical',
      'validation',
      'fail-closed',
      'active',
      'selected',
      'open',
      'closed',
      'disabled',
      'focus',
      'hover',
      'none',
      'alert-',
      'magniom-icon-',
      'scientific-state-',
    ]);

    function extractClassNameLiterals(node: any): string[] {
      const literals: string[] = [];
      function visit(n: any) {
        if (!n) return;
        if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
          literals.push(n.text);
        } else if (ts.isTemplateExpression(n)) {
          literals.push(n.head.text);
          for (const span of n.templateSpans) {
            literals.push(span.literal.text);
            visit(span.expression);
          }
        } else if (ts.isConditionalExpression(n)) {
          visit(n.whenTrue);
          visit(n.whenFalse);
        } else if (ts.isBinaryExpression(n)) {
          if (
            n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
            n.operatorToken.kind === ts.SyntaxKind.BarBarToken
          ) {
            visit(n.right);
          }
        } else if (ts.isCallExpression(n)) {
          if (ts.isPropertyAccessExpression(n.expression) && n.expression.name.text === 'trim') {
            visit(n.expression.expression);
          } else {
            for (const arg of n.arguments) visit(arg);
          }
        } else if (ts.isArrayLiteralExpression(n)) {
          for (const elem of n.elements) visit(elem);
        } else if (ts.isParenthesizedExpression(n)) {
          visit(n.expression);
        }
      }
      visit(node);
      return literals;
    }

    const missingClasses: { file: string; line: number; className: string }[] = [];
    function scanDir(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.name.endsWith('.tsx') && !entry.name.includes('test')) {
          const content = fs.readFileSync(full, 'utf8');
          const sourceFile = ts.createSourceFile(
            full,
            content,
            ts.ScriptTarget.Latest,
            true,
            ts.ScriptKind.TSX,
          );

          function visitNode(node: any) {
            if (
              ts.isJsxAttribute(node) &&
              ts.isIdentifier(node.name) &&
              node.name.text === 'className'
            ) {
              if (node.initializer) {
                let stringValues: string[] = [];
                if (ts.isStringLiteral(node.initializer)) {
                  stringValues = [node.initializer.text];
                } else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
                  stringValues = extractClassNameLiterals(node.initializer.expression);
                }

                const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

                for (const val of stringValues) {
                  const tokens = val.split(/\s+/).filter(Boolean);
                  for (const token of tokens) {
                    if (/^[a-zA-Z][a-zA-Z0-9\-_/.:]*$/.test(token)) {
                      if (!definedCssClasses.has(token) && !ignoredTokens.has(token)) {
                        missingClasses.push({
                          file: path.relative(webSrcRoot, full),
                          line: line + 1,
                          className: token,
                        });
                      }
                    }
                  }
                }
              }
            }
            ts.forEachChild(node, visitNode);
          }

          visitNode(sourceFile);
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      missingClasses,
      `Found phantom CSS classes referenced in JSX but undefined in globals.css:\n${JSON.stringify(missingClasses, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 0 raw unicode arrow glyphs (→, ←, ↑, ↓, ↔, ⇒, ⇐, ▲, ▼, ▶, ◀, ↺, ↗) across TSX files in apps/web/src', () => {
    const arrowRegex = /[→←↑↓↔⇒⇐▲▼▶◀↺↗]/;
    const arrowViolations: { file: string; line: number; text: string }[] = [];

    function scanDir(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.name.endsWith('.tsx')) {
          if (entry.name.includes('test')) continue;
          const lines = fs.readFileSync(full, 'utf8').split('\n');
          lines.forEach((lineText, idx) => {
            if (arrowRegex.test(lineText)) {
              arrowViolations.push({
                file: path.relative(webSrcRoot, full),
                line: idx + 1,
                text: lineText.trim(),
              });
            }
          });
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      arrowViolations,
      `Found raw unicode arrow glyphs; replace with canonical vector icons (ArrowRightIcon, ArrowLeftIcon, ArrowDownIcon, ArrowLeftRightIcon, ExternalLinkIcon):\n${JSON.stringify(arrowViolations, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 0 legacy CSS variable aliases in TSX source code', () => {
    const legacyAliasRegex = /var\((--(text-main|accent-green|accent-red|accent-yellow))\)/;
    const violations: { file: string; line: number; text: string }[] = [];

    function scanDir(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.name.endsWith('.tsx')) {
          if (entry.name.includes('test')) continue;
          const lines = fs.readFileSync(full, 'utf8').split('\n');
          lines.forEach((lineText, idx) => {
            if (legacyAliasRegex.test(lineText)) {
              violations.push({
                file: path.relative(webSrcRoot, full),
                line: idx + 1,
                text: lineText.trim(),
              });
            }
          });
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      violations,
      `Found legacy CSS variable aliases in TSX files; replace with canonical variables (--text-primary, --accent-emerald, --accent-rose, --accent-amber):\n${JSON.stringify(violations, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 0 legacy .text-main CSS class usages across all JSX elements in apps/web/src', () => {
    const textMainViolations: { file: string; line: number; text: string }[] = [];

    function scanDir(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.name.endsWith('.tsx')) {
          if (entry.name.includes('test')) continue;
          const lines = fs.readFileSync(full, 'utf8').split('\n');
          lines.forEach((lineText, idx) => {
            if (
              /(?:className=["'`](?:[^"'`]*\s)?text-main(?:\s[^"'`]*)?["'`]|classNames?\([^)]*\btext-main\b)/.test(
                lineText,
              )
            ) {
              textMainViolations.push({
                file: path.relative(webSrcRoot, full),
                line: idx + 1,
                text: lineText.trim(),
              });
            }
          });
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      textMainViolations,
      `Found legacy .text-main class usages; use canonical .text-primary instead:\n${JSON.stringify(textMainViolations, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 100% of font-size declarations in globals.css outside :root use canonical design tokens', () => {
    const lines = cssContent.split('\n');
    let inRoot = false;
    const nonTokenFontSizes: { line: number; text: string }[] = [];

    lines.forEach((lineText, idx) => {
      const stripped = lineText.trim();
      if (stripped.includes(':root')) {
        inRoot = true;
      }
      if (inRoot && stripped.includes('}')) {
        inRoot = false;
        return;
      }
      if (!inRoot && stripped.includes('font-size:')) {
        if (!/font-size:\s*(?:var\(--font-size-[a-z0-9]+\)|inherit);/.test(stripped)) {
          nonTokenFontSizes.push({ line: idx + 1, text: stripped });
        }
      }
    });

    expect(
      nonTokenFontSizes,
      `Found hardcoded non-token font-size declarations outside :root in globals.css; use var(--font-size-*):\n${JSON.stringify(nonTokenFontSizes, null, 2)}`,
    ).toEqual([]);
  });

  it('guarantees 0 hardcoded hex colors in packages/presentation/src', () => {
    const presentationSrc = path.resolve(webSrcRoot, '../../../packages/presentation/src');
    const hexRegex = /#[0-9a-fA-F]{3,8}\b/;
    const violations: { file: string; line: number; text: string }[] = [];

    function scanDir(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (entry.name.endsWith('.ts')) {
          const lines = fs.readFileSync(full, 'utf8').split('\n');
          lines.forEach((lineText, idx) => {
            if (hexRegex.test(lineText)) {
              violations.push({
                file: path.relative(presentationSrc, full),
                line: idx + 1,
                text: lineText.trim(),
              });
            }
          });
        }
      }
    }

    scanDir(presentationSrc);
    expect(
      violations,
      `Found hardcoded hex colors in packages/presentation/src:\n${JSON.stringify(violations, null, 2)}`,
    ).toEqual([]);
  });

  it('enforces Phase 6 UI barrier integrity: zero deep imports from components/ui/* (all consumers import from @/components/ui)', () => {
    const deepImports: { file: string; importStatement: string }[] = [];
    const deepImportRegex = /from\s+['"][^'"]*components\/ui\/[a-zA-Z0-9_\-]+['"]/g;

    function scanDir(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(full);
        } else if (
          (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) &&
          !full.includes('components/ui/') &&
          !entry.name.includes('test')
        ) {
          const content = fs.readFileSync(full, 'utf8');
          const matches = content.match(deepImportRegex);
          if (matches) {
            deepImports.push({
              file: path.relative(webSrcRoot, full),
              importStatement: matches.join('; '),
            });
          }
        }
      }
    }

    scanDir(webSrcRoot);
    expect(
      deepImports,
      `Found deep imports from components/ui/*; all consumers must import from @/components/ui directly:\n${JSON.stringify(deepImports, null, 2)}`,
    ).toEqual([]);
  });

  it('enforces Phase 6 component deduplication: zero obsolete component wrapper stubs in components root', () => {
    const prohibitedStubs = ['scientific-states.tsx', 'badge-wrapper.tsx', 'button-wrapper.tsx'];
    for (const stub of prohibitedStubs) {
      const stubPath = path.join(webSrcRoot, 'components', stub);
      expect(
        fs.existsSync(stubPath),
        `Found obsolete component wrapper stub: ${stub}. Use canonical @/components/ui primitive instead.`,
      ).toBe(false);
    }
  });

  it('verifies Phase 6 shared primitives export all required design system components', () => {
    expect(Button).toBeDefined();
    expect(Badge).toBeDefined();
    expect(Card).toBeDefined();
    expect(CardHeader).toBeDefined();
    expect(CardTitle).toBeDefined();
    expect(CardDescription).toBeDefined();
    expect(CardContent).toBeDefined();
    expect(CardFooter).toBeDefined();
    expect(Breadcrumbs).toBeDefined();
    expect(Modal).toBeDefined();
    expect(Icon).toBeDefined();
    expect(ArrowDownIcon).toBeDefined();
    expect(ArrowLeftRightIcon).toBeDefined();
    expect(Alert).toBeDefined();
    expect(AlertTitle).toBeDefined();
    expect(AlertDescription).toBeDefined();
    expect(AlertActions).toBeDefined();
    expect(AlertIcon).toBeDefined();
    expect(FilterBar).toBeDefined();
    expect(FilterBarRow).toBeDefined();
    expect(FilterBarGroup).toBeDefined();
    expect(FilterBarLabel).toBeDefined();
    expect(FilterBarSearch).toBeDefined();
    expect(FilterBarSelect).toBeDefined();
    expect(FilterBarActions).toBeDefined();
    expect(ScientificState).toBeDefined();
    expect(CaseNotFoundState).toBeDefined();
    expect(TableEmptyRow).toBeDefined();
    expect(Input).toBeDefined();
    expect(Select).toBeDefined();
    expect(Textarea).toBeDefined();
    expect(Checkbox).toBeDefined();
    expect(RangeSlider).toBeDefined();
    expect(Radio).toBeDefined();
    expect(FormGroup).toBeDefined();
    expect(FormLabel).toBeDefined();
  });
});
