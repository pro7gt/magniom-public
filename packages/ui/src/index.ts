/**
 * @magniom/ui
 * Clinical design system tokens and theme constants.
 * Conforms to MAGNIOM-Clinician Workspace & UX Specification v1.0.
 */

export const CLINICAL_THEME_TOKENS = {
  colors: {
    // Canvas & Surfaces
    background: '#090d16',
    surface: '#111827',
    surfaceElevated: '#1f2937',
    surfaceCard: '#151c2e',
    surfaceDrawer: '#0f172a',
    border: '#374151',
    borderSubtle: '#1f293d',
    borderHighlight: '#38bdf8',

    // Accents & Signals
    primary: '#38bdf8',
    primaryHover: '#0ea5e9',
    secondary: '#818cf8',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    research: '#f59e0b',
    purple: '#8b5cf6',
    white: '#ffffff',
    black: '#000000',

    // Typography
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    textInverse: '#090d16',

    // Evidence Tiers
    tier1Badge: '#059669',
    tier2Badge: '#0284c7',
    tier3Badge: '#d97706',
    tier4Badge: '#7c3aed',
    tierExpBadge: '#dc2626',

    // Reliability Levels
    reliabilityHigh: '#10b981',
    reliabilityModerate: '#38bdf8',
    reliabilityLow: '#f59e0b',
    reliabilityUnusable: '#ef4444',

    // Workflow Rail States
    workflowCompleted: '#10b981',
    workflowActive: '#38bdf8',
    workflowAvailable: '#9ca3af',
    workflowLocked: '#4b5563',

    // Environment Modes
    modeClinical: '#38bdf8',
    modeResearch: '#f59e0b',
    modeValidation: '#818cf8',

    // Decision Action Button Backgrounds
    decisionAcceptBg: '#065f46',
    decisionRejectBg: '#991b1b',
    decisionModifyBg: '#1e40af',
    decisionDeferBg: '#92400e',

    // Environment Mode Banners & Safety Strips
    modeResearchBg: '#3d2800',
    modeResearchText: '#fefcbf',
    modeResearchBorder: '#d69e2e',
    modeValidationBg: '#1b3247',
    modeValidationText: '#bee3f8',
    modeValidationBorder: '#3182ce',
    modeFailClosedBg: '#4a1114',
    modeFailClosedText: '#ffdddd',
    modeFailClosedBorder: '#e53e3e',
  },
  typography: {
    fontFamilySans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
    fontSizeXs: '0.75rem',
    fontSizeSm: '0.875rem',
    fontSizeBase: '1rem',
    fontSizeLg: '1.125rem',
    fontSizeXl: '1.25rem',
    fontSize2Xl: '1.5rem',
  },
  layout: {
    leftColumnWidth: '300px',
    centerColumnWidth: '1fr',
    rightColumnWidth: '380px',
    drawerWidth: '540px',
    maxContainerWidth: '1600px',
    headerHeight: '64px',
    workflowRailHeight: '48px',
  },
  transitions: {
    drawer: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    card: 'all 0.15s ease-in-out',
  },
} as const;

/**
 * Numeric hex tokens optimized for WebGL, Canvas, and 3D rendering contexts.
 */
export const HEX_NUMERIC_TOKENS = {
  background: 0x090d16,
  surface: 0x111827,
  surfaceElevated: 0x1f2937,
  surfaceCard: 0x151c2e,
  surfaceDrawer: 0x0f172a,
  border: 0x374151,
  borderSubtle: 0x1f293d,
  borderHighlight: 0x38bdf8,
  primary: 0x38bdf8,
  primaryHover: 0x0ea5e9,
  secondary: 0x818cf8,
  success: 0x10b981,
  warning: 0xf59e0b,
  danger: 0xef4444,
  purple: 0x8b5cf6,
  textPrimary: 0xf9fafb,
  textSecondary: 0x9ca3af,
  textMuted: 0x6b7280,
} as const;

