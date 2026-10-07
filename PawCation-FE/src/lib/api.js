const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

export function getToken() {
  return localStorage.getItem('token')
}

export async function apiFetch(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/login') && !path.startsWith('/register')) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('pawbot_chat')
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    const message =
      data.message ||
      (data.errors && Object.values(data.errors).flat()[0]) ||
      'Permintaan gagal'
    const err = new Error(message)
    err.status = res.status
    err.data = data
    throw err
  }

  return data
}

export { API_URL }
