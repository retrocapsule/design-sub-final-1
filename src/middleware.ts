import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
// Remove direct Prisma import
// import { prisma } from "@/lib/prisma"; 

// Force the middleware to run in the Node.js runtime (Keep this, might still be needed for getToken or other logic)
export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  const isSubscriptionRequiredPath = request.nextUrl.pathname.startsWith('/dashboard/requests');
  // const isNewRequestPage = request.nextUrl.pathname === '/dashboard/requests/new'; // Covered by startsWith

  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Clone the URL for potential redirects
  const url = request.nextUrl.clone();
  
  // Extract the plan parameter if it exists
  const searchParams = new URL(request.url).searchParams;
  const plan = searchParams.get('plan');
  
  // Check if path is a protected path that requires authentication
  const isProtectedPath = path.startsWith('/dashboard');
  
  // Public paths accessible to all users
  const isPublicPath = path.startsWith('/signin') || path.startsWith('/signup');
  
  // --- Redirect /subscribe (but NOT /subscribe/test) to /checkout --- 
  if (path.startsWith('/subscribe') && path !== '/subscribe/test') {
    url.pathname = '/checkout';
    if (plan) {
      url.searchParams.set('plan', plan);
    }
    console.log(`Middleware: Redirecting from ${path} to ${url.pathname}${url.search}`);
    return NextResponse.redirect(url);
  }
  // --- End Redirect Logic --- 
  
  // For signin/signup pages, redirect to dashboard if already authenticated
  if (isAuthenticated && isPublicPath) {
    url.pathname = '/dashboard';
    console.log(`Middleware: Redirecting authenticated user from ${path} to /dashboard`);
    return NextResponse.redirect(url);
  }
  
  // For dashboard, verify authentication (Redirect to signin, not checkout)
  if (!isAuthenticated && path.startsWith('/dashboard')) {
    url.pathname = '/signin'; // Redirect to signin if trying to access dashboard while unauthenticated
    url.searchParams.set('callbackUrl', request.nextUrl.href); // Add callback URL
    console.log(`Middleware: Redirecting unauthenticated user from ${path} to ${url.pathname}`);
    return NextResponse.redirect(url);
  }

  // For /subscribe/test, ensure user is authenticated
  if (!isAuthenticated && path === '/subscribe/test') {
      url.pathname = '/signin';
      url.searchParams.set('callbackUrl', request.nextUrl.href);
      console.log(`Middleware: Redirecting unauthenticated user from ${path} to ${url.pathname}`);
      return NextResponse.redirect(url);
  }
  
  // If the user is authenticated and trying to access a subscription-required path
  if (isAuthenticated && isSubscriptionRequiredPath) {
    console.log(`Middleware: User accessing subscription required path ${path}. Redirecting to check subscription status.`);
    // Redirect to the API route for checking the subscription. Pass the original URL.
    const checkSubUrl = new URL('/api/check-subscription', request.url);
    checkSubUrl.searchParams.set('callbackUrl', request.nextUrl.href); // Pass the original intended URL
    return NextResponse.redirect(checkSubUrl);

    /* --- REMOVED DATABASE LOGIC ---
    try {
      // Check subscription status directly from the database
      const user = await prisma.user.findUnique({
        where: { email: token.email as string },
        select: { subscriptionStatus: true } // Only select the needed field
      });

      const hasActiveSubscription = user?.subscriptionStatus === 'active';

      if (!hasActiveSubscription) {
        console.log(`Middleware: User ${token.email} has no active subscription, redirecting`);
        // Redirect any attempt to access subscription-required pages without a sub to billing
        return NextResponse.redirect(new URL('/dashboard/billing', request.url));
      }

      console.log(`Middleware: User ${token.email} has active subscription, allowing access to ${path}`);
      // Allow access if subscription is active
      return NextResponse.next(); 

    } catch (error) {
      console.error('Middleware: Error checking subscription status:', error);
      // Gracefully handle potential DB errors during check. Decide if access should be allowed or denied.
      // Allowing access might be safer if the DB is temporarily down.
      // Alternatively, redirect to an error page or billing.
      // For now, allowing access:
      return NextResponse.next();
    }
    */
  }
  
  // For all other authenticated & non-subscription-required paths, or paths handled above
  console.log(`Middleware: Allowing request to ${path}`);
  return NextResponse.next();
}

// Configure paths that need middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes for authentication)
     * - api/check-subscription (Our new API route) <--- ADD THIS EXCLUSION
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * -.*\\..* (files with extensions, likely static assets)
     * - assets/ (assuming you have a public assets folder)
     * - manifest.json (PWA manifest)
     * - sw.js (Service Worker)
     */
    // Updated negative lookahead to exclude the new API route
    '/((?!api/auth|api/check-subscription|_next/static|_next/image|favicon.ico|assets/|manifest.json|sw.js|.*\\..*).*)',
    
    // Explicitly include paths that still need specific middleware logic 
    // defined within the middleware function above, even if they might be 
    // partially matched by the negative lookahead. This adds clarity.
    '/dashboard/:path*', // For auth checks and redirection to subscription check
    '/subscribe/:path*', // For the redirect to /checkout logic
    '/signin',           // For redirecting authenticated users
    '/signup',          // For redirecting authenticated users
  ],
}; 