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

export async function callApi(endpoint: string, method: HttpMethod, accessToken?: string, payload?: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
  const url = `${baseUrl}${endpoint}`

  let headers = {
    'Content-Type': 'application/json',
    'Authorization': ''
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const options: RequestInit = {
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
