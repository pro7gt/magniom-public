import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    system: 'Magniom Decision Support Platform',
    version: '0.1.0-alpha',
    mode: process.env.MAGNIOM_MODE || 'RESEARCH',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    architecture: {
      domainCore: 'pure-typescript',
      database: 'supabase-postgres',
      computePlane: 'isolated-container',
    },
    checks: {
      api: 'ok',
      domainSchemas: 'ok',
      policyRelease: 'ok',
    },
  });
}
