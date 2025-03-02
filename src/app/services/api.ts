import { getUserAuth } from "../utils/common"

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) throw new Error()
    const data = await response.json()
    return data.accessToken
  } catch {
    return null
  }
}

export async function callApi(endpoint: string, method: HttpMethod, payload?: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const url = `${baseUrl}${endpoint}`

  let headers = {
    'Content-Type': 'application/json',
    'Authorization': ''
  }

  let auth = getUserAuth()
  if (auth?.accessToken) {
    headers['Authorization'] = `Bearer ${auth?.accessToken}`
  }

  const options: RequestInit = {
    referrerPolicy: "unsafe-url",
    method,
    headers
  }

  if (payload) {
    options.body = JSON.stringify(payload)
  }

  try {
    const response = await fetch(url, options)

    return await response.json()
  } catch (error) {
    console.error('API error:', error)
    throw error
  }
}
