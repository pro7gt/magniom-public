/**
 * @magniom/web - Web Crypto HMAC-SHA256 Session Token Engine
 * Conforms to MAG-SEC-001 (Mandatory authentication) and MAG-SEC-009 (Session Integrity).
 *
 * Implements tamper-evident, cryptographically signed clinician session tokens
 * verified at the edge (Next.js Edge Middleware) and Node.js runtime using
 * the standard Web Crypto API.
 */

import { isSessionRevoked, registerServerSession } from '../server/session-registry';

export interface SessionClaims {
  readonly sub: string; // userId
  readonly username?: string | undefined; // clinician username (e.g. dr_asmith, magniom_spec)
  readonly iat: number; // issued at (unix seconds)
  readonly exp: number; // expiration (unix seconds)
  readonly jti: string; // cryptographically secure random session ID
  readonly role?: string | undefined;
  readonly orgId?: string | undefined;
  readonly iss: string; // 'magniom-authority'
  readonly aud: string; // 'magniom-workstation'
}

export interface SessionVerificationResult {
  readonly valid: boolean;
  readonly claims?: SessionClaims;
  readonly reason?:
    | 'INVALID_FORMAT'
    | 'SIGNATURE_MISMATCH'
    | 'EXPIRED'
    | 'CRYPTO_ERROR'
    | 'REVOKED'
    | 'UNKNOWN_SESSION';
}

/**
 * Retrieves the authoritative session secret.
 * Enforces fail-fast startup: throws if MAGNIOM_SESSION_SECRET is missing or weak,
 * except in isolated automated test runners where a dedicated test secret is provided.
 */
export function getSessionSecret(): string {
  const secret = typeof process !== 'undefined' ? process.env?.MAGNIOM_SESSION_SECRET : undefined;
  if (!secret) {
    const isTest =
      typeof process !== 'undefined' &&
      (process.env?.NODE_ENV === 'test' || Boolean(process.env?.VITEST));
    if (isTest) {
      return 'magniom-test-isolated-session-secret-key-at-least-32-chars';
    }
    throw new Error(
      'CRITICAL SECURITY ERROR: MAGNIOM_SESSION_SECRET environment variable is missing. ' +
        'Workstation server cannot start or verify sessions without an authoritative secret key.',
    );
  }
  if (secret.length < 32) {
    throw new Error(
      'CRITICAL SECURITY ERROR: MAGNIOM_SESSION_SECRET must be at least 32 characters long ' +
        'to prevent brute-force attacks against HMAC-SHA256 session signatures.',
    );
  }
  return secret;
}

/**
 * Derives a CryptoKey for HMAC-SHA256 operations via Web Crypto API.
 */
async function getWebCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

/**
 * Converts a hex string into a Uint8Array.
 */
function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.trim().toLowerCase();
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Converts an ArrayBuffer / Uint8Array into a lowercase hex string.
 */
function bytesToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += (bytes[i] ?? 0).toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Base64URL string encoder (RFC 4648 §5).
 */
export function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Base64URL string decoder (RFC 4648 §5).
 */
export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Universal raw SHA-256 computation over Uint8Array (RFC 6234).
 */
