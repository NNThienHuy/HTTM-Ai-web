import NextAuth from "next-auth/next";
import type { User, Session, Profile, NextAuthOptions } from "next-auth";
import type { Account } from "@auth/core/types";
import { JWT } from "next-auth/jwt"; 
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import config from "@/lib/config";

type Provider = {
  id: string;
  name: string;
  type: string;
  credentials?: Record<string, any>;
  authorize?: (credentials: Record<string, any>, req: any) => Promise<any>;
};

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
          const loginResponse = await fetch(`${config.apiBaseUrl}/api/login`, {
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

          if (!loginResponse.ok) {
             console.error("Laravel login failed:", loginResponse.status, await loginResponse.text());
             return null;
          }

          const data = await loginResponse.json();

          if (data && data.user && data.access_token) {
             const user = data.user;

             return {
               id: user.id.toString(),
               name: user.name,
               email: user.email,
               role: user.role ?? "user",
               accessToken: data.access_token
             } as any;
          } else {
            console.error("Laravel login response missing user or token:", data);
            return null;
          }

        } catch (error) {
           console.error("Error calling Laravel login API:", error);
           return null;
        }
      },
    }),
  ],


  callbacks: {

    async signIn({ user, account, profile, email, credentials }: { 
        user: User, 
        account: Account | null, 
        profile?: Profile, 
        email?: { verificationRequest?: boolean }, 
        credentials?: Record<string, any> 
    }) {
      if (account?.provider === "google") {
         const email = profile?.email;
         if (!email) {
            console.error("Google profile missing email");
            return false;
         }
      }
      return true;
    },

    

     async jwt({ token, user }: { token: JWT, user: User }) {
      const anyUser = user as any; 
      if (anyUser) {
        token.id = anyUser.id;
        token.role = anyUser.role;
        token.accessToken = anyUser.accessToken; 
        token.name = anyUser.name;
        token.email = anyUser.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      const anyToken = token as any; 
      if (anyToken) {
        if (session.user) {
          session.user.id = anyToken.id;
          session.user.role = anyToken.role;
          if (anyToken.name) session.user.name = anyToken.name;
          if (anyToken.email) session.user.email = anyToken.email;
        }
        session.accessToken = anyToken.accessToken; 
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

const handler = NextAuth(authOptions);

function CredentialsProvider(options: {
  name: string;
  credentials: Record<string, { label: string; type: string; placeholder?: string }>;
  authorize: (credentials: Record<string, any>, req: any) => Promise<any>;
}): Provider {
  return {
    id: "credentials",
    name: options.name,
    type: "credentials",
    credentials: options.credentials,
    authorize: options.authorize,
  } as Provider;
}

