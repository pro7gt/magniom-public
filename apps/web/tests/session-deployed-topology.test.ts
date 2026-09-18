/**
 * @magniom/web - Deployed Topology Multi-Process Session Integration Test
 * Conforms to MAG-SEC-001 (Mandatory authentication), MAG-SEC-009 (Session Integrity),
 * and MAGNIOM Revision 06 Finding 2 & Finding 3.
 *
 * Exercises login, protected request authorization, and logout revocation
 * executing strictly across independent, isolated OS processes sharing a durable authority.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const TEST_DIR = path.join(process.cwd(), '.temp', 'test-deployed-topology');
const TEST_STORE_PATH = path.join(TEST_DIR, 'distributed-session-authority.json');

describe('Deployed Topology Multi-Process Session Authority', () => {
  beforeEach(() => {
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      try {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
      } catch {}
    }
  });

  it('SEC-TOPOLOGY-01: login in Process 1, validation in Process 2, revocation in Process 3, rejection in Process 4', () => {
    const env = {
      ...process.env,
      MAGNIOM_SESSION_SECRET: 'magniom-test-isolated-session-secret-key-at-least-32-chars',
      MAGNIOM_SESSION_STORE_PATH: TEST_STORE_PATH,
    };

    // Step 1: Process 1 performs Login and outputs token & jti
    const p1Script = `
      const { createSignedSessionToken } = require('./src/lib/security/session-crypto');
      const { registerServerSession } = require('./src/lib/server/session-registry');
      
      const token = createSignedSessionToken('usr-spec-001', {
        username: 'dr_asmith',
        expiresInSeconds: 3600,
      });
      const parts = token.split('.');
      const claims = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      registerServerSession({
        jti: claims.jti,
        userId: 'usr-spec-001',
        username: 'dr_asmith',
        organizationId: 'melb-tms-01',
        issuedAt: claims.iat,
        expiresAt: claims.exp,
        authAssuranceLevel: 'AAL2',
      });
      console.log(JSON.stringify({ token, jti: claims.jti }));
    `;

    const p1Output = execSync(`npx tsx -e "${p1Script.replace(/"/g, '\\"')}"`, {
      cwd: path.resolve(__dirname, '..'),
      env,
      stdio: ['pipe', 'pipe', 'inherit'],
    })
      .toString()
      .trim();

    const { token, jti } = JSON.parse(p1Output);
    expect(token).toBeDefined();
    expect(jti).toBeDefined();

    // Step 2: Process 2 (simulating edge gateway / downstream instance) verifies token
    const p2Script = `
      const { verifySessionTokenWithClaims } = require('./src/lib/security/session-crypto');
      const { isSessionRevoked } = require('./src/lib/server/session-registry');
      const { setGlobalSessionRevocationChecker } = require('./src/lib/security/session-crypto');
      
      setGlobalSessionRevocationChecker(isSessionRevoked);
      
      async function run() {
        const res = await verifySessionTokenWithClaims('${token}');
        console.log(JSON.stringify({ valid: res.valid, reason: res.reason }));
      }
      run();
    `;

    const p2Output = execSync(`npx tsx -e "${p2Script.replace(/"/g, '\\"')}"`, {
      cwd: path.resolve(__dirname, '..'),
      env,
      stdio: ['pipe', 'pipe', 'inherit'],
    })
      .toString()
      .trim();

    const p2Res = JSON.parse(p2Output);
    expect(p2Res.valid).toBe(true);

    // Step 3: Process 3 (separate worker / API instance) performs Logout and revokes session
    const p3Script = `
      const { revokeSession } = require('./src/lib/server/session-registry');
      const success = revokeSession('${jti}', 'CLINICIAN_LOGOUT');
      console.log(JSON.stringify({ revoked: success }));
    `;

    const p3Output = execSync(`npx tsx -e "${p3Script.replace(/"/g, '\\"')}"`, {
      cwd: path.resolve(__dirname, '..'),
      env,
      stdio: ['pipe', 'pipe', 'inherit'],
    })
      .toString()
      .trim();

    const p3Res = JSON.parse(p3Output);
    expect(p3Res.revoked).toBe(true);

    // Step 4: Process 4 (fresh gateway process) immediately rejects the revoked token
    const p4Script = `
      const { verifySessionTokenWithClaims } = require('./src/lib/security/session-crypto');
      const { isSessionRevoked } = require('./src/lib/server/session-registry');
      const { setGlobalSessionRevocationChecker } = require('./src/lib/security/session-crypto');
      
      setGlobalSessionRevocationChecker(isSessionRevoked);
      
      async function run() {
        const res = await verifySessionTokenWithClaims('${token}');
        console.log(JSON.stringify({ valid: res.valid, reason: res.reason }));
      }
      run();
    `;

    const p4Output = execSync(`npx tsx -e "${p4Script.replace(/"/g, '\\"')}"`, {
      cwd: path.resolve(__dirname, '..'),
      env,
      stdio: ['pipe', 'pipe', 'inherit'],
    })
      .toString()
      .trim();

    const p4Res = JSON.parse(p4Output);
    expect(p4Res.valid).toBe(false);
    expect(p4Res.reason).toBe('REVOKED');
  });

  it('SEC-TOPOLOGY-02: unknown token generated out-of-band strictly fails closed in isolated process', () => {
    const env = {
      ...process.env,
      MAGNIOM_SESSION_SECRET: 'magniom-test-isolated-session-secret-key-at-least-32-chars',
      MAGNIOM_SESSION_STORE_PATH: TEST_STORE_PATH,
    };

    // Validly signed with correct secret, but never registered in the distributed authority
    const pScript = `
      const { createSignedSessionToken, verifySessionTokenWithClaims, setGlobalSessionRevocationChecker } = require('./src/lib/security/session-crypto');
      const { isSessionRevoked } = require('./src/lib/server/session-registry');
      
      setGlobalSessionRevocationChecker(isSessionRevoked);
      
      async function run() {
        const token = createSignedSessionToken('usr-spoof-001', {
          username: 'attacker',
          registerSession: false,
        });
        const res = await verifySessionTokenWithClaims(token);
        console.log(JSON.stringify({ valid: res.valid, reason: res.reason }));
      }
      run();
    `;

    const pOutput = execSync(`npx tsx -e "${pScript.replace(/"/g, '\\"')}"`, {
      cwd: path.resolve(__dirname, '..'),
      env,
      stdio: ['pipe', 'pipe', 'inherit'],
    })
      .toString()
      .trim();

    const pRes = JSON.parse(pOutput);
    expect(pRes.valid).toBe(false);
    expect(pRes.reason).toBe('REVOKED');
  });
});
