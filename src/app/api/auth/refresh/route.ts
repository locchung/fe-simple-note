// src/app/api/auth/refresh/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const refreshToken = cookies().get('refreshToken')

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    let response = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Refresh failed')
    }

    const data = await response.json()

    // Set new cookies
    const nextResponse = NextResponse.redirect(new URL(request.url))
    nextResponse.cookies.set('accessToken', data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 900 // 15 minutes
    })

    return response
  } catch (error) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
}
