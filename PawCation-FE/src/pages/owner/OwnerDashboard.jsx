import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'

function OwnerDashboard() {
  const [stats, setStats] = useState(null)
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    Promise.all([apiFetch('/owner/stats'), apiFetch('/owner/admins')])
      .then(([s, list]) => {
        setStats(s)
        setAdmins(list)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiFetch('/owner/admins', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setForm({ name: '', email: '', password: '' })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm('Hapus admin ini?')) return
    try {
      await apiFetch(`/owner/admins/${id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <p className="text-slate-500">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Owner Dashboard</h1>
      <p className="text-slate-500 mb-6">Kelola bisnis dan tim Admin PawCation.</p>

      {error && <p className="text-sm text-rose-500 mb-4">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500">Total Pendapatan</p>
          <p className="text-xl font-bold text-slate-800">
            Rp {(stats?.total_revenue ?? 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500">Total Customer</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.total_customers ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500">Total Admin</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.total_admins ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500">Cabang Aktif</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.active_branches ?? 1}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-4">Tambah Admin</h2>
        <form onSubmit={handleAddAdmin} className="grid md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Nama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            required
          />
          <input
            type="password"
            placeholder="Password (min 6)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="md:col-span-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {saving ? 'Menyimpan...' : '+ Tambah Admin'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Daftar Admin</h2>
        <div className="space-y-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between border-b border-slate-100 py-2"
            >
              <div>
                <p className="font-medium text-slate-800">{admin.name}</p>
                <p className="text-sm text-slate-500">{admin.email}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteAdmin(admin.id)}
                className="text-rose-500 text-sm font-medium"
              >
                Hapus
              </button>
            </div>
          ))}
          {admins.length === 0 && (
            <p className="text-sm text-slate-400">Belum ada admin.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
