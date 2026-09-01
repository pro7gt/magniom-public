import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@magniom/domain',
    '@magniom/schemas',
    '@magniom/phenotype',
    '@magniom/evidence',
    '@magniom/target-engine',
    '@magniom/scientific-policy',
    '@magniom/presentation',
    '@magniom/ui',
    '@magniom/test-fixtures',
  ],
};

export default nextConfig;
