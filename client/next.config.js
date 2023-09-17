/** @type {import('next').NextConfig} */

const rewrites = async () => {
  return [
    {
      source: "/bi/:path*",
      destination: `${process.env.BASE_URL}/:path*`,
    },
  ]
};

const nextConfig = {
  reactStrictMode: true,
  rewrites
};

module.exports = nextConfig
