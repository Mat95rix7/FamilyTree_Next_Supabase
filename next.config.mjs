/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**', // autorise toutes les images de tous les dossiers
      },
    ],
  },
};

export default nextConfig;

