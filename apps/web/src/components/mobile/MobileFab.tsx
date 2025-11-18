interface MobileFabProps {
  isHomeView: boolean
  onTapHome: () => void
  onTapDetail: () => void
}

export default function MobileFab({ isHomeView, onTapHome, onTapDetail }: MobileFabProps) {
  const handleClick = () => {
    if (isHomeView) {
      onTapHome()
    } else {
      onTapDetail()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-8 right-6 h-14 w-14 rounded-full bg-[var(--color-primary-600)] text-white text-3xl shadow-2xl flex items-center justify-center"
      aria-label="Crear tarea"
    >
      +
    </button>
  )
}
