import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { petTypeLabel } from '../../lib/pets'
import PetAvatar from '../../components/PetAvatar'

const packages = [
  { id: 'basic', name: 'Basic Check-up', desc: 'Pemeriksaan umum, suhu, berat badan', price: 60000, emoji: '🩺' },
  { id: 'vaccine', name: 'Vaksinasi', desc: 'Vaksin lengkap + kartu kesehatan', price: 150000, emoji: '💉' },
  { id: 'dental', name: 'Perawatan Gigi', desc: 'Scaling + pemeriksaan gigi & gusi', price: 200000, emoji: '🦷' },
  { id: 'full_body', name: 'Full Body Check', desc: 'Pemeriksaan menyeluruh + lab dasar', price: 350000, emoji: '🔬' },
]

const doctors = [
  { id: 1, name: 'drg. Ayu Kartika', specialist: 'Umum & Vaksinasi', emoji: '👩‍⚕️' },
  { id: 2, name: 'drh. Bagas Prasetyo', specialist: 'Gigi & Bedah Kecil', emoji: '👨‍⚕️' },
  { id: 3, name: 'drh. Citra Wulandari', specialist: 'Internal & Lab', emoji: '👩‍⚕️' },
]

const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']

function Consult() {
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [petsLoading, setPetsLoading] = useState(true)

  const [selectedPet, setSelectedPet] = useState(null)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [consultDate, setConsultDate] = useState('')
  const [consultTime, setConsultTime] = useState('')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    apiFetch('/pets')
      .then(setPets)
      .catch(() => setPets([]))
      .finally(() => setPetsLoading(false))
  }, [])

  const packagePrice = selectedPackage ? selectedPackage.price : 0
  const consultFee = selectedDoctor ? 50000 : 0
  const total = packagePrice + consultFee

  const isFormComplete =
    selectedPet && selectedPackage && selectedDoctor && consultDate && consultTime

  const handleConfirm = async () => {
    if (!isFormComplete || submitting) return
    setSubmitting(true)
    setSubmitError(null)

    try {
      await apiFetch('/consult-bookings', {
        method: 'POST',
        body: JSON.stringify({
          pet_id: selectedPet.id,
          package: selectedPackage.id,
          doctor: selectedDoctor.name,
          consult_date: consultDate,
          consult_time: consultTime,
          notes: notes || null,
        }),
      })
      navigate('/schedule')
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
        <h1 className="text-2xl font-bold text-blue-900 mb-1">Booking Kesehatan</h1>
        <p className="text-slate-500 mb-6">Jadwalkan konsultasi kesehatan untuk hewan kesayanganmu.</p>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-4">Pilih Hewan</h2>
          {petsLoading && <p className="text-sm text-slate-400">Memuat...</p>}
          {!petsLoading && pets.length === 0 && (
            <p className="text-sm text-slate-500">
              Belum ada hewan. Tambahkan dari halaman{' '}
              <a href="/hotel" className="text-blue-700">Pet Hotel</a> atau Profil.
            </p>
          )}
          <div className="flex flex-wrap gap-3">
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
                  <p className="text-xs text-slate-400">{petTypeLabel(pet.type)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-4">Pilih Paket Kesehatan</h2>
          <div className="grid grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackage(pkg)}
                className={`text-left border rounded-xl overflow-hidden transition ${
                  selectedPackage?.id === pkg.id
                    ? 'border-blue-900 ring-2 ring-blue-100'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="bg-blue-50 h-20 flex items-center justify-center text-3xl">
                  {pkg.emoji}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-slate-800 text-sm mb-1">{pkg.name}</p>
                  <p className="text-xs text-slate-500 mb-1">{pkg.desc}</p>
                  <p className="text-blue-700 font-semibold text-sm">
                    Rp {pkg.price.toLocaleString('id-ID')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-4">Pilih Dokter</h2>
          <div className="grid grid-cols-3 gap-4">
            {doctors.map((doc) => (
              <button
                key={doc.id}
                type="button"
                onClick={() => setSelectedDoctor(doc)}
                className={`flex flex-col items-center text-center border rounded-xl p-4 transition ${
                  selectedDoctor?.id === doc.id
                    ? 'border-blue-900 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className="text-3xl mb-2">{doc.emoji}</span>
                <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                <p className="text-xs text-slate-400 mt-1">{doc.specialist}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-blue-900 mb-4">Jadwal Konsultasi</h2>
          <div className="mb-4">
            <label className="text-sm text-slate-500 mb-1 block">Tanggal</label>
            <input
              type="date"
              min={today}
              value={consultDate}
              onChange={(e) => setConsultDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm text-slate-500 mb-2 block">Jam</label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setConsultTime(slot)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                    consultTime === slot
                      ? 'border-blue-900 bg-blue-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-blue-900 mb-4">Catatan Tambahan (opsional)</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Contoh: hewan alergi obat tertentu, riwayat penyakit, dll."
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      <div className="w-80 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-8">
          <h2 className="font-semibold text-blue-900 mb-4">Ringkasan Booking</h2>

          {!selectedPet && !selectedPackage && !selectedDoctor && !consultDate ? (
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
              {selectedPackage && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Paket</span>
                  <span className="text-slate-800 font-medium">{selectedPackage.name}</span>
                </div>
              )}
              {selectedDoctor && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Dokter</span>
                  <span className="text-slate-800 font-medium">{selectedDoctor.name}</span>
                </div>
              )}
              {consultDate && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal</span>
                  <span className="text-slate-800 font-medium">{consultDate}</span>
                </div>
              )}
              {consultTime && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Jam</span>
                  <span className="text-slate-800 font-medium">{consultTime}</span>
                </div>
              )}
              {selectedPackage && (
                <div className="flex justify-between border-t border-slate-100 pt-3">
                  <span className="text-slate-500">Biaya Paket</span>
                  <span className="text-slate-800 font-medium">
                    Rp {packagePrice.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
              {selectedDoctor && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Biaya Konsultasi</span>
                  <span className="text-slate-800 font-medium">
                    Rp {consultFee.toLocaleString('id-ID')}
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

          {submitError && <p className="text-sm text-rose-500 mt-3">{submitError}</p>}

          <button
            type="button"
            disabled={!isFormComplete || submitting}
            onClick={handleConfirm}
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

export default Consult
