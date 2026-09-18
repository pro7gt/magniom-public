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
  const [isAuthorised, setIsAuthorised] = useState<boolean>(() => authStore.isAuthenticated());
  const [isLoading, setIsLoading] = useState<boolean>(
    () => !authStore.isAuthenticated() && !authStore.isReady(),
  );

  useEffect(() => {
    let isMounted = true;

    async function evaluateAuth() {
      // 1. If active authenticated session is already available in authStore (e.g. from localStorage)
      if (authStore.isAuthenticated()) {
        if (isMounted) {
          setIsAuthorised(true);
          setIsLoading(false);
        }
        return;
      }

      // 2. If store has not completed initial server handshake, await it
      if (!authStore.isReady()) {
        if (isMounted) setIsLoading(true);
        const refreshed = await authStore.refreshSessionFromServer();
        if (!isMounted) return;

        if (refreshed && refreshed.isAuthenticated) {
          setIsAuthorised(true);
          setIsLoading(false);
          return;
        }
      }

      // 3. Store confirmed unauthenticated / revoked: redirect to login
      if (isMounted) {
        setIsAuthorised(false);
        setIsLoading(false);
        const targetRedirect =
          pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
        router.replace(`/login${targetRedirect}`);
      }
    }

    evaluateAuth();

    // 4. Multi-tab and real-time session subscription (§141, §142)
    const unsubscribe = authStore.subscribe(updatedSession => {
      if (!isMounted) return;
      if (updatedSession && updatedSession.isAuthenticated) {
        setIsAuthorised(true);
        setIsLoading(false);
      } else {
        setIsAuthorised(false);
        setIsLoading(false);
        const targetRedirect =
          pathname && pathname !== '/' ? `?redirect=${encodeURIComponent(pathname)}` : '';
        router.replace(`/login${targetRedirect}`);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
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
