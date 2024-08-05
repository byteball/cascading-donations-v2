/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = async (phase, { defaultConfig }) => {
  // const nextConfig = {...};
  return {
    ...defaultConfig,
    eslint: {
      ignoreDuringBuilds: true,
    },
    experimental: {
      instrumentationHook: true,
      serverActions: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    headers: () => {
      return [
        {
          source: '/',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
            },
          ],
        },
      ];
    }
  };
}
