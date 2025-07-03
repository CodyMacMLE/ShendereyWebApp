import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'shenderey-app-images.s3.us-east-2.amazonaws.com',
      'shenderey-app-images.s3.amazonaws.com',
      'shenderey-app-images.s3.us-east-2.amazonaws.com'
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
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
