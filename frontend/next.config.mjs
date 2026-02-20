/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all for now during development as user requests "sare news" which might come from various sources
      },
    ],
  },
};

export default nextConfig;
