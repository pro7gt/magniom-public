'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SunIcon, MoonIcon } from './icon';

const THEME_STORAGE_KEY = 'magniom_theme';
const TRANSITION_DURATION_MS = 350;

type Theme = 'light' | 'dark';

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage unavailable (e.g. incognito with restrictions)
  }
  return 'light';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/**
 * Theme toggle switch with sun/moon icons and smooth crossfade.
 * Persists preference to localStorage under 'magniom_theme'.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(getStoredTheme());
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';

    // Add transitioning class for smooth crossfade
    document.documentElement.setAttribute('data-theme-transitioning', '');

    applyTheme(nextTheme);
    setTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Silent fail for restricted storage contexts
    }

    // Remove transitioning class after animation completes
    setTimeout(() => {
      document.documentElement.removeAttribute('data-theme-transitioning');
    }, TRANSITION_DURATION_MS);
  }, [theme]);

  const isDark = theme === 'dark';

  // Prevent hydration mismatch by rendering neutral state until mounted
  if (!mounted) {
    return (
      <div className="theme-toggle" role="switch" aria-checked={false} aria-label="Toggle dark mode">
        <span className="theme-toggle-label">
          <span className="theme-toggle-label-icon" aria-hidden="true">
            <SunIcon size={14} />
          </span>
          <span>Light</span>
        </span>
        <div className="theme-toggle-track" data-active="false">
          <div className="theme-toggle-thumb" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="theme-toggle"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      tabIndex={0}
      id="theme-toggle-switch"
    >
      <span className="theme-toggle-label">
        <span className="theme-toggle-label-icon" aria-hidden="true">
          {isDark ? <MoonIcon size={14} /> : <SunIcon size={14} />}
        </span>
        <span>{isDark ? 'Dark' : 'Light'}</span>
      </span>
      <div className="theme-toggle-track" data-active={isDark ? 'true' : 'false'}>
        <div className="theme-toggle-thumb" />
      </div>
    </div>
  );
}
