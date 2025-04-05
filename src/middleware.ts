import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
// Remove direct Prisma import
// import { prisma } from "@/lib/prisma"; 

// Remove the runtime declaration
// export const runtime = 'nodejs';

export async function middleware(request: NextRequest) {
  // --- DETAILED LOGGING START ---
  console.log(`\\n--- Middleware Start ---`);
  const path = request.nextUrl.pathname;
  console.log(`Requested Path: ${path}`);

  let token;
  let tokenError = null;
  try {
    token = await getToken({ req: request });
    console.log(`Token fetched: ${token ? JSON.stringify(token, null, 2) : 'null'}`);
  } catch (error) {
    tokenError = error;
    console.error(`Error fetching token:`, error);
  }

  const isAuthenticated = !!token;
  console.log(`Is Authenticated: ${isAuthenticated}`);

  const isPublicPath = path.startsWith('/signin') || path.startsWith('/signup');
  console.log(`Is Public Path (signin/signup): ${isPublicPath}`);
  // --- DETAILED LOGGING END ---

  // const userStatus = token?.subscriptionStatus as string | undefined; // Get status from token - Moved this down

  // *** Original Logging - Kept for reference ***
  // if (isAuthenticated) {
  //   console.log(`Middleware Check: User ${token?.email}, Token Status: '${userStatus}'`); // Moved this down
  // }
  // *************************

  const isSubscriptionRequiredPath = path.startsWith('/dashboard/requests');
  // const isNewRequestPage = request.nextUrl.pathname === '/dashboard/requests/new'; // Covered by startsWith

  // Get the pathname of the request
  // const path = request.nextUrl.pathname;
  
  // Clone the URL for potential redirects
  const url = request.nextUrl.clone();
  
  // Extract the plan parameter if it exists
  const searchParams = new URL(request.url).searchParams;
  const plan = searchParams.get('plan');
  
  // Check if path is a protected path that requires authentication
  const isProtectedPath = path.startsWith('/dashboard');
  
  // Public paths accessible to all users
  // const isPublicPath = path.startsWith('/signin') || path.startsWith('/signup');
  
  // --- Redirect /subscribe (but NOT /subscribe/test) to /checkout --- 
  if (path.startsWith('/subscribe') && path !== '/subscribe/test') {
    url.pathname = '/checkout';
    if (plan) {
      url.searchParams.set('plan', plan);
    }
    console.log(`Middleware: Redirecting from ${path} to ${url.pathname}${url.search} (Subscription page redirect)`);
    console.log(`--- Middleware End (Redirect) ---`);
    return NextResponse.redirect(url);
  }
  // --- End Redirect Logic --- 
  
  // For signin/signup pages, redirect to dashboard if already authenticated
  if (isAuthenticated && isPublicPath) {
    url.pathname = '/dashboard';
    console.log(`Middleware: Redirecting authenticated user from ${path} to /dashboard`);
    console.log(`--- Middleware End (Redirect) ---`);
    return NextResponse.redirect(url);
  }
  
  // For dashboard, verify authentication (Redirect to signin, not checkout)
  if (!isAuthenticated && path.startsWith('/dashboard')) {
    url.pathname = '/signin'; // Redirect to signin if trying to access dashboard while unauthenticated
    url.searchParams.set('callbackUrl', request.nextUrl.href); // Add callback URL
    console.log(`Middleware: Redirecting unauthenticated user from ${path} to ${url.pathname}`);
    console.log(`--- Middleware End (Redirect) ---`);
    return NextResponse.redirect(url);
  }

  // For /subscribe/test, ensure user is authenticated
  if (!isAuthenticated && path === '/subscribe/test') {
      url.pathname = '/signin';
      url.searchParams.set('callbackUrl', request.nextUrl.href);
      console.log(`Middleware: Redirecting unauthenticated user from ${path} to ${url.pathname}`);
      console.log(`--- Middleware End (Redirect) ---`);
      return NextResponse.redirect(url);
  }
  
  // --- NEW Subscription Check Logic --- 
  if (isAuthenticated && isSubscriptionRequiredPath) {
    const userStatus = token?.subscriptionStatus as string | undefined; // Get status from token now
    console.log(`Middleware: Checking subscription for ${path}. User Status from Token: '${userStatus}'`);
    const hasActiveSubscription = userStatus === 'active';

    if (!hasActiveSubscription) {
      console.log(`Middleware: User ${token?.email} has status '${userStatus}', redirecting from ${path} to billing.`);
      // Redirect to billing if subscription is not active
      url.pathname = '/dashboard/billing';
      console.log(`--- Middleware End (Redirect) ---`);
      return NextResponse.redirect(url);
    } else {
       console.log(`Middleware: User ${token?.email} has active status, allowing access to ${path}.`);
       // Allow access if subscription is active
       console.log(`--- Middleware End (Next) ---`);
       return NextResponse.next(); 
    }
  }
  
  // For all other authenticated & non-subscription-required paths, or paths handled above
  console.log(`Middleware: Allowing request to ${path} (default rule).`);
  console.log(`--- Middleware End (Next) ---`);
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
    '/((?!api/auth|_next/static|_next/image|favicon.ico|assets/|manifest.json|sw.js|.*\\..*).*)',
    
    // Explicitly include paths that still need specific middleware logic 
    // defined within the middleware function above, even if they might be 
    // partially matched by the negative lookahead. This adds clarity.
    '/dashboard/:path*', // For auth checks and redirection to subscription check
    '/subscribe/:path*', // For the redirect to /checkout logic
    '/signin',           // For redirecting authenticated users
    '/signup',          // For redirecting authenticated users
  ],
}; 