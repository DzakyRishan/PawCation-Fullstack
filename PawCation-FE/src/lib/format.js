export function formatDate(value) {
  if (!value) return '-'
  const str = String(value)
  if (str.includes('T')) return str.split('T')[0]
  return str.length >= 10 ? str.slice(0, 10) : str
}

export function formatTime(value) {
  if (!value) return '-'
  const str = String(value)
  return str.length >= 5 ? str.slice(0, 5) : str
}
