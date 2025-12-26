interface HomeIconProps {
  className?: string
}

export default function HomeIcon({ className = 'h-5 w-5' }: HomeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5l9-7 9 7" />
      <path d="M5 9.5v10a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19.5v-10" />
      <path d="M9 21v-6h6v6" />
    </svg>
  )
}
