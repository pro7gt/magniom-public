/**
 * @magniom/ui
 * Clinical design system tokens and theme constants.
 * Unified with MAGNIOM Landing Page design system (magniom.com).
 * Conforms to MAGNIOM-Clinician Workspace & UX Specification v1.0.
 */

export const CLINICAL_THEME_TOKENS = {
  colors: {
    // Canvas & Surfaces — Light, warm mineral white (landing page §1)
    bgBase: '#F8F9FA',
    bgSurface: '#FFFFFF',
    bgSurfaceSubtle: '#F1F3F5',
    bgSurfaceElevated: '#FFFFFF',
    bgSurfaceTint: '#EBF2F5',

    // Legacy aliases for backward compatibility
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceCard: '#FFFFFF',
    surfaceDrawer: '#FFFFFF',

    // Borders & Rules — Landing page §1
    border: '#DDE3E6',
    borderSubtle: '#ECEFF1',
    borderStrong: '#9BAAB4',
    borderHighlight: '#1B4353',

    // Accent — Deep Petrol / Mineral Blue (landing page §1)
    primary: '#1B4353',
    primaryHover: '#13313D',
    accentSubtle: 'rgba(27, 67, 83, 0.07)',
    accentBorder: '#C5D6DF',

    // Status Accent — Calibrated Amber / Mineral (landing page §1)
    statusText: '#8A521D',
    statusBg: '#F9F4EE',
    statusBorder: '#E8DACB',

    // Clinical Semantic Signals — recalibrated for light backgrounds (WCAG AA)
    secondary: '#5A6B78',
    success: '#0D7C5A',
    warning: '#9A6400',
    danger: '#C42020',
    research: '#9A6400',
    purple: '#6A2DC8',
    white: '#ffffff',
    black: '#000000',

    // Typography — Near-black graphite on warm white (landing page §1)
    textPrimary: '#121516',
    textSecondary: '#3E484F',
    textMuted: '#566571',
    textInverse: '#FFFFFF',

    // Evidence Tiers — adjusted for light background contrast
    tier1Badge: '#0D7C5A',
    tier2Badge: '#0B6FAA',
    tier3Badge: '#9A6400',
    tier4Badge: '#6A2DC8',
    tierExpBadge: '#C42020',

    // Reliability Levels — adjusted for light backgrounds
    reliabilityHigh: '#0D7C5A',
    reliabilityModerate: '#0B6FAA',
    reliabilityLow: '#9A6400',
    reliabilityUnusable: '#C42020',

    // Workflow Rail States
    workflowCompleted: '#0D7C5A',
    workflowActive: '#1B4353',
    workflowAvailable: '#566571',
    workflowLocked: '#9BAAB4',

    // Environment Modes — restrained tints for light backgrounds
    modeClinical: '#1B4353',
    modeResearch: '#9A6400',
    modeValidation: '#5A6B78',

    // Decision Action Button Backgrounds — muted for light surfaces
    decisionAcceptBg: '#E8F5EE',
    decisionRejectBg: '#FDECEC',
    decisionModifyBg: '#EBF2F5',
    decisionDeferBg: '#F9F4EE',
    decisionAcceptActive: '#0A6B4D',
    decisionRejectActive: '#A41A1A',

    // Semantic Status & Alert Surfaces (Light Mode)
    alertDangerBg: '#FDECEC',
    alertDangerBorder: '#E8B4B4',
    alertSuccessBg: '#E8F5EE',
    alertSuccessBorder: '#B4D9C4',
    alertInfoBg: '#EBF2F5',
    alertInfoBorder: '#C5D6DF',
    alertWarningBg: '#FDF8ED',
    alertWarningBorder: '#E8DACB',

    // Badge Backgrounds (Light Mode)
    badgeTier1Bg: '#E8F5EE',
    badgeTier2Bg: '#E6F0F8',
    badgeTier3Bg: '#FDF8ED',
    badgeTier4Bg: '#F0E8F8',
    badgeTierExpBg: '#FDECEC',

    // Environment Mode Banners & Safety Strips — light variants
    modeResearchBg: '#FDF8ED',
    modeResearchText: '#8A521D',
    modeResearchBorder: '#E8DACB',
    modeValidationBg: '#EBF2F5',
    modeValidationText: '#3E484F',
    modeValidationBorder: '#C5D6DF',
    modeFailClosedBg: '#FDECEC',
    modeFailClosedText: '#C42020',
    modeFailClosedBorder: '#E8B4B4',

    // 3D Viewer — intentionally dark (medical imaging convention)
    viewerBg: '#090d16',
    viewerSurface: '#111827',
    viewerBorder: '#374151',
    viewerTextPrimary: '#f9fafb',
    viewerTextSecondary: '#9ca3af',
    viewerAccent: '#38bdf8',
  },
  typography: {
    // Instrument Sans — unified with landing page
    fontFamilySans:
      '"Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontFamilyDisplay: '"Instrument Sans", -apple-system, BlinkMacSystemFont, sans-serif',
    fontFamilyMono: 'ui-monospace, "SF Mono", "Cascadia Code", "Roboto Mono", monospace',
    fontSizeXs: '0.75rem',
    fontSizeSm: '0.875rem',
    fontSizeMd: '0.9375rem',
    fontSizeBase: '1rem',
    fontSizeLead: '1.0625rem',
    fontSizeLg: '1.125rem',
    fontSizeXl: '1.25rem',
    fontSize2Xl: '1.5rem',
    fontSize3Xl: 'clamp(1.75rem, 3vw, 2.5rem)',
    fontSize4Xl: 'clamp(2.25rem, 4vw, 3.25rem)',
  },
  layout: {
    leftColumnWidth: '280px',
    centerColumnWidth: '1fr',
    rightColumnWidth: '380px',
    drawerWidth: '540px',
    maxContainerWidth: '1600px',
    containerMax: '1240px',
    containerNarrow: '840px',
    headerHeight: '70px',
    workflowRailHeight: '48px',
  },
  spacing: {
    space1: '0.25rem',
    space2: '0.5rem',
    space3: '0.75rem',
    space4: '1rem',
    space5: '1.25rem',
    space6: '1.5rem',
    space8: '2rem',
    space10: '2.5rem',
    space12: '3rem',
    space14: '3.5rem',
    space16: '4rem',
    space18: '4.5rem',
    space20: '5rem',
    space24: '6rem',
    space32: '8rem',
  },
  radii: {
    xs: '2px',
    sm: '3px',
    md: '4px',
    lg: '6px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px rgba(18, 21, 22, 0.04), 0 1px 2px rgba(18, 21, 22, 0.02)',
    md: '0 4px 12px rgba(27, 67, 83, 0.06), 0 1px 3px rgba(18, 21, 22, 0.04)',
    lg: '0 12px 32px rgba(27, 67, 83, 0.08), 0 2px 6px rgba(18, 21, 22, 0.03)',
  },
  transitions: {
    easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    base: '140ms ease',
    drawer: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    card: 'border-color 140ms ease, box-shadow 140ms ease',
  },
} as const;

