import Image from 'next/image'

interface LogoProps {
  height?: number
  className?: string
}

export function Logo({ height = 40, className }: LogoProps) {
  return (
    <Image
      src="/wilourinLogo.png"
      alt="WILOURIN"
      height={height}
      width={height * 4}
      className={className}
      style={{ objectFit: 'contain', width: 'auto', height: height, display: 'block', margin: '0 auto' }}
      priority
    />
  )
}
