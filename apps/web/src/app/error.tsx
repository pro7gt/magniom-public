'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error for audit without sensitive PHI
    console.error('MAGNIOM UI Runtime Exception:', error.name, error.message, error.digest);
  }, [error]);

  return (
    <div
      className="error-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          padding: '3rem 2.5rem',
          maxWidth: '560px',
          width: '100%',
        }}
      >
        <span
          style={{
            fontSize: '3rem',
            display: 'block',
            marginBottom: '1rem',
          }}
          aria-hidden="true"
        >
          ⚠️
        </span>
        <h1
          style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#ef4444' }}
        >
          Presentation Exception (Fail-Closed)
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            margin: '0 0 1rem',
          }}
        >
          An unexpected presentation layer error occurred. In accordance with §25 (Contradictory
          State Shall Fail Closed), clinical actions are suspended.
        </p>
        {error.digest && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              marginBottom: '1.5rem',
            }}
          >
            Digest: {error.digest}
          </p>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => reset()}
            style={{ padding: '8px 16px' }}
          >
            Retry Action
          </button>
          <Link
            href="/cases"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', padding: '8px 16px' }}
          >
            Return to Cases
          </Link>
        </div>
      </div>
    </div>
  );
}