/**
 * Dark theme color tokens — Organic charcoal-graphite palette.
 * Designed for extended clinical sessions with reduced eye strain.
 * 3D Viewer tokens remain unchanged (medical imaging convention).
 */
export const CLINICAL_DARK_THEME_TOKENS = {
  colors: {
    // Canvas & Surfaces — Warm charcoal-graphite (organic, not pure black)
    bgBase: '#141618',
    bgSurface: '#1A1D20',
    bgSurfaceSubtle: '#22262A',
    bgSurfaceElevated: '#1E2225',
    bgSurfaceTint: '#1C2832',
    bgSurfaceCard: '#1A1D20',
    bgSurfaceDrawer: '#171A1D',

    // Legacy aliases
    background: '#141618',
    surface: '#1A1D20',
    surfaceElevated: '#1E2225',
    surfaceCard: '#1A1D20',
    surfaceDrawer: '#171A1D',

    // Borders — Subtle warm edges
    border: '#2E3338',
    borderSubtle: '#252A2E',
    borderStrong: '#4A5560',
    borderHighlight: '#5BA8C8',

    // Accent — Brightened petrol for dark backgrounds
    primary: '#5BA8C8',
    primaryHover: '#7BC0DC',
    accentSubtle: 'rgba(91, 168, 200, 0.12)',
    accentBorder: '#2A3E4A',

    // Status — Warmer amber on dark
    statusText: '#D4A054',
    statusBg: '#2A2318',
    statusBorder: '#3D3020',

    // Clinical Semantic Signals — Brightened for dark-bg WCAG AA
    secondary: '#8A9BAA',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    research: '#FBBF24',
    purple: '#A78BFA',
    white: '#ffffff',
    black: '#000000',

    // Typography — Light text on dark canvas
    textPrimary: '#E8EAED',
    textSecondary: '#9BA3AC',
    textMuted: '#6B7580',
    textInverse: '#141618',

    // Evidence Tiers — Brightened for dark backgrounds
    tier1Badge: '#34D399',
    tier2Badge: '#60A5FA',
    tier3Badge: '#FBBF24',
    tier4Badge: '#A78BFA',
    tierExpBadge: '#F87171',

    // Reliability Levels
    reliabilityHigh: '#34D399',
    reliabilityModerate: '#60A5FA',
    reliabilityLow: '#FBBF24',
    reliabilityUnusable: '#F87171',

    // Workflow Rail States
    workflowCompleted: '#34D399',
    workflowActive: '#5BA8C8',
    workflowAvailable: '#6B7580',
    workflowLocked: '#4A5560',

    // Environment Modes
    modeClinical: '#5BA8C8',
    modeResearch: '#FBBF24',
    modeValidation: '#8A9BAA',

    // Decision Action Button Backgrounds — Muted on dark
    decisionAcceptBg: '#1A2E24',
    decisionRejectBg: '#2E1A1A',
    decisionModifyBg: '#1C2832',
    decisionDeferBg: '#2A2318',
    decisionAcceptActive: '#10B981',
    decisionRejectActive: '#EF4444',

    // Alert surfaces — Dark variants
    alertDangerBg: '#2E1A1A',
    alertDangerBorder: '#5C2E2E',
    alertSuccessBg: '#1A2E24',
    alertSuccessBorder: '#2E5C3E',
    alertInfoBg: '#1C2832',
    alertInfoBorder: '#2A3E4A',
    alertWarningBg: '#2A2318',
    alertWarningBorder: '#3D3020',

    // Badge Backgrounds — Dark variants
    badgeTier1Bg: '#1A2E24',
    badgeTier2Bg: '#1A2438',
    badgeTier3Bg: '#2A2318',
    badgeTier4Bg: '#241A38',
    badgeTierExpBg: '#2E1A1A',

    // Environment Mode Banners — Dark variants
    modeResearchBg: '#2A2318',
    modeResearchText: '#D4A054',
    modeResearchBorder: '#3D3020',
    modeValidationBg: '#1C2832',
    modeValidationText: '#9BA3AC',
    modeValidationBorder: '#2A3E4A',
    modeFailClosedBg: '#2E1A1A',
    modeFailClosedText: '#F87171',
    modeFailClosedBorder: '#5C2E2E',

    // 3D Viewer — UNCHANGED (medical imaging convention)
    viewerBg: '#090d16',
    viewerSurface: '#111827',
    viewerBorder: '#374151',
    viewerTextPrimary: '#f9fafb',
    viewerTextSecondary: '#9ca3af',
    viewerAccent: '#38bdf8',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.25), 0 1px 2px rgba(0, 0, 0, 0.15)',
    md: '0 4px 12px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.20)',
    lg: '0 12px 32px rgba(0, 0, 0, 0.45), 0 2px 6px rgba(0, 0, 0, 0.25)',
  },
} as const;

