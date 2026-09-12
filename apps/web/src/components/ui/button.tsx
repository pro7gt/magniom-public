import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const combinedClass = `btn ${variantClass} ${sizeClass} ${className}`.trim();

  if (href) {
    const { type, ...linkProps } = rest as Record<string, unknown>;
    return (
      <Link href={href} className={combinedClass} {...(linkProps as any)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClass} {...rest}>
      {children}
    </button>
  );
}
