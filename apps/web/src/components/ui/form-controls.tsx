'use client';

import React from 'react';

// ==========================================
// Form Control Primitives
// Encapsulated, accessible design system components.
// ==========================================

export interface FormGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FormGroup({ className = '', children, ...props }: FormGroupProps) {
  return (
    <div className={`form-group ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function FormLabel({ className = '', required, children, ...props }: FormLabelProps) {
  return (
    <label className={`form-label ${className}`.trim()} {...props}>
      {children}
      {required && (
        <span className="text-danger ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

export function Input({ className = '', error, inputSize, ...props }: InputProps) {
  const sizeClass =
    inputSize === 'sm' ? 'text-xs py-1 px-2' : inputSize === 'lg' ? 'text-lg p-3' : '';
  const errorClass = error ? 'border-danger focus:border-danger' : '';
  return (
    <input className={`form-input ${sizeClass} ${errorClass} ${className}`.trim()} {...props} />
  );
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ className = '', error, children, ...props }: SelectProps) {
  const errorClass = error ? 'border-danger' : '';
  return (
    <select className={`form-select ${errorClass} ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ className = '', error, ...props }: TextareaProps) {
  const errorClass = error ? 'border-danger' : '';
  return <textarea className={`form-textarea ${errorClass} ${className}`.trim()} {...props} />;
}

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export function Checkbox({ className = '', label, id, ...props }: CheckboxProps) {
  const checkbox = (
    <input type="checkbox" id={id} className={`form-checkbox ${className}`.trim()} {...props} />
  );

  if (label) {
    return (
      <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
        {checkbox}
        <span className="text-secondary">{label}</span>
      </label>
    );
  }

  return checkbox;
}

export interface RangeSliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {}

export function RangeSlider({ className = '', ...props }: RangeSliderProps) {
  return <input type="range" className={`form-range ${className}`.trim()} {...props} />;
}

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export function Radio({ className = '', label, id, ...props }: RadioProps) {
  const radio = (
    <input type="radio" id={id} className={`form-radio ${className}`.trim()} {...props} />
  );

  if (label) {
    return (
      <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
        {radio}
        <span className="text-secondary">{label}</span>
      </label>
    );
  }

  return radio;
}
