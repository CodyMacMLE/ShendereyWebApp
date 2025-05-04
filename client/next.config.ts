import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      'shenderey-app-images.s3.us-east-2.amazonaws.com',
      "shenderey-app-images.s3.amazonaws.com"
    ],
  },
};

export default nextConfig;
