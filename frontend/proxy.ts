import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TODO: replace with real session check when Strapi auth is connected
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth pages — redirect straight to dashboard
  if (pathname.startsWith('/auth/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/register'],
};
