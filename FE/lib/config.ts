const config = {
  // Thay đổi 'localhost' thành '127.0.0.1' để ép kết nối qua IPv4
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3001',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
};

export default config;