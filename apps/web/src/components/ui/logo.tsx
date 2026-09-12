'use client';

import React from 'react';
import Link from 'next/link';

export interface MagniomMarkProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Size in pixels (height). Default: 28 */
  size?: number;
  /** Custom alt text */
  alt?: string;
  /** Visual variant: 'default' | 'squircle' */
  variant?: 'default' | 'squircle';
}

/**
 * MAGNIOM Precision Brand Mark
 *
 * Implements the official faceted prismatic mark from public/logo.jpg.
 */
export function MagniomMark({
  size = 28,
  variant = 'default',
  alt = 'MAGNIOM',
  className = '',
  style,
  ...props
}: MagniomMarkProps) {
  const width = Math.round(size * (332 / 266));

  return (
    <span
      className={`magniom-mark-wrapper ${variant === 'squircle' ? 'magniom-mark-squircle' : ''} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: size,
        width,
        ...style,
      }}
      {...props}
    >
      <img src="/logo.png" alt={alt} width={width} height={size} className="magniom-mark-img" />
    </span>
  );
}

export interface MagniomLogoProps {
  /** Size of the mark in pixels (height). Default: 28 */
  markSize?: number;
  /** Whether to show the clinical descriptor subtitle. Default: false */
  showDescriptor?: boolean;
  /** Custom descriptor text. Default: "TMS Target Decision Support" */
  descriptorText?: string;
  /** Additional CSS class names */
  className?: string;
  /** Render as a Next.js Link pointing to href. Default: false */
  asLink?: boolean;
  /** Target link destination when asLink is true. Default: "/" */
  href?: string;
}

/**
 * MAGNIOM Complete Logo Component
 *
 * Combines the official logo from public/logo.jpg and the refined uppercase
 * wordmark "MAGNIOM" (without dot) with optional clinical descriptor.
 */
export function MagniomLogo({
  markSize = 28,
  showDescriptor = false,
  descriptorText = 'TMS Target Decision Support',
  className = '',
  asLink = false,
  href = '/',
}: MagniomLogoProps) {
  const content = (
    <span className={`magniom-logo-container ${className}`}>
      <MagniomMark size={markSize} className="magniom-logo-mark" aria-hidden="true" />
      <span className="brand-title">MAGNIOM</span>
      {showDescriptor && (
        <>
          <span className="brand-separator" aria-hidden="true">
            |
          </span>
          <span className="brand-descriptor">{descriptorText}</span>
        </>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link href={href} className="top-bar-brand" aria-label="MAGNIOM Home">
        {content}
      </Link>
    );
  }

  return content;
}
