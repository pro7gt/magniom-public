'use client';

import { Button } from '@/components/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === 'development';

  return (
    <html lang="en">
      <body className="root-error-body">
        <div className="container page-container-col center-card-danger">
          <h1 className="page-title text-rose mb-4">Root Presentation Fault</h1>
          <p className="text-secondary text-sm mb-4">
            The application shell encountered an unrecoverable root layout fault.
          </p>
          {error?.digest && (
            <p className="font-mono text-xs text-muted mb-6">Fault Digest: {error.digest}</p>
          )}

          {isDev && (
            <details className="error-diagnostics-details">
              <summary className="error-diagnostics-summary">
                Developer Diagnostics ({error.name || 'Error'}:{' '}
                {error.message || 'Unknown Root Fault'})
              </summary>
              {error.stack && <pre className="error-diagnostics-pre">{error.stack}</pre>}
            </details>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <Button type="button" variant="primary" onClick={() => reset()}>
              Reset Boundary
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
            >
              Reload Shell
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
