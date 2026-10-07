import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const role = user?.role || 'customer'

  const handleLogout = async () => {
    try {
      await apiFetch('/logout', { method: 'POST' })
    } catch {
      // token may already be invalid
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('pawbot_chat')
    navigate('/login')
  }

  if (role === 'admin') {
    return (
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-3" aria-label="PawCation Admin">
          <img src="/pawcation-logo.png" alt="PawCation" className="h-9 w-auto" />
          <span className="text-sm font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-rose-600 font-medium"
          >
            Keluar
          </button>
        </div>
      </nav>
    )
  }

  if (role === 'owner') {
    return (
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <Link to="/owner" className="flex items-center gap-3" aria-label="PawCation Owner">
          <img src="/pawcation-logo.png" alt="PawCation" className="h-9 w-auto" />
          <span className="text-sm font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Owner</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.name}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-rose-600 font-medium"
          >
            Keluar
          </button>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center" aria-label="PawCation - Home">
        <img src="/pawcation-logo.png" alt="PawCation" className="h-9 w-auto" />
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/" className="text-slate-600 hover:text-blue-700 font-medium">Home</Link>
        <Link to="/shop" className="text-slate-600 hover:text-blue-700 font-medium">Supermarket</Link>
        <Link to="/hotel" className="text-slate-600 hover:text-blue-700 font-medium">Pet Hotel</Link>
        <Link to="/consult" className="text-slate-600 hover:text-blue-700 font-medium">Booking Kesehatan</Link>
        <Link to="/cctv" className="text-slate-600 hover:text-blue-700 font-medium">CCTV Live</Link>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/schedule" className="text-slate-600 hover:text-blue-700 text-sm">Jadwal</Link>
        <Link to="/profile" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-sm">
            🐾
          </div>
          <div className="text-sm">
            <p className="font-semibold text-slate-800 leading-tight">{user?.name || 'Guest'}</p>
            <p className="text-xs text-slate-400 leading-tight">Pet Parent</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs text-slate-500 hover:text-rose-600"
        >
          Keluar
        </button>
      </div>
    </nav>
  )
}

export default Navbar
