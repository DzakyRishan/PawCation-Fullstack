import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'

const hotelStatuses = ['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']
const consultStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
const orderStatuses = ['pending', 'paid', 'cancelled']

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [hotelBookings, setHotelBookings] = useState([])
  const [consultBookings, setConsultBookings] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      apiFetch('/admin/stats'),
      apiFetch('/admin/hotel-bookings'),
      apiFetch('/admin/consult-bookings'),
      apiFetch('/admin/orders'),
    ])
      .then(([s, hotel, consult, orderList]) => {
        setStats(s)
        setHotelBookings(hotel)
        setConsultBookings(consult)
        setOrders(orderList)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const updateHotelStatus = async (id, status) => {
    try {
      await apiFetch(`/admin/hotel-bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const updateConsultStatus = async (id, status) => {
    try {
      await apiFetch(`/admin/consult-bookings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      await apiFetch(`/admin/orders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <p className="text-slate-500">Memuat dashboard...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">Admin Dashboard</h1>
      <p className="text-slate-500 mb-6">Kelola operasional PawCation sehari-hari.</p>

      {error && <p className="text-sm text-rose-500 mb-4">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500">Booking Hari Ini</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.bookings_today ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500">Order Supermarket</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.orders_today ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500">Kamar Terisi</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.rooms_occupied ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500">CCTV Aktif</p>
          <p className="text-2xl font-bold text-slate-800">{stats?.cctv_active ?? 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Booking Hotel</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {hotelBookings.map((b) => (
              <div key={b.id} className="border border-slate-100 rounded-lg p-3 text-sm">
                <p className="font-medium">
                  {b.user?.name} · {b.pet?.name} · {b.room_type}
                </p>
                <p className="text-xs text-slate-500 mb-2">
                  {String(b.check_in).slice(0, 10)} → {String(b.check_out).slice(0, 10)}
                </p>
                <select
                  value={b.status}
                  onChange={(e) => updateHotelStatus(b.id, e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1"
                >
                  {hotelStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {hotelBookings.length === 0 && (
              <p className="text-sm text-slate-400">Belum ada booking.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Booking Konsultasi</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {consultBookings.map((b) => (
              <div key={b.id} className="border border-slate-100 rounded-lg p-3 text-sm">
                <p className="font-medium">
                  {b.user?.name} · {b.pet?.name}
                </p>
                <p className="text-xs text-slate-500 mb-2">
                  {b.consult_date} {b.consult_time} · {b.doctor}
                </p>
                <select
                  value={b.status}
                  onChange={(e) => updateConsultStatus(b.id, e.target.value)}
                  className="text-xs border border-slate-200 rounded px-2 py-1"
                >
                  {consultStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            {consultBookings.length === 0 && (
              <p className="text-sm text-slate-400">Belum ada booking.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Pesanan Supermarket</h2>
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="border border-slate-100 rounded-lg p-3 text-sm">
              <p className="font-medium">
                #{o.id} · {o.user?.name} · Rp {parseFloat(o.total_price).toLocaleString('id-ID')}
              </p>
              <select
                value={o.status}
                onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                className="text-xs border border-slate-200 rounded px-2 py-1 mt-2"
              >
                {orderStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-slate-400">Belum ada pesanan.</p>}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
