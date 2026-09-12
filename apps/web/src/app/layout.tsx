import type { Metadata } from 'next';
import '../styles/globals.css';
import { ReactiveShellHeader } from '../components/shell/reactive-shell-header';
import { GlobalSidebar } from '../components/shell/global-sidebar';
import { VersionManifestDisclosure } from '../components/shell/version-manifest-disclosure';
import { NotificationProvider } from '../components/notification-system';

export const metadata: Metadata = {
  title: 'Magniom — Clinician Decision Support Workspace',
  description:
    'Connectome-Informed TMS Target Decision Support System (IEC 62304 / ISO 14971 Aligned)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NotificationProvider>
          {/* §179: Skip-to-content accessibility link for keyboard users */}
          <a href="#main-content" className="skip-to-content">
            Skip to main content
          </a>

          {/* Layer 1: Top Bar (§7–22) via ReactiveShellHeader (MagniomTopBar) */}
          {/* Layer 2: Safety / CDS Environment Strip (§13, §123) (EnvironmentSafetyStrip) */}
          <ReactiveShellHeader />

          {/* 4-Layer Shell Body: Sidebar + Main Workspace Canvas */}
          <div className="shell-workspace-container">
            {/* Layer 3: Global / Case Sidebar (§23–39, §51–53) */}
            <GlobalSidebar />

            {/* Layer 4: Main Canvas (§57, §58) */}
            <main role="main" className="shell-main-canvas" id="main-content">
              {children}
            </main>
          </div>

          {/* Provenance Footer (§78, §124, §153) */}
          <VersionManifestDisclosure />
        </NotificationProvider>
      </body>
    </html>
  );
}