export const CSS_THEME_VARIABLES = {
  '--bg-primary': CLINICAL_THEME_TOKENS.colors.background,
  '--bg-surface': CLINICAL_THEME_TOKENS.colors.surface,
  '--bg-surface-elevated': CLINICAL_THEME_TOKENS.colors.surfaceElevated,
  '--bg-surface-card': CLINICAL_THEME_TOKENS.colors.surfaceCard,
  '--bg-surface-drawer': CLINICAL_THEME_TOKENS.colors.surfaceDrawer,

  '--border-color': CLINICAL_THEME_TOKENS.colors.border,
  '--border-subtle': CLINICAL_THEME_TOKENS.colors.borderSubtle,
  '--border-highlight': CLINICAL_THEME_TOKENS.colors.borderHighlight,

  '--accent-cyan': CLINICAL_THEME_TOKENS.colors.primary,
  '--accent-cyan-hover': CLINICAL_THEME_TOKENS.colors.primaryHover,
  '--accent-indigo': CLINICAL_THEME_TOKENS.colors.secondary,
  '--accent-emerald': CLINICAL_THEME_TOKENS.colors.success,
  '--accent-amber': CLINICAL_THEME_TOKENS.colors.warning,
  '--accent-rose': CLINICAL_THEME_TOKENS.colors.danger,
  '--accent-purple': CLINICAL_THEME_TOKENS.colors.purple,

  '--text-primary': CLINICAL_THEME_TOKENS.colors.textPrimary,
  '--text-secondary': CLINICAL_THEME_TOKENS.colors.textSecondary,
  '--text-muted': CLINICAL_THEME_TOKENS.colors.textMuted,
  '--text-inverse': CLINICAL_THEME_TOKENS.colors.textInverse,

  // Aliases & Missing CSS Custom Properties
  '--text-main': CLINICAL_THEME_TOKENS.colors.textPrimary,
  '--accent-green': CLINICAL_THEME_TOKENS.colors.success,
  '--accent-red': CLINICAL_THEME_TOKENS.colors.danger,
  '--accent-yellow': CLINICAL_THEME_TOKENS.colors.warning,
  '--bg-card': CLINICAL_THEME_TOKENS.colors.surfaceCard,
  '--card-bg': CLINICAL_THEME_TOKENS.colors.surfaceCard,
  '--card-border': CLINICAL_THEME_TOKENS.colors.border,
  '--transitions-card': CLINICAL_THEME_TOKENS.transitions.card,
  '--color-white': CLINICAL_THEME_TOKENS.colors.white,
  '--color-black': CLINICAL_THEME_TOKENS.colors.black,

  // Decision Action Button Backgrounds
  '--decision-accept-bg': CLINICAL_THEME_TOKENS.colors.decisionAcceptBg,
  '--decision-reject-bg': CLINICAL_THEME_TOKENS.colors.decisionRejectBg,
  '--decision-modify-bg': CLINICAL_THEME_TOKENS.colors.decisionModifyBg,
  '--decision-defer-bg': CLINICAL_THEME_TOKENS.colors.decisionDeferBg,

  // Environment Safety Strips
  '--mode-research-bg': CLINICAL_THEME_TOKENS.colors.modeResearchBg,
  '--mode-research-text': CLINICAL_THEME_TOKENS.colors.modeResearchText,
  '--mode-research-border': CLINICAL_THEME_TOKENS.colors.modeResearchBorder,
  '--mode-validation-bg': CLINICAL_THEME_TOKENS.colors.modeValidationBg,
  '--mode-validation-text': CLINICAL_THEME_TOKENS.colors.modeValidationText,
  '--mode-validation-border': CLINICAL_THEME_TOKENS.colors.modeValidationBorder,
  '--mode-failclosed-bg': CLINICAL_THEME_TOKENS.colors.modeFailClosedBg,
  '--mode-failclosed-text': CLINICAL_THEME_TOKENS.colors.modeFailClosedText,
  '--mode-failclosed-border': CLINICAL_THEME_TOKENS.colors.modeFailClosedBorder,

  // Evidence Tier Badge Borders
  '--badge-tier1-border': CLINICAL_THEME_TOKENS.colors.tier1Badge,
  '--badge-tier2-border': CLINICAL_THEME_TOKENS.colors.tier2Badge,
  '--badge-tier3-border': CLINICAL_THEME_TOKENS.colors.tier3Badge,
  '--badge-tier4-border': CLINICAL_THEME_TOKENS.colors.tier4Badge,
  '--badge-tierexp-border': CLINICAL_THEME_TOKENS.colors.tierExpBadge,

  '--font-sans': CLINICAL_THEME_TOKENS.typography.fontFamilySans,
  '--font-mono': CLINICAL_THEME_TOKENS.typography.fontFamilyMono,

  '--font-size-xs': CLINICAL_THEME_TOKENS.typography.fontSizeXs,
  '--font-size-sm': CLINICAL_THEME_TOKENS.typography.fontSizeSm,
  '--font-size-base': CLINICAL_THEME_TOKENS.typography.fontSizeBase,
  '--font-size-lg': CLINICAL_THEME_TOKENS.typography.fontSizeLg,
  '--font-size-xl': CLINICAL_THEME_TOKENS.typography.fontSizeXl,
  '--font-size-2xl': CLINICAL_THEME_TOKENS.typography.fontSize2Xl,

  // Workspace & Drawer Layout Tokens
  '--layout-left-col-width': CLINICAL_THEME_TOKENS.layout.leftColumnWidth,
  '--layout-center-col-width': CLINICAL_THEME_TOKENS.layout.centerColumnWidth,
  '--layout-right-col-width': CLINICAL_THEME_TOKENS.layout.rightColumnWidth,
  '--layout-drawer-width': CLINICAL_THEME_TOKENS.layout.drawerWidth,
  '--layout-max-container-width': CLINICAL_THEME_TOKENS.layout.maxContainerWidth,
  '--layout-header-height': CLINICAL_THEME_TOKENS.layout.headerHeight,
  '--layout-workflow-rail-height': CLINICAL_THEME_TOKENS.layout.workflowRailHeight,

  // Surface overlay & alpha glass tokens
  '--surface-overlay-subtle': 'rgba(255, 255, 255, 0.04)',
  '--surface-overlay-card': 'rgba(255, 255, 255, 0.02)',
  '--border-glass-tint': 'rgba(255, 255, 255, 0.08)',
} as const;

