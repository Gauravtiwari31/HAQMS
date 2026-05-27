/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    // Fix: Explicitly set root to the frontend directory to suppress workspace root warning
    root: import.meta.dirname,
  },
};

export default nextConfig;
