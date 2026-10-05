import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import { petTypeLabel } from '../../lib/pets'

function PetTaxi() {
  const [pets, setPets] = useState([])
  const [activeTrip, setActiveTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    pet_id: '',
    pickup_address: '',
    dropoff_address: '',
    pickup_time: '',
  })

  useEffect(() => {
    Promise.all([apiFetch('/pets'), apiFetch('/pet-taxi')])
      .then(([petList, trips]) => {
        setPets(petList)
        if (petList.length) {
          setForm((f) => ({ ...f, pet_id: String(petList[0].id) }))
        }
        const ongoing = trips.find((t) => t.status === 'on_the_way' || t.status === 'pending')
        setActiveTrip(ongoing || null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const trip = await apiFetch('/pet-taxi', {
        method: 'POST',
        body: JSON.stringify({
          pet_id: Number(form.pet_id),
          pickup_address: form.pickup_address,
          dropoff_address: form.dropoff_address,
          pickup_time: form.pickup_time,
        }),
      })
      setActiveTrip(trip)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!activeTrip) return
    try {
      await apiFetch(`/pet-taxi/${activeTrip.id}/cancel`, { method: 'PATCH' })
      setActiveTrip(null)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <p className="text-slate-400">Memuat...</p>
      </div>
    )
  }

  if (activeTrip) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-900 mb-1">Pet Taxi</h1>
        <p className="text-slate-500 mb-6">Driver sedang menuju lokasi penjemputan.</p>

        {error && <p className="text-sm text-rose-500 mb-4">{error}</p>}

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="bg-blue-50 h-48 rounded-lg flex items-center justify-center text-slate-400 mb-4">
            🗺️ Live Tracking Map
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-xl">
              🚗
            </div>
            <div>
              <p className="font-semibold text-slate-800">{activeTrip.driver_name}</p>
              <p className="text-sm text-slate-500">{activeTrip.driver_vehicle}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-900 mt-1.5" />
            <div>
              <p className="text-xs text-slate-400">Penjemputan</p>
              <p className="text-sm font-medium text-slate-800">{activeTrip.pickup_address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1.5" />
            <div>
              <p className="text-xs text-slate-400">Tujuan</p>
              <p className="text-sm font-medium text-slate-800">{activeTrip.dropoff_address}</p>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <span className="text-sm text-slate-500">Hewan</span>
            <span className="text-sm font-semibold text-blue-900">{activeTrip.pet?.name}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCancel}
          className="w-full mt-6 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-lg font-medium"
        >
          Batalkan Pesanan
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-1">Pet Taxi</h1>
      <p className="text-slate-500 mb-6">Antar jemput hewan kesayanganmu dengan aman.</p>

      {error && <p className="text-sm text-rose-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Hewan</label>
          <select
            name="pet_id"
            value={form.pet_id}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm"
            required
          >
            {pets.length === 0 ? (
              <option value="">Tambah hewan dulu di Profil</option>
            ) : (
              pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({petTypeLabel(pet.type)})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Lokasi Penjemputan</label>
          <input
            type="text"
            name="pickup_address"
            placeholder="Alamat penjemputan"
            value={form.pickup_address}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Tujuan</label>
          <input
            type="text"
            name="dropoff_address"
            placeholder="PawCation Hotel"
            value={form.dropoff_address}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Waktu Penjemputan</label>
          <input
            type="time"
            name="pickup_time"
            value={form.pickup_time}
            onChange={handleChange}
            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting || pets.length === 0}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg disabled:opacity-60"
        >
          {submitting ? 'Memproses...' : 'Pesan Pet Taxi'}
        </button>
      </form>
    </div>
  )
}

export default PetTaxi
