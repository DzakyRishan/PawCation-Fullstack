import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import { formatDate, formatTime } from '../../lib/format'

const hotelStatus = {
  pending: { text: 'MENUNGGU', className: 'bg-amber-50 text-amber-600' },
  confirmed: { text: 'DIKONFIRMASI', className: 'bg-blue-50 text-blue-700' },
  checked_in: { text: 'CHECK-IN', className: 'bg-emerald-50 text-emerald-600' },
  checked_out: { text: 'SELESAI', className: 'bg-slate-100 text-slate-600' },
  cancelled: { text: 'BATAL', className: 'bg-rose-50 text-rose-600' },
}

const consultStatus = {
  pending: { text: 'MENUNGGU', className: 'bg-amber-50 text-amber-600' },
  confirmed: { text: 'DIKONFIRMASI', className: 'bg-blue-50 text-blue-700' },
  completed: { text: 'SELESAI', className: 'bg-emerald-50 text-emerald-600' },
  cancelled: { text: 'BATAL', className: 'bg-rose-50 text-rose-600' },
}

const taxiStatus = {
  pending: { text: 'MENUNGGU', className: 'bg-amber-50 text-amber-600' },
  on_the_way: { text: 'DI JALAN', className: 'bg-blue-50 text-blue-700' },
  completed: { text: 'SELESAI', className: 'bg-emerald-50 text-emerald-600' },
  cancelled: { text: 'BATAL', className: 'bg-rose-50 text-rose-600' },
}

function Schedule() {
  const [hotelBookings, setHotelBookings] = useState([])
  const [consultBookings, setConsultBookings] = useState([])
  const [taxiTrips, setTaxiTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      apiFetch('/hotel-bookings'),
      apiFetch('/consult-bookings'),
      apiFetch('/pet-taxi'),
    ])
      .then(([hotel, consult, taxi]) => {
        setHotelBookings(hotel)
        setConsultBookings(consult)
        setTaxiTrips(taxi)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const cancelHotel = async (id) => {
    if (!window.confirm('Batalkan booking hotel ini?')) return
    try {
      await apiFetch(`/hotel-bookings/${id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const cancelConsult = async (id) => {
    if (!window.confirm('Batalkan booking konsultasi ini?')) return
    try {
      await apiFetch(`/consult-bookings/${id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-900 mb-1">Jadwal</h1>
        <p className="text-slate-500">Kelola semua jadwal perawatan hewan kesayanganmu.</p>
      </div>

      {loading && <p className="text-sm text-slate-400">Memuat jadwal...</p>}
      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-blue-900 mb-4">Booking Pet Hotel</h2>
        {!loading && hotelBookings.length === 0 && (
          <p className="text-sm text-slate-400">Belum ada booking hotel.</p>
        )}
        <div className="space-y-3">
          {hotelBookings.map((b) => {
            const status = hotelStatus[b.status] || hotelStatus.pending
            return (
              <div key={b.id} className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    Kamar {b.room_type} · {b.pet?.name}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                    {status.text}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">
                  {formatDate(b.check_in)} → {formatDate(b.check_out)} · Rp{' '}
                  {parseFloat(b.total_price).toLocaleString('id-ID')}
                </p>
                {b.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => cancelHotel(b.id)}
                    className="text-xs text-rose-500 font-medium"
                  >
                    Batalkan
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-blue-900 mb-4">Booking Kesehatan</h2>
        {!loading && consultBookings.length === 0 && (
          <p className="text-sm text-slate-400">Belum ada booking konsultasi.</p>
        )}
        <div className="space-y-3">
          {consultBookings.map((b) => {
            const status = consultStatus[b.status] || consultStatus.pending
            return (
              <div key={b.id} className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {b.package?.replace('_', ' ')} · {b.pet?.name}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                    {status.text}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-1">
                  {formatDate(b.consult_date)} · {formatTime(b.consult_time)} · {b.doctor}
                </p>
                <p className="text-xs text-slate-400 mb-2">
                  Rp {parseFloat(b.total_price).toLocaleString('id-ID')}
                </p>
                {b.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => cancelConsult(b.id)}
                    className="text-xs text-rose-500 font-medium"
                  >
                    Batalkan
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-blue-900 mb-4">Pet Taxi</h2>
        {!loading && taxiTrips.length === 0 && (
          <p className="text-sm text-slate-400">Belum ada pesanan pet taxi.</p>
        )}
        <div className="space-y-3">
          {taxiTrips.map((t) => {
            const status = taxiStatus[t.status] || taxiStatus.pending
            return (
              <div key={t.id} className="border border-slate-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-slate-800">
                    {t.pet?.name} · {t.pickup_address}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.className}`}>
                    {status.text}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  → {t.dropoff_address} · Jemput {formatTime(t.pickup_time)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Schedule
