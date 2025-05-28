import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.myshopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Remotion compatibility
  webpack: (config, { isServer }) => {
    // Handle Remotion's dependencies
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
    };

    // Exclude problematic files from bundling
    config.module.rules.push({
      test: /\.(md|txt|README)$/i,
      type: 'asset/source',
    });

    // Handle binary files and native modules
    config.module.rules.push({
      test: /\.(node|wasm)$/,
      type: 'asset/resource',
    });

    // Ignore Remotion server-side dependencies on client
    if (!isServer) {
      config.externals = [
        ...(config.externals || []),
        {
          '@remotion/bundler': '@remotion/bundler',
          '@remotion/renderer': '@remotion/renderer',
          '@remotion/cli': '@remotion/cli',
        },
      ];
    }

    // Ignore esbuild binaries and README files
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Failed to parse source map/,
      /Critical dependency: the request of a dependency is an expression/,
    ];

    return config;
  },
  // Server external packages for Remotion
  serverExternalPackages: [
    '@remotion/bundler',
    '@remotion/renderer',
    '@remotion/cli',
  ],
  // Transpile Remotion packages
  transpilePackages: [
    'remotion',
  ],
};

export default nextConfig;
