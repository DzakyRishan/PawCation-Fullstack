import { useState, useRef, useEffect } from 'react'

const FLASK_URL = 'http://localhost:5000/chat'

function PawBot() {
const [messages, setMessages] = useState(() => {
  const saved = localStorage.getItem('pawbot_chat')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      // kalau data rusak, fallback ke default
    }
  }
  return [
    {
      sender: 'bot',
      text: 'Halo! Aku PawBot, ada yang bisa aku bantu soal kesehatan hewan peliharaanmu?',
    },
  ]
})
  const [input, setInput] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
  localStorage.setItem('pawbot_chat', JSON.stringify(messages))
}, [messages])

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSend = async () => {
    if (!input.trim() && !photo) return

    const isFirst = messages.length === 1 // cuma ada salam pembuka bot
    const userMessage = {
      sender: 'user',
      text: input,
      photoPreview: photoPreview,
    }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)

    const riwayat = messages.map((m) => ({
      pengirim: m.sender === 'user' ? 'User' : 'PawBot',
      teks: m.text,
    }))

    const formData = new FormData()
    formData.append('pesan', input)
    formData.append('is_first', isFirst ? 'true' : 'false')
    formData.append('riwayat', JSON.stringify(riwayat))
    if (photo) formData.append('foto', photo)

    setInput('')
    removePhoto()
    setLoading(true)

    try {
      const res = await fetch(FLASK_URL, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: `⚠️ Terjadi kesalahan: ${data.error}` },
        ])
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: data.jawaban }])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: '⚠️ Gagal terhubung ke server PawBot. Pastikan server Flask sedang berjalan.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-1">PawBot AI</h1>
      <p className="text-slate-500 mb-6">Asisten AI untuk konsultasi kesehatan hewanmu, kapan saja.</p>

      {/* Chat Window */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 h-[550px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((msg, idx) =>
            msg.sender === 'bot' ? (
              <div key={idx} className="flex gap-2">
                <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white text-sm shrink-0">
                  🤖
                </div>
                <div className="bg-blue-50 text-slate-700 rounded-xl rounded-tl-none px-4 py-2 max-w-sm whitespace-pre-wrap text-sm">
                  {msg.text}
                </div>
              </div>
            ) : (
              <div key={idx} className="flex gap-2 justify-end">
                <div className="bg-blue-900 text-white rounded-xl rounded-tr-none px-4 py-2 max-w-sm text-sm">
                  {msg.photoPreview && (
                    <img
                      src={msg.photoPreview}
                      alt="foto hewan"
                      className="rounded-lg mb-2 max-h-40 object-cover"
                    />
                  )}
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                </div>
              </div>
            )
          )}

          {loading && (
            <div className="flex gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-white text-sm shrink-0">
                🤖
              </div>
              <div className="bg-blue-50 text-slate-400 rounded-xl rounded-tl-none px-4 py-2 text-sm italic">
                PawBot sedang mengetik...
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Preview foto sebelum kirim */}
        {photoPreview && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
            <img src={photoPreview} alt="preview" className="w-14 h-14 object-cover rounded-lg" />
            <span className="text-sm text-slate-500 flex-1">Foto siap dikirim</span>
            <button
              onClick={removePhoto}
              className="text-rose-500 text-sm font-medium hover:text-rose-600"
            >
              Hapus
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border border-slate-200 hover:border-blue-300 text-slate-500 px-3 py-2 rounded-lg"
            title="Upload foto hewan"
          >
            📷
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pertanyaanmu..."
            disabled={loading}
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
          />
          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !photo)}
            className="bg-blue-900 hover:bg-blue-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-medium"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  )
}

export default PawBot