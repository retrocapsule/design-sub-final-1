import NextAuth, { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { compare } from "bcrypt";
import type { User as NextAuthUser } from "next-auth";

// Define AuthOptions for v4
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    signOut: "/signout",
    error: "/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<NextAuthUser | null> {
        console.log("[Auth] Authorize: Attempting authorization for", credentials?.email); // Log entry
        if (!credentials?.email || !credentials?.password) {
          console.error("[Auth] Authorize: Missing credentials");
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) { // Check user existence first
          console.error(`[Auth] Authorize: User not found for ${credentials.email}`);
          return null;
        }

        if (!user.password) { // Separately check if password field exists
           console.error(`[Auth] Authorize: User ${credentials.email} found, but database record has no password field.`);
           return null;
        }

        console.log(`[Auth] Authorize: Hash retrieved from DB for ${credentials.email}:`, user.password ? `Exists (Length: ${user.password.length})` : 'DOES NOT EXIST');
        console.log(`[Auth] Authorize: User found for ${credentials.email}. Comparing password.`);
        let isPasswordValid = false;
        try {
            isPasswordValid = await compare(
              credentials.password,
              user.password
            );
        } catch (compareError) {
            console.error(`[Auth] Authorize: Error during password comparison for ${credentials.email}:`, compareError);
            return null; // Fail if comparison itself throws error
        }

        if (!isPasswordValid) {
          console.error(`[Auth] Authorize: Invalid password for ${credentials.email}`);
          return null;
        }

        console.log(`[Auth] Authorize: Success for ${credentials.email}`);
        // Return the user object matching NextAuthUser structure
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        // Add properties from token to session user
        (session.user as any).id = token.sub; // Standard way to pass id
        (session.user as any).role = token.role; // Pass custom role
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Persist standard OAuth profile properties to token
        token.accessToken = account.access_token;
        token.id = user.id; // user.id is available on initial sign in
        
        // Fetch role from DB and add to token
        // We use the user object passed on sign-in which includes the role from authorize
        if ((user as any).role) {
             token.role = (user as any).role;
        }
      }
      // Subsequent requests, token exists
      return token;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Export named handlers for GET and POST for App Router
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 