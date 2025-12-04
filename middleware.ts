import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/profile", "/summary"];
const authRoutes = ["/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('better-auth.session_token');
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const sessionInvalid = request.nextUrl.searchParams.get('session_invalid') === 'true'

  if (sessionInvalid && sessionCookie) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete('better-auth.session_token');
    return response;
  }

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  if(request.nextUrl.pathname === '/' && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
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
}
