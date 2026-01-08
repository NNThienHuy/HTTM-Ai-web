import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"; 
import config from "@/lib/config";

const LARAVEL_API_LOGIN_URL = `${config.apiBaseUrl}/api/login`; 

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
      async authorize(credentials: any, req) {
        if (!credentials) {
          return null;
        }

        try {
          const loginResponse = await fetch(LARAVEL_API_LOGIN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data: LaravelLoginResponse = await loginResponse.json();

          if (!loginResponse.ok) {
            console.error("Laravel login failed:", loginResponse.status, data.message);
            throw new Error(data.message || "Email hoặc mật khẩu không đúng");
          }

          if (data && data.user && data.token) {
            const user = data.user;
            return {
              id: user.id.toString(),
              name:
                  (user as any)?.customer?.full_name ??
                  (user as any)?.name ??
                  (user as any)?.username ??
              user.email,
              email: user.email,
              role: (user as any).user_type ?? "customer",
              accessToken: data.token, 
              
            };
          } else {
            return null; 
          }

        } catch (error: any) {
          console.error("Error calling Laravel login API:", error);
          throw new Error(error.message || "Đăng nhập thất bại");
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email;
        if (!email) {
          console.error("Google profile missing email");
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          session.user.id = token.id;
          session.user.role = token.role;
          if (token.name) session.user.name = token.name;
          if (token.email) session.user.email = token.email;
        }
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
