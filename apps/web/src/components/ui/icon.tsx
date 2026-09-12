'use client';

import React from 'react';

export type IconName =
  | 'check'
  | 'alert'
  | 'x'
  | 'info'
  | 'lock'
  | 'unlock'
  | 'refresh'
  | 'arrow-right'
  | 'arrow-left'
  | 'arrow-down'
  | 'arrow-left-right'
  | 'external-link'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'chevron-right'
  | 'search'
  | 'bell'
  | 'settings'
  | 'microscope'
  | 'flask'
  | 'brain'
  | 'dna'
  | 'target'
  | 'shield'
  | 'scale'
  | 'rocket'
  | 'package'
  | 'file-text'
  | 'database'
  | 'chart'
  | 'clock'
  | 'download'
  | 'hospital'
  | 'building'
  | 'book'
  | 'edit'
  | 'smartphone'
  | 'file-code'
  | 'stop-circle'
  | 'activity'
  | 'magnet'
  | 'hand'
  | 'ear'
  | 'dot'
  | 'circle'
  | 'sparkles'
  | 'home'
  | 'folder'
  | 'sun'
  | 'moon';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 18, className = '', style, ...props }: IconProps) {
  const s = typeof size === 'number' ? `${size}px` : size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`magniom-icon magniom-icon-${name} ${className}`.trim()}
      aria-hidden="true"
      style={style}
      {...props}
    >
      {renderIconPaths(name)}
    </svg>
  );
}

function renderIconPaths(name: IconName) {
  switch (name) {
    case 'check':
      return <polyline points="20 6 9 17 4 12" />;
    case 'alert':
      return (
        <>
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </>
      );
    case 'x':
      return (
        <>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </>
      );
    case 'info':
      return (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </>
      );
    case 'lock':
      return (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      );
    case 'unlock':
      return (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 9.9-1" />
        </>
      );
    case 'refresh':
      return (
        <>
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 21h5v-5" />
        </>
      );
    case 'arrow-right':
      return (
        <>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </>
      );
    case 'arrow-left':
      return (
        <>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </>
      );
    case 'arrow-down':
      return (
        <>
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </>
      );
    case 'arrow-left-right':
      return (
        <>
          <polyline points="8 16 4 12 8 8" />
          <polyline points="16 8 20 12 16 16" />
          <line x1="4" y1="12" x2="20" y2="12" />
        </>
      );
    case 'external-link':
      return (
        <>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </>
      );
    case 'chevron-down':
      return <polyline points="6 9 12 15 18 9" />;
    case 'chevron-up':
      return <polyline points="18 15 12 9 6 15" />;
    case 'chevron-left':
      return <polyline points="15 18 9 12 15 6" />;
    case 'chevron-right':
      return <polyline points="9 18 15 12 9 6" />;
    case 'search':
      return (
        <>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </>
      );
    case 'bell':
      return (
        <>
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </>
      );
    case 'settings':
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </>
      );
    case 'microscope':
      return (
        <>
          <path d="M6 18h8" />
          <path d="M3 22h18" />
          <path d="M14 22a7 7 0 1 0 0-14h-1" />
          <path d="M9 14h2" />
          <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
          <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
        </>
      );
    case 'flask':
      return (
        <>
          <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
          <path d="M8.5 2h7" />
          <path d="M7 16h10" />
        </>
      );
    case 'brain':
      return (
        <>
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04Z" />
        </>
      );
    case 'dna':
      return (
        <>
          <path d="m2 15 2.5-2.5" />
          <path d="m19.5 9.5 2.5-2.5" />
          <path d="m2 9 2.5 2.5" />
          <path d="m19.5 14.5 2.5 2.5" />
          <path d="m5 12 7-7" />
          <path d="m12 19 7-7" />
          <path d="M7 8h10" />
          <path d="M7 16h10" />
        </>
      );
    case 'target':
      return (
        <>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </>
      );
    case 'shield':
      return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />;
    case 'scale':
      return (
        <>
          <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <path d="M7 21h10" />
          <path d="M12 3v18" />
          <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </>
      );
    case 'rocket':
      return (
        <>
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </>
      );
    case 'package':
      return (
        <>
          <path d="m16.5 9.4-9-5.19" />
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </>
      );
    case 'file-text':
      return (
        <>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </>
      );
    case 'database':
      return (
        <>
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </>
      );
    case 'chart':
      return (
        <>
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </>
      );
    case 'clock':
      return (
        <>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </>
      );
    case 'download':
      return (
        <>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </>
      );
    case 'hospital':
    case 'building':
      return (
        <>
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
          <path d="M12 10h.01" />
          <path d="M12 14h.01" />
          <path d="M16 10h.01" />
          <path d="M16 14h.01" />
          <path d="M8 10h.01" />
          <path d="M8 14h.01" />
        </>
      );
    case 'book':
      return (
        <>
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </>
      );
    case 'edit':
      return (
        <>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </>
      );
    case 'smartphone':
      return (
        <>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </>
      );
    case 'file-code':
      return (
        <>
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="m10 13-2 2 2 2" />
          <path d="m14 17 2-2-2-2" />
        </>
      );
    case 'stop-circle':
      return (
        <>
          <circle cx="12" cy="12" r="10" />
          <rect x="9" y="9" width="6" height="6" />
        </>
      );
    case 'activity':
      return <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />;
    case 'magnet':
      return (
        <>
          <path d="m6 15-4-4 6.75-6.77a7.78 7.78 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15" />
          <path d="m5 8 4 4" />
          <path d="m12 15 4 4" />
        </>
      );
    case 'hand':
      return (
        <>
          <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
          <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
          <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </>
      );
    case 'ear':
      return (
        <>
          <path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0" />
          <path d="M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4" />
        </>
      );
    case 'dot':
      return <circle cx="12" cy="12" r="5" fill="currentColor" />;
    case 'circle':
      return <circle cx="12" cy="12" r="8" />;
    case 'sparkles':
      return (
        <>
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          <path d="M5 3v4" />
          <path d="M19 17v4" />
          <path d="M3 5h4" />
          <path d="M17 19h4" />
        </>
      );
    case 'home':
      return (
        <>
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </>
      );
    case 'folder':
      return (
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
      );
    case 'sun':
      return (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </>
      );
    case 'moon':
      return <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />;
    default:
      return <circle cx="12" cy="12" r="8" />;
  }
}

