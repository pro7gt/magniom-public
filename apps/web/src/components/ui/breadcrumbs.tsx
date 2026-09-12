import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  ariaLabel?: string;
  style?: React.CSSProperties;
}

export function Breadcrumbs({
  items,
  className = '',
  ariaLabel = 'Breadcrumb',
  style,
}: BreadcrumbsProps) {
  return (
    <nav aria-label={ariaLabel} className={`breadcrumbs ${className}`.trim()} style={style}>
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.current || isLast;
          return (
            <li key={`${item.label}-${index}`} className="breadcrumbs-item">
              {index > 0 && (
                <span className="breadcrumbs-separator" aria-hidden="true">
                  /
                </span>
              )}
              {item.href && !isCurrent ? (
                <Link href={item.href} className="breadcrumbs-link">
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isCurrent ? 'breadcrumbs-current' : 'breadcrumbs-text'}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
