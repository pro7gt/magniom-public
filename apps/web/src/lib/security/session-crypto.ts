/**
 * @magniom/web - Web Crypto HMAC-SHA256 Session Token Engine
 * Conforms to MAG-SEC-001, MAG-SEC-009, HIPAA § 164.312(a)(1), and 21 CFR Part 11.
 *
 * Implements tamper-evident, cryptographically signed clinician session tokens
 * verified at the edge (Next.js Edge Middleware) using the standard Web Crypto API.
 */

export const DEFAULT_SESSION_SECRET =
  (typeof process !== 'undefined' && process.env?.MAGNIOM_SESSION_SECRET) ||
  'magniom-clinical-session-hmac-sha256-secret-key-2026';

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
export function signSessionTokenSync(payload: string, secret = DEFAULT_SESSION_SECRET): string {
  const signature = computeHmacSha256Sync(secret, payload);
  return `${payload}.${signature}`;
}

/**
 * Signs a session payload using Web Crypto API.
 */
export async function signSessionToken(
  payload: string,
  secret = DEFAULT_SESSION_SECRET,
): Promise<string> {
  const key = await getWebCryptoKey(secret);
  const enc = new TextEncoder();
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return `${payload}.${bytesToHex(sigBuffer)}`;
}

/**
 * Verifies an HMAC-SHA256 session token using the standard Web Crypto API (for Next.js Edge Middleware).
 * Returns true if and only if the token has valid structure and cryptographic signature matches.
 */
export async function verifySessionToken(
  token: string | undefined | null,
  secret = DEFAULT_SESSION_SECRET,
): Promise<boolean> {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [payload, sigHex] = parts;
  if (!payload || !sigHex || sigHex.length !== 64) {
    return false;
  }

  try {
    const key = await getWebCryptoKey(secret);
    const enc = new TextEncoder();
    const sigBytes = hexToBytes(sigHex);
    return await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(payload) as unknown as BufferSource,
    );
  } catch {
    return false;
  }
}

/**
 * Generates an authoritative, tamper-evident clinician session token.
 */
export function createSignedSessionToken(
  userId = 'usr-spec-001',
  secret = DEFAULT_SESSION_SECRET,
): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  const rawPayload = `mgn-sess-${userId}-${timestamp}-${randomSuffix}`;
  return signSessionTokenSync(rawPayload, secret);
}

/**
 * Parses and extracts the payload and signature from a signed session token.
 */
export function parseSignedSessionToken(
  token: string,
): { payload: string; signature: string } | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return { payload: parts[0], signature: parts[1] };
}
