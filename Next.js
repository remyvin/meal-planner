/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force toutes les requêtes en HTTPS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
        ],
      },
    ]
  },
  // Rediriger HTTP vers HTTPS
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?!localhost).*',
          }
        ],
        destination: 'https://:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig