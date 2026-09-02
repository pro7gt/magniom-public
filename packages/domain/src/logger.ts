/**
 * Structured Security Logger & HIPAA/GDPR PHI Redaction Engine
 * Conforms to MAG-SEC-030, MAG-SEC-031, MAG-SEC-032, MAG-SEC-033, MAG-SEC-034
 * and Sections 150 & 151 of Database & Security Specification v1.0
 */

import { randomUUID } from 'node:crypto';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';

export type HighRiskSecurityEvent =
  | 'TMS_SIGNING_AUTHORITY_GRANTED'
  | 'TMS_SIGNING_AUTHORITY_REVOKED'
  | 'ROLE_GRANTED'
  | 'ROLE_REVOKED'
  | 'EVIDENCE_LIBRARY_ACTIVATED'
  | 'TARGET_ENGINE_ACTIVATED'
  | 'NORMATIVE_MODEL_ACTIVATED'
  | 'SCIENTIFIC_POLICY_ACTIVATED'
  | 'BREAK_GLASS_ACCESS_GRANTED'
  | 'CROSS_TENANT_ACCESS_DENIED';

export interface StructuredLogEntry {
  timestamp: string;
  level: LogLevel;
  correlationId: string;
  traceId: string;
  actorId?: string | undefined;
  orgId?: string | undefined;
  eventType?: string | undefined;
  message: string;
  metadata?: Record<string, unknown> | undefined;
  isSecurityAlert?: boolean | undefined;
}

export class SecurityLogger {
  private static phiRedactionRules: Array<{ pattern: RegExp; replacement: string }> = [
    // MRN patterns e.g. MRN-12345, MRN: 998877
    { pattern: /\bMRN[-\s:]*[A-Za-z0-9-]{4,}\b/gi, replacement: '[REDACTED_MRN]' },
    // Email patterns
    {
      pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      replacement: '[REDACTED_EMAIL]',
    },
    // Phone numbers
    {
      pattern: /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      replacement: '[REDACTED_PHONE]',
    },
    // Patient name key/value pairs
    {
      pattern: /("?(?:patient_name|full_name|patientName)"?\s*[:=]\s*)"[^"]+"/gi,
      replacement: '$1"[REDACTED_NAME]"',
    },
    // Dates of birth
    {
      pattern: /("?(?:dob|date_of_birth|birthDate)"?\s*[:=]\s*)"[^"]+"/gi,
      replacement: '$1"[REDACTED_DOB]"',
    },
  ];

  public static redactPHI(text: string): string {
    if (!text) return text;
    let sanitized = text;
    for (const rule of this.phiRedactionRules) {
      sanitized = sanitized.replace(rule.pattern, rule.replacement);
    }
    return sanitized;
  }

  public static sanitizeObject(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return this.redactPHI(obj);
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: Record<string, unknown> = {};
    const restrictedKeys = new Set([
      'patient_name',
      'full_name',
      'patientName',
      'mrn',
      'ssn',
      'dob',
      'date_of_birth',
    ]);

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (restrictedKeys.has(key.toLowerCase())) {
        sanitized[key] = '[REDACTED_PHI]';
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else if (typeof value === 'string') {
        sanitized[key] = this.redactPHI(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  public static createLogEntry(
    level: LogLevel,
    message: string,
    context?: {
      correlationId?: string | undefined;
      traceId?: string | undefined;
      actorId?: string | undefined;
      orgId?: string | undefined;
      eventType?: string | undefined;
      metadata?: Record<string, unknown> | undefined;
    },
  ): StructuredLogEntry {
    const sanitizedMsg = this.redactPHI(message);
    const sanitizedMetadata = context?.metadata
      ? (this.sanitizeObject(context.metadata) as Record<string, unknown>)
      : undefined;

    return {
      timestamp: new Date().toISOString(),
      level,
      correlationId: context?.correlationId || `corr-${randomUUID().slice(0, 8)}`,
      traceId: context?.traceId || `tr-${randomUUID().slice(0, 12)}`,
      actorId: context?.actorId,
      orgId: context?.orgId,
      eventType: context?.eventType,
      message: sanitizedMsg,
      metadata: sanitizedMetadata,
      isSecurityAlert: level === 'SECURITY',
    };
  }

  public static logSecurityEvent(
    event: HighRiskSecurityEvent,
    actorId: string,
    orgId: string,
    details: Record<string, any>,
  ): StructuredLogEntry {
    return this.createLogEntry('SECURITY', `High-Risk Security Event: ${event}`, {
      actorId,
      orgId,
      eventType: event,
      metadata: details,
    });
  }
}
