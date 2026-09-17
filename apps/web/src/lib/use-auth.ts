'use client';

import { useState, useEffect, useCallback } from 'react';
import { authStore, type ClinicianAuthSession, type AuthResult } from './auth-store';

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

  const loginAsync = useCallback(
    async (
      username: string,
      password: string,
      options?: { rememberMe?: boolean },
    ): Promise<AuthResult> => {
      return await authStore.authenticateClinicianAsync(username, password, options);
    },
    [],
  );

  const login = useCallback(
    async (
      username: string,
      password: string,
      options?: { rememberMe?: boolean },
    ): Promise<AuthResult> => {
      return await authStore.authenticateClinicianAsync(username, password, options);
    },
    [],
  );

  const logoutAsync = useCallback(async (): Promise<void> => {
    await authStore.logoutClinicianAsync();
  }, []);

  const logout = useCallback((): void => {
    authStore.logoutClinician();
  }, []);

  return {
    session,
    isAuthenticated: Boolean(session?.isAuthenticated),
    isLoading,
    login,
    loginAsync,
    logout,
    logoutAsync,
  };
}
