import { Role } from "@prisma/client";
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      subscriptionStatus?: string;
      onboardingCompleted?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    subscriptionStatus?: string;
    onboardingCompleted?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    subscriptionStatus?: string;
    onboardingCompleted?: boolean;
  }
} 