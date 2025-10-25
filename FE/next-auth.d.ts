import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

// Mở rộng kiểu dữ liệu JWT mặc định
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string; // Thêm id người dùng vào JWT
    role: string; // Thêm vai trò người dùng vào JWT
  }
}

// Mở rộng kiểu dữ liệu Session mặc định
declare module "next-auth" {
  interface Session {
    user: {
      id: string; // Thêm id vào user trong session
      role: string; // Thêm role vào user trong session
    } & DefaultSession["user"]; // Giữ lại các trường mặc định (name, email, image)
  }

  // Mở rộng kiểu dữ liệu User mặc định (đối tượng trả về từ authorize hoặc signIn)
  interface User extends DefaultUser {
    role: string; // Thêm role vào đối tượng User
  }
}

