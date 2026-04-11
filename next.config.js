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
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    webpack: (config, { webpack }) => {
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /\.less$/,
        })
      );
      return config;
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
