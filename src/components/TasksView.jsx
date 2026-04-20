import { daysUntil, deadlineColor, deadlineLabel } from '../lib/utils'

const DEADLINE_COLORS = {
  red: 'var(--red)', yellow: 'var(--yellow)', green: 'var(--green)', gray: 'var(--dim)',
}

const s = {
  container: { padding: 20, flex: 1, overflowY: 'auto' },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 20 },
  group: { marginBottom: 20 },
  groupLabel: { fontSize: 9, color: 'var(--dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10 },
  taskRow: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '10px 14px', background: 'var(--bg1)',
    border: '1px solid var(--border)', borderRadius: 6, marginBottom: 6,
  },
  check: (done) => ({
    width: 12, height: 12, border: `1px solid ${done ? 'var(--accent)' : '#333'}`,
    borderRadius: 2, flexShrink: 0, marginTop: 2, cursor: 'pointer',
    background: done ? 'var(--accent)' : 'transparent',
  }),
  taskTitle: (done) => ({
    fontSize: 11, color: done ? 'var(--dim)' : 'var(--text)',
    textDecoration: done ? 'line-through' : 'none',
  }),
  projectTag: {
    fontSize: 9, color: 'var(--dim)', marginTop: 2,
  },
  deadline: (col) => ({ fontSize: 9, color: col, marginLeft: 'auto', flexShrink: 0 }),
  empty: { fontSize: 11, color: 'var(--dim)', marginTop: 40, textAlign: 'center' },
}

export default function TasksView({ projects, onToggleTask }) {
  const allTasks = projects.flatMap(p =>
    (p.tasks || []).map(t => ({ ...t, projectId: p.id, projectName: p.name }))
  )

  const overdue = allTasks.filter(t => !t.done && t.deadline && daysUntil(t.deadline) < 0)
  const urgent = allTasks.filter(t => !t.done && t.deadline && daysUntil(t.deadline) >= 0 && daysUntil(t.deadline) <= 3)
  const upcoming = allTasks.filter(t => !t.done && (!t.deadline || daysUntil(t.deadline) > 3))
  const done = allTasks.filter(t => t.done)

  const TaskRow = ({ task }) => {
    const days = daysUntil(task.deadline)
    const col = DEADLINE_COLORS[deadlineColor(days)]
    return (
      <div style={s.taskRow}>
        <div style={s.check(task.done)} onClick={() => onToggleTask(task.projectId, task.id)} />
        <div style={{ flex: 1 }}>
          <div style={s.taskTitle(task.done)}>{task.title}</div>
          <div style={s.projectTag}>{task.projectName}</div>
        </div>
        {task.deadline && <div style={s.deadline(col)}>{deadlineLabel(days)}</div>}
      </div>
    )
  }

  if (allTasks.length === 0) {
    return (
      <div style={s.container}>
        <div style={s.title}>Tasks</div>
        <div style={s.empty}>no tasks yet — add some to your projects</div>
      </div>
    )
  }

  return (
    <div style={s.container}>
      <div style={s.title}>Tasks</div>
      {overdue.length > 0 && (
        <div style={s.group}>
          <div style={{ ...s.groupLabel, color: 'var(--red)' }}>Overdue ({overdue.length})</div>
          {overdue.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
      {urgent.length > 0 && (
        <div style={s.group}>
          <div style={{ ...s.groupLabel, color: 'var(--yellow)' }}>Due Soon ({urgent.length})</div>
          {urgent.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
      {upcoming.length > 0 && (
        <div style={s.group}>
          <div style={s.groupLabel}>Upcoming ({upcoming.length})</div>
          {upcoming.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
      {done.length > 0 && (
        <div style={s.group}>
          <div style={s.groupLabel}>Done ({done.length})</div>
          {done.map(t => <TaskRow key={t.id} task={t} />)}
        </div>
      )}
    </div>
  )
}
