// Default '/api' -> lewat proxy Vite (same-origin), jadi browser tidak perlu
// kirim request CORS preflight (OPTIONS) untuk setiap panggilan API.
const API_URL = import.meta.env.VITE_API_URL || '/api'

export function getToken() {
  return localStorage.getItem('token')
}

/* ------------------------------------------------------------------
 * Cache GET sederhana (stale-while-revalidate).
 * - Halaman yang pernah dibuka langsung tampil pakai data terakhir,
 *   lalu diperbarui diam-diam di background.
 * - Request yang sama dan sedang berjalan digabung (tidak dobel).
 * - Key memakai token, jadi data antar akun tidak tercampur.
 * - Setiap request yang mengubah data (POST/PUT/PATCH/DELETE) yang
 *   berhasil akan mengosongkan cache agar tidak ada data basi.
 * ------------------------------------------------------------------ */
const cache = new Map() // key -> { data, ts }
const inflight = new Map() // key -> Promise
let generation = 0 // naik setiap cache dikosongkan, agar respons lama tidak ikut tersimpan

const cacheKey = (path) => `${getToken() || 'guest'}|${path}`

export function clearApiCache() {
  generation++
  cache.clear()
  inflight.clear()
}

/** Ambil data cache (tanpa request). undefined jika belum ada. */
export function peekCache(path) {
  return cache.get(cacheKey(path))?.data
}

/**
 * GET dengan cache. Jika data masih lebih muda dari maxAge (ms) dikembalikan
 * langsung dari cache, selain itu request baru (dengan dedupe).
 */
export function cachedGet(path, { maxAge = 0 } = {}) {
  const key = cacheKey(path)
  const hit = cache.get(key)
  if (hit && Date.now() - hit.ts < maxAge) return Promise.resolve(hit.data)
  if (inflight.has(key)) return inflight.get(key)

  const gen = generation
  const p = apiFetch(path)
    .then((data) => {
      if (gen === generation) cache.set(key, { data, ts: Date.now() })
      return data
    })
    .finally(() => {
      if (inflight.get(key) === p) inflight.delete(key)
    })
  inflight.set(key, p)
  return p
}

/** Panaskan cache di background (dipakai setelah login / saat idle). */
export function prefetch(paths) {
  paths.forEach((path) => cachedGet(path, { maxAge: 15000 }).catch(() => {}))
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  }

  // Content-Type hanya untuk request yang punya body JSON.
  if (options.body && !(options.body instanceof FormData)) {
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
      clearApiCache()
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

  if (method !== 'GET') clearApiCache()

  return data
}

export { API_URL }
