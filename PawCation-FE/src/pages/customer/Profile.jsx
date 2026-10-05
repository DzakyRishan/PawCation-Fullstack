import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { petTypeLabel } from '../../lib/pets'
import PetAvatar from '../../components/PetAvatar'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [petForm, setPetForm] = useState({ name: '', type: 'kucing', breed: '' })
  const [petPhotoFile, setPetPhotoFile] = useState(null)
  const [petPhotoPreview, setPetPhotoPreview] = useState(null)
  const [savingPet, setSavingPet] = useState(false)
  const [uploadingPetId, setUploadingPetId] = useState(null)

  const photoInputRefs = useRef({})

  const load = () => {
    setLoading(true)
    Promise.all([apiFetch('/profile'), apiFetch('/orders')])
      .then(([profile, orderList]) => {
        setUser(profile)
        setOrders(orderList)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const clearNewPetPhoto = () => {
    setPetPhotoFile(null)
    setPetPhotoPreview(null)
  }

  const handleNewPetPhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal 5 MB')
      return
    }
    setPetPhotoFile(file)
    setPetPhotoPreview(URL.createObjectURL(file))
    setError(null)
  }

  const handleAddPet = async (e) => {
    e.preventDefault()
    if (!petForm.name.trim()) return
    setSavingPet(true)
    setError(null)
    try {
      const body = new FormData()
      body.append('name', petForm.name.trim())
      body.append('type', petForm.type)
      if (petForm.breed.trim()) body.append('breed', petForm.breed.trim())
      if (petPhotoFile) body.append('photo', petPhotoFile)

      await apiFetch('/pets', { method: 'POST', body })
      setPetForm({ name: '', type: 'kucing', breed: '' })
      clearNewPetPhoto()
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingPet(false)
    }
  }

  const handlePetPhotoChange = async (petId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran foto maksimal 5 MB')
      return
    }
    setUploadingPetId(petId)
    setError(null)
    try {
      const body = new FormData()
      body.append('photo', file)
      await apiFetch(`/pets/${petId}/photo`, { method: 'POST', body })
      load()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploadingPetId(null)
      e.target.value = ''
    }
  }

  const handleDeletePet = async (id) => {
    if (!window.confirm('Hapus data hewan ini?')) return
    try {
      await apiFetch(`/pets/${id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleLogout = async () => {
    try {
      await apiFetch('/logout', { method: 'POST' })
    } catch {
      // ignore
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <p className="text-slate-400">Memuat profil...</p>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-1">Profil Saya</h1>
      <p className="text-slate-500 mb-6">Kelola informasi akun dan hewan kesayanganmu.</p>

      {error && <p className="text-sm text-rose-500 mb-4">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-2xl">
            🐾
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-lg">{user?.name}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
            <p className="text-xs text-blue-700 capitalize mt-1">{user?.role || 'customer'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-blue-900 mb-4">Data Hewan</h2>
        <div className="space-y-3 mb-6">
          {user?.pets?.length ? (
            user.pets.map((pet) => (
              <div
                key={pet.id}
                className="flex items-center justify-between gap-3 border border-slate-100 rounded-lg p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PetAvatar pet={pet} size="md" />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{pet.name}</p>
                    <p className="text-sm text-slate-500 truncate">
                      {petTypeLabel(pet.type)}
                      {pet.breed ? ` · ${pet.breed}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    ref={(el) => {
                      photoInputRefs.current[pet.id] = el
                    }}
                    onChange={(e) => handlePetPhotoChange(pet.id, e)}
                  />
                  <button
                    type="button"
                    disabled={uploadingPetId === pet.id}
                    onClick={() => photoInputRefs.current[pet.id]?.click()}
                    className="text-xs text-blue-700 font-medium disabled:opacity-50"
                  >
                    {uploadingPetId === pet.id ? 'Upload...' : 'Ganti foto'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePet(pet.id)}
                    className="text-xs text-rose-500 font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">Belum ada hewan terdaftar.</p>
          )}
        </div>

        <form onSubmit={handleAddPet} className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-sm font-medium text-slate-700">Tambah hewan baru</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nama hewan"
              value={petForm.name}
              onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              required
            />
            <select
              value={petForm.type}
              onChange={(e) => setPetForm({ ...petForm, type: e.target.value })}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="kucing">Kucing</option>
              <option value="anjing">Anjing</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Ras (opsional)"
            value={petForm.breed}
            onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
          />

          <div className="flex items-center gap-4">
            {petPhotoPreview ? (
              <img
                src={petPhotoPreview}
                alt="Preview"
                className="w-16 h-16 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs text-center px-1">
                Foto
              </div>
            )}
            <div>
              <label className="inline-block cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-3 py-2 rounded-lg">
                Pilih foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleNewPetPhoto}
                />
              </label>
              {petPhotoPreview && (
                <button
                  type="button"
                  onClick={clearNewPetPhoto}
                  className="ml-2 text-xs text-rose-500"
                >
                  Hapus foto
                </button>
              )}
              <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP · maks. 5 MB</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPet}
            className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {savingPet ? 'Menyimpan...' : 'Simpan Hewan'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-blue-900 mb-4">Riwayat Pesanan Shop</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada pesanan supermarket.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="border border-slate-100 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-800">Pesanan #{order.id}</span>
                  <span className="text-blue-700 font-semibold">
                    Rp {parseFloat(order.total_price).toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 capitalize">Status: {order.status}</p>
                <ul className="text-xs text-slate-600 mt-2 space-y-1">
                  {order.items?.map((item) => (
                    <li key={item.id}>
                      {item.product?.emoji} {item.product?.name} × {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-lg font-medium"
      >
        Keluar
      </button>
    </div>
  )
}

export default Profile