function sha256Uint8(bytes: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const bitLength = bytes.length * 8;
  const paddingLength =
    bytes.length % 64 < 56 ? 56 - (bytes.length % 64) : 120 - (bytes.length % 64);
  const totalLength = bytes.length + paddingLength + 8;
  const padded = new Uint8Array(totalLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(totalLength - 4, bitLength >>> 0, false);
  view.setUint32(totalLength - 8, Math.floor(bitLength / 0x100000000), false);

  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a;
  let h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let i = 0; i < totalLength; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, false);
    }
    for (let j = 16; j < 64; j++) {
      const s0 =
        (((w[j - 15]! >>> 7) | (w[j - 15]! << 25)) ^
          ((w[j - 15]! >>> 18) | (w[j - 15]! << 14)) ^
          (w[j - 15]! >>> 3)) >>>
        0;
      const s1 =
        (((w[j - 2]! >>> 17) | (w[j - 2]! << 15)) ^
          ((w[j - 2]! >>> 19) | (w[j - 2]! << 13)) ^
          (w[j - 2]! >>> 10)) >>>
        0;
      w[j] = (w[j - 16]! + s0 + w[j - 7]! + s1) >>> 0;
    }

    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;

    for (let j = 0; j < 64; j++) {
      const S1 =
        (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + ch + K[j]! + w[j]!) >>> 0;
      const S0 =
        (((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const result = new Uint8Array(32);
  const resView = new DataView(result.buffer);
  resView.setUint32(0, h0, false);
  resView.setUint32(4, h1, false);
  resView.setUint32(8, h2, false);
  resView.setUint32(12, h3, false);
  resView.setUint32(16, h4, false);
  resView.setUint32(20, h5, false);
  resView.setUint32(24, h6, false);
  resView.setUint32(28, h7, false);
  return result;
}

/**
 * Computes standard RFC 2104 HMAC-SHA256 synchronously across all JS runtimes.
 */
export function computeHmacSha256Sync(keyStr: string, messageStr: string): string {
  const enc = new TextEncoder();
  let keyBytes: Uint8Array = enc.encode(keyStr);
  if (keyBytes.length > 64) {
    keyBytes = sha256Uint8(keyBytes);
  }

  const kPadded = new Uint8Array(64);
  kPadded.set(keyBytes);

  const iPad = new Uint8Array(64);
  const oPad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    iPad[i] = (kPadded[i] ?? 0) ^ 0x36;
    oPad[i] = (kPadded[i] ?? 0) ^ 0x5c;
  }

  const msgBytes = enc.encode(messageStr);
  const innerInput = new Uint8Array(64 + msgBytes.length);
  innerInput.set(iPad, 0);
  innerInput.set(msgBytes, 64);
  const innerHash = sha256Uint8(innerInput);

  const outerInput = new Uint8Array(64 + 32);
  outerInput.set(oPad, 0);
  outerInput.set(innerHash, 64);
  const outerHash = sha256Uint8(outerInput);

  return bytesToHex(outerHash);
}

/**
 * Signs a session payload with HMAC-SHA256 synchronously, returning `${payload}.${signature}`.
 */
export function signSessionTokenSync(payload: string, secret?: string): string {
  const effectiveSecret = secret ?? getSessionSecret();
  const signature = computeHmacSha256Sync(effectiveSecret, payload);
  return `${payload}.${signature}`;
}

/**
 * Generates cryptographically secure random identifier bytes.
 */
export function generateCryptographicNonce(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
  }
  try {
    const nodeCrypto = require('node:crypto');
    return nodeCrypto.randomBytes(byteLength).toString('hex');
  } catch {
    throw new Error(
      'Cryptographically secure random source unavailable; cannot generate secure session nonce.',
    );
  }
}

/**
 * Creates an authoritative, tamper-evident clinician session token with structured claims.
 */
export function createSignedSessionToken(
  userId = 'usr-spec-001',
  options: {
    expiresInSeconds?: number;
    role?: string;
    orgId?: string;
    username?: string;
    secret?: string;
    registerSession?: boolean;
  } = {},
): string {
  const nowSec = Math.floor(Date.now() / 1000);
  const ttl = options.expiresInSeconds ?? 3600; // default 1 hour expiration
  const jti = generateCryptographicNonce(16);
  const claims: SessionClaims = {
    sub: userId,
    ...(options.username !== undefined ? { username: options.username } : {}),
    iat: nowSec,
    exp: nowSec + ttl,
    jti,
    role: options.role ?? 'TMS Specialist & Clinical Reviewer',
    orgId: options.orgId ?? 'melb-tms-01',
    iss: 'magniom-authority',
    aud: 'magniom-workstation',
  };

  const payloadStr = base64UrlEncode(JSON.stringify(claims));
  const effectiveSecret = options.secret ?? getSessionSecret();
  const token = signSessionTokenSync(payloadStr, effectiveSecret);

  if (options.registerSession !== false) {
    registerServerSession({
      jti,
      userId,
      username: options.username ?? (userId === 'usr-spec-002' ? 'magniom_spec' : 'dr_asmith'),
      organizationId: options.orgId ?? 'melb-tms-01',
      issuedAt: nowSec,
      expiresAt: nowSec + ttl,
      authAssuranceLevel: 'AAL2',
    });
  }

  return token;
}

/**
 * Verifies an HMAC-SHA256 session token, checking signature, structure, and expiration.
 */
export async function verifySessionTokenWithClaims(
  token: string | undefined | null,
  secret?: string,
  options?: { checkRevocation?: boolean },
): Promise<SessionVerificationResult> {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'INVALID_FORMAT' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: 'INVALID_FORMAT' };
  }

  const [payloadBase64, sigHex] = parts;
  if (!payloadBase64 || !sigHex || sigHex.length !== 64) {
    return { valid: false, reason: 'INVALID_FORMAT' };
  }

  const effectiveSecret = secret ?? getSessionSecret();

  // 1. Verify HMAC signature via Web Crypto API
  try {
    const key = await getWebCryptoKey(effectiveSecret);
    const enc = new TextEncoder();
    const sigBytes = hexToBytes(sigHex);
    const isValidSignature = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(payloadBase64) as unknown as BufferSource,
    );

    if (!isValidSignature) {
      return { valid: false, reason: 'SIGNATURE_MISMATCH' };
    }
  } catch {
    return { valid: false, reason: 'CRYPTO_ERROR' };
  }

  // 2. Decode claims and verify expiration and authority
  try {
    const jsonStr = base64UrlDecode(payloadBase64);
    const claims = JSON.parse(jsonStr) as SessionClaims;
    const nowSec = Math.floor(Date.now() / 1000);

    if (typeof claims.exp !== 'number' || claims.exp <= nowSec) {
      return { valid: false, reason: 'EXPIRED' };
    }

    if (claims.iss !== 'magniom-authority' || claims.aud !== 'magniom-workstation') {
      return { valid: false, reason: 'INVALID_FORMAT' };
    }

    // Fail-closed session authority verification: token must possess valid jti and be actively registered
    if (options?.checkRevocation ?? true) {
      if (!claims.jti || isSessionRevoked(claims.jti)) {
        return { valid: false, reason: 'REVOKED' };
      }
    }

    return { valid: true, claims };
  } catch {
    return { valid: false, reason: 'INVALID_FORMAT' };
  }
}

/**
 * Computes a one-way deterministic non-reversible audit hash of a jti.
 * Guarantees live bearer tokens and signatures never enter audit logs.
 */
export function hashJtiForAudit(jti: string): string {
  if (!jti) return 'unknown';
  return computeHmacSha256Sync('magniom-audit-salt-2026', `jti:${jti}`).slice(0, 16);
}

/**
 * Verifies session token returning a boolean (standard Edge Middleware interface).
 */
export async function verifySessionToken(
  token: string | undefined | null,
  secret?: string,
): Promise<boolean> {
  const result = await verifySessionTokenWithClaims(token, secret);
  return result.valid;
}

/**
 * Parses and extracts payload and signature from a signed token without verification.
 */
export function parseSignedSessionToken(
  token: string,
): { payload: string; signature: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { payload: parts[0], signature: parts[1] };
}
