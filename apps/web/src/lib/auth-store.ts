/**
 * @magniom/web - Clinician Authentication & Session Store
 * Conforms to MAGNIOM Clinical Platform & Shell Navigation Specification.
 *
 * Provides authoritative specialist session state, storage synchronization,
 * and security audit logging. Authentication is strictly executed on the server.
 */

import { emitAuditEvent } from './shell-observability';
import type {
  UserIdentityViewModel,
  OrganisationContextViewModel,
  EnvironmentMode,
} from '@magniom/presentation';

export const AUTH_STORAGE_KEY = 'magniom_clinician_session';
export const AUTH_COOKIE_NAME = 'magniom_session';

export interface ClinicianAuthSession {
  isAuthenticated: boolean;
  username: string;
  loginTimestamp: string;
  sessionToken?: string;
  rememberMe: boolean;
  user: UserIdentityViewModel;
  organization: OrganisationContextViewModel;
  mode: EnvironmentMode;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  session?: ClinicianAuthSession;
}

type AuthListener = (session: ClinicianAuthSession | null) => void;

class ClinicianAuthStore {
  private listeners: Set<AuthListener> = new Set();
  private cachedSession: ClinicianAuthSession | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initFromStorage();
      // Synchronize with server on load
      this.refreshSessionFromServer().catch(() => {});
    }
  }

  private initFromStorage(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ClinicianAuthSession;
        if (parsed && parsed.isAuthenticated) {
          this.cachedSession = parsed;
          return;
        }
      }
    } catch {
      // Storage unavailable or parsing error
    }
    this.cachedSession = null;
  }

  /**
   * Refreshes active session state authoritatively from the server via HttpOnly cookie.
   */
  public async refreshSessionFromServer(): Promise<ClinicianAuthSession | null> {
    if (typeof window === 'undefined') return null;

    try {
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isAuthenticated) {
          const session: ClinicianAuthSession = {
            isAuthenticated: true,
            username: data.username,
            loginTimestamp: data.issuedAt,
            rememberMe: false,
            user: data.user,
            organization: data.organization,
            mode: data.mode,
          };
          this.cachedSession = session;
          try {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
          } catch {}
          this.notifyListeners();
          return session;
        }
      } else {
        // Unauthenticated or expired
        if (this.cachedSession) {
          this.cachedSession = null;
          try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          } catch {}
          this.notifyListeners();
        }
      }
    } catch {
      // Server unreachable
    }

    return this.cachedSession;
  }

  /**
   * Retrieves the current clinician session, or null if unauthenticated.
   */
  public getAuthSession(): ClinicianAuthSession | null {
    if (typeof window !== 'undefined' && !this.isInitialized) {
      this.initFromStorage();
    }
    return this.cachedSession;
  }

  /**
   * Checks whether an active clinician session exists.
   */
  public isAuthenticated(): boolean {
    const session = this.getAuthSession();
    return Boolean(session?.isAuthenticated);
  }

  /**
   * Directly sets active session for isolated automated testing suites.
   */
  public setSessionForTesting(session: ClinicianAuthSession | null): void {
    this.cachedSession = session;
    this.notifyListeners();
  }

  /**
   * Authenticates clinician strictly through the server API endpoint (/api/auth/login).
   * Ensures authoritative HttpOnly cookies are established on the HTTP response.
   * Fails closed if the server is unreachable.
   */
  public async authenticateClinicianAsync(
    usernameInput: string,
    passwordInput: string,
    options: { rememberMe?: boolean } = {},
  ): Promise<AuthResult> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput,
          rememberMe: options.rememberMe,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.session) {
        this.cachedSession = data.session;
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.session));
        } catch {}

        this.notifyListeners();
        return { success: true, session: data.session };
      }

      return {
        success: false,
        error: data.error || `Authentication failed (HTTP ${res?.status ?? 500}).`,
      };
    } catch {
      return {
        success: false,
        error: 'Authentication service unavailable. Please check your network connection.',
      };
    }
  }

  /**
   * Synchronous authenticateClinician placeholder that enforces asynchronous server authentication.
   * Prevents any client-side credential evaluation.
   */
  public authenticateClinician(
    usernameInput: string,
    _passwordInput: string,
    _options: { rememberMe?: boolean } = {},
  ): AuthResult {
    // In strict security mode, synchronous client-side authentication is rejected.
    emitAuditEvent('CLINICIAN_AUTH_FAILED', {
      message:
        'Client-side synchronous authentication attempt rejected; server authentication required.',
      metadata: { attemptedUser: usernameInput },
    });

    return {
      success: false,
      error:
        'Direct client-side authentication is prohibited. Please use authenticateClinicianAsync.',
    };
  }

  /**
   * Signs out the clinician, invalidates the session, and clears storage.
   */
  public logoutClinician(): void {
    const priorSession = this.cachedSession;
    this.cachedSession = null;

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {}

      try {
        document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
      } catch {}

      // Notify server logout
      try {
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      } catch {}
    }

    emitAuditEvent('CLINICIAN_LOGGED_OUT', {
      userId: priorSession?.user.id,
      sessionId: priorSession?.sessionToken,
      message: priorSession
        ? `Clinician ${priorSession.user.displayName} signed out of active workstation session.`
        : 'Workstation session signed out.',
      metadata: {
        priorSessionToken: priorSession?.sessionToken,
      },
    });

    this.notifyListeners();
  }

  /**
   * Subscribes to auth session state changes.
   */
  public subscribe(listener: AuthListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.cachedSession);
      } catch {}
    }
  }
}

export const authStore = new ClinicianAuthStore();
