import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { daysUntil, deadlineColor, deadlineLabel } from '../lib/utils'
import { summarizeProject } from '../lib/groq'

const DEADLINE_COLORS = {
  red: 'var(--red)', yellow: 'var(--yellow)', green: 'var(--green)', gray: 'var(--dim)',
}

const STATUSES = ['researching', 'active', 'done', 'archived']

const s = {
  panel: {
    width: 260, borderLeft: '1px solid var(--border)',
    padding: 16, flexShrink: 0, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 16,
  },
  sectionTitle: {
    fontSize: 9, color: 'var(--dim)', letterSpacing: '2px',
    textTransform: 'uppercase', marginBottom: 8,
  },
  projectName: { fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 4 },
  summary: { fontSize: 10, color: 'var(--muted)', lineHeight: 1.6 },
  taskItem: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    padding: '8px 0', borderBottom: '1px solid #141414',
  },
  taskCheck: (done) => ({
    width: 12, height: 12, border: `1px solid ${done ? 'var(--accent)' : '#333'}`,
    borderRadius: 2, flexShrink: 0, marginTop: 1, cursor: 'pointer',
    background: done ? 'var(--accent)' : 'transparent', transition: 'all 0.1s',
  }),
  taskTitle: (done) => ({
    fontSize: 11, color: done ? 'var(--dim)' : 'var(--muted)',
    textDecoration: done ? 'line-through' : 'none', marginBottom: 2,
  }),
  addTaskRow: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 },
  addBtn: {
    width: '100%', padding: '6px', fontSize: 10, borderRadius: 3,
    background: 'transparent', border: '1px solid var(--border)',
    color: 'var(--muted)', transition: 'all 0.15s',
  },
  statusRow: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  statusPill: (active) => ({
    fontSize: 9, padding: '3px 8px', borderRadius: 3,
    background: active ? 'var(--accent-bg)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--dim)',
    border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
    cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
  }),
  groqArea: {
    background: 'var(--bg)', border: '1px solid var(--border)',
    borderRadius: 4, padding: 10,
  },
  label: { fontSize: 9, color: 'var(--dim)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 },
  summarizeBtn: {
    width: '100%', marginTop: 6, padding: '6px', fontSize: 10, borderRadius: 3,
    background: 'transparent', border: '1px solid var(--border)',
    color: 'var(--muted)', transition: 'all 0.15s',
  },
  noSelect: { fontSize: 11, color: 'var(--dim)', marginTop: 40, textAlign: 'center', lineHeight: 2 },
}

export default function DetailPanel({ project, onToggleTask, onAddTask, onUpdateProject, groqKey }) {
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDeadline, setTaskDeadline] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [summarizing, setSummarizing] = useState(false)
  const [descInput, setDescInput] = useState('')

  if (!project) {
    return (
      <div style={s.panel}>
        <div style={s.noSelect}>
          ← select a project<br />
          <span style={{ fontSize: 9, color: 'var(--dim)' }}>to view details</span>
        </div>
      </div>
    )
  }

  const handleAddTask = () => {
    if (!taskTitle.trim()) return
    onAddTask(project.id, {
      id: uuid(),
      title: taskTitle.trim(),
      deadline: taskDeadline || null,
      done: false,
    })
    setTaskTitle('')
    setTaskDeadline('')
    setShowAddTask(false)
  }

  const handleSummarize = async () => {
    if (!descInput.trim() || !groqKey) return
    setSummarizing(true)
    try {
      const result = await summarizeProject(descInput, groqKey)
      onUpdateProject(project.id, { summary: result })
    } catch (e) {
      console.error(e)
    } finally {
      setSummarizing(false)
    }
  }

  const pendingTasks = (project.tasks || []).filter(t => !t.done)
  const doneTasks = (project.tasks || []).filter(t => t.done)

  return (
    <div style={s.panel}>
      <div>
        <div style={s.sectionTitle}>Project</div>
        <div style={s.projectName}>{project.name}</div>
        {project.summary && <div style={s.summary}>{project.summary}</div>}
      </div>

      <div>
        <div style={s.sectionTitle}>Status</div>
        <div style={s.statusRow}>
          {STATUSES.map(st => (
            <div key={st} style={s.statusPill(project.status === st)}
              onClick={() => onUpdateProject(project.id, { status: st })}>
              {st}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={s.sectionTitle}>Tasks ({pendingTasks.length} pending)</div>
        {(project.tasks || []).map(task => {
          const days = daysUntil(task.deadline)
          const col = DEADLINE_COLORS[deadlineColor(days)]
          return (
            <div key={task.id} style={s.taskItem}>
              <div style={s.taskCheck(task.done)} onClick={() => onToggleTask(project.id, task.id)} />
              <div style={{ flex: 1 }}>
                <div style={s.taskTitle(task.done)}>{task.title}</div>
                {task.deadline && (
                  <div style={{ fontSize: 9, color: col }}>
                    ● {deadlineLabel(days)}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {showAddTask ? (
          <div style={s.addTaskRow}>
            <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)}
              placeholder="task title..." onKeyDown={e => e.key === 'Enter' && handleAddTask()} />
            <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)}
              style={{ colorScheme: 'dark' }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button style={{ ...s.addBtn, flex: 1 }} onClick={() => setShowAddTask(false)}>cancel</button>
              <button style={{ ...s.addBtn, flex: 1, color: 'var(--accent)', borderColor: 'var(--accent-border)' }}
                onClick={handleAddTask}>add</button>
            </div>
          </div>
        ) : (
          <button style={{ ...s.addBtn, marginTop: 8 }} onClick={() => setShowAddTask(true)}>
            + add task
          </button>
        )}
      </div>

      <div style={s.groqArea}>
        <div style={s.label}>Re-summarize</div>
        <textarea
          value={descInput}
          onChange={e => setDescInput(e.target.value)}
          placeholder="paste new description or URL..."
          rows={2}
          style={{ resize: 'none' }}
        />
        <button style={s.summarizeBtn} onClick={handleSummarize} disabled={summarizing}>
          {summarizing ? 'running...' : 'run groq →'}
        </button>
      </div>
    </div>
  )
}