/**
 * Numeric hex tokens optimized for WebGL, Canvas, and 3D rendering contexts.
 * These retain dark values for the 3D clinical viewer (medical imaging convention).
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
  // Surfaces — Landing page aligned
  '--bg-base': CLINICAL_THEME_TOKENS.colors.bgBase,
  '--bg-primary': CLINICAL_THEME_TOKENS.colors.bgBase,
  '--bg-surface': CLINICAL_THEME_TOKENS.colors.bgSurface,
  '--bg-surface-subtle': CLINICAL_THEME_TOKENS.colors.bgSurfaceSubtle,
  '--bg-surface-elevated': CLINICAL_THEME_TOKENS.colors.bgSurfaceElevated,
  '--bg-surface-tint': CLINICAL_THEME_TOKENS.colors.bgSurfaceTint,
  '--bg-surface-card': CLINICAL_THEME_TOKENS.colors.bgSurface,
  '--bg-surface-drawer': CLINICAL_THEME_TOKENS.colors.bgSurface,

  // Borders — Landing page aligned
  '--border-color': CLINICAL_THEME_TOKENS.colors.border,
  '--border-subtle': CLINICAL_THEME_TOKENS.colors.borderSubtle,
  '--border-strong': CLINICAL_THEME_TOKENS.colors.borderStrong,
  '--border-highlight': CLINICAL_THEME_TOKENS.colors.borderHighlight,
  '--accent-border': CLINICAL_THEME_TOKENS.colors.accentBorder,
  '--border-hairline': `1px solid ${CLINICAL_THEME_TOKENS.colors.border}`,

  // Accent — Deep Petrol
  '--accent-primary': CLINICAL_THEME_TOKENS.colors.primary,
  '--accent-hover': CLINICAL_THEME_TOKENS.colors.primaryHover,
  '--accent-subtle': CLINICAL_THEME_TOKENS.colors.accentSubtle,
  '--accent-cyan': CLINICAL_THEME_TOKENS.colors.primary,
  '--accent-cyan-hover': CLINICAL_THEME_TOKENS.colors.primaryHover,
  '--accent-indigo': CLINICAL_THEME_TOKENS.colors.secondary,
  '--accent-emerald': CLINICAL_THEME_TOKENS.colors.success,
  '--accent-amber': CLINICAL_THEME_TOKENS.colors.warning,
  '--accent-rose': CLINICAL_THEME_TOKENS.colors.danger,
  '--accent-purple': CLINICAL_THEME_TOKENS.colors.purple,

  // Status Accent
  '--status-text': CLINICAL_THEME_TOKENS.colors.statusText,
  '--status-bg': CLINICAL_THEME_TOKENS.colors.statusBg,
  '--status-border': CLINICAL_THEME_TOKENS.colors.statusBorder,

  // Typography
  '--text-primary': CLINICAL_THEME_TOKENS.colors.textPrimary,
  '--text-secondary': CLINICAL_THEME_TOKENS.colors.textSecondary,
  '--text-muted': CLINICAL_THEME_TOKENS.colors.textMuted,
  '--text-inverse': CLINICAL_THEME_TOKENS.colors.textInverse,
  '--text-main': CLINICAL_THEME_TOKENS.colors.textPrimary,

  // Semantic aliases
  '--accent-green': CLINICAL_THEME_TOKENS.colors.success,
  '--accent-red': CLINICAL_THEME_TOKENS.colors.danger,
  '--accent-yellow': CLINICAL_THEME_TOKENS.colors.warning,
  '--bg-card': CLINICAL_THEME_TOKENS.colors.bgSurface,
  '--card-bg': CLINICAL_THEME_TOKENS.colors.bgSurface,
  '--card-border': CLINICAL_THEME_TOKENS.colors.border,
  '--transitions-card': CLINICAL_THEME_TOKENS.transitions.card,
  '--color-white': CLINICAL_THEME_TOKENS.colors.white,
  '--color-black': CLINICAL_THEME_TOKENS.colors.black,

  // Decision Action Backgrounds & States
  '--decision-accept-bg': CLINICAL_THEME_TOKENS.colors.decisionAcceptBg,
  '--decision-reject-bg': CLINICAL_THEME_TOKENS.colors.decisionRejectBg,
  '--decision-modify-bg': CLINICAL_THEME_TOKENS.colors.decisionModifyBg,
  '--decision-defer-bg': CLINICAL_THEME_TOKENS.colors.decisionDeferBg,
  '--decision-accept-active': CLINICAL_THEME_TOKENS.colors.decisionAcceptActive,
  '--decision-reject-active': CLINICAL_THEME_TOKENS.colors.decisionRejectActive,

  // Semantic Status & Alert Surfaces
  '--alert-danger-bg': CLINICAL_THEME_TOKENS.colors.alertDangerBg,
  '--alert-danger-border': CLINICAL_THEME_TOKENS.colors.alertDangerBorder,
  '--alert-success-bg': CLINICAL_THEME_TOKENS.colors.alertSuccessBg,
  '--alert-success-border': CLINICAL_THEME_TOKENS.colors.alertSuccessBorder,
  '--alert-info-bg': CLINICAL_THEME_TOKENS.colors.alertInfoBg,
  '--alert-info-border': CLINICAL_THEME_TOKENS.colors.alertInfoBorder,
  '--alert-warning-bg': CLINICAL_THEME_TOKENS.colors.alertWarningBg,
  '--alert-warning-border': CLINICAL_THEME_TOKENS.colors.alertWarningBorder,

  // Badge Backgrounds
  '--badge-tier1-bg': CLINICAL_THEME_TOKENS.colors.badgeTier1Bg,
  '--badge-tier2-bg': CLINICAL_THEME_TOKENS.colors.badgeTier2Bg,
  '--badge-tier3-bg': CLINICAL_THEME_TOKENS.colors.badgeTier3Bg,
  '--badge-tier4-bg': CLINICAL_THEME_TOKENS.colors.badgeTier4Bg,
  '--badge-tierexp-bg': CLINICAL_THEME_TOKENS.colors.badgeTierExpBg,

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

  // Typography Stacks
  '--font-sans': CLINICAL_THEME_TOKENS.typography.fontFamilySans,
  '--font-display': CLINICAL_THEME_TOKENS.typography.fontFamilyDisplay,
  '--font-mono': CLINICAL_THEME_TOKENS.typography.fontFamilyMono,

  '--font-size-xs': CLINICAL_THEME_TOKENS.typography.fontSizeXs,
  '--font-size-sm': CLINICAL_THEME_TOKENS.typography.fontSizeSm,
  '--font-size-md': CLINICAL_THEME_TOKENS.typography.fontSizeMd,
  '--font-size-base': CLINICAL_THEME_TOKENS.typography.fontSizeBase,
  '--font-size-lead': CLINICAL_THEME_TOKENS.typography.fontSizeLead,
  '--font-size-lg': CLINICAL_THEME_TOKENS.typography.fontSizeLg,
  '--font-size-xl': CLINICAL_THEME_TOKENS.typography.fontSizeXl,
  '--font-size-2xl': CLINICAL_THEME_TOKENS.typography.fontSize2Xl,
  '--font-size-3xl': CLINICAL_THEME_TOKENS.typography.fontSize3Xl,
  '--font-size-4xl': CLINICAL_THEME_TOKENS.typography.fontSize4Xl,

  // Layout
  '--layout-left-col-width': CLINICAL_THEME_TOKENS.layout.leftColumnWidth,
  '--layout-center-col-width': CLINICAL_THEME_TOKENS.layout.centerColumnWidth,
  '--layout-right-col-width': CLINICAL_THEME_TOKENS.layout.rightColumnWidth,
  '--layout-drawer-width': CLINICAL_THEME_TOKENS.layout.drawerWidth,
  '--layout-max-container-width': CLINICAL_THEME_TOKENS.layout.maxContainerWidth,
  '--container-max': CLINICAL_THEME_TOKENS.layout.containerMax,
  '--container-narrow': CLINICAL_THEME_TOKENS.layout.containerNarrow,
  '--layout-header-height': CLINICAL_THEME_TOKENS.layout.headerHeight,
  '--layout-workflow-rail-height': CLINICAL_THEME_TOKENS.layout.workflowRailHeight,

  // Spacing Scale
  '--space-1': CLINICAL_THEME_TOKENS.spacing.space1,
  '--space-2': CLINICAL_THEME_TOKENS.spacing.space2,
  '--space-3': CLINICAL_THEME_TOKENS.spacing.space3,
  '--space-4': CLINICAL_THEME_TOKENS.spacing.space4,
  '--space-5': CLINICAL_THEME_TOKENS.spacing.space5,
  '--space-6': CLINICAL_THEME_TOKENS.spacing.space6,
  '--space-8': CLINICAL_THEME_TOKENS.spacing.space8,
  '--space-10': CLINICAL_THEME_TOKENS.spacing.space10,
  '--space-12': CLINICAL_THEME_TOKENS.spacing.space12,
  '--space-14': CLINICAL_THEME_TOKENS.spacing.space14,
  '--space-16': CLINICAL_THEME_TOKENS.spacing.space16,
  '--space-18': CLINICAL_THEME_TOKENS.spacing.space18,
  '--space-20': CLINICAL_THEME_TOKENS.spacing.space20,
  '--space-24': CLINICAL_THEME_TOKENS.spacing.space24,
  '--space-32': CLINICAL_THEME_TOKENS.spacing.space32,

  // Border Radii — Architectural (landing page §1)
  '--radius-xs': CLINICAL_THEME_TOKENS.radii.xs,
  '--radius-sm': CLINICAL_THEME_TOKENS.radii.sm,
  '--radius-md': CLINICAL_THEME_TOKENS.radii.md,
  '--radius-lg': CLINICAL_THEME_TOKENS.radii.lg,
  '--radius-full': CLINICAL_THEME_TOKENS.radii.full,

  // Shadows — Hue-tinted, subtle (landing page §1)
  '--shadow-sm': CLINICAL_THEME_TOKENS.shadows.sm,
  '--shadow-md': CLINICAL_THEME_TOKENS.shadows.md,
  '--shadow-lg': CLINICAL_THEME_TOKENS.shadows.lg,

  // Transitions
  '--ease-out-expo': CLINICAL_THEME_TOKENS.transitions.easeOutExpo,
  '--transition-base': CLINICAL_THEME_TOKENS.transitions.base,

  // 3D Viewer — scoped dark tokens (medical imaging convention)
  '--viewer-bg': CLINICAL_THEME_TOKENS.colors.viewerBg,
  '--viewer-surface': CLINICAL_THEME_TOKENS.colors.viewerSurface,
  '--viewer-border': CLINICAL_THEME_TOKENS.colors.viewerBorder,
  '--viewer-text-primary': CLINICAL_THEME_TOKENS.colors.viewerTextPrimary,
  '--viewer-text-secondary': CLINICAL_THEME_TOKENS.colors.viewerTextSecondary,
  '--viewer-accent': CLINICAL_THEME_TOKENS.colors.viewerAccent,

  // Legacy surface overlay tokens (kept for backward compat, now transparent on light)
  '--surface-overlay-subtle': 'rgba(0, 0, 0, 0.02)',
  '--surface-overlay-card': 'rgba(0, 0, 0, 0.01)',
  '--border-glass-tint': 'rgba(0, 0, 0, 0.04)',
} as const;

export const CSS_DARK_THEME_VARIABLES = {
  // Surfaces — Dark organic charcoal-graphite
  '--bg-base': CLINICAL_DARK_THEME_TOKENS.colors.bgBase,
  '--bg-primary': CLINICAL_DARK_THEME_TOKENS.colors.bgBase,
  '--bg-surface': CLINICAL_DARK_THEME_TOKENS.colors.bgSurface,
  '--bg-surface-subtle': CLINICAL_DARK_THEME_TOKENS.colors.bgSurfaceSubtle,
  '--bg-surface-elevated': CLINICAL_DARK_THEME_TOKENS.colors.bgSurfaceElevated,
  '--bg-surface-tint': CLINICAL_DARK_THEME_TOKENS.colors.bgSurfaceTint,
  '--bg-surface-card': CLINICAL_DARK_THEME_TOKENS.colors.bgSurfaceCard,
  '--bg-surface-drawer': CLINICAL_DARK_THEME_TOKENS.colors.bgSurfaceDrawer,

  // Borders — Warm subtle edges
  '--border-color': CLINICAL_DARK_THEME_TOKENS.colors.border,
  '--border-subtle': CLINICAL_DARK_THEME_TOKENS.colors.borderSubtle,
  '--border-strong': CLINICAL_DARK_THEME_TOKENS.colors.borderStrong,
  '--border-highlight': CLINICAL_DARK_THEME_TOKENS.colors.borderHighlight,
  '--accent-border': CLINICAL_DARK_THEME_TOKENS.colors.accentBorder,
  '--border-hairline': `1px solid ${CLINICAL_DARK_THEME_TOKENS.colors.border}`,

  // Accent — Brightened petrol
  '--accent-primary': CLINICAL_DARK_THEME_TOKENS.colors.primary,
  '--accent-hover': CLINICAL_DARK_THEME_TOKENS.colors.primaryHover,
  '--accent-subtle': CLINICAL_DARK_THEME_TOKENS.colors.accentSubtle,
  '--accent-cyan': CLINICAL_DARK_THEME_TOKENS.colors.primary,
  '--accent-cyan-hover': CLINICAL_DARK_THEME_TOKENS.colors.primaryHover,
  '--accent-indigo': CLINICAL_DARK_THEME_TOKENS.colors.secondary,
  '--accent-emerald': CLINICAL_DARK_THEME_TOKENS.colors.success,
  '--accent-amber': CLINICAL_DARK_THEME_TOKENS.colors.warning,
  '--accent-rose': CLINICAL_DARK_THEME_TOKENS.colors.danger,
  '--accent-purple': CLINICAL_DARK_THEME_TOKENS.colors.purple,

  // Status Accent
  '--status-text': CLINICAL_DARK_THEME_TOKENS.colors.statusText,
  '--status-bg': CLINICAL_DARK_THEME_TOKENS.colors.statusBg,
  '--status-border': CLINICAL_DARK_THEME_TOKENS.colors.statusBorder,

  // Typography
  '--text-primary': CLINICAL_DARK_THEME_TOKENS.colors.textPrimary,
  '--text-secondary': CLINICAL_DARK_THEME_TOKENS.colors.textSecondary,
  '--text-muted': CLINICAL_DARK_THEME_TOKENS.colors.textMuted,
  '--text-inverse': CLINICAL_DARK_THEME_TOKENS.colors.textInverse,
  '--text-main': CLINICAL_DARK_THEME_TOKENS.colors.textPrimary,

  // Semantic aliases
  '--accent-green': CLINICAL_DARK_THEME_TOKENS.colors.success,
  '--accent-red': CLINICAL_DARK_THEME_TOKENS.colors.danger,
  '--accent-yellow': CLINICAL_DARK_THEME_TOKENS.colors.warning,
  '--bg-card': CLINICAL_DARK_THEME_TOKENS.colors.bgSurface,
  '--card-bg': CLINICAL_DARK_THEME_TOKENS.colors.bgSurface,
  '--card-border': CLINICAL_DARK_THEME_TOKENS.colors.border,
  '--transitions-card': CLINICAL_THEME_TOKENS.transitions.card,
  '--color-white': CLINICAL_DARK_THEME_TOKENS.colors.white,
  '--color-black': CLINICAL_DARK_THEME_TOKENS.colors.black,

  // Decision Action Backgrounds & States
  '--decision-accept-bg': CLINICAL_DARK_THEME_TOKENS.colors.decisionAcceptBg,
  '--decision-reject-bg': CLINICAL_DARK_THEME_TOKENS.colors.decisionRejectBg,
  '--decision-modify-bg': CLINICAL_DARK_THEME_TOKENS.colors.decisionModifyBg,
  '--decision-defer-bg': CLINICAL_DARK_THEME_TOKENS.colors.decisionDeferBg,
  '--decision-accept-active': CLINICAL_DARK_THEME_TOKENS.colors.decisionAcceptActive,
  '--decision-reject-active': CLINICAL_DARK_THEME_TOKENS.colors.decisionRejectActive,

  // Semantic Status & Alert Surfaces
  '--alert-danger-bg': CLINICAL_DARK_THEME_TOKENS.colors.alertDangerBg,
  '--alert-danger-border': CLINICAL_DARK_THEME_TOKENS.colors.alertDangerBorder,
  '--alert-success-bg': CLINICAL_DARK_THEME_TOKENS.colors.alertSuccessBg,
  '--alert-success-border': CLINICAL_DARK_THEME_TOKENS.colors.alertSuccessBorder,
  '--alert-info-bg': CLINICAL_DARK_THEME_TOKENS.colors.alertInfoBg,
  '--alert-info-border': CLINICAL_DARK_THEME_TOKENS.colors.alertInfoBorder,
  '--alert-warning-bg': CLINICAL_DARK_THEME_TOKENS.colors.alertWarningBg,
  '--alert-warning-border': CLINICAL_DARK_THEME_TOKENS.colors.alertWarningBorder,

  // Badge Backgrounds
  '--badge-tier1-bg': CLINICAL_DARK_THEME_TOKENS.colors.badgeTier1Bg,
  '--badge-tier2-bg': CLINICAL_DARK_THEME_TOKENS.colors.badgeTier2Bg,
  '--badge-tier3-bg': CLINICAL_DARK_THEME_TOKENS.colors.badgeTier3Bg,
  '--badge-tier4-bg': CLINICAL_DARK_THEME_TOKENS.colors.badgeTier4Bg,
  '--badge-tierexp-bg': CLINICAL_DARK_THEME_TOKENS.colors.badgeTierExpBg,

  // Environment Safety Strips
  '--mode-research-bg': CLINICAL_DARK_THEME_TOKENS.colors.modeResearchBg,
  '--mode-research-text': CLINICAL_DARK_THEME_TOKENS.colors.modeResearchText,
  '--mode-research-border': CLINICAL_DARK_THEME_TOKENS.colors.modeResearchBorder,
  '--mode-validation-bg': CLINICAL_DARK_THEME_TOKENS.colors.modeValidationBg,
  '--mode-validation-text': CLINICAL_DARK_THEME_TOKENS.colors.modeValidationText,
  '--mode-validation-border': CLINICAL_DARK_THEME_TOKENS.colors.modeValidationBorder,
  '--mode-failclosed-bg': CLINICAL_DARK_THEME_TOKENS.colors.modeFailClosedBg,
  '--mode-failclosed-text': CLINICAL_DARK_THEME_TOKENS.colors.modeFailClosedText,
  '--mode-failclosed-border': CLINICAL_DARK_THEME_TOKENS.colors.modeFailClosedBorder,

  // Evidence Tier Badge Borders
  '--badge-tier1-border': CLINICAL_DARK_THEME_TOKENS.colors.tier1Badge,
  '--badge-tier2-border': CLINICAL_DARK_THEME_TOKENS.colors.tier2Badge,
  '--badge-tier3-border': CLINICAL_DARK_THEME_TOKENS.colors.tier3Badge,
  '--badge-tier4-border': CLINICAL_DARK_THEME_TOKENS.colors.tier4Badge,
  '--badge-tierexp-border': CLINICAL_DARK_THEME_TOKENS.colors.tierExpBadge,

  // Shadows — Deeper for dark surfaces
  '--shadow-sm': CLINICAL_DARK_THEME_TOKENS.shadows.sm,
  '--shadow-md': CLINICAL_DARK_THEME_TOKENS.shadows.md,
  '--shadow-lg': CLINICAL_DARK_THEME_TOKENS.shadows.lg,

  // 3D Viewer — UNCHANGED
  '--viewer-bg': CLINICAL_DARK_THEME_TOKENS.colors.viewerBg,
  '--viewer-surface': CLINICAL_DARK_THEME_TOKENS.colors.viewerSurface,
  '--viewer-border': CLINICAL_DARK_THEME_TOKENS.colors.viewerBorder,
  '--viewer-text-primary': CLINICAL_DARK_THEME_TOKENS.colors.viewerTextPrimary,
  '--viewer-text-secondary': CLINICAL_DARK_THEME_TOKENS.colors.viewerTextSecondary,
  '--viewer-accent': CLINICAL_DARK_THEME_TOKENS.colors.viewerAccent,

  // Surface overlays — Inverted for dark backgrounds
  '--surface-overlay-subtle': 'rgba(255, 255, 255, 0.03)',
  '--surface-overlay-card': 'rgba(255, 255, 255, 0.02)',
  '--border-glass-tint': 'rgba(255, 255, 255, 0.06)',
} as const;

/**
 * Generates the raw CSS variable declarations string (light theme).
 */