/**
 * Generates the raw CSS variable declarations string.
 */
export function generateCssThemeVariables(): string {
  const entries = Object.entries(CSS_THEME_VARIABLES).map(([key, val]) => `  ${key}: ${val};`);
  return entries.join('\n');
}

/**
 * Generates a complete, authoritative :root { ... } CSS block.
 */
export function generateRootVariablesCss(): string {
  return `/* ==========================================================================
   PROGRAMMATICALLY GENERATED DESIGN TOKENS (DO NOT EDIT MANUALLY)
   Source of Truth: @magniom/ui (packages/ui/src/index.ts)
   ========================================================================== */
:root {
${generateCssThemeVariables()}
}
`;
}

export function getTierBadgeColor(tier: string): string {
  switch (tier) {
    case 'T1':
      return CLINICAL_THEME_TOKENS.colors.tier1Badge;
    case 'T2':
      return CLINICAL_THEME_TOKENS.colors.tier2Badge;
    case 'T3':
      return CLINICAL_THEME_TOKENS.colors.tier3Badge;
    case 'T4':
      return CLINICAL_THEME_TOKENS.colors.tier4Badge;
    default:
      return CLINICAL_THEME_TOKENS.colors.tierExpBadge;
  }
}

export function getReliabilityBadgeColor(level: string): string {
  switch (level) {
    case 'HIGH':
      return CLINICAL_THEME_TOKENS.colors.reliabilityHigh;
    case 'MODERATE':
      return CLINICAL_THEME_TOKENS.colors.reliabilityModerate;
    case 'LOW':
      return CLINICAL_THEME_TOKENS.colors.reliabilityLow;
    default:
      return CLINICAL_THEME_TOKENS.colors.reliabilityUnusable;
  }
}

export function getModeBadgeColor(mode: string): string {
  switch (mode.toUpperCase()) {
    case 'RESEARCH':
      return CLINICAL_THEME_TOKENS.colors.modeResearch;
    case 'VALIDATION':
      return CLINICAL_THEME_TOKENS.colors.modeValidation;
    default:
      return CLINICAL_THEME_TOKENS.colors.modeClinical;
  }
}
