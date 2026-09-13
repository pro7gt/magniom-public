'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Breadcrumbs,
  Input,
  Checkbox,
  FormGroup,
  FormLabel,
  ThemeToggle,
  LockIcon,
  CheckIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  MagniomMark,
} from '@/components/ui';
import { authStore, type ClinicianAuthSession } from '../../lib/auth-store';

function EyeIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [existingSession, setExistingSession] = useState<ClinicianAuthSession | null>(null);

  useEffect(() => {
    // Check if clinician is already authenticated
    const session = authStore.getAuthSession();
    if (session && session.isAuthenticated) {
      setExistingSession(session);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = authStore.authenticateClinician(username, password, { rememberMe });

    if (result.success) {
      startTransition(() => {
        router.push(redirectTarget);
      });
    } else {
      setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      setPassword('');
    }
  };

  const handleLogoutExisting = () => {
    authStore.logoutClinician();
    setExistingSession(null);
    setUsername('');
    setPassword('');
  };

  return (
    <div className="login-container">
      {/* 1. Main Authenticated Clinician Card using design system Card primitive */}
      <Card className="login-card" aria-label="Clinician Login Card">
        {/* Magniom Brand & Clinical System Header */}
        <CardHeader className="login-brand-header">
          <div className="login-brand-logo-wrap" aria-hidden="true">
            <MagniomMark size={40} className="login-brand-mark" />
          </div>
          <CardTitle as="h1" className="login-brand-title" id="login-brand-heading">
            MAGNIOM
          </CardTitle>
          <p className="login-brand-sub">TMS Target Decision Support System</p>

          <div className="login-compliance-badges" aria-label="Regulatory Compliance">
            <Badge variant="clinical" className="login-compliance-badge">
              IEC 62304 Class B
            </Badge>
            <Badge variant="neutral" className="login-compliance-badge">
              ISO 14971
            </Badge>
            <Badge variant="neutral" className="login-compliance-badge">
              21 CFR Part 11
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {existingSession ? (
            /* Active Session Resume Card */
            <div className="login-active-session-prompt">
              <div className="alert alert-info mb-4" role="status">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <CheckIcon size={16} className="text-emerald" /> Active Clinician Session Detected
                </div>
                <p className="text-xs text-secondary mt-1">
                  You are currently signed in as <strong>{existingSession.user.displayName}</strong>{' '}
                  ({existingSession.user.roleTitle}) at{' '}
                  <strong>{existingSession.organization.organizationName}</strong>.
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => router.push(redirectTarget)}
                >
                  <span>Continue to Clinical Workspace</span>
                  <ArrowRightIcon size={16} />
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={handleLogoutExisting}
                >
                  Sign Out &amp; Switch Account
                </Button>
              </div>
            </div>
          ) : (
            /* Standard Specialist Sign In Form */
            <>
              <div className="login-form-heading-area">
                <h2 className="login-form-title">Authorised Specialist Sign In</h2>
                <CardDescription className="login-form-desc">
                  Enter your clinician credentials to access patient connectomic slates, target
                  formulation reviews, and clinical decision signing.
                </CardDescription>
              </div>

              {/* Error Callout */}
              {errorMessage && (
                <div className="alert alert-danger mb-4" role="alert" aria-live="assertive">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <AlertTriangleIcon size={16} className="text-danger" />
                    <span>Authentication Error</span>
                  </div>
                  <p className="text-xs text-secondary mt-1">{errorMessage}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} noValidate>
                <div className="login-form-fields">
                  <FormGroup>
                    <FormLabel htmlFor="login-username" required>
                      Clinician Username
                    </FormLabel>
                    <Input
                      id="login-username"
                      name="user_name"
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Enter username"
                      autoComplete="username"
                      autoFocus
                      required
                      error={Boolean(errorMessage)}
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel htmlFor="login-password" required>
                      Security Password
                    </FormLabel>
                    <div className="login-input-wrapper">
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        error={Boolean(errorMessage)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="login-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                      </Button>
                    </div>
                  </FormGroup>

                  <div className="flex items-center justify-between text-xs mt-1">
                    <Checkbox
                      id="remember-workstation"
                      label="Remember this clinical workstation (30 days)"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  id="login-submit-btn"
                  className="login-submit-btn"
                  disabled={isPending}
                >
                  {isPending ? (
                    <span>Authorising Session...</span>
                  ) : (
                    <>
                      <LockIcon size={16} />
                      <span>Sign In to Clinical Workspace</span>
                      <ArrowRightIcon size={16} />
                    </>
                  )}
                </Button>
              </form>
            </>
          )}
        </CardContent>

        <CardFooter>
          <div className="login-security-notice">
            <span>Site 1 — Surrey Hills Clinic · Node: Melb-01</span>
          </div>
        </CardFooter>
      </Card>

      {/* 2. Security & Governance Footnote */}
      <footer className="login-security-notice" role="contentinfo">
        <p>
          <strong>Restricted Clinical Decision Support System.</strong> Unauthorised access or
          misuse is prohibited. All target selections, modification slates, and clinician sign-offs
          are cryptographically hashed and audited under 21 CFR Part 11 and hospital IT governance
          protocols.
        </p>
        <div className="login-system-meta">
          <span className="inline-flex items-center gap-1.5">
            <span className="login-system-dot" aria-hidden="true" />
            <span>Operational Node: Melb-01</span>
          </span>
          <span>·</span>
          <span>CDS Engine: v2.0-spec</span>
          <span>·</span>
          <span>TLS 1.3 Certified</span>
        </div>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="container page-container-col login-page-container">
      {/* Navigation and Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Magniom', href: '/' }, { label: 'Clinician Portal' }]} />

      {/* Dedicated Top Utility Navigation Strip */}
      <nav className="login-nav-strip" aria-label="Portal Navigation">
        <div className="login-nav-left">
          <Link
            href="https://magniom.com"
            className="login-back-link"
            title="Return to Public Overview"
          >
            <ArrowLeftIcon size={14} />
            <span>Return to Magniom.com</span>
          </Link>
        </div>

        <div className="login-nav-right">
          <div className="login-tls-badge" title="Cryptographically Secured TLS Session">
            <LockIcon size={12} className="text-emerald" />
            <span>TLS 1.3 · Encrypted CDS Session</span>
          </div>
          <ThemeToggle />
        </div>
      </nav>

      {/* Suspense Boundary for searchParams */}
      <Suspense fallback={<div className="login-loading-container">Loading portal...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
