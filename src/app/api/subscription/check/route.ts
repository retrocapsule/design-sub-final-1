import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscription: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const hasActiveSubscription = user.subscription?.status === "active";

    return NextResponse.json({ hasActiveSubscription });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
} 