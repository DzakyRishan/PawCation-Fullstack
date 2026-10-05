import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiFetch } from '../../lib/api'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify(form),
      })

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      if (data.user.role === 'admin') navigate('/admin')
      else if (data.user.role === 'owner') navigate('/owner')
      else navigate('/')
    } catch (err) {
      setError(err.message || 'Tidak bisa terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-blue-900 mb-1 text-center">Masuk</h1>
        <p className="text-slate-500 text-sm mb-2 text-center">Selamat datang kembali</p>
        <p className="text-xs text-slate-400 mb-6 text-center leading-relaxed">
          Demo: customer@pawcation.com / password123 · admin@pawcation.com / password123
        </p>

        {error && (
          <div className="bg-rose-50 text-rose-600 text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 rounded-lg disabled:opacity-60"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-4">
          Belum punya akun?{' '}
          <Link to="/register" className="text-blue-700 font-medium">Daftar</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
