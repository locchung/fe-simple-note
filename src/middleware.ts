// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't need authentication
const publicRoutes = ['/auth/login', '/auth/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get('accessToken')

  // If no tokens, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/note/:path*',
  ]
}
