import { daysUntil, deadlineColor, deadlineLabel, getProjectUrgency } from '../lib/utils'

const STATUS_STYLES = {
  active:      { bg: 'var(--accent-bg)',  color: 'var(--accent)', border: 'var(--accent-border)' },
  researching: { bg: 'var(--yellow-bg)', color: 'var(--yellow)', border: '#2a2200' },
  done:        { bg: 'var(--green-bg)',   color: 'var(--green)',  border: '#1a2a1a' },
  archived:    { bg: '#141414',           color: 'var(--dim)',    border: 'var(--border)' },
}

const DEADLINE_COLORS = {
  red: 'var(--red)', yellow: 'var(--yellow)', green: 'var(--green)', gray: 'var(--dim)',
}

export default function ProjectCard({ project, selected, onClick }) {
  const st = STATUS_STYLES[project.status] || STATUS_STYLES.researching
  const pendingTasks = (project.tasks || []).filter(t => !t.done)

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg1)', border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 6, padding: '14px 16px', cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{
          fontSize: 9, padding: '2px 8px', borderRadius: 3,
          letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600,
          background: st.bg, color: st.color, border: `1px solid ${st.border}`,
        }}>
          {project.status}
        </span>
        <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          {project.name}
        </span>
      </div>

      {project.summary && (
        <div style={{
          fontSize: 10, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {project.summary}
        </div>
      )}

      {pendingTasks.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {pendingTasks.slice(0, 4).map(task => {
            const days = daysUntil(task.deadline)
            const col = DEADLINE_COLORS[deadlineColor(days)]
            return (
              <div key={task.id} style={{
                fontSize: 9, padding: '3px 8px', borderRadius: 3,
                border: `1px solid ${col}22`, color: col,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: col }} />
                {task.title} {task.deadline ? `— ${deadlineLabel(days)}` : ''}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
