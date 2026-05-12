interface LogoProps {
  dark?: boolean
  height?: number
}

export function Logo({ dark = false, height = 50 }: LogoProps) {
  const ink   = dark ? '#0d2818' : '#e8e4d8'
  const label = dark ? '#2b2a26' : '#d4d0c4'
  return (
    <svg
      viewBox="0 0 200 60"
      height={height}
      style={{ width: 'auto', display: 'block' }}
      aria-label="WILOURIN"
    >
      <text
        x="100" y="44"
        textAnchor="middle"
        fontFamily="'Prata', Georgia, serif"
        fontSize="48"
        fill={ink}
        letterSpacing="4"
      >
        W
      </text>
      <text
        x="100" y="58"
        textAnchor="middle"
        fontFamily="'Raleway', sans-serif"
        fontSize="8"
        fill={label}
        letterSpacing="6"
        fontWeight="400"
      >
        WILOURIN
      </text>
    </svg>
  )
}
