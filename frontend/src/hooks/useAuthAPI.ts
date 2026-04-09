export function useAuthAPI() {
  const getToken = () => localStorage.getItem('gama_voz_token')

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getToken()

    if (!token) {
      throw new Error('Não autenticado')
    }

    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    return response
  }

  return { fetchWithAuth, getToken }
}
