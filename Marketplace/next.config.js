/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // Les images Jumia seront téléchargées localement, mais on garde pour compatibilité temporaire
      {
        protocol: 'https',
        hostname: 'sn.jumia.is',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
