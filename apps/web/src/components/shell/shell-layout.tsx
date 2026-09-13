'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ReactiveShellHeader } from './reactive-shell-header';
import { GlobalSidebar } from './global-sidebar';
import { VersionManifestDisclosure } from './version-manifest-disclosure';
import { AuthGuard } from './auth-guard';

export interface ShellLayoutProps {
  children: React.ReactNode;
}

/**
 * Authoritative Shell Layout Adapter
 * Dynamically switches between the authenticated 4-layer clinical workspace
 * and the dedicated, distraction-free clinician login portal (/login).
 * Non-login routes are gated by AuthGuard to prevent unauthenticated access.
 */
export function ShellLayout({ children }: ShellLayoutProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login' || pathname?.startsWith('/login/');

  if (isLoginPage) {
    return (
      <main role="main" className="shell-login-canvas" id="main-content">
        {children}
      </main>
    );
  }

  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
