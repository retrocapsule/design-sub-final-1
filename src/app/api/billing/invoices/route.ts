import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

// Initialize Stripe with proper error handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey && process.env.NODE_ENV === 'production') {
  console.error('STRIPE_SECRET_KEY is missing in production environment');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
}) : null;

export async function GET() {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment processing is not configured' },
        { status: 500 }
      );
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get the user's invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: session.user.stripeCustomerId as string,
      limit: 12, // Get last 12 invoices
    });

    return NextResponse.json(
      invoices.data.map(invoice => ({
        id: invoice.id,
        date: new Date(invoice.created * 1000).toISOString(),
        amount: invoice.amount_paid / 100,
        status: invoice.status,
        downloadUrl: invoice.invoice_pdf,
      }))
    );
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { invoiceId } = await request.json();

    // Get the invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);

    // Return the invoice PDF URL
    return NextResponse.json({
      downloadUrl: invoice.invoice_pdf,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { message: 'Error fetching invoice' },
      { status: 500 }
    );
  }
} 