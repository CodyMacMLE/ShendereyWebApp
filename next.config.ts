import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shenderey-app-images.s3.us-east-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'shenderey-app-images.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'shenderey-app-images.s3.us-east-2.amazonaws.com',
      },
    ],
  },
  serverExternalPackages: ['fluent-ffmpeg'],
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
