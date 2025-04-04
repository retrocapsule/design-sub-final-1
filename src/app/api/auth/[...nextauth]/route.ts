import NextAuth, { NextAuthOptions } from "next-auth";
import { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { compare } from "bcrypt";
import type { User as NextAuthUser } from "next-auth";
import type { User as DbUser } from "@prisma/client"; // Import DbUser type

// Define custom User type for session/token to include custom fields
interface CustomUser extends Omit<DbUser, 'password' | 'emailVerified'> {
  // Add fields you want in session/token that might differ from DB model
}

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
      async authorize(credentials, req): Promise<CustomUser | null> {
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
        // Return the user object matching CustomUser structure
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          subscriptionStatus: user.subscriptionStatus,
          onboardingStep: user.onboardingStep,
          onboardingCompleted: user.onboardingCompleted,
          stripeCustomerId: user.stripeCustomerId,
          subscriptionId: user.subscriptionId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.log("[Auth Callback] Session: Token received:", token);
      if (token && session.user) {
        // Copy essential fields from token to session user
        (session.user as any).id = token.sub; // Standard way to pass id
        (session.user as any).role = token.role; // Pass custom role
        (session.user as any).subscriptionStatus = token.subscriptionStatus;
      }
      console.log("[Auth Callback] Session: Returning session:", session);
      return session;
    },
    async jwt({ token, user, account, trigger, session }) {
      console.log(`[Auth Callback] JWT: Trigger: ${trigger}, User present: ${!!user}, Account present: ${!!account}`);
      
      // Initial sign in (user object is passed)
      if (account && user) {
        console.log("[Auth Callback] JWT: Initial sign in, populating token from user object.");
        token.id = user.id;
        token.role = (user as CustomUser).role; // Cast to CustomUser
        token.subscriptionStatus = (user as CustomUser).subscriptionStatus;
        // Add other fields if needed
      }
      
      // Handle session updates (e.g., user updates profile)
      if (trigger === "update" && session?.user) {
          console.log("[Auth Callback] JWT: Trigger is 'update', merging session data into token:", session.user);
          // Merge updated data from session into token if necessary
          // Example: token.name = session.user.name;
          // For subscription status, we rely on DB refresh below, not session merge.
      }

      // On subsequent requests OR after update trigger, refresh from DB 
      // to ensure status is always up-to-date after potential webhook changes.
      if (token.sub) { // Check if token has subject (user id)
          try {
              console.log(`[Auth Callback] JWT: Refreshing user data from DB for ID: ${token.sub}`);
              const dbUser = await db.user.findUnique({
                  where: { id: token.sub },
                  select: { role: true, subscriptionStatus: true } // Select only needed fields
              });
              if (dbUser) {
                  console.log(`[Auth Callback] JWT: DB refresh successful. DB Status: '${dbUser.subscriptionStatus}'. Updating token.`);
                  token.role = dbUser.role;
                  token.subscriptionStatus = dbUser.subscriptionStatus;
              } else {
                 console.log(`[Auth Callback] JWT: DB refresh failed, user ${token.sub} not found.`);
                 // Handle case where user might have been deleted? Invalidate token?
                 // For now, keep existing token values.
              }
          } catch (error) {
              console.error("[Auth Callback] JWT: Error refreshing user data from DB:", error);
              // Keep existing token values if DB lookup fails
          }
      }

      console.log("[Auth Callback] JWT: Returning token:", token);
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