import { Breadcrumbs, Button, SearchIcon } from '@/components/ui';
import React from 'react';

export default function NotFound() {
  return (
    <div className="container page-container-col fullpage-center-layout">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Resource Not Found', current: true },
        ]}
      />

      <div className="center-card-box">
        <span className="inline-flex items-center justify-center mb-4 text-cyan" aria-hidden="true">
          <SearchIcon size={32} />
        </span>
        <h1 className="page-title mb-2">404 — Destination Not Found</h1>
        <p className="text-secondary text-base leading-relaxed m-0 mb-6">
          The requested MAGNIOM navigation route does not exist or may belong to an unconfigured
          indication module namespace.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="secondary" href="/">
            Return to Home
          </Button>
          <Button variant="primary" href="/cases">
            View Cases
          </Button>
          <Button variant="secondary" href="/help">
            Clinical Help
          </Button>
        </div>
      </div>
    </div>
  );
}
