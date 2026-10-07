export function petEmoji(type) {
  return type === 'anjing' ? '🐶' : '🐱'
}

export function petTypeLabel(type) {
  return type === 'anjing' ? 'Anjing' : 'Kucing'
}

// Foto default anjing/kucing (file lokal di folder public/).
// Dipakai sebagai avatar saat pet belum punya foto sendiri (photo_url).
export function petImage(type) {
  return type === 'anjing' ? '/pets/dog.jpg' : '/pets/cat.jpg'
}
