/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // 👇 Add rewrites so /api calls hit Spring Boot in Docker
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://backend:8080/:path*',
      },
    ];
  },

  // 👇 Enable standalone build (for smaller Docker image)
  output: 'standalone',
};

export default nextConfig;
