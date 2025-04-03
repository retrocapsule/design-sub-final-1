import { prisma } from "@/db/client";
import type { Payment } from "@prisma/client";

export interface PaymentWithUser {
  id: string;
  status: string;
  amount: number;
  refundedAmount?: number;
  currency: string;
  description: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

// Mock payment data
const mockPayment: PaymentWithUser = {
  id: 'mock-payment-id',
  status: 'succeeded',
  amount: 1000,
  currency: 'usd',
  description: 'Mock payment',
  createdAt: new Date(),
  user: {
    id: 'mock-user-id',
    name: 'John Doe',
    email: 'john@example.com'
  }
};

// Get a payment by ID
export async function getPaymentById(paymentId: string): Promise<PaymentWithUser> {
  console.log(`Mock getPaymentById called with ID: ${paymentId}`);
  return {
    ...mockPayment,
    id: paymentId
  };
}

// Process a refund
export async function processRefund(
  paymentId: string, 
  amount: number, 
  isFullRefund: boolean
): Promise<PaymentWithUser> {
  console.log(`Mock processRefund called: paymentId=${paymentId}, amount=${amount}, isFullRefund=${isFullRefund}`);
  
  return {
    ...mockPayment,
    id: paymentId,
    status: isFullRefund ? 'refunded' : 'partially_refunded',
    refundedAmount: isFullRefund ? mockPayment.amount : amount
  };
}

// Add account credit
export async function addAccountCredit(
  userId: string, 
  paymentId: string, 
  amount: number
): Promise<void> {
  console.log(`Mock addAccountCredit called: userId=${userId}, paymentId=${paymentId}, amount=${amount}`);
  // This would normally update a user's account credit balance
}

// Get all payments (for admin)
export async function getAllPayments(): Promise<PaymentWithUser[]> {
  return [
    mockPayment,
    {
      ...mockPayment,
      id: 'mock-payment-id-2',
      status: 'pending',
      amount: 2000,
      description: 'Another mock payment',
    }
  ];
}

// Function to generate dummy payment data for testing
export async function generateDummyPayments(): Promise<void> {
  try {
    const response = await fetch('/api/admin/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate dummy payments');
    }
  } catch (error) {
    console.error('Error generating dummy payments:', error);
    throw error;
  }
} 