import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST handler to create dummy payment data
export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get all users
    const users = await prisma.user.findMany({
      where: {
        role: "USER"
      },
      select: {
        id: true
      }
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: "No users found to create payments for" },
        { status: 404 }
      );
    }

    // Seed payment statuses
    const statuses = ["succeeded", "pending", "failed", "refunded", "partially_refunded"];
    
    // Generate 10 random payments
    const paymentPromises = Array.from({ length: 10 }).map((_, i) => {
      const randomUserIndex = Math.floor(Math.random() * users.length);
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 10000) + 1000; // Random amount between $10-$110
      
      // If status is refunded or partially_refunded, add refunded amount
      let refundedAmount = null;
      if (randomStatus === "refunded") {
        refundedAmount = amount;
      } else if (randomStatus === "partially_refunded") {
        refundedAmount = Math.floor(amount * (Math.random() * 0.8)); // Refund up to 80%
      }

      return prisma.payment.create({
        data: {
          userId: users[randomUserIndex].id,
          amount,
          currency: "usd",
          status: randomStatus,
          description: `Test payment #${i + 1}`,
          paymentIntentId: `pi_${Math.random().toString(36).substring(2, 15)}`,
          refundedAmount,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)), // Random date within last 30 days
        }
      });
    });

    const payments = await Promise.all(paymentPromises);

    return NextResponse.json({
      message: "Dummy payment data created successfully",
      count: payments.length
    });
  } catch (error) {
    console.error("Error creating dummy payment data:", error);
    return NextResponse.json(
      { error: "Failed to create dummy payment data" },
      { status: 500 }
    );
  }
}

// GET handler to fetch all payments with user info
export async function GET(req: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
} 