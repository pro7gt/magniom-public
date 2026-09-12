import type { Metadata } from 'next';
import { CLINICAL_THEME_TOKENS } from '@magniom/ui';
import '../styles/globals.css';
import { ShellLayout } from '../components/shell/shell-layout';
import { NotificationProvider } from '../components/notification-system';

export const metadata: Metadata = {
  title: 'Magniom — Clinician Decision Support Workspace',
  description:
    'Connectome-Informed TMS Target Decision Support System (IEC 62304 / ISO 14971 Aligned)',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
  },
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

          {/* Route-adaptive Shell: Full 4-Layer Workspace or Dedicated Login Canvas */}
          <ShellLayout>{children}</ShellLayout>
        </NotificationProvider>
      </body>
    </html>
  );
}
