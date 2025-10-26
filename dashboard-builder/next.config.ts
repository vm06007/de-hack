import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: false,
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '5000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'octopus-app-szca5.ondigitalocean.app',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'github.com',
                pathname: '/**',
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: '/images/:path*',
                destination: '/images/:path*',
            },
        ];
    },
    webpack: (config) => {
        // Add fallback for node modules that aren't available in the browser
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "crypto": false,
            "stream": false,
            "assert": false,
            "http": false,
            "https": false,
            "os": false,
            "url": false,
            "zlib": false,
            "util": false,
        };

        // Fix for Coinbase Wallet SDK preact dependency
        config.resolve.alias = {
            ...config.resolve.alias,
            "preact/dist/preact.js": require.resolve("preact"),
            "preact/hooks": require.resolve("preact/hooks"),
            "preact": require.resolve("preact"),
        };

        return config;
    },
};

export default nextConfig;
