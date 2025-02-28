// src/app/context/AuthContext.tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthContextType, AuthState } from '../interfaces/types'
import { setCookie } from '../helpers/cookie'
import { LOCAL_STORAGE_KEY } from '../constants/localStorage'

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
      accessToken: localStorage.getItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN) as string,
      refreshToken: localStorage.getItem(LOCAL_STORAGE_KEY.REFRESH_TOKEN) as string
    })
  }, [tokens.accessToken])

  const setToken = (accessToken: string, refreshToken: string) => {
    // Set cookies
    setCookie(LOCAL_STORAGE_KEY.ACCESS_TOKEN, accessToken, {
      path: '/',
      maxAge: 900, // 15 minutes
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    setCookie(LOCAL_STORAGE_KEY.REFRESH_TOKEN, refreshToken, {
      path: '/',
      maxAge: 604800, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Set localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN, accessToken)
    localStorage.setItem(LOCAL_STORAGE_KEY.REFRESH_TOKEN, refreshToken)
  }

  const logout = () => {
    // Clear cookies
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    localStorage.removeItem(LOCAL_STORAGE_KEY.ACCESS_TOKEN)
    localStorage.removeItem(LOCAL_STORAGE_KEY.REFRESH_TOKEN)
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
