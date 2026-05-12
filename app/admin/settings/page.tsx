'use client'

import { useEffect, useState } from 'react'

const SETTING_DEFS = [
  { key: 'hero_video_url', label: 'Hero Video URL', placeholder: 'https://…/video.mp4', type: 'url' },
  { key: 'hero_tagline', label: 'Hero Tagline', placeholder: 'Worn slowly.', type: 'text' },
  { key: 'free_shipping_threshold', label: 'Free Shipping Above (₹)', placeholder: '2000', type: 'number' },
  { key: 'shipping_flat_rate', label: 'Flat Shipping Rate (₹)', placeholder: '150', type: 'number' },
  { key: 'whatsapp_number', label: 'WhatsApp Number', placeholder: '+918140081461', type: 'tel' },
  { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/wilourin', type: 'url' },
  { key: 'contact_email', label: 'Contact Email', placeholder: 'hello@wilourin.com', type: 'email' },
]

export default function AdminSettings() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(json => {
      setValues(json.data ?? {})
      setLoading(false)
    })
  }, [])

  const save = async () => {
    setSaving(true)
    await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const F = { fontFamily: "'Raleway',sans-serif" }

  return (
    <div>
      <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, color: '#15140f', fontWeight: 400, marginBottom: 8 }}>Settings</h1>
      <p style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.55)', marginBottom: 40 }}>Configure your store settings.</p>

      {loading ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)', padding: 40 }}>Loading…</div>
      ) : (
        <div style={{ maxWidth: 560 }}>
          <div style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)', padding: 32, marginBottom: 24 }}>
            <div style={{ ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 24 }}>Store Configuration</div>

            {SETTING_DEFS.map(def => (
              <div key={def.key} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.55)', marginBottom: 6 }}>{def.label}</label>
                <input
                  type={def.type}
                  value={values[def.key] ?? ''}
                  placeholder={def.placeholder}
                  onChange={e => setValues(v => ({ ...v, [def.key]: e.target.value }))}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid rgba(21,20,15,0.22)', background: 'transparent', ...F, fontSize: 13, color: '#15140f', outline: 'none' }}
                />
              </div>
            ))}
          </div>

          <button onClick={save} disabled={saving}
            style={{ padding: '13px 32px', background: '#0d2818', color: '#e8e4d8', border: 'none', ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  )
}
