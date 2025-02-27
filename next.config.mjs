/** @type {import('next').NextConfig} */

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  "src/i18n/request.ts"
);

const nextConfig = {
  output: 'standalone',
  env: {
    API_ENDPOINT: process.env.API_ENDPOINT,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/signin',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
