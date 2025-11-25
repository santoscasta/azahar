interface AzaharLogoProps {
  className?: string
}

export default function AzaharLogo({ className = '' }: AzaharLogoProps) {
  return (
    <img
      src="/icon.png"
      alt="Azahar"
      className={`h-20 w-20 object-contain ${className}`.trim()}
      style={{ backgroundColor: 'transparent' }}
    />
  )
}
