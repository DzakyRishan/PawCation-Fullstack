import { useState, useEffect } from 'react'
import { apiFetch, cachedGet, peekCache } from '../../lib/api'
import { productImage } from '../../lib/images'

const CART_STORAGE_KEY = 'pawcation_cart'

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const normalizeProducts = (data) =>
  (Array.isArray(data) ? data : []).map((p) => ({ ...p, price: parseFloat(p.price) }))

function Shop() {
  // Tampilkan data terakhir dari cache dulu (instan), lalu perbarui di background.
  const [products, setProducts] = useState(() => normalizeProducts(peekCache('/products')))
  const [loading, setLoading] = useState(() => peekCache('/products') === undefined)
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

  const loadProducts = () =>
    cachedGet('/products')
      .then((data) => {
        setProducts(normalizeProducts(data))
        setError(null)
      })
      .catch((err) => setError(err.message || 'Gagal mengambil data produk'))
      .finally(() => setLoading(false))

  useEffect(() => {
    loadProducts()
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
      loadProducts() // stok berubah setelah checkout
      setCheckoutMessage(
        `Pesanan #${order.id} berhasil! Total Rp ${parseFloat(order.total_price).toLocaleString('id-ID')}`
      )
    } catch (err) {
      setCheckoutError(err.message)
    } finally {
      setCheckoutLoading(false)
    }
  }

  const categories = [
    'All',
    'Makanan Anjing',
    'Snack Anjing',
    'Makanan Kucing',
    'Snack Kucing',
    'Mainan',
    'Perawatan',
  ]

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

        <div className="flex flex-wrap gap-2 mb-6">
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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/3" />
                  <div className="h-8 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}
        {error && products.length === 0 && (
          <p className="text-rose-500 text-sm text-center py-8">
            Gagal memuat produk: {error}. Pastikan server Laravel berjalan.
          </p>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition flex flex-col"
              >
                <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                  <img
                    src={productImage(product)}
                    alt={product.name}
                    width="400"
                    height="300"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-2 left-2 bg-white/90 text-blue-900 text-[11px] font-medium px-2 py-0.5 rounded-full">
                    {product.category}
                  </span>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-sm font-medium text-slate-800 mb-1">{product.name}</p>
                  <p className="text-blue-700 font-semibold mb-1">
                    Rp {product.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-slate-400 mb-3">Stok: {product.stock}</p>
                  <button
                    type="button"
                    onClick={() => addToCart(product)}
                    disabled={!product.stock}
                    className="mt-auto w-full bg-blue-900 hover:bg-blue-800 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50"
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
                    <img
                      src={productImage(item)}
                      alt=""
                      width="48"
                      height="48"
                      loading="lazy"
                      decoding="async"
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0"
                    />
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
