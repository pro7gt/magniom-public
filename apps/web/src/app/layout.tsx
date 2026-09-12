import type { Metadata } from 'next';
import { CLINICAL_THEME_TOKENS } from '@magniom/ui';
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

/**
 * Inline script for theme flash prevention (FOUC).
 * Runs synchronously before first paint to apply stored theme preference.
 * Must not reference any React/module code — pure vanilla JS in a string.
 */
const THEME_FLASH_PREVENTION_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('magniom_theme');
    if (t === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme flash prevention — must execute before first paint */}
        <script dangerouslySetInnerHTML={{ __html: THEME_FLASH_PREVENTION_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content={CLINICAL_THEME_TOKENS.colors.bgBase} />
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
