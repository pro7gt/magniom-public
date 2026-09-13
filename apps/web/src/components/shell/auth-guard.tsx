'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authStore } from '../../lib/auth-store';
import { MagniomMark } from '@/components/ui';

export interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Magniom Authoritative Workspace AuthGuard
 * Conforms to MAG-SEC-001 (Mandatory authentication for clinical routes)
 * and IEC 62304 / 21 CFR Part 11 session integrity rules.
 *
 * Enforces client-side session presence, multi-tab invalidation,
 * and automatic locking when unauthenticated.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorised, setIsAuthorised] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Initial active session verification
    const activeSession = authStore.getAuthSession();
    if (activeSession && activeSession.isAuthenticated) {
      setIsAuthorised(true);
      setIsLoading(false);
    } else {
      setIsAuthorised(false);
      setIsLoading(false);
      const targetRedirect =
        pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
      router.push(`/login${targetRedirect}`);
    }

    // 2. Multi-tab and real-time session subscription (§141, §142)
    const unsubscribe = authStore.subscribe(updatedSession => {
      if (updatedSession && updatedSession.isAuthenticated) {
        setIsAuthorised(true);
      } else {
        setIsAuthorised(false);
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  // Loading or redirecting lock screen (prevents FOUC / patient PHI flash)
  if (isLoading || !isAuthorised) {
    return (
      <div
        className="auth-guard-lock-screen"
        role="status"
        aria-label="Authorising Workstation Session"
      >
        <div>
          <MagniomMark size={56} />
        </div>
        <div className="text-center">
          <h2 className="auth-guard-title">Authorising Clinical Workstation</h2>
          <p className="auth-guard-desc">
            Verifying specialist credentials and cryptographic session tokens...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
