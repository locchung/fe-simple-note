// src/app/context/AuthContext.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContextType, AuthState } from '../interfaces/types'
import { setCookie } from '../helpers/cookie'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useState<AuthState>({
    accessToken: '',
    refreshToken: ''
  })
  const [user, setUser] = useState<any>(null);
  const router = useRouter()

  // Initialize tokens from localStorage after component mounts
  useEffect(() => {
    setTokens({
      accessToken: localStorage.getItem('accessToken') as string,
      refreshToken: localStorage.getItem('refreshToken') as string
    })
  }, [])

  const setToken = (accessToken: string, refreshToken: string) => {
    // Set cookies
    setCookie('accessToken', accessToken, {
      path: '/',
      maxAge: 900, // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    setCookie('refreshToken', refreshToken, {
      path: '/',
      maxAge: 604800, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Set localStorage
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
  }

  const logout = () => {
    // Clear cookies
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setTokens({ accessToken: '', refreshToken: '' })
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{
      ...tokens,
      setUser,
      logout,
      setToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
