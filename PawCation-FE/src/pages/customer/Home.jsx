import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { API_URL, apiFetch } from '../../lib/api'
import { formatDate } from '../../lib/format'
import PetBanner from '../../components/PetBanner'

function Home() {
  const [products, setProducts] = useState([])
  const [dashboard, setDashboard] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProducts(data.slice(0, 2)))
      .catch(() => setProducts([]))

    apiFetch('/dashboard')
      .then(setDashboard)
      .catch(() => setDashboard(null))
  }, [])

  const name = dashboard?.user?.name || 'Pet Parent'

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PetBanner />

      <div className="bg-blue-50 rounded-2xl p-8 mb-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Halo, {name}! 🐾
        </h1>
        <p className="text-slate-600 mb-4 max-w-2xl">
          Titipkan hewan kesayanganmu dengan tenang, belanja kebutuhan mereka,
          dan pantau langsung lewat CCTV kapan saja.
        </p>
        <Link
          to="/hotel"
          className="inline-block bg-blue-900 hover:bg-blue-800 text-white font-medium px-5 py-2 rounded-lg"
        >
          Booking Sekarang
        </Link>
      </div>

      {dashboard && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-900">{dashboard.stats.pets}</p>
            <p className="text-xs text-slate-500">Hewan Terdaftar</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-900">{dashboard.stats.orders}</p>
            <p className="text-xs text-slate-500">Pesanan Shop</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-900">{dashboard.stats.active_hotel_sessions}</p>
            <p className="text-xs text-slate-500">Sesi Hotel Aktif (CCTV)</p>
          </div>
        </div>
      )}

      {(dashboard?.upcoming_hotel?.length > 0 || dashboard?.upcoming_consult?.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-blue-900">Jadwal Mendatang</h2>
            <Link to="/schedule" className="text-blue-500 text-sm font-medium">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-2 text-sm">
            {dashboard.upcoming_hotel.map((b) => (
              <div key={`h-${b.id}`} className="flex justify-between border-b border-slate-50 pb-2">
                <span>
                  🏨 {b.pet?.name} · kamar {b.room_type}
                </span>
                <span className="text-slate-500">
                  {formatDate(b.check_in)} → {formatDate(b.check_out)}
                </span>
              </div>
            ))}
            {dashboard.upcoming_consult.map((b) => (
              <div key={`c-${b.id}`} className="flex justify-between border-b border-slate-50 pb-2">
                <span>
                  🩺 {b.pet?.name} · {b.doctor}
                </span>
                <span className="text-slate-500">
                  {formatDate(b.consult_date)} {b.consult_time}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-blue-900 text-lg">Produk Unggulan</h2>
            <Link to="/shop" className="text-blue-500 text-sm font-medium">
              Lihat Semua
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {products.length === 0 ? (
              <p className="text-sm text-slate-400 col-span-2">
                Memuat produk dari database...
              </p>
            ) : (
              products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition"
                >
                  <div className="bg-blue-50 h-32 flex items-center justify-center text-4xl">
                    {p.emoji}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-slate-800 mb-1">{p.name}</p>
                    <p className="text-blue-700 font-semibold">
                      Rp {parseFloat(p.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-blue-900 rounded-2xl p-6 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Butuh konsultasi mendadak?</h3>
            <p className="text-blue-100 text-sm">
              Jadwalkan pemeriksaan kesehatan hewanmu dengan dokter terpercaya PawCation.
            </p>
          </div>
          <Link
            to="/consult"
            className="mt-4 bg-white text-blue-900 font-medium text-sm px-4 py-2 rounded-lg text-center hover:bg-blue-50"
          >
            Mulai Konsultasi
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { to: '/shop', emoji: '🛒', label: 'Supermarket' },
          { to: '/hotel', emoji: '🏨', label: 'Pet Hotel' },
          { to: '/consult', emoji: '🩺', label: 'Booking Kesehatan' },
          { to: '/cctv', emoji: '📹', label: 'CCTV Live' },
          { to: '/schedule', emoji: '📅', label: 'Jadwal' },
          { to: '/pet-taxi', emoji: '🚕', label: 'Pet Taxi' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-white border border-slate-200 rounded-xl p-5 text-center hover:shadow-md transition"
          >
            <div className="text-3xl mb-2">{item.emoji}</div>
            <p className="font-medium text-slate-700">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home
