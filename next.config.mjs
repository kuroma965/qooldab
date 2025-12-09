/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // อนุญาตทุก subdomain ของ pic.in.th เช่น img1.pic.in.th, img5.pic.in.th
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.pic.in.th', // ✅ wildcard subdomain ทั้งหมด
        // ถ้าอยากระบุ path ให้แคบลงก็ใส่ได้ เช่น pathname: '/file/**'
      },
      {
        protocol: 'https',
        hostname: 'pic.in.th', // เผื่อกรณีไม่มี subdomain เลย
      },
    ],
  },
};

export default nextConfig;
