import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        turbo: {
            resolveAlias: {
                // Fix for @magic-ext/oauth module resolution issues
                "@magic-ext/oauth": "@magic-ext/oauth/dist/es/index.mjs",
            },
        },
    },
    webpack: (config, { isServer }) => {
        // Handle magic packages module resolution
        config.resolve.alias = {
            ...config.resolve.alias,
            "@magic-ext/oauth": "@magic-ext/oauth/dist/es/index.mjs",
        };
        
        // Add fallback for missing modules
        config.resolve.fallback = {
            ...config.resolve.fallback,
            "crypto": false,
            "stream": false,
            "util": false,
        };
        
        return config;
    },
    // Disable turbo for problematic packages
    transpilePackages: ["@magic-ext/oauth"],
};

export default nextConfig;
