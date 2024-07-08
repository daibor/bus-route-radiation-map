const withMDX = require('@next/mdx')();

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['ts', 'tsx', 'mdx'],
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    }
};

module.exports = withMDX(nextConfig);
