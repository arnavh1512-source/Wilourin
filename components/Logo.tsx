import Image from 'next/image'

interface LogoProps {
  height?: number
}

export function Logo({ height = 40 }: LogoProps) {
  return (
    <Image
      src="/wilourinLogo.png"
      alt="WILOURIN"
      height={height}
      width={height * 4}
      style={{ objectFit: 'contain', width: 'auto', display: 'block', margin: '0 auto' }}
      priority
    />
  )
}
