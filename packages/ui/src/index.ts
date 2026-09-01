/**
 * @magniom/ui
 * Clinical design system tokens and helper styles.
 * Conforms to MAGNIOM-Clinician Workspace & UX Specification v1.0.
 */

export const CLINICAL_THEME_TOKENS = {
  colors: {
    background: '#090d16',
    surface: '#111827',
    surfaceElevated: '#1f2937',
    border: '#374151',
    primary: '#38bdf8',
    primaryHover: '#0ea5e9',
    secondary: '#818cf8',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    textPrimary: '#f9fafb',
    textSecondary: '#9ca3af',
    textMuted: '#6b7280',
    tier1Badge: '#059669',
    tier2Badge: '#0284c7',
    tier3Badge: '#d97706',
    tier4Badge: '#7c3aed',
    tierExpBadge: '#dc2626',
  },
  typography: {
    fontFamilySans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontFamilyMono: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
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
