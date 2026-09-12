import React from 'react';

export interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: 'default' | 'card' | 'case-workspace';
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  description,
  eyebrow,
  actions,
  variant = 'default',
  className = '',
  children,
  ...rest
}: PageHeaderProps) {
  const baseClass =
    variant === 'case-workspace' || variant === 'card'
      ? 'case-workspace-header'
      : 'page-header-row';
  const combinedClass = `${baseClass} ${className}`.trim();

  if (title) {
    const subText = subtitle || description;
    return (
      <header className={combinedClass} {...rest}>
        <PageHeaderHeading>
          {eyebrow && <div>{eyebrow}</div>}
          <PageHeaderTitle>{title}</PageHeaderTitle>
          {subText && <PageHeaderDescription>{subText}</PageHeaderDescription>}
        </PageHeaderHeading>
        {actions && <PageHeaderActions>{actions}</PageHeaderActions>}
        {children}
      </header>
    );
  }

  return (
    <header className={combinedClass} {...rest}>
      {children}
    </header>
  );
}

export function PageHeaderHeading({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`page-header-heading ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export interface PageHeaderTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2';
}

export function PageHeaderTitle({
  as: Component = 'h1',
  className = '',
  children,
  ...rest
}: PageHeaderTitleProps) {
  return (
    <Component className={`page-title ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
}

export function PageHeaderDescription({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`page-subtitle ${className}`.trim()} {...rest}>
      {children}
    </p>
  );
}

export function PageHeaderActions({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`page-header-actions ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
