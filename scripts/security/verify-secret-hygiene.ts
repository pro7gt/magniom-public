/**
 * Secret Hygiene & Credential Leakage Scanner
 * Static analysis scanner detecting accidental leaks of service role keys, DB passwords, or private keys
 * Conforms to MAG-SEC-009, MAG-SEC-028, and Section 90 of Technical Architecture
 */

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';

interface SecretLeakFinding {
  filePath: string;
  line: number;
  pattern: string;
  snippet: string;
}

export class SecretHygieneScanner {
  private repoRoot: string;
  private leakPatterns: Array<{ name: string; regex: RegExp }>;

  constructor(repoRoot: string = resolve(process.cwd())) {
    this.repoRoot = repoRoot;
    this.leakPatterns = [
      {
        name: 'Supabase Service Role Key',
        regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{20,}/,
      },
      {
        name: 'Hardcoded Postgres Password',
        regex: /postgres:\/\/[a-zA-Z0-9_-]+:[a-zA-Z0-9_!@#$%^&*()+=]+@/,
      },
      { name: 'Private Key Block', regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
      { name: 'AWS Secret Access Key', regex: /aws_secret_access_key\s*=\s*[A-Za-z0-9\/+=]{40}/ },
    ];
  }

  public scanDirectory(dir: string, findings: SecretLeakFinding[] = []): SecretLeakFinding[] {
    const ignoredDirs = ['.git', 'node_modules', '.turbo', '.venv', 'dist', 'build', '.next'];
    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!ignoredDirs.includes(entry)) {
          this.scanDirectory(fullPath, findings);
        }
      } else if (stat.isFile()) {
        const allowedExts = [
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.json',
          '.md',
          '.sql',
          '.toml',
          '.env.example',
        ];
        if (allowedExts.some(ext => entry.endsWith(ext))) {
          this.scanFile(fullPath, findings);
        }
      }
    }

    return findings;
  }

  private scanFile(filePath: string, findings: SecretLeakFinding[]): void {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of this.leakPatterns) {
        if (pattern.regex.test(line)) {
          findings.push({
            filePath: filePath.replace(this.repoRoot + '/', ''),
            line: i + 1,
            pattern: pattern.name,
            snippet: line.trim().slice(0, 80),
          });
        }
      }
    }
  }
}

// Direct CLI Execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const scanner = new SecretHygieneScanner();
  const repoRoot = resolve(process.cwd());
  const findings = scanner.scanDirectory(repoRoot);

  console.log('\n============================================================');
  console.log('       MAGNIOM STATIC SECRET HYGIENE & LEAK SCANNER        ');
  console.log('============================================================\n');

  const reportPath = join(repoRoot, 'docs/security/secret-hygiene-report.json');
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(
    reportPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        scannedRules: ['MAG-SEC-009', 'MAG-SEC-028'],
        status: findings.length === 0 ? 'PASS' : 'FAIL',
        totalFindings: findings.length,
        findings,
      },
      null,
      2,
    ),
    'utf-8',
  );

  if (findings.length === 0) {
    console.log('✓ PASS: Zero hardcoded secrets, service keys, or private certificates detected.');
    console.log(
      '  Scanned apps, packages, services, and docs according to MAG-SEC-009 & MAG-SEC-028.',
    );
    console.log(`  Report saved to: ${reportPath}`);
    process.exit(0);
  } else {
    console.error(`✗ FAIL: ${findings.length} potential secret leak(s) detected:`);
    for (const f of findings) {
      console.error(`  - [${f.pattern}] in ${f.filePath}:${f.line}`);
      console.error(`    Snippet: ${f.snippet}\n`);
    }
    process.exit(1);
  }
}
