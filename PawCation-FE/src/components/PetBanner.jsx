import { useState, useEffect, useCallback } from 'react'

// Satu banner, dua panel independen:
//  - Panel KIRI  : tulisan  -> atur lewat array `textSlides`
//  - Panel KANAN : foto     -> atur lewat array `photoSlides`
// Mengubah satu panel tidak memengaruhi panel lain. Keduanya hanya
// berbagi index slide agar pergantiannya sinkron.
// Palet tetap: biru (blue-900 / blue-50) + putih.

// ===== PANEL KIRI (tulisan) =====
const textSlides = [
  {
    brand: true,
    subtitle: 'Pet hotel, supermarket, konsultasi & CCTV — satu platform untuk hewan kesayanganmu.',
  },
  { kicker: 'Pet Hotel', title: 'Menginap Nyaman', subtitle: 'Kamar ber-AC, dipantau CCTV 24 jam.' },
  { kicker: 'Grooming & Sehat', title: 'Perawatan Terbaik', subtitle: 'Grooming dan vet check-up oleh tim profesional.' },
  { kicker: 'Pet Taxi & Main', title: 'Aktif & Bahagia', subtitle: 'Antar-jemput dan area bermain yang luas.' },
]

// ===== PANEL KANAN (foto) =====
// fit      : 'contain' = foto utuh (tidak terpotong) | 'cover' = isi penuh panel (bisa terpotong)
// position : titik fokus foto, mis. 'center', 'top', 'bottom', '50% 30%'
// scale    : perbesar/perkecil foto (1 = normal)
const photoSlides = [
  { img: '/pets/banner-golden.jpg', alt: 'Golden Retriever', fit: 'cover', position: 'center', scale: 1 },
  { img: '/pets/banner-persian.jpg', alt: 'Persian Cat', fit: 'cover', position: 'center', scale: 1 },
  { img: '/pets/banner-siamese.jpg', alt: 'Siamese Cat', fit: 'cover', position: 'center', scale: 1 },
  { img: '/pets/banner-corgi.jpg', alt: 'Corgi', fit: 'cover', position: 'center', scale: 1 },
]

const INTERVAL = 4000
const TOTAL = Math.max(textSlides.length, photoSlides.length)

function TextPanel({ index }) {
  return (
    <div className="relative h-full">
      {textSlides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 flex flex-col justify-center px-8 md:px-12 py-6 transition-all duration-700 ${
            i === index % textSlides.length
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          {s.brand ? (
            <>
              <img
                src="/pawcation-logo.png"
                alt="PawCation"
                className="h-12 md:h-16 w-auto self-start mb-4"
                draggable={false}
              />
              <p className="text-slate-600 text-sm md:text-base max-w-md">{s.subtitle}</p>
            </>
          ) : (
            <>
              <span className="inline-block self-start text-white bg-blue-900 text-xs md:text-sm font-semibold px-3 py-1 rounded-full mb-3">
                {s.kicker}
              </span>
              <h2 className="text-blue-900 text-2xl md:text-4xl font-bold mb-2 leading-tight">
                {s.title}
              </h2>
              <p className="text-slate-600 text-sm md:text-base max-w-md">{s.subtitle}</p>
              <span className="mt-3 text-blue-500 text-xs md:text-sm font-semibold">by PawCation</span>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function PhotoPanel({ index }) {
  return (
    <div className="relative h-full overflow-hidden bg-blue-100">
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${(index % photoSlides.length) * 100}%)` }}
      >
        {photoSlides.map((p, i) => (
          <div key={i} className="relative w-full h-full shrink-0 flex items-center justify-center overflow-hidden">
            {/* Latar: foto yang sama diblur, mengisi panel agar tidak ada ruang kosong */}
            <img
              src={p.img}
              alt=""
              aria-hidden
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-60"
            />
            <div className="absolute inset-0 bg-blue-900/10" />
            {/* Kartu foto: ukuran seragam (3:4) untuk semua foto */}
            <div className="relative h-[85%] aspect-[3/4] rounded-2xl overflow-hidden shadow-xl ring-4 ring-white/70">
              <img
                src={p.img}
                alt={p.alt}
                draggable={false}
                className="w-full h-full"
                style={{
                  objectFit: p.fit,
                  objectPosition: p.position,
                  transform: `scale(${p.scale})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PetBanner() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((i) => setIndex(((i % TOTAL) + TOTAL) % TOTAL), [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % TOTAL), INTERVAL)
    return () => clearInterval(t)
  }, [paused])

  return (
    <div
      className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden mb-8 shadow-sm bg-blue-50 grid grid-cols-2 group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <TextPanel index={index} />
      <PhotoPanel index={index} />

      {/* Panah */}
      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Sebelumnya"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-blue-900 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition z-20"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Berikutnya"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-blue-900 flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition z-20"
      >
        ›
      </button>

      {/* Dots (di panel kiri, agar tidak menutupi foto) */}
      <div className="absolute bottom-4 left-8 md:left-12 flex gap-2 z-20">
        {Array.from({ length: TOTAL }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? 'w-6 bg-blue-900' : 'w-2 bg-blue-300 hover:bg-blue-500'
            }`}
          />
        ))}
      </div>

      {/* Progress bar waktu auto-slide */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-blue-100 z-20">
        <div
          key={`${index}-${paused}`}
          className="h-full bg-blue-900"
          style={{ animation: paused ? 'none' : `pawbarGrow ${INTERVAL}ms linear forwards` }}
        />
      </div>

      <style>{`
        @keyframes pawbarGrow { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  )
}

export default PetBanner
