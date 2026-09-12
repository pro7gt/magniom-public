'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  authStore,
  type ClinicianAuthSession,
  type AuthResult,
} from './auth-store';

export function useAuth() {
  const [session, setSession] = useState<ClinicianAuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    setSession(authStore.getAuthSession());
    setIsLoading(false);

    // Subscribe to changes
    const unsubscribe = authStore.subscribe(updatedSession => {
      setSession(updatedSession);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(
    (username: string, password: string, options?: { rememberMe?: boolean }): AuthResult => {
      return authStore.authenticateClinician(username, password, options);
    },
    [],
  );

  const logout = useCallback(() => {
    authStore.logoutClinician();
  }, []);

  return {
    session,
    isAuthenticated: Boolean(session?.isAuthenticated),
    isLoading,
    login,
    logout,
  };
}
