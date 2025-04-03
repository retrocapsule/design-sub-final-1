import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';

type Role = 'USER' | 'ADMIN';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { subscription: true }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password!);

        if (!isPasswordValid) {
          return null;
        }

        // Determine subscription status
        const subscriptionStatus = user.subscription?.status === 'active' 
          ? 'active' 
          : user.subscriptionStatus || 'inactive';

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          subscriptionStatus,
          onboardingCompleted: user.onboardingCompleted || false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.subscriptionStatus = user.subscriptionStatus;
        token.onboardingCompleted = user.onboardingCompleted;
      }
      
      // Update subscription status if it's changed in the session
      if (trigger === 'update' && session?.subscriptionStatus) {
        token.subscriptionStatus = session.subscriptionStatus;
      }
      
      // If we have a user object, update the token with their latest subscription status
      if (user) {
        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { subscription: true }
        });
        
        if (updatedUser) {
          token.subscriptionStatus = updatedUser.subscription?.status === 'active' 
            ? 'active' 
            : updatedUser.subscriptionStatus || 'inactive';
          token.onboardingCompleted = updatedUser.onboardingCompleted || false;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
    error: '/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 