import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/innovator", destination: "/dashboard", permanent: false },
      { source: "/investor", destination: "/dashboard", permanent: false },
      { source: "/innovator/projects", destination: "/dashboard/projects", permanent: false },
      { source: "/innovator/projects/new", destination: "/dashboard/projects/new", permanent: false },
      {
        source: "/innovator/projects/:path*",
        destination: "/dashboard/projects/:path*",
        permanent: false,
      },
      { source: "/innovator/messages", destination: "/dashboard/messages", permanent: false },
      { source: "/innovator/profile", destination: "/dashboard/profile", permanent: false },
      { source: "/investor/portfolio", destination: "/dashboard/portfolio", permanent: false },
      { source: "/investor/messages", destination: "/dashboard/messages", permanent: false },
      { source: "/investor/profile", destination: "/dashboard/profile", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
