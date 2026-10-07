import { petImage, petTypeLabel } from '../lib/pets'

const sizeClass = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
}

function PetAvatar({ pet, size = 'md', className = '' }) {
  const box = `${sizeClass[size] || sizeClass.md} shrink-0 rounded-full overflow-hidden ${className}`
  const src = pet?.photo_url || petImage(pet?.type)

  return (
    <img
      src={src}
      alt={pet?.name || petTypeLabel(pet?.type)}
      className={`${box} object-cover border border-slate-100`}
    />
  )
}

export default PetAvatar
