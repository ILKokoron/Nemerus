import { shortAddr, timeAgo } from '../lib/utils'
import { getProjectUrgency } from '../lib/utils'

const s = {
  sidebar: {
    width: 200, borderRight: '1px solid var(--border)',
    padding: '16px 0', flexShrink: 0, display: 'flex',
    flexDirection: 'column', gap: 20, overflowY: 'auto',
  },
  section: { padding: '0 12px' },
  label: {
    fontSize: 9, color: 'var(--dim)', letterSpacing: '2px',
    textTransform: 'uppercase', marginBottom: 8, padding: '0 4px',
  },
  navItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 8px', borderRadius: 4, fontSize: 11,
    color: active ? 'var(--accent)' : 'var(--muted)',
    background: active ? 'var(--accent-bg)' : 'transparent',
    border: `1px solid ${active ? 'var(--accent-border)' : 'transparent'}`,
    cursor: 'pointer', transition: 'all 0.1s',
  }),
  dot: { width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 },
  badge: (urgent) => ({
    marginLeft: 'auto', fontSize: 9, padding: '2px 6px', borderRadius: 10,
    background: urgent ? 'var(--red-bg)' : 'var(--bg2)',
    color: urgent ? 'var(--red)' : 'var(--dim)',
  }),
  line: { fontSize: 10, color: 'var(--dim)', padding: '2px 0', display: 'flex', gap: 6 },
  cmd: { color: 'var(--accent)' },
  out: { color: 'var(--dim)' },
  statusDot: (ok) => ({
    width: 5, height: 5, borderRadius: '50%', background: ok ? 'var(--accent)' : 'var(--red)',
    display: 'inline-block', marginRight: 5,
  }),
}

export default function Sidebar({ view, setView, projects, blobId, lastSaved, walrusOk }) {
  const overdueCount = projects.filter(p => getProjectUrgency(p) === 'overdue').length
  const urgentCount = projects.filter(p => ['overdue','urgent'].includes(getProjectUrgency(p))).length
  const allTasks = projects.flatMap(p => (p.tasks || []).filter(t => !t.done))

  return (
    <div style={s.sidebar}>
      <div style={s.section}>
        <div style={s.label}>Navigate</div>
        {[
          { id: 'projects', label: 'Projects', badge: projects.length },
          { id: 'tasks', label: 'Tasks', badge: urgentCount, urgent: urgentCount > 0 },
          { id: 'settings', label: 'Settings' },
        ].map(item => (
          <div key={item.id} style={s.navItem(view === item.id)} onClick={() => setView(item.id)}>
            <div style={s.dot} />
            {item.label}
            {item.badge !== undefined && (
              <span style={s.badge(item.urgent)}>{item.badge}</span>
            )}
          </div>
        ))}
      </div>

      <div style={s.section}>
        <div style={s.label}>Storage</div>
        <div style={s.line}><span style={s.cmd}>blob</span> <span style={s.out}>{blobId ? shortAddr(blobId) : '—'}</span></div>
        <div style={s.line}><span style={s.cmd}>net</span> <span style={s.out}>testnet</span></div>
        <div style={s.line}><span style={s.cmd}>items</span> <span style={s.out}>{projects.length} projects</span></div>
        {lastSaved && <div style={s.line}><span style={s.cmd}>saved</span> <span style={s.out}>{new Date(lastSaved).toLocaleTimeString()}</span></div>}
      </div>

      <div style={s.section}>
        <div style={s.label}>Status</div>
        <div style={s.line}><span style={s.statusDot(walrusOk)} /><span style={{color: walrusOk ? 'var(--accent)' : 'var(--red)'}}>walrus</span></div>
        <div style={s.line}><span style={s.statusDot(true)} /><span style={{color:'var(--accent)'}}>groq</span></div>
      </div>
    </div>
  )
}
