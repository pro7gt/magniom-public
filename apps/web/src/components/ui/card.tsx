import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  highlight?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Card({ highlight = false, className = '', children, ...rest }: CardProps) {
  const highlightClass = highlight ? 'card-highlight' : '';
  const combinedClass = `card ${highlightClass} ${className}`.trim();

  return (
    <div className={combinedClass} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-header ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({
  as: Component = 'h3',
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: 'h1' | 'h2' | 'h3' | 'h4' }) {
  return (
    <Component className={`card-title ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
}

export function CardDescription({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`card-description ${className}`.trim()} {...rest}>
      {children}
    </p>
  );
}

export function CardContent({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-content ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = '',
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-footer ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
