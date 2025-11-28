/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,

  reactStrictMode: true,
  images: {
    domains: ['flagcdn.com', 'flagcdn.io'] // ให้อนุญาตโดเมนรูปธง
  }
};

export default nextConfig;