// Named Icon Convenience Components
export function CheckIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="check" {...props} />;
}
export function AlertTriangleIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="alert" {...props} />;
}
export function XIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="x" {...props} />;
}
export function InfoIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="info" {...props} />;
}
export function LockIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="lock" {...props} />;
}
export function RefreshCwIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="refresh" {...props} />;
}
export function ChevronDownIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="chevron-down" {...props} />;
}
export function ChevronUpIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="chevron-up" {...props} />;
}
export function ChevronLeftIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="chevron-left" {...props} />;
}
export function ChevronRightIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="chevron-right" {...props} />;
}
export function SearchIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="search" {...props} />;
}
export function BellIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="bell" {...props} />;
}
export function SettingsIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="settings" {...props} />;
}
export function MicroscopeIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="microscope" {...props} />;
}
export function FlaskConicalIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="flask" {...props} />;
}
export function BrainIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="brain" {...props} />;
}
export function DnaIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="dna" {...props} />;
}
export function TargetIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="target" {...props} />;
}
export function ShieldIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="shield" {...props} />;
}
export function ScaleIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="scale" {...props} />;
}
export function RocketIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="rocket" {...props} />;
}
export function PackageIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="package" {...props} />;
}
export function FileTextIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="file-text" {...props} />;
}
export function BarChart3Icon(props: Omit<IconProps, 'name'>) {
  return <Icon name="chart" {...props} />;
}
export function ClockIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="clock" {...props} />;
}
export function DownloadIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="download" {...props} />;
}
export function Building2Icon(props: Omit<IconProps, 'name'>) {
  return <Icon name="building" {...props} />;
}
export function BookOpenIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="book" {...props} />;
}
export function AlertOctagonIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="stop-circle" {...props} />;
}
export function ActivityIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="activity" {...props} />;
}
export function DotIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="dot" {...props} />;
}
export function CircleIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="circle" {...props} />;
}
export function EditIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="edit" {...props} />;
}
export function SmartphoneIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="smartphone" {...props} />;
}
export function FileCodeIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="file-code" {...props} />;
}
export function ArrowRightIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="arrow-right" {...props} />;
}
export function ArrowLeftIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="arrow-left" {...props} />;
}
export function ArrowDownIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="arrow-down" {...props} />;
}
export function ArrowLeftRightIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="arrow-left-right" {...props} />;
}
export function ExternalLinkIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="external-link" {...props} />;
}
export function SunIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="sun" {...props} />;
}
export function MoonIcon(props: Omit<IconProps, 'name'>) {
  return <Icon name="moon" {...props} />;
}
