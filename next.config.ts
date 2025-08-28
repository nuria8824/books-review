import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // Portadas “clásicas”
      { protocol: "https", hostname: "books.googleusercontent.com" },
      // Portadas vía /books/content
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "http",  hostname: "books.google.com" },
    ],
  },
};

export default nextConfig;