import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../lib/api'
import PetAvatar from '../../components/PetAvatar'

function CCTV() {
  const [sessions, setSessions] = useState([])
  const [selectedPetName, setSelectedPetName] = useState('Hewan')
  const [heartRate, setHeartRate] = useState(85)
  const [temp, setTemp] = useState(24.0)
  const [activity, setActivity] = useState('Active')
  const [logs, setLogs] = useState([])
  const [, forceTick] = useState(0)
  const nextId = useRef(1)

  useEffect(() => {
    apiFetch('/cctv/sessions')
      .then((data) => {
        setSessions(data)
        if (data[0]?.pet?.name) {
          setSelectedPetName(data[0].pet.name)
        }
      })
      .catch(() => setSessions([]))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate((prev) => {
        const change = Math.floor(Math.random() * 7) - 3
        return Math.min(120, Math.max(70, prev + change))
      })
      setTemp((prev) => {
        const change = Math.random() * 0.6 - 0.3
        return Math.round(Math.min(27, Math.max(22, prev + change)) * 10) / 10
      })
      setActivity((prev) => (Math.random() > 0.7 ? (prev === 'Active' ? 'Resting' : 'Active') : prev))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const pool = [
      { text: `${selectedPetName} sedang makan siang`, type: 'normal' },
      { text: `${selectedPetName} sedang tidur`, type: 'normal' },
      { text: `${selectedPetName} bermain dengan mainan`, type: 'normal' },
      { text: 'Aktivitas meningkat terdeteksi', type: 'info' },
      { text: `${selectedPetName} minum air`, type: 'normal' },
      { text: '⚠️ Detak jantung di atas normal', type: 'warning' },
    ]

    const interval = setInterval(() => {
      const random = pool[Math.floor(Math.random() * pool.length)]
      setLogs((prev) => [
        { id: nextId.current++, text: random.text, type: random.type, time: Date.now() },
        ...prev,
      ].slice(0, 8))
    }, 10000)

    setLogs([
      { id: nextId.current++, text: `${selectedPetName} sedang makan siang`, type: 'normal', time: Date.now() - 120000 },
    ])

    return () => clearInterval(interval)
  }, [selectedPetName])

  useEffect(() => {
    const interval = setInterval(() => forceTick((t) => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  const timeAgo = (timestamp) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000)
    if (diffSec < 60) return 'Baru saja'
    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin} menit lalu`
    return `${Math.floor(diffMin / 60)} jam lalu`
  }

  const borderColor = (type) => {
    if (type === 'warning') return 'border-rose-400'
    if (type === 'info') return 'border-blue-500'
    return 'border-slate-200'
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-1">CCTV Live</h1>
      <p className="text-slate-500 mb-6">Pantau hewan kesayanganmu secara langsung.</p>

      {sessions.length === 0 ? (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-sm text-amber-800">
          Belum ada sesi hotel aktif (status confirmed/checked_in). Booking hotel dulu, lalu minta admin
          mengubah status agar CCTV aktif.
        </div>
      ) : (
        <div className="mb-4 flex gap-2 flex-wrap">
          {sessions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedPetName(s.pet?.name || 'Hewan')}
              className={`text-sm px-3 py-1.5 rounded-full border flex items-center gap-2 ${
                selectedPetName === s.pet?.name
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white border-slate-200'
              }`}
            >
              <PetAvatar pet={s.pet} size="sm" className="w-7 h-7 text-sm" />
              {s.pet?.name} · {s.room_type}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-slate-900 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden">
            <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE
            </span>
            <p className="text-slate-400">
              {sessions.length ? `Live feed · ${selectedPetName}` : 'Live feed placeholder'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">❤️</p>
              <p className="font-semibold text-slate-800">{heartRate} bpm</p>
              <p className="text-xs text-slate-400">Heart Rate</p>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">🏃</p>
              <p className="font-semibold text-blue-900">{activity}</p>
              <p className="text-xs text-slate-400">Activity</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">🌡️</p>
              <p className="font-semibold text-slate-800">{temp}°C</p>
              <p className="text-xs text-slate-400">Temp</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="font-semibold text-blue-900 mb-3">Aktivitas Terkini</h2>
          <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div key={log.id} className={`border-l-2 ${borderColor(log.type)} pl-3`}>
                <p className={log.type === 'warning' ? 'text-rose-600 font-medium' : 'text-slate-700'}>
                  {log.text}
                </p>
                <p className="text-xs text-slate-400">{timeAgo(log.time)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CCTV
