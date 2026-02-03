/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  transpilePackages: ["@wrbt/sdk", "@wrbt/types", "@wrbt/ui"]
};

export default nextConfig;
