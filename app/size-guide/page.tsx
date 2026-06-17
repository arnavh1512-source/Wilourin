import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Size Guide — Wilourin',
  description: 'Find your perfect fit with our detailed size guide for luxury garments.',
}

const C = { marbleBase: '#f4f1ec', marbleInk: '#15140f', marbleLine: 'rgba(21,20,15,0.22)', forestDark: '#0d2818', cream: '#e8e4d8', inkFaint: 'rgba(21,20,15,0.55)', inkSoft: 'rgba(21,20,15,0.78)' }
const F: React.CSSProperties = { fontFamily: "'Raleway',sans-serif" }

const SIZES = [
  { size: 'XS', chest: '81–86', waist: '63–68', hips: '86–91', length: '62' },
  { size: 'S',  chest: '86–91', waist: '68–73', hips: '91–96', length: '64' },
  { size: 'M',  chest: '91–96', waist: '73–78', hips: '96–101', length: '66' },
  { size: 'L',  chest: '96–101', waist: '78–83', hips: '101–106', length: '68' },
  { size: 'XL', chest: '101–106', waist: '83–88', hips: '106–111', length: '70' },
  { size: 'XXL', chest: '106–111', waist: '88–93', hips: '111–116', length: '72' },
]

const cell: React.CSSProperties = { padding: '14px 20px', borderBottom: `1px solid ${C.marbleLine}`, ...F, fontSize: 13, color: C.marbleInk, textAlign: 'center' }
const headerCell: React.CSSProperties = { ...cell, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', fontWeight: 700, color: C.inkFaint, background: 'rgba(21,20,15,0.03)' }

export default function SizeGuidePage() {
  return (
    <div style={{ minHeight: '100vh', background: C.marbleBase }}>
      <div style={{ borderBottom: `1px solid ${C.marbleLine}`, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: C.inkFaint, textDecoration: 'none' }}>← Back</Link>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>
        <h1 style={{ fontFamily: "'Prata',serif", fontSize: 'clamp(28px,4vw,42px)', color: C.marbleInk, fontWeight: 400, margin: '0 0 16px', textAlign: 'center' }}>Size Guide</h1>
        <p style={{ ...F, fontSize: 14, color: C.inkSoft, lineHeight: 1.7, textAlign: 'center', marginBottom: 48, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
          All measurements are in centimetres. For the best fit, measure yourself and compare with the chart below.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${C.marbleLine}` }}>
            <thead>
              <tr>
                <th style={headerCell}>Size</th>
                <th style={headerCell}>Chest (cm)</th>
                <th style={headerCell}>Waist (cm)</th>
                <th style={headerCell}>Hips (cm)</th>
                <th style={headerCell}>Length (cm)</th>
              </tr>
            </thead>
            <tbody>
              {SIZES.map(row => (
                <tr key={row.size}>
                  <td style={{ ...cell, fontWeight: 700 }}>{row.size}</td>
                  <td style={cell}>{row.chest}</td>
                  <td style={cell}>{row.waist}</td>
                  <td style={cell}>{row.hips}</td>
                  <td style={cell}>{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 48 }}>
          <h2 style={{ fontFamily: "'Prata',serif", fontSize: 22, color: C.marbleInk, fontWeight: 400, margin: '0 0 16px' }}>How to Measure</h2>
          <div style={{ ...F, fontSize: 13, color: C.inkSoft, lineHeight: 1.8 }}>
            <p style={{ marginBottom: 12 }}><strong style={{ color: C.marbleInk }}>Chest:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: C.marbleInk }}>Waist:</strong> Measure around your natural waistline, the narrowest part of your torso.</p>
            <p style={{ marginBottom: 12 }}><strong style={{ color: C.marbleInk }}>Hips:</strong> Measure around the fullest part of your hips, approximately 20 cm below your waist.</p>
            <p><strong style={{ color: C.marbleInk }}>Length:</strong> Measure from the highest point of your shoulder to the desired hemline.</p>
          </div>
        </div>

        <div style={{ marginTop: 40, padding: '24px', border: `1px solid ${C.marbleLine}`, background: 'rgba(21,20,15,0.02)' }}>
          <p style={{ ...F, fontSize: 12, color: C.inkFaint, lineHeight: 1.7, margin: 0 }}>
            Every Wilourin piece offers <strong>Personalized Fit</strong> adjustments. On any product page, use the fit sliders to add or remove centimetres from your standard size — we tailor accordingly.
          </p>
        </div>
      </div>
    </div>
  )
}