export function generateCssThemeVariables(): string {
  const entries = Object.entries(CSS_THEME_VARIABLES).map(([key, val]) => `  ${key}: ${val};`);
  return entries.join('\n');
}

/**
 * Generates the raw CSS variable declarations string (dark theme).
 */
export function generateDarkCssThemeVariables(): string {
  const entries = Object.entries(CSS_DARK_THEME_VARIABLES).map(([key, val]) => `  ${key}: ${val};`);
  return entries.join('\n');
}

/**
 * Generates a complete, authoritative :root { ... } CSS block (light theme).
 */
export function generateRootVariablesCss(): string {
  return `/* ==========================================================================
   PROGRAMMATICALLY GENERATED DESIGN TOKENS (DO NOT EDIT MANUALLY)
   Source of Truth: @magniom/ui (packages/ui/src/index.ts)
   Unified with MAGNIOM Landing Page Design System (magniom.com)
   ========================================================================== */
:root {
${generateCssThemeVariables()}
}
`;
}

/**
 * Generates a complete, authoritative [data-theme="dark"] { ... } CSS block.
 */
export function generateDarkThemeVariablesCss(): string {
  return `/* ==========================================================================
   DARK THEME TOKENS (DO NOT EDIT MANUALLY)
   Source of Truth: @magniom/ui CLINICAL_DARK_THEME_TOKENS
   Organic charcoal-graphite palette for extended clinical sessions
   ========================================================================== */
[data-theme="dark"] {
${generateDarkCssThemeVariables()}
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
