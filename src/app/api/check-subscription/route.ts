import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request });

  // Ensure user is authenticated
  if (!token || !token.email) {
    console.error('API check-subscription: Unauthenticated access attempt.');
    // Redirect to signin, perhaps with a message? Or just deny.
    // Passing the original callbackUrl might be needed if redirecting to signin.
    const signInUrl = new URL('/signin', request.url);
    // If you want to preserve the original destination after sign-in:
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    if (callbackUrl) {
      signInUrl.searchParams.set('callbackUrl', callbackUrl); 
    }
    return NextResponse.redirect(signInUrl);
  }

  const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
  const billingUrl = new URL('/dashboard/billing', request.url);

  // Validate callbackUrl - ensure it's a relative path or within the allowed domain
  // Basic check: is it a path starting with '/'? More robust validation might be needed.
  if (!callbackUrl || !callbackUrl.startsWith('/')) {
      console.error('API check-subscription: Invalid or missing callbackUrl.');
      // Redirect to a safe default, like billing or dashboard home
      return NextResponse.redirect(billingUrl);
  }

  try {
    // Check subscription status from the database
    const user = await prisma.user.findUnique({
      where: { email: token.email },
      select: { subscriptionStatus: true },
    });

    const hasActiveSubscription = user?.subscriptionStatus === 'active';

    if (hasActiveSubscription) {
      console.log(`API check-subscription: User ${token.email} has active subscription. Redirecting to ${callbackUrl}`);
      // User has an active subscription, redirect to the original URL they intended to visit
      // Important: Construct the URL carefully from the validated callbackUrl
      const destinationUrl = new URL(callbackUrl, request.url.origin); 
      return NextResponse.redirect(destinationUrl);
    } else {
      console.log(`API check-subscription: User ${token.email} has INACTIVE subscription. Redirecting to billing.`);
      // User does not have an active subscription, redirect to the billing page
      return NextResponse.redirect(billingUrl);
    }
  } catch (error) {
    console.error('API check-subscription: Error checking subscription status:', error);
    // Handle database errors - redirecting to billing might be a safe fallback
    return NextResponse.redirect(billingUrl);
  }
} 