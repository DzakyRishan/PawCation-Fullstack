import { useState, useEffect } from 'react'
import { apiFetch, API_URL } from '../../lib/api'

const CART_STORAGE_KEY = 'pawcation_cart'

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [cart, setCart] = useState(loadCartFromStorage)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutMessage, setCheckoutMessage] = useState(null)
  const [checkoutError, setCheckoutError] = useState(null)

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil data produk')
        return res.json()
      })
      .then((data) => {
        const normalized = data.map((p) => ({
          ...p,
          price: parseFloat(p.price),
        }))
        setProducts(normalized)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchCategory = activeCategory === 'All' || p.category === activeCategory
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  const addToCart = (product) => {
    setCheckoutMessage(null)
    setCheckoutError(null)
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
  }

  const updateQty = (id, delta) => {
    setCheckoutMessage(null)
    setCheckoutError(null)
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    )
  }

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0)

  const handleCheckout = async () => {
    if (cart.length === 0 || checkoutLoading) return
    setCheckoutLoading(true)
    setCheckoutError(null)
    setCheckoutMessage(null)

    try {
      const order = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.qty,
          })),
        }),
      })
      setCart([])
      setCheckoutMessage(
        `Pesanan #${order.id} berhasil! Total Rp ${parseFloat(order.total_price).toLocaleString('id-ID')}`
      )
    } catch (err) {
      setCheckoutError(err.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const categories = ['All', 'Cat', 'Dog', 'Fish']

  return (
    <div className="p-8 max-w-6xl mx-auto flex gap-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-blue-900 mb-1">Pet Supermarket</h1>
        <p className="text-slate-500 mb-6">Semua kebutuhan hewan kesayanganmu ada di sini.</p>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium transition ${
                activeCategory === cat
                  ? 'bg-blue-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-slate-400 text-sm text-center py-8">Memuat produk...</p>
        )}
        {error && (
          <p className="text-rose-500 text-sm text-center py-8">
            Gagal memuat produk: {error}. Pastikan server Laravel berjalan.
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition"
              >
                <div className="bg-blue-50 h-32 flex items-center justify-center text-4xl">
                  {product.emoji}
                </div>
                <div className="p-4">
                  <p className="text-sm font-medium text-slate-800 mb-1">{product.name}</p>
                  <p className="text-blue-700 font-semibold mb-1">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-400 mb-3">Stok: {product.stock}</p>
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={!product.stock}
                    className="w-full bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50"
                  >
                    + Keranjang
                  </button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <p className="text-slate-400 text-sm col-span-full text-center py-8">
                Produk tidak ditemukan.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="w-80 shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl p-5 sticky top-8">
          <h2 className="font-semibold text-blue-900 mb-4">
            Keranjang {totalItems > 0 && <span className="text-sm text-slate-400">({totalItems})</span>}
          </h2>

          {checkoutMessage && (
            <p className="text-sm text-emerald-600 mb-3">{checkoutMessage}</p>
          )}
          {checkoutError && (
            <p className="text-sm text-rose-500 mb-3">{checkoutError}</p>
          )}

          {cart.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Keranjang masih kosong.</p>
          ) : (
            <>
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 border-b border-slate-100 pb-3">
                    <div className="text-2xl">{item.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-blue-700 font-semibold">
                        Rp {(item.price * item.qty).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-600 text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm w-4 text-center">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded text-slate-600 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Subtotal</span>
                  <span className="font-semibold text-blue-900">
                    Rp {subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg disabled:opacity-60"
              >
                {checkoutLoading ? 'Memproses...' : 'Checkout'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Shop
