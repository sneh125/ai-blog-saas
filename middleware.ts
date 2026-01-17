import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host');
  const url = request.nextUrl;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Default domains (your main app)
  const defaultDomains = [
    'localhost:3000',
    'localhost',
    process.env.NEXT_PUBLIC_URL?.replace('https://', '').replace('http://', ''),
    'blogai.com', // Your production domain
    'www.blogai.com'
  ].filter(Boolean);
  
  // Check if this is a custom domain (not your main app domain)
  const isCustomDomain = host && !defaultDomains.some(domain => 
    host === domain || host.startsWith(domain)
  );
  
  if (isCustomDomain) {
    // Rewrite to agency route with domain parameter
    const agencyUrl = new URL(`/agency/${host}${url.pathname}${url.search}`, request.url);
    
    console.log(`Custom domain detected: ${host} -> rewriting to /agency/${host}${url.pathname}`);
    
    return NextResponse.rewrite(agencyUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};