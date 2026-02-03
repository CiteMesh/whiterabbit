import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    turbo: {
      root: resolve(__dirname, '../..'),
    },
  },
  transpilePackages: ["@wrbt/sdk", "@wrbt/types", "@wrbt/ui"]
};

export default nextConfig;
