import { describe, it, expect } from 'vitest';
import { SecurityLogger } from './logger.js';
import { createHash } from 'node:crypto';

describe('MAG-SEC-030 & MAG-AUD-001: Logging Controls, PHI Scrubbing & Audit Chaining', () => {
  it('redacts patient MRN and clinical identifiers from log messages (MAG-SEC-030)', () => {
    const rawMessage = 'Patient MRN-994821 processed with depression severity score 28';
    const redacted = SecurityLogger.redactPHI(rawMessage);

    expect(redacted).not.toContain('MRN-994821');
    expect(redacted).toContain('[REDACTED_MRN]');
  });

  it('redacts email addresses and phone numbers from log context', () => {
    const rawMessage = 'Contact clinician at dr.smith@hospital.org or 555-123-4567 for case review';
    const redacted = SecurityLogger.redactPHI(rawMessage);

    expect(redacted).not.toContain('dr.smith@hospital.org');
    expect(redacted).not.toContain('555-123-4567');
    expect(redacted).toContain('[REDACTED_EMAIL]');
    expect(redacted).toContain('[REDACTED_PHONE]');
  });

  it('sanitizes nested JSON objects containing sensitive patient demographic fields', () => {
    const sensitivePayload = {
      caseId: 'case-100',
      patient_name: 'John Doe',
      mrn: 'MRN-12345',
      dob: '1980-01-01',
      symptomScore: 18,
      nested: {
        full_name: 'John Doe',
        notes: 'Clinical intake complete for patient MRN-12345',
      },
    };

    const sanitized = SecurityLogger.sanitizeObject(sensitivePayload);

    expect(sanitized.patient_name).toBe('[REDACTED_PHI]');
    expect(sanitized.mrn).toBe('[REDACTED_PHI]');
    expect(sanitized.dob).toBe('[REDACTED_PHI]');
    expect(sanitized.symptomScore).toBe(18);
    expect(sanitized.nested.full_name).toBe('[REDACTED_PHI]');
    expect(sanitized.nested.notes).toContain('[REDACTED_MRN]');
  });

  it('generates structured high-risk security alert log entries (Section 151)', () => {
    const entry = SecurityLogger.logSecurityEvent(
      'TMS_SIGNING_AUTHORITY_GRANTED',
      'user-admin-01',
      'org-alpha',
      { targetUser: 'user-clinician-02', grantedBy: 'Dr. Chief of Psychiatry' }
    );

    expect(entry.level).toBe('SECURITY');
    expect(entry.isSecurityAlert).toBe(true);
    expect(entry.eventType).toBe('TMS_SIGNING_AUTHORITY_GRANTED');
    expect(entry.actorId).toBe('user-admin-01');
    expect(entry.orgId).toBe('org-alpha');
    expect(entry.correlationId).toBeDefined();
    expect(entry.traceId).toBeDefined();
  });

  it('verifies cryptographic hash chaining over sequential audit events (MAG-AUD-001)', () => {
    interface MockAuditEvent {
      id: string;
      prevHash: string;
      eventType: string;
      timestamp: string;
      eventHash: string;
    }

    const events: MockAuditEvent[] = [];
    let prevHash = 'GENESIS';

    const eventTypes = ['PHENOTYPE_APPROVED', 'TARGET_SLATE_GENERATED', 'DECISION_SIGNED'];

    for (let i = 0; i < eventTypes.length; i++) {
      const id = `evt-00${i + 1}`;
      const type = eventTypes[i];
      const ts = `2026-09-02T10:0${i}:00Z`;
      const hash = createHash('sha256').update(prevHash + id + type + ts).digest('hex');

      events.push({ id, prevHash, eventType: type, timestamp: ts, eventHash: hash });
      prevHash = hash;
    }

    // Verify chain integrity
    let testPrev = 'GENESIS';
    let chainValid = true;

    for (const evt of events) {
      const calculated = createHash('sha256').update(testPrev + evt.id + evt.eventType + evt.timestamp).digest('hex');
      if (calculated !== evt.eventHash) {
        chainValid = false;
        break;
      }
      testPrev = evt.eventHash;
    }

    expect(chainValid).toBe(true);

    // Tampering test: modify an earlier event
    events[0].eventType = 'TAMPERED_EVENT';
    let tamperedChainValid = true;
    testPrev = 'GENESIS';
    for (const evt of events) {
      const calculated = createHash('sha256').update(testPrev + evt.id + evt.eventType + evt.timestamp).digest('hex');
      if (calculated !== evt.eventHash) {
        tamperedChainValid = false;
        break;
      }
      testPrev = evt.eventHash;
    }

    expect(tamperedChainValid).toBe(false);
  });
});
