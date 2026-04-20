import { shortAddr, timeAgo } from '../lib/utils'

const styles = {
  bar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', borderBottom: '1px solid var(--border)',
    background: 'var(--bg)', flexShrink: 0,
  },
  logo: {
    fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700,
    color: 'var(--accent)', letterSpacing: '-0.5px',
  },
  tagline: {
    color: 'var(--dim)', fontWeight: 400, fontSize: 11,
    marginLeft: 8, fontFamily: "'JetBrains Mono', monospace",
  },
  right: { display: 'flex', alignItems: 'center', gap: 10 },
  saved: { fontSize: 9, color: 'var(--dim)' },
  saving: { fontSize: 9, color: 'var(--accent)' },
  walletBtn: {
    background: 'transparent', border: '1px solid var(--border2)',
    color: 'var(--muted)', padding: '6px 14px', fontSize: 11,
    cursor: 'pointer', borderRadius: 4, transition: 'all 0.15s',
  },
  walletConnected: {
    background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
    color: 'var(--accent)', padding: '6px 14px', fontSize: 11,
    cursor: 'pointer', borderRadius: 4,
  },
}

export default function Topbar({ wallet, onConnect, saving, lastSaved }) {
  return (
    <div style={styles.bar}>
      <div style={styles.logo}>
        NEMERUS
        <span style={styles.tagline}>// your research. your data.</span>
      </div>
      <div style={styles.right}>
        {saving && <span style={styles.saving}>saving...</span>}
        {!saving && lastSaved && (
          <span style={styles.saved}>synced {timeAgo(lastSaved)}</span>
        )}
        <button
          style={wallet ? styles.walletConnected : styles.walletBtn}
          onClick={onConnect}
        >
          {wallet ? shortAddr(wallet) : 'connect wallet'}
        </button>
      </div>
    </div>
  )
}
