import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET handler to fetch a single payment
export async function GET(
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { paymentId } = params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error fetching payment:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    );
  }
}

// PATCH handler to update payment (for refunds or credits)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { paymentId } = params;
    const { operation, amount, isFullRefund } = await req.json();

    // Get the current payment
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    if (operation === "refund") {
      // Process refund
      const refundAmount = isFullRefund ? payment.amount : amount;
      const newRefundedAmount = (payment.refundedAmount || 0) + refundAmount;

      // Validate refund amount
      if (newRefundedAmount > payment.amount) {
        return NextResponse.json(
          { error: "Refund amount exceeds the original payment amount" },
          { status: 400 }
        );
      }

      // Determine new payment status
      let newStatus = payment.status;
      if (newRefundedAmount === payment.amount) {
        newStatus = "refunded";
      } else if (newRefundedAmount > 0) {
        newStatus = "partially_refunded";
      }

      // Update the payment record
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          refundedAmount: newRefundedAmount,
          status: newStatus,
        }
      });

      return NextResponse.json({
        message: "Refund processed successfully",
        payment: updatedPayment
      });
    } 
    else if (operation === "credit") {
      // Process account credit
      const updatedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          creditAmount: amount
        }
      });

      return NextResponse.json({
        message: "Account credit added successfully",
        payment: updatedPayment
      });
    } 
    else {
      return NextResponse.json(
        { error: "Invalid operation" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    );
  }
} 