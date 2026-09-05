'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: '#0a0d14',
          color: '#e2e8f0',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '3rem 2.5rem',
            maxWidth: '520px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', color: '#ef4444', margin: '0 0 1rem' }}>
            Root Presentation Fault
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
            The application shell encountered an unrecoverable root layout fault.
          </p>
          {error?.digest && (
            <p
              style={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                color: '#64748b',
                marginBottom: '1.5rem',
              }}
            >
              Fault Digest: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Reload Shell
          </button>
        </div>
      </body>
    </html>
  );
}
