import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth"; 
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import config from "@/lib/config";

export const authOptions: NextAuthOptions = { 
  // adapter: PrismaAdapter(prisma), // <- ĐÃ XÓA
  session: {
    strategy: "jwt", // Sử dụng JWT (JSON Web Tokens)
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // --- GỌI API ĐĂNG NHẬP CỦA LARAVEL ---
        if (!credentials) {
          return null; // Thiếu thông tin đăng nhập
        }

        try {
          // Gọi API đăng nhập của Laravel
          const loginResponse = await fetch(`${config.apiBaseUrl}/api/login`, { // Sử dụng apiBaseUrl từ config
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json', // Laravel thường cần header này
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          // Kiểm tra nếu login không thành công (vd: sai pass, user không tồn tại)
          if (!loginResponse.ok) {
             console.error("Laravel login failed:", loginResponse.status, await loginResponse.text());
             // Bạn có thể throw error cụ thể hơn dựa trên status code
             // Ví dụ: if (loginResponse.status === 401) throw new Error("Invalid credentials");
             return null; // Trả về null khi đăng nhập thất bại (NextAuth sẽ báo lỗi "Invalid credentials")
          }

          // Lấy dữ liệu trả về từ Laravel (bao gồm user và token)
          const data = await loginResponse.json();

          // Kiểm tra xem có user trong response không
          if (data && data.user) {
             // Laravel trả về user object bên trong key 'user'
             const user = data.user;

             // Quan trọng: Trả về object user với các trường NextAuth cần
             // Đảm bảo các tên trường khớp (id, name, email, role nếu có)
             return {
               id: user.id.toString(), // Chuyển id sang string nếu cần
               name: user.name,
               email: user.email,
               role: user.role ?? "user", // Lấy role từ Laravel, mặc định là 'user' nếu không có
               // Bạn có thể thêm access_token vào đây nếu muốn nó có trong JWT
               // accessToken: data.access_token
             };
          } else {
            // Trường hợp response không có user data
            console.error("Laravel login response missing user data:", data);
            return null;
          }

        } catch (error) {
           console.error("Error calling Laravel login API:", error);
           return null; // Trả về null nếu có lỗi mạng hoặc lỗi khác
        }
        // --- KẾT THÚC FETCH ---

      },
    }),
  ],
  callbacks: {
    // Callback signIn cho Google Provider (có thể cần gọi API Laravel để tạo user nếu chưa có)
    async signIn({ user, account, profile, email, credentials }) {
      if (account?.provider === "google") {
        // TÙY CHỌN: Gọi API Laravel để kiểm tra/tạo user từ Google login
        // Ví dụ: fetch(`${config.apiBaseUrl}/api/auth/google/callback`, { ... body: profile ... })
        // Nếu API Laravel xử lý thành công thì return true, ngược lại return false hoặc URL lỗi
         const email = profile?.email;
         if (!email) {
            console.error("Google profile missing email");
            return false; // Hoặc chuyển hướng đến trang lỗi
         }
         // Tạm thời luôn cho phép đăng nhập Google, bạn cần hoàn thiện logic gọi API BE sau
      }
      return true; // Cho phép đăng nhập Credentials (đã xử lý ở authorize)
    },
     // Callback JWT để thêm role và id vào token
     // File FE/next-auth.d.ts sẽ báo cho TS biết token có thể chứa id và role
     async jwt({ token, user }) {
      // Khi đăng nhập thành công (lần đầu), user object sẽ có mặt (từ authorize hoặc signIn)
      // Chú ý: user object này chỉ tồn tại trong lần gọi đầu tiên sau khi đăng nhập
      if (user) {
        token.id = user.id;
        token.role = user.role; // Lấy role từ User object (đã mở rộng type)
        // Nếu bạn thêm accessToken vào user object trong authorize:
        // token.accessToken = (user as any).accessToken;
      }
      return token;
    },
    // Callback session để thêm role và id vào session object cho client sử dụng
    // Dữ liệu từ token (ở callback jwt) được truyền vào đây
    // File FE/next-auth.d.ts sẽ báo cho TS biết session.user có thể chứa id và role
    async session({ session, token }) {
      if (token && session.user) {
        // Gán thêm thông tin từ token vào session.user
        session.user.id = token.id; // Lấy id từ token
        session.user.role = token.role; // Lấy role từ token
        // Nếu bạn thêm accessToken vào token trong jwt callback:
        // session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // Trang đăng nhập tùy chỉnh của bạn
    // error: '/auth/error', // (optional) Trang hiển thị lỗi xác thực
  },
  secret: process.env.NEXTAUTH_SECRET, // Đảm bảo bạn đã set biến này trong .env
  debug: process.env.NODE_ENV === 'development', // Bật debug log khi ở môi trường dev
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

