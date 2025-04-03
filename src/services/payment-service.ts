import { prisma } from "@/db/client";
import type { Payment } from "@prisma/client";

export type PaymentWithUser = Payment & {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

export async function getAllPayments(): Promise<PaymentWithUser[]> {
  try {
    const response = await fetch('/api/admin/payments', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch payments');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

export async function getPaymentById(id: string): Promise<PaymentWithUser | null> {
  try {
    const response = await fetch(`/api/admin/payments/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch payment');
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching payment ${id}:`, error);
    throw error;
  }
}

export async function processRefund(
  paymentId: string, 
  amount: number, 
  isFullRefund: boolean
): Promise<Payment> {
  try {
    const response = await fetch(`/api/admin/payments/${paymentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'refund',
        amount,
        isFullRefund,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process refund');
    }

    const data = await response.json();
    return data.payment;
  } catch (error) {
    console.error(`Error processing refund for payment ${paymentId}:`, error);
    throw error;
  }
}

export async function addAccountCredit(
  userId: string,
  paymentId: string,
  amount: number
): Promise<Payment> {
  try {
    const response = await fetch(`/api/admin/payments/${paymentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'credit',
        amount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add account credit');
    }

    const data = await response.json();
    return data.payment;
  } catch (error) {
    console.error(`Error adding account credit for payment ${paymentId}:`, error);
    throw error;
  }
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