import { useState, lazy, Suspense } from 'react'

// Chat dimuat hanya saat pop-up pertama kali dibuka (biar Home tetap ringan).
const PawBotChat = lazy(() =>
  import('../pages/customer/PawBot').then((m) => ({ default: m.PawBotChat }))
)

// Tombol bulat melayang di kanan bawah -> buka pop-up chat PawBot.
function PawBotWidget() {
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const toggle = () => {
    setLoaded(true)
    setOpen((o) => !o)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Pop-up chat (tetap ter-mount setelah dibuka agar chat tidak hilang saat ditutup) */}
      {loaded && (
        <div
          className={`w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden origin-bottom-right transition-all duration-300 ${
            open ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
          }`}
          role="dialog"
          aria-label="PawBot AI"
          aria-hidden={!open}
        >
          <div className="bg-blue-900 text-white px-4 py-3 flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-lg">🤖</span>
            <div className="flex-1">
              <p className="font-semibold leading-tight">PawBot AI</p>
              <p className="text-xs text-blue-200">Asisten kesehatan hewanmu</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup PawBot"
              className="w-8 h-8 rounded-full hover:bg-white/15 flex items-center justify-center text-xl leading-none"
            >
              ×
            </button>
          </div>
          <Suspense fallback={<p className="p-6 text-sm text-slate-400">Memuat PawBot…</p>}>
            <PawBotChat className="h-[460px] max-h-[65vh] p-4" />
          </Suspense>
        </div>
      )}

      {/* Tombol bulat */}
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? 'Tutup PawBot' : 'Buka PawBot'}
        aria-expanded={open}
        className="relative w-14 h-14 rounded-full bg-blue-900 hover:bg-blue-800 text-white shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-105"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-blue-900 animate-ping opacity-25" aria-hidden />
        )}
        <span className="relative">{open ? '×' : '🤖'}</span>
      </button>
    </div>
  )
}

export default PawBotWidget
