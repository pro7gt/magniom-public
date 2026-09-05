import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="not-found-page"
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
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '3rem 2.5rem',
          maxWidth: '540px',
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
          🔍
        </span>
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            margin: '0 0 0.5rem',
            color: 'var(--text-main)',
          }}
        >
          404 — Destination Not Found
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.5,
            margin: '0 0 1.75rem',
          }}
        >
          The requested MAGNIOM navigation route does not exist or may belong to an unconfigured
          indication module namespace.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', padding: '8px 16px' }}
          >
            Return to Home
          </Link>
          <Link
            href="/cases"
            className="btn btn-primary"
            style={{ textDecoration: 'none', padding: '8px 16px' }}
          >
            View Cases
          </Link>
          <Link
            href="/help"
            className="btn btn-secondary"
            style={{ textDecoration: 'none', padding: '8px 16px' }}
          >
            Clinical Help
          </Link>
        </div>
      </div>
    </div>
  );
}
