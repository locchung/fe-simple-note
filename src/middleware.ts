// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { LOCAL_STORAGE_KEY } from './app/constants/localStorage'

// Define public routes that don't need authentication
const publicRoutes = ['/auth/login', '/auth/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = request.cookies.get(LOCAL_STORAGE_KEY.ACCESS_TOKEN)

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
