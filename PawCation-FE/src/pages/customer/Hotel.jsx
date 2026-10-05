import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import PetAvatar from '../../components/PetAvatar'
import { Link } from 'react-router-dom'

const roomTypes = [
  { id: 'standard', name: 'Standard', desc: 'AC, tempat tidur, mainan', price: 100000, emoji: '🛏️' },
  { id: 'deluxe', name: 'Deluxe', desc: 'AC, kamera pantau, area main', price: 175000, emoji: '🏡' },
  { id: 'vip', name: 'VIP', desc: 'Full fasilitas + grooming gratis', price: 250000, emoji: '👑' },
]

const addons = [
  { id: 'grooming', name: 'Grooming', price: 50000 },
  { id: 'pettaxi', name: 'Pet Taxi Antar-Jemput', price: 40000 },
  { id: 'vetcheck', name: 'Vet Check-up', price: 75000 },
]

function Hotel() {
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [petsLoading, setPetsLoading] = useState(true)
  const [petsError, setPetsError] = useState(null)

  const [selectedPet, setSelectedPet] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [selectedAddons, setSelectedAddons] = useState([])

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const [newPetName, setNewPetName] = useState('')
  const [newPetType, setNewPetType] = useState('kucing')
  const [addingPet, setAddingPet] = useState(false)

  const loadPets = () => {
    setPetsLoading(true)
    setPetsError(null)
    apiFetch('/pets')
      .then((data) => {
        setPets(data)
        setPetsLoading(false)
      })
      .catch((err) => {
        setPetsError(err.message)
        setPetsLoading(false)
      })
  }

  useEffect(() => {
    loadPets()
  }, [])

  const handleAddPet = async (e) => {
    e.preventDefault()
    if (!newPetName.trim()) return
    setAddingPet(true)
    try {
      const pet = await apiFetch('/pets', {
        method: 'POST',
        body: JSON.stringify({ name: newPetName.trim(), type: newPetType }),
      })
      setPets((prev) => [...prev, pet])
      setSelectedPet(pet)
      setNewPetName('')
    } catch (err) {
      setPetsError(err.message)
    } finally {
      setAddingPet(false)
    }
  }

  const toggleAddon = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const inDate = new Date(checkIn)
    const outDate = new Date(checkOut)
    const diff = (outDate - inDate) / (1000 * 60 * 60 * 24)
    return diff > 0 ? diff : 0
  }

  const nights = calculateNights()
  const roomPrice = selectedRoom ? selectedRoom.price * nights : 0
  const addonsPrice = selectedAddons.reduce((sum, id) => {
    const addon = addons.find((a) => a.id === id)
    return sum + (addon ? addon.price : 0)
  }, 0)
  const total = roomPrice + addonsPrice

  const isFormComplete = selectedPet && selectedRoom && nights > 0

  const handleConfirmBooking = async () => {
    if (!isFormComplete || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    setSuccessMessage(null)

    try {
      await apiFetch('/hotel-bookings', {
        method: 'POST',
        body: JSON.stringify({
          pet_id: selectedPet.id,
          check_in: checkIn,
          check_out: checkOut,
          room_type: selectedRoom.id,
          addons: selectedAddons,
        }),
      })
      setSuccessMessage('Booking berhasil! Status menunggu konfirmasi.')
      setTimeout(() => navigate('/schedule'), 1500)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="p-8 max-w-6xl mx-auto flex gap-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-blue-900 mb-1">Pet Hotel</h1>
        <p className="text-slate-500 mb-6">Titipkan hewan kesayanganmu dengan aman dan nyaman.</p>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-4">Pilih Hewan</h2>
          {petsLoading && <p className="text-sm text-slate-400">Memuat data hewan...</p>}
          {petsError && (
            <p className="text-sm text-rose-500 mb-3">{petsError}</p>
          )}
          {!petsLoading && pets.length === 0 && (
            <p className="text-sm text-slate-500 mb-4">
              Belum ada hewan terdaftar. Tambahkan dulu agar bisa booking hotel.
            </p>
          )}
          {pets.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {pets.map((pet) => (
                <button
                  key={pet.id}
                  type="button"
                  onClick={() => setSelectedPet(pet)}
                  className={`flex items-center gap-2 border rounded-xl px-4 py-2 transition ${
                    selectedPet?.id === pet.id
                      ? 'border-blue-900 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <PetAvatar pet={pet} size="sm" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-800">{pet.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{pet.type}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <form onSubmit={handleAddPet} className="flex flex-wrap gap-2 items-end border-t border-slate-100 pt-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Nama hewan baru</label>
              <input
                type="text"
                value={newPetName}
                onChange={(e) => setNewPetName(e.target.value)}
                placeholder="Contoh: Choco"
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Jenis</label>
              <select
                value={newPetType}
                onChange={(e) => setNewPetType(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="kucing">Kucing</option>
                <option value="anjing">Anjing</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={addingPet || !newPetName.trim()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {addingPet ? 'Menyimpan...' : '+ Tambah Hewan'}
            </button>
            <Link to="/profile" className="text-xs text-blue-700 self-center pb-2">
              Upload foto di Profil →
            </Link>
          </form>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-4">Tanggal Menginap</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-500 mb-1 block">Check-in</label>
              <input
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500 mb-1 block">Check-out</label>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2"
              />
            </div>
          </div>
          {nights > 0 && (
            <p className="text-sm text-blue-700 mt-2 font-medium">{nights} malam</p>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-4">Pilih Tipe Kamar</h2>
          <div className="grid grid-cols-3 gap-4">
            {roomTypes.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoom(room)}
                className={`text-left border rounded-xl overflow-hidden transition ${
                  selectedRoom?.id === room.id
                    ? 'border-blue-900 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="bg-blue-50 h-24 flex items-center justify-center text-3xl">
                  {room.emoji}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-slate-800 text-sm mb-1">{room.name}</p>
                  <p className="text-xs text-slate-500 mb-1">{room.desc}</p>
                  <p className="text-blue-700 font-semibold text-sm">
                    Rp {room.price.toLocaleString('id-ID')} / malam
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-blue-900 mb-4">Layanan Tambahan</h2>
          <div className="space-y-2">
            {addons.map((addon) => (
              <label
                key={addon.id}
                className="flex items-center justify-between border border-slate-200 rounded-lg px-4 py-3 cursor-pointer hover:border-blue-300"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedAddons.includes(addon.id)}
                    onChange={() => toggleAddon(addon.id)}
                    className="w-4 h-4 accent-blue-900"
                  />
                  <span className="text-sm text-slate-700">{addon.name}</span>
                </div>
                <span className="text-sm text-blue-700 font-medium">
                  Rp {addon.price.toLocaleString('id-ID')}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="w-80 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-8">
          <h2 className="font-semibold text-blue-900 mb-4">Ringkasan Booking</h2>

          {!selectedPet && !selectedRoom && nights === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Lengkapi form untuk melihat ringkasan.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {selectedPet && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Hewan</span>
                  <span className="text-slate-800 font-medium">{selectedPet.name}</span>
                </div>
              )}
              {selectedRoom && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Kamar</span>
                  <span className="text-slate-800 font-medium">{selectedRoom.name}</span>
                </div>
              )}
              {nights > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Durasi</span>
                  <span className="text-slate-800 font-medium">{nights} malam</span>
                </div>
              )}
              {selectedRoom && nights > 0 && (
                <div className="flex justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-500">Biaya Kamar</span>
                  <span className="text-slate-800 font-medium">
                    Rp {roomPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              {selectedAddons.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Add-on</span>
                  <span className="text-slate-800 font-medium">
                    Rp {addonsPrice.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="font-semibold text-blue-900">Total</span>
                <span className="font-bold text-blue-900">
                  Rp {total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          )}

          {submitError && (
            <p className="text-sm text-rose-500 mt-3">{submitError}</p>
          )}
          {successMessage && (
            <p className="text-sm text-emerald-600 mt-3">{successMessage}</p>
          )}

          <button
            type="button"
            disabled={!isFormComplete || submitting}
            onClick={handleConfirmBooking}
            className={`w-full mt-4 py-2.5 rounded-lg font-medium transition ${
              isFormComplete && !submitting
                ? 'bg-blue-900 hover:bg-blue-800 text-white'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Memproses...' : 'Konfirmasi Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hotel
