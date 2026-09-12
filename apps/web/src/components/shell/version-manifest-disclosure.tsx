'use client';

import { Button, Badge, Card, CardContent, Modal, LockIcon, InfoIcon } from '@/components/ui';

import React, { useState } from 'react';
import { getAuthoritativeReleaseContext } from '../../lib/release-authority';

export function VersionManifestDisclosure() {
  const [isOpen, setIsOpen] = useState(false);
  const releaseContext = getAuthoritativeReleaseContext();

  return (
    <>
      <footer
        className="version-provenance-footer"
        role="contentinfo"
        aria-label="Scientific Subsystems and Release Provenance"
      >
        <div className="footer-subsystem-summary">
          <Badge variant="clinical" size="sm" className="build-badge">
            <span className="status-dot">●</span> {releaseContext.buildName}
          </Badge>
          <span className="footer-divider" aria-hidden="true">
            |
          </span>
          <span className="subsystem-pill">
            Build: <code className="font-mono">{releaseContext.buildId}</code>
          </span>
          <span className="footer-divider" aria-hidden="true">
            |
          </span>
          <span className="subsystem-pill">
            Commit: <code className="font-mono">{releaseContext.gitCommitShaShort}</code>
          </span>
          <span className="footer-divider" aria-hidden="true">
            |
          </span>
          <span className="subsystem-pill">
            Frozen: {releaseContext.freezeTimestamp.split('T')[0]}
          </span>
        </div>

        <div className="footer-provenance-action">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(true)}
            aria-label="Open full system provenance and frozen verification manifest"
            className="btn-provenance-disclosure"
          >
            <LockIcon size={12} className="mr-1 inline" /> Manifest &amp; Provenance
          </Button>
        </div>
      </footer>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="MAGNIOM System Release &amp; Subsystem Manifest"
        maxWidth="900px"
      >
        <div className="mb-4">
          <Badge variant="tier1">{releaseContext.maturityStage} FROZEN BASELINE</Badge>
        </div>

        <div className="provenance-meta-grid">
          <Card className="meta-card">
            <CardContent className="p-0">
              <span className="meta-label">Build Identifier</span>
              <strong className="meta-value font-mono">{releaseContext.buildId}</strong>
            </CardContent>
          </Card>
          <Card className="meta-card">
            <CardContent className="p-0">
              <span className="meta-label">Git Commit SHA</span>
              <strong className="meta-value font-mono">{releaseContext.gitCommitShaShort}</strong>
            </CardContent>
          </Card>
          <Card className="meta-card">
            <CardContent className="p-0">
              <span className="meta-label">Freeze Timestamp</span>
              <strong className="meta-value">
                {new Date(releaseContext.freezeTimestamp).toUTCString()}
              </strong>
            </CardContent>
          </Card>
        </div>

        <div className="provenance-subsystems-table-wrapper">
          <table
            className="provenance-table comparison-table"
            aria-label="Subsystem Version and Manifest Provenance"
          >
            <thead>
              <tr>
                <th>Subsystem</th>
                <th>Version</th>
                <th>SHA-256 Digest</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {releaseContext.subsystems.map(sub => (
                <tr key={sub.subsystemName}>
                  <td>
                    <strong>{sub.subsystemName}</strong>
                  </td>
                  <td>
                    <Badge variant="neutral">{sub.version}</Badge>
                  </td>
                  <td>
                    <span className="font-mono text-cyan" title={sub.sha256DigestFull}>
                      {sub.sha256DigestShort}…
                    </span>
                  </td>
                  <td>
                    <Badge variant="tier1" className="inline-flex items-center gap-1">
                      <span>{sub.status}</span>
                      {sub.isChangeControlLocked && <LockIcon size={12} />}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="provenance-disclaimer-box flex items-start gap-2">
          <InfoIcon size={18} className="text-secondary shrink-0 mt-0.5" />
          <p className="text-sm text-secondary m-0">{releaseContext.decisionSupportDisclaimer}</p>
        </div>

        <div className="provenance-modal-footer">
          <Button variant="secondary" onClick={() => setIsOpen(false)}>
            Close Provenance
          </Button>
        </div>
      </Modal>
    </>
  );
}
