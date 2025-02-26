type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

async function callApi(endpoint: string, method: HttpMethod, payload?: any) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const url = `${baseUrl}${endpoint}`

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (payload) {
    options.body = JSON.stringify(payload)
  }

  try {
    const response = await fetch(url, options)
    return await response.json()
  } catch (error) {
    console.error('API call error:', error)
    throw error
  }
}

export default callApi
