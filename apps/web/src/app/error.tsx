'use client';

import { Breadcrumbs, Button, AlertTriangleIcon } from '@/components/ui';
import React, { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error for audit without sensitive PHI
    console.error('[MAGNIOM ERROR BOUNDARY]', error);
  }, [error]);

  const isDev = process.env.NODE_ENV === 'development';

  return (
    <div className="container page-container-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-full text-left">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Workspace Error', current: true },
          ]}
        />
      </div>

      <div className="w-full max-w-2xl p-10 rounded-xl bg-rose-500/5 border border-rose-500/20 text-center mt-4">
        <span className="inline-flex items-center justify-center mb-4 text-rose" aria-hidden="true">
          <AlertTriangleIcon size={32} />
        </span>
        <h1 className="page-title text-rose mb-2">Presentation Exception (Fail-Closed)</h1>
        <p className="text-secondary text-base leading-relaxed mb-4">
          An unexpected presentation layer error occurred. In accordance with §25 (Contradictory
          State Shall Fail Closed), clinical actions are suspended.
        </p>

        {error.digest && (
          <p className="font-mono text-xs text-muted mb-6">Digest: {error.digest}</p>
        )}

        {isDev && (
          <details className="error-diagnostics-details text-left mb-6">
            <summary className="error-diagnostics-summary">
              Developer Diagnostics ({error.name || 'Error'}: {error.message || 'Unknown Exception'}
              )
            </summary>
            {error.stack && <pre className="error-diagnostics-pre">{error.stack}</pre>}
          </details>
        )}

        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="primary" type="button" onClick={() => reset()}>
            Retry Action
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
          >
            Reload Workspace
          </Button>
          <Button variant="secondary" href="/cases">
            Return to Cases
          </Button>
        </div>
      </div>
    </div>
  );
}
