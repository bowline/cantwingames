/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://andycantwin.com/arcade/',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
