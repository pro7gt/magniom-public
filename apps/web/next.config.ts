import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  reactStrictMode: true,
  serverExternalPackages: ['zod'],
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
  webpack: (config, { isServer, webpack }) => {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
        resource.request = resource.request.replace(/^node:/, '');
      }),
    );

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        fs: false,
        path: false,
        os: false,
        stream: false,
        buffer: false,
      };
    }
    return config;
  },
};

export default nextConfig;
