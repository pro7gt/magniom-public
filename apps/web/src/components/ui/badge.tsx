import React from 'react';
export { getTierBadgeColor, getReliabilityBadgeColor, getModeBadgeColor } from '@magniom/ui';

export type BadgeVariant =
  | 'tier1'
  | 'tier2'
  | 'tier3'
  | 'tier4'
  | 'tierexp'
  | 'clinical'
  | 'research'
  | 'validation'
  | 'neutral'
  | 'warning'
  | 'danger'
  | 'role-primary'
  | 'role-additional'
  | 'reliability-high'
  | 'reliability-moderate'
  | 'reliability-low'
  | 'reliability-unusable'
  | 'convergence-high'
  | 'convergence-moderate'
  | 'convergence-low'
  | 'indication'
  | 'claim'
  | 'circuit'
  | 'target-family'
  | 'candidate';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  mono?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  mono = false,
  className = '',
  children,
  ...rest
}: BadgeProps) {
  const variantClass = `badge-${variant}`;
  const sizeClass = size === 'sm' ? 'badge-tiny' : '';
  const monoClass = mono ? 'font-mono' : '';
  const combinedClass = `badge ${variantClass} ${sizeClass} ${monoClass} ${className}`.trim();

  return (
    <span className={combinedClass} {...rest}>
      {children}
    </span>
  );
}
