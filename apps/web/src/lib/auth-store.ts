/**
 * @magniom/web - Universal Clinician Authentication & Session Store
 * Conforms to MAGNIOM Clinical Platform & Shell Navigation Specification.
 *
 * Universal Credentials:
 *   user_name = 'magniom'
 *   password  = 'amygdala'
 *
 * Provides authoritative specialist session state, storage persistence,
 * cookie synchronization, and regulatory audit logging.
 */

import { CANONICAL_CLINICAL_SESSION } from './release-authority';
import { emitAuditEvent } from './shell-observability';
import { createSignedSessionToken } from './security/session-crypto';
import type {
  UserIdentityViewModel,
  OrganisationContextViewModel,
  EnvironmentMode,
} from '@magniom/presentation';

export const UNIVERSAL_USER_NAME = 'magniom';
export const UNIVERSAL_PASSWORD = 'amygdala';

export const AUTH_STORAGE_KEY = 'magniom_clinician_session';
export const AUTH_COOKIE_NAME = 'magniom_session';

export interface ClinicianAuthSession {
  isAuthenticated: boolean;
  username: string;
  loginTimestamp: string;
  sessionToken: string;
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
    // Lazy initialize on client
    if (typeof window !== 'undefined') {
      this.initFromStorage();
    }
  }

  private initFromStorage(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ClinicianAuthSession;
        if (parsed && parsed.isAuthenticated && parsed.sessionToken) {
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
   * Retrieves the current authenticated clinician session, or null if unauthenticated.
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
   * Authenticates clinician using universal credentials.
   * Universal credentials:
   *   username: 'magniom' (case-insensitive, trimmed)
   *   password: 'amygdala' (exact match)
   */
  public authenticateClinician(
    usernameInput: string,
    passwordInput: string,
    options: { rememberMe?: boolean } = {},
  ): AuthResult {
    const normalizedUser = (usernameInput || '').trim().toLowerCase();
    const cleanPassword = passwordInput || '';

    const isValidUser = normalizedUser === UNIVERSAL_USER_NAME.toLowerCase();
    const isValidPass = cleanPassword === UNIVERSAL_PASSWORD;

    if (!isValidUser || !isValidPass) {
      emitAuditEvent('CLINICIAN_AUTH_FAILED', {
        message: 'Clinician authentication failed: Invalid universal credentials.',
        metadata: {
          attemptedUser: normalizedUser,
          reason: !isValidUser ? 'INVALID_USERNAME' : 'INVALID_PASSWORD',
        },
      });

      return {
        success: false,
        error: 'Invalid clinician credentials. Please verify your username and password.',
      };
    }

    const timestamp = new Date().toISOString();
    const sessionToken = createSignedSessionToken(CANONICAL_CLINICAL_SESSION.user.id);

    const newSession: ClinicianAuthSession = {
      isAuthenticated: true,
      username: UNIVERSAL_USER_NAME,
      loginTimestamp: timestamp,
      sessionToken,
      rememberMe: Boolean(options.rememberMe),
      user: {
        ...CANONICAL_CLINICAL_SESSION.user,
      },
      organization: {
        ...CANONICAL_CLINICAL_SESSION.organization,
      },
      mode: CANONICAL_CLINICAL_SESSION.mode,
    };

    this.cachedSession = newSession;

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newSession));
      } catch {
        // LocalStorage quota or access denied
      }

      // Set cookie for HTTP / edge route checks
      try {
        const maxAge = options.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days vs 1 day
        document.cookie = `${AUTH_COOKIE_NAME}=${sessionToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
      } catch {
        // Cookie access error
      }
    }

    emitAuditEvent('CLINICIAN_AUTHENTICATED', {
      userId: newSession.user.id,
      sessionId: sessionToken.split('.')[0] || 'mgn-sess',
      message: `Specialist clinician ${newSession.user.displayName} authenticated via universal credentials.`,
      metadata: {
        userId: newSession.user.id,
        roleTitle: newSession.user.roleTitle,
        rememberMe: newSession.rememberMe,
      },
    });

    this.notifyListeners();

    return {
      success: true,
      session: newSession,
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
      } catch {
        // Ignore listener error
      }
    }
  }
}

export const authStore = new ClinicianAuthStore();
