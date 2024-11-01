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
    ];
  },
}

module.exports = nextConfig