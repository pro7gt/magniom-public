import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Magniom — Clinician Decision Support Workspace',
  description: 'Connectome-Informed TMS Target Decision Support System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="header-bar">
          <div className="logo-group">
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#38bdf8' }}>
              MAGNIOM
            </span>
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>|</span>
            <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>TMS Target Decision Support</span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span className="badge badge-research">RESEARCH PROTOTYPE (M0/M1)</span>
            <span style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>v0.1.0-alpha</span>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
