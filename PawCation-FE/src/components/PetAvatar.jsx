import { petEmoji } from '../lib/pets'

const sizeClass = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-xl',
  lg: 'w-20 h-20 text-2xl',
}

function PetAvatar({ pet, size = 'md', className = '' }) {
  const box = `${sizeClass[size] || sizeClass.md} shrink-0 rounded-full overflow-hidden ${className}`

  if (pet?.photo_url) {
    return (
      <img
        src={pet.photo_url}
        alt={pet.name || 'Hewan'}
        className={`${box} object-cover border border-slate-100`}
      />
    )
  }

  return (
    <div
      className={`${box} bg-blue-50 flex items-center justify-center border border-slate-100`}
      aria-hidden
    >
      {petEmoji(pet?.type)}
    </div>
  )
}

export default PetAvatar
