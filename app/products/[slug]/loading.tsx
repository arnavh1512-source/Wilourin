export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f1ec', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ aspectRatio: '3/4', background: '#ede9e3', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
      <div style={{ padding: '80px 40px 40px 0' }}>
        <div style={{ height: 48, width: '70%', background: '#ede9e3', marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 32, width: '30%', background: '#ede9e3', marginBottom: 32, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 120, width: '90%', background: '#ede9e3', animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} } @media(max-width:800px){div[style*="grid-template-columns"]{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
