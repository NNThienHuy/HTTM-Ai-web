import { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const LARAVEL_API_LOGIN_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`;

interface LaravelUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface LaravelLoginResponse {
  user: LaravelUser;
  token: string;
  message?: string;
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập email và mật khẩu");
        }

        try {
          const res = await fetch(LARAVEL_API_LOGIN_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const responseData: LaravelLoginResponse = await res.json();

          if (!res.ok) {
            throw new Error(responseData.message || "Email hoặc mật khẩu không đúng");
          }
          
          if (responseData.user && responseData.token) {
            return {
              id: responseData.user.id.toString(),
              name: responseData.user.name,
              email: responseData.user.email,
              role: responseData.user.role,
              accessToken: responseData.token,
            } as User; 
          } else {
            return null;
          }

        } catch (error: any) {
          console.error("Login Error:", error);
          throw new Error(error.message || "Đăng nhập thất bại");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.accessToken = token.accessToken;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  debug: process.env.NODE_ENV === "development",
};