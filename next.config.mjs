/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['i.ytimg.com', 'yt3.ggpht.com'],
    unoptimized: true,
  },
  serverExternalPackages: ['@upstash/redis'],
}

export default nextConfig
