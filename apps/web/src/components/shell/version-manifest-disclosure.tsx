'use client';

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
          <span className="build-badge">
            <span className="status-dot">●</span> {releaseContext.buildName}
          </span>
          <span className="footer-divider" aria-hidden="true">
            |
          </span>
          <span className="subsystem-pill">
            <strong>Target Engine:</strong> v1.0.0
          </span>
          <span className="subsystem-pill">
            <strong>Evidence:</strong> v1.0.0
          </span>
          <span className="subsystem-pill">
            <strong>Phenotype:</strong> v1.0.0
          </span>
          <span className="subsystem-pill">
            <strong>Neuro:</strong> v1.0.0
          </span>
          <span className="subsystem-pill">
            <strong>Policy:</strong> v1.0.0
          </span>
        </div>

        <div className="footer-provenance-action">
          <button
            className="btn-provenance-disclosure"
            onClick={() => setIsOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
          >
            Inspect Release Provenance ↗
          </button>
        </div>
      </footer>

      {/* Release Provenance Modal (§78, §124) */}
      {isOpen && (
        <div
          className="provenance-modal-backdrop"
          onClick={() => setIsOpen(false)}
          role="presentation"
        >
          <div
            className="provenance-modal-content"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="provenance-modal-title"
          >
            <div className="provenance-modal-header">
              <div>
                <span className="badge badge-tier1" style={{ marginBottom: '0.25rem' }}>
                  {releaseContext.maturityStage} FROZEN BASELINE
                </span>
                <h2 id="provenance-modal-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  Scientific Release Manifest & Subsystem Provenance
                </h2>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--text-secondary)',
                    marginTop: '0.25rem',
                  }}
                >
                  Authoritative cryptographic freeze manifest for IEC 62304 / ISO 14971
                  traceability.
                </p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsOpen(false)}
                aria-label="Close provenance modal"
              >
                ✕
              </button>
            </div>

            <div className="provenance-meta-grid">
              <div className="meta-card">
                <span className="meta-label">Build Identifier</span>
                <strong className="meta-value font-mono">{releaseContext.buildId}</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">Git Commit SHA</span>
                <strong className="meta-value font-mono">{releaseContext.gitCommitShaShort}</strong>
              </div>
              <div className="meta-card">
                <span className="meta-label">Freeze Timestamp</span>
                <strong className="meta-value">
                  {new Date(releaseContext.freezeTimestamp).toUTCString()}
                </strong>
              </div>
            </div>

            <div className="provenance-subsystems-table-wrapper">
              <table className="provenance-table">
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
                        <span className="badge badge-neutral">{sub.version}</span>
                      </td>
                      <td>
                        <span className="font-mono text-cyan" title={sub.sha256DigestFull}>
                          {sub.sha256DigestShort}…
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-tier1">
                          {sub.status} {sub.isChangeControlLocked ? '🔒' : ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="provenance-disclaimer-box">
              <span className="disclaimer-icon">ℹ</span>
              <p style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                {releaseContext.decisionSupportDisclaimer}
              </p>
            </div>

            <div className="provenance-modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsOpen(false)}>
                Close Provenance
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
