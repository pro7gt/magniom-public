'use client';

import React from 'react';
import { InfoIcon, AlertTriangleIcon, AlertOctagonIcon, CheckIcon, FlaskConicalIcon } from './icon';

export type AlertVariant = 'info' | 'warning' | 'danger' | 'success' | 'research' | 'neutral';

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  variant?: AlertVariant;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode | boolean;
  actions?: React.ReactNode;
  role?: string;
  children?: React.ReactNode;
}

function getDefaultIcon(variant: AlertVariant): React.ReactNode {
  switch (variant) {
    case 'warning':
      return <AlertTriangleIcon size={18} />;
    case 'danger':
      return <AlertOctagonIcon size={18} />;
    case 'success':
      return <CheckIcon size={18} />;
    case 'research':
      return <FlaskConicalIcon size={18} />;
    case 'info':
    case 'neutral':
    default:
      return <InfoIcon size={18} />;
  }
}

function getDefaultRole(variant: AlertVariant): string {
  switch (variant) {
    case 'danger':
    case 'warning':
      return 'alert';
    case 'success':
      return 'status';
    case 'info':
    case 'neutral':
    case 'research':
    default:
      return 'note';
  }
}

export function Alert({
  variant = 'info',
  title,
  description,
  icon = true,
  actions,
  role,
  className = '',
  children,
  ...rest
}: AlertProps) {
  const computedRole = role ?? getDefaultRole(variant);
  const resolvedIcon = icon === false ? null : icon === true ? getDefaultIcon(variant) : icon;

  return (
    <div role={computedRole} className={`alert alert-${variant} ${className}`.trim()} {...rest}>
      {resolvedIcon && <AlertIcon>{resolvedIcon}</AlertIcon>}
      <AlertContent>
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
        {children}
        {actions && <AlertActions>{actions}</AlertActions>}
      </AlertContent>
    </div>
  );
}

export function AlertIcon({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`alert-icon ${className}`.trim()} aria-hidden="true" {...rest}>
      {children}
    </div>
  );
}

export function AlertContent({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`alert-content ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'div';
}

export function AlertTitle({
  as: Component = 'strong',
  className = '',
  children,
  ...rest
}: AlertTitleProps) {
  return (
    <Component className={`alert-title ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
}

export function AlertDescription({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`alert-description ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function AlertActions({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`alert-actions ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
