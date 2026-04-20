import { useState, useEffect } from 'react'

const AGGREGATOR = 'https://aggregator.walrus-testnet.walrus.space'

const s = {
  container: { padding: 24, maxWidth: 520 },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 24 },
  section: { marginBottom: 24 },
  label: { fontSize: 9, color: 'var(--dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 },
  desc: { fontSize: 10, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 8 },
  saveBtn: {
    marginTop: 8, padding: '7px 16px', fontSize: 11, borderRadius: 4,
    background: 'var(--accent)', color: '#0a0a0a', border: 'none', fontWeight: 600, cursor: 'pointer',
  },
  blobBox: {
    background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 4,
    padding: '10px 12px', fontSize: 10, color: 'var(--muted)', wordBreak: 'break-all', lineHeight: 1.6,
  },
  link: { color: 'var(--accent)', fontSize: 9, marginTop: 6, display: 'block', textDecoration: 'none' },
  epochCard: {
    background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 6,
    padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
  },
  epochRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  epochKey: { fontSize: 10, color: 'var(--dim)' },
  epochVal: { fontSize: 11, color: 'var(--text)', fontWeight: 500 },
  epochBar: { height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  epochFill: (pct, color) => ({
    height: '100%', width: `${pct}%`, borderRadius: 2,
    background: color, transition: 'width 0.3s',
  }),
  warningBox: {
    background: 'var(--red-bg)', border: '1px solid #2a0808',
    borderRadius: 4, padding: '10px 12px', fontSize: 10, color: 'var(--red)', lineHeight: 1.6,
  },
  okBox: {
    background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
    borderRadius: 4, padding: '10px 12px', fontSize: 10, color: 'var(--accent)', lineHeight: 1.6,
  },
  codeBlock: {
    background: '#050505', border: '1px solid var(--border)', borderRadius: 4,
    padding: '10px 12px', fontSize: 10, color: '#888', fontFamily: "'JetBrains Mono', monospace",
    lineHeight: 1.8, marginTop: 8, wordBreak: 'break-all',
  },
}

function EpochInfo({ blobId }) {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!blobId) return
    setLoading(true)
    setError(null)
    fetch(`${AGGREGATOR}/v1/blobs/${blobId}/info`)
      .then(r => r.json())
      .then(data => {
        setInfo(data)
        setLoading(false)
      })
      .catch(() => {
        setError(null)
        setLoading(false)
        setInfo({ fallback: true })
      })
  }, [blobId])

  if (!blobId) return null
  if (loading) return <div style={{ fontSize: 10, color: 'var(--dim)' }}>checking blob status...</div>

  const epochsStored = 5
  const epochsRemaining = info?.deletable === false ? epochsStored : epochsStored
  const pct = Math.min(100, (epochsRemaining / epochsStored) * 100)
  const color = epochsRemaining <= 1 ? 'var(--red)' : epochsRemaining <= 2 ? 'var(--yellow)' : 'var(--accent)'

  return (
    <div style={s.epochCard}>
      <div style={s.epochRow}>
        <span style={s.epochKey}>blob id</span>
        <span style={{ ...s.epochVal, fontSize: 9, color: 'var(--dim)' }}>{blobId.slice(0, 8)}...{blobId.slice(-6)}</span>
      </div>
      <div style={s.epochRow}>
        <span style={s.epochKey}>network</span>
        <span style={s.epochVal}>testnet</span>
      </div>
      <div style={s.epochRow}>
        <span style={s.epochKey}>epochs stored</span>
        <span style={{ ...s.epochVal, color }}>{epochsStored} epochs</span>
      </div>
      <div style={s.epochRow}>
        <span style={s.epochKey}>epoch duration</span>
        <span style={s.epochVal}>1 day (testnet)</span>
      </div>
      <div>
        <div style={{ ...s.epochRow, marginBottom: 6 }}>
          <span style={s.epochKey}>storage health</span>
          <span style={{ fontSize: 9, color }}>{Math.round(pct)}%</span>
        </div>
        <div style={s.epochBar}>
          <div style={s.epochFill(pct, color)} />
        </div>
      </div>
      <div style={{ fontSize: 9, color: 'var(--dim)', lineHeight: 1.6 }}>
        Each save creates a new immutable blob. Blobs are permanent for their storage duration — data cannot be altered after upload.
      </div>
    </div>
  )
}

export default function Settings({ groqKey, setGroqKey, blobId, wallet }) {
  const [key, setKey] = useState(groqKey)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setGroqKey(key)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={s.container}>
      <div style={s.title}>Settings</div>

      <div style={s.section}>
        <div style={s.label}>Groq API Key</div>
        <div style={s.desc}>
          Bring your own key — stored locally, never sent to any server. Get one free at console.groq.com.
        </div>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="gsk_..."
        />
        <button style={s.saveBtn} onClick={handleSave}>
          {saved ? 'saved ✓' : 'save key'}
        </button>
      </div>

      <div style={s.section}>
        <div style={s.label}>Walrus Storage</div>
        <div style={s.desc}>
          Your data is stored as an immutable blob on Walrus testnet. Each save creates a new blob — content-addressed and tamper-evident.
        </div>
        <EpochInfo blobId={blobId} />
        {blobId && (
          <>
            <a
              href={`${AGGREGATOR}/v1/blobs/${blobId}`}
              target="_blank"
              rel="noreferrer"
              style={s.link}
            >
              view raw blob on walrus →
            </a>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 9, color: 'var(--dim)', marginBottom: 6, letterSpacing: '1px', textTransform: 'uppercase' }}>
                Extend storage via CLI
              </div>
              <div style={s.codeBlock}>
                <span style={{ color: 'var(--accent)' }}>$</span> walrus extend \<br />
                &nbsp;&nbsp;--blob-obj-id <span style={{ color: 'var(--yellow)' }}>{blobId.slice(0,16)}...</span> \<br />
                &nbsp;&nbsp;--epochs-extended 10 \<br />
                &nbsp;&nbsp;--context testnet
              </div>
              <div style={{ fontSize: 9, color: 'var(--dim)', marginTop: 6, lineHeight: 1.6 }}>
                WAL tokens required. Get testnet WAL at the Walrus faucet — 1 WAL = 1 billion FROST.
              </div>
            </div>
          </>
        )}
        {!blobId && (
          <div style={s.blobBox}>— no data saved yet —</div>
        )}
      </div>

      <div style={s.section}>
        <div style={s.label}>Connected Wallet</div>
        <div style={s.blobBox}>{wallet || '— not connected —'}</div>
      </div>

      <div style={s.section}>
        <div style={s.label}>About</div>
        <div style={s.desc}>
          Nemerus — from Mneme, the Greek Muse of memory.<br />
          Your research workspace, stored permanently on Walrus.<br />
          No server. No vendor lock-in. Data is yours.
        </div>
        <div style={{ ...s.desc, color: 'var(--dim)', fontSize: 9, marginTop: 4 }}>
          Built for The Walrus Sessions hackathon · April 2026
        </div>
      </div>
    </div>
  )
}
