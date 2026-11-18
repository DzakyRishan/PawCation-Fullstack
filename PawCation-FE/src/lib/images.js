// Foto asli untuk tiap produk Pet Supermarket (file lokal di public/images/products).
// Prioritas: kolom `photo` dari database -> foto berdasarkan nama produk -> foto per kategori.
const byName = {
  'royal canin maxi adult': 'royal-canin',
  'pedigree adult beef 3kg': 'pedigree',
  'dog chew toy bone': 'chew-bone',
  'dentastix snack anjing': 'dentastix',
  'whiskas tuna 1.2kg': 'whiskas',
  'me-o persian adult': 'meo',
  'creamy treats kucing': 'creamy-treats',
  'catnip snack stick': 'catnip',
  'bola mainan interaktif': 'ball',
  'tali tarik gigit': 'rope',
  'pet shampoo anti kutu': 'shampoo',
}

const byCategory = {
  'Makanan Anjing': 'royal-canin',
  'Snack Anjing': 'chew-bone',
  'Makanan Kucing': 'meo',
  'Snack Kucing': 'creamy-treats',
  Mainan: 'ball',
  Perawatan: 'shampoo',
}

export function productImage(product) {
  if (!product) return '/images/products/royal-canin.jpg'
  if (product.photo) {
    return /^(https?:)?\//.test(product.photo) ? product.photo : `/storage/${product.photo}`
  }
  const slug =
    byName[String(product.name || '').trim().toLowerCase()] ||
    byCategory[product.category] ||
    'royal-canin'
  return `/images/products/${slug}.jpg`
}
