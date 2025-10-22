/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
  // Deshabilitar generación estática para permitir interactividad
  experimental: {
    isrMemoryCacheSize: 0,
  },
}

export default nextConfig
