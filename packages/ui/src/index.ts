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
  },
  typography: {
    fontFamilySans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
