import { PrismaClient } from '@prisma/client';

// Khai báo một biến global để lưu trữ instance của PrismaClient
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Kiểm tra xem đã có instance nào chưa, nếu chưa thì tạo mới
// Điều này giúp tránh tạo quá nhiều kết nối trong môi trường development (hot-reloading)
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Tùy chọn: log các query ra console
  });

// Gán instance vào biến global nếu đang ở môi trường development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
