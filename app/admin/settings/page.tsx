'use client'

import { useEffect, useState } from 'react'

interface Settings {
  hero_video_url?: string | null
  hero_headline?: string | null
  free_shipping_threshold?: number
  shipping_cost?: number
}

const F = { fontFamily: "'Raleway',sans-serif" }
const inputStyle = { width: '100%', padding: '12px 16px', border: '1px solid rgba(21,20,15,0.22)', background: 'transparent', fontFamily: "'Raleway',sans-serif", fontSize: 13, color: '#15140f', outline: 'none' }

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => setSettings(json.data ?? {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setError('')
    // Send exactly the writable fields — the API rejects unknown keys, and the
    // GET response carries an id that must not be echoed back.
    const payload = {
      hero_video_url: settings.hero_video_url?.trim() ?? '',
      hero_headline: settings.hero_headline?.trim() ?? '',
      free_shipping_threshold: settings.free_shipping_threshold ?? 0,
      shipping_cost: settings.shipping_cost ?? 0,
    }
    const res = await fetch('/api/admin/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const json = await res.json().catch(() => null)
    setSaving(false)
    if (!res.ok) { setError(json?.error ?? 'Failed to save settings. Please try again.'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }


  return (
    <div>
      <h1 style={{ fontFamily: "'Prata',serif", fontSize: 32, color: '#15140f', fontWeight: 400, marginBottom: 8 }}>Settings</h1>
      <p style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.55)', marginBottom: 40 }}>Configure your store.</p>

      {loading ? (
        <div style={{ ...F, fontSize: 13, color: 'rgba(21,20,15,0.4)' }}>Loading…</div>
      ) : (
        <div style={{ maxWidth: 560 }}>
          <div style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)', padding: 32, marginBottom: 24 }}>
            <div style={{ ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 24 }}>Hero</div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.55)', marginBottom: 6 }}>Video URL</label>
              <input type="url" style={inputStyle} value={settings.hero_video_url ?? ''} placeholder="https://…/video.mp4"
                onChange={e => setSettings(s => ({ ...s, hero_video_url: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 0 }}>
              <label style={{ display: 'block', ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.55)', marginBottom: 6 }}>Hero Headline</label>
              <input type="text" style={inputStyle} value={settings.hero_headline ?? ''} placeholder="Worn slowly."
                onChange={e => setSettings(s => ({ ...s, hero_headline: e.target.value }))} />
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid rgba(21,20,15,0.12)', padding: 32, marginBottom: 24 }}>
            <div style={{ ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(21,20,15,0.45)', marginBottom: 24 }}>Shipping</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.55)', marginBottom: 6 }}>Free Shipping Above (₹)</label>
                <input type="number" style={inputStyle} value={settings.free_shipping_threshold ?? ''} placeholder="999"
                  onChange={e => setSettings(s => ({ ...s, free_shipping_threshold: e.target.value === '' ? undefined : parseFloat(e.target.value) }))} />
              </div>
              <div>
                <label style={{ display: 'block', ...F, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(21,20,15,0.55)', marginBottom: 6 }}>Flat Shipping Rate (₹)</label>
                <input type="number" style={inputStyle} value={settings.shipping_cost ?? ''} placeholder="99"
                  onChange={e => setSettings(s => ({ ...s, shipping_cost: e.target.value === '' ? undefined : parseFloat(e.target.value) }))} />
              </div>
            </div>
          </div>

          {error && (
            <p style={{ ...F, fontSize: 12, color: '#8a2a1f', marginBottom: 16 }}>{error}</p>
          )}

          <button onClick={save} disabled={saving}
            style={{ padding: '13px 32px', background: '#0d2818', color: '#e8e4d8', border: 'none', ...F, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', cursor: saving ? 'wait' : 'pointer', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      )}
    </div>
  )
}
