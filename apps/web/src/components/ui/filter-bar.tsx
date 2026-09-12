'use client';

import React from 'react';
import { SearchIcon, XIcon } from './icon';

export type FilterBarVariant = 'card' | 'glass' | 'inline';

export interface FilterBarProps extends React.HTMLAttributes<HTMLElement> {
  variant?: FilterBarVariant;
  stacked?: boolean;
  as?: 'aside' | 'div' | 'nav' | 'form';
  className?: string;
  children: React.ReactNode;
}

export function FilterBar({
  variant = 'card',
  stacked = false,
  as: Component = 'aside',
  role = 'search',
  'aria-label': ariaLabel = 'Filters and search',
  className = '',
  children,
  ...rest
}: FilterBarProps) {
  const variantClass =
    variant === 'glass'
      ? 'filter-bar-glass'
      : variant === 'inline'
        ? 'filter-bar-inline'
        : 'filter-bar-card';

  const stackedClass = stacked ? 'filter-bar-stacked' : '';

  return (
    <Component
      role={role}
      aria-label={ariaLabel}
      className={`filter-bar ${variantClass} ${stackedClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Component>
  );
}

export interface FilterBarRowProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'between' | 'end' | 'center';
  divider?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FilterBarRow({
  justify = 'between',
  divider = false,
  className = '',
  children,
  ...rest
}: FilterBarRowProps) {
  const justifyClass =
    justify === 'start'
      ? 'justify-start'
      : justify === 'end'
        ? 'justify-end'
        : justify === 'center'
          ? 'justify-center'
          : 'justify-between';

  const dividerClass = divider ? 'filter-bar-row-divider' : '';

  return (
    <div className={`filter-bar-row ${justifyClass} ${dividerClass} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export interface FilterBarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FilterBarGroup({
  label,
  htmlFor,
  className = '',
  children,
  ...rest
}: FilterBarGroupProps) {
  return (
    <div className={`filter-control ${className}`.trim()} {...rest}>
      {label && <FilterBarLabel htmlFor={htmlFor}>{label}</FilterBarLabel>}
      {children}
    </div>
  );
}

export interface FilterBarLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
  children: React.ReactNode;
}

export function FilterBarLabel({ className = '', children, ...rest }: FilterBarLabelProps) {
  return (
    <label className={`filter-label ${className}`.trim()} {...rest}>
      {children}
    </label>
  );
}

export interface FilterBarSearchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  onClear?: () => void;
  wrapperClassName?: string;
}

export function FilterBarSearch({
  value,
  onChange,
  onClear,
  placeholder = 'Filter and search...',
  className = '',
  wrapperClassName = '',
  ...rest
}: FilterBarSearchProps) {
  const hasValue = Boolean(value && String(value).length > 0);

  return (
    <div className={`filter-search-wrapper ${wrapperClassName}`.trim()}>
      <SearchIcon size={14} className="filter-search-icon" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`form-input filter-search-input ${className}`.trim()}
        {...rest}
      />
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="filter-search-clear-btn"
          aria-label="Clear search text"
        >
          <XIcon size={12} />
        </button>
      )}
    </div>
  );
}

export interface FilterBarSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
}

export function FilterBarSelect({ className = '', children, ...rest }: FilterBarSelectProps) {
  return (
    <select className={`form-select filter-select ${className}`.trim()} {...rest}>
      {children}
    </select>
  );
}

export interface FilterBarActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export function FilterBarActions({ className = '', children, ...rest }: FilterBarActionsProps) {
  return (
    <div className={`filter-bar-actions ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
