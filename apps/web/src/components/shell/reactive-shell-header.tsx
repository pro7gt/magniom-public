'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MagniomTopBar } from './magniom-top-bar';
import { EnvironmentSafetyStrip } from './environment-safety-strip';
import { caseStore } from '../../lib/case-store';
import type { EnvironmentMode, ShellSafetyState } from '@magniom/presentation';

export function ReactiveShellHeader() {
  const pathname = usePathname();

  let mode: EnvironmentMode = 'CLINICAL';
  let safetyState: ShellSafetyState = 'NORMAL';

  if (pathname.startsWith('/research')) {
    mode = 'RESEARCH';
  } else if (pathname.startsWith('/validation')) {
    mode = 'VALIDATION';
  } else {
    const caseMatch = pathname.match(/^(?:\/research|\/validation)?\/cases\/([^/]+)/);
    if (caseMatch && caseMatch[1] && caseMatch[1] !== 'new') {
      const caseId = caseMatch[1];
      const record = caseStore.getCaseRecord(caseId);
      if (record) {
        if (record.clinicalCase.mode === 'RESEARCH') mode = 'RESEARCH';
        else if (record.clinicalCase.mode === 'VALIDATION') mode = 'VALIDATION';
        if (record.isBlindedValidation) safetyState = 'BLINDED_VALIDATION';
      }
    }
  }

  return (
    <>
      <MagniomTopBar currentMode={mode} />
      <EnvironmentSafetyStrip mode={mode} safetyState={safetyState} />
    </>
  );
}
