// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthed = request.cookies.has('auth');
  const isAuthPage = request.nextUrl.pathname === '/auth';

  // Si on est sur la page d'auth et qu'on est déjà authentifié
  if (isAuthPage && isAuthed) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si on n'est pas authentifié et qu'on n'est pas sur la page d'auth
  if (!isAuthed && !isAuthPage) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};