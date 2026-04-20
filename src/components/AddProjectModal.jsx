import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { summarizeProject } from '../lib/groq'

const STATUSES = ['researching', 'active', 'done', 'archived']

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  modal: {
    background: 'var(--bg1)', border: '1px solid var(--border2)',
    borderRadius: 8, padding: 24, width: 480, maxHeight: '80vh',
    overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16,
  },
  title: { fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 600, color: 'var(--text)' },
  label: { fontSize: 9, color: 'var(--dim)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 5 },
  row: { display: 'flex', gap: 8 },
  statusBtn: (active) => ({
    flex: 1, padding: '6px 0', fontSize: 10, borderRadius: 3, textTransform: 'uppercase',
    background: active ? 'var(--accent-bg)' : 'var(--bg)',
    color: active ? 'var(--accent)' : 'var(--dim)',
    border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border)'}`,
  }),
  btn: (primary) => ({
    flex: 1, padding: '8px', fontSize: 11, borderRadius: 4,
    background: primary ? 'var(--accent)' : 'transparent',
    color: primary ? '#0a0a0a' : 'var(--muted)',
    border: `1px solid ${primary ? 'var(--accent)' : 'var(--border)'}`,
    fontWeight: primary ? 600 : 400,
    transition: 'all 0.15s',
  }),
  summarizeBtn: {
    width: '100%', marginTop: 6, padding: '6px', fontSize: 10, borderRadius: 3,
    background: 'transparent', border: '1px solid var(--border)',
    color: 'var(--muted)', transition: 'all 0.15s',
  },
  error: { fontSize: 10, color: 'var(--red)', marginTop: 4 },
}

export default function AddProjectModal({ onAdd, onClose, groqKey }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [summary, setSummary] = useState('')
  const [status, setStatus] = useState('researching')
  const [summarizing, setSummarizing] = useState(false)
  const [error, setError] = useState('')

  const handleSummarize = async () => {
    if (!description.trim()) return setError('Enter a description first')
    if (!groqKey) return setError('Add your Groq API key in Settings')
    setSummarizing(true)
    setError('')
    try {
      const result = await summarizeProject(description, groqKey)
      setSummary(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setSummarizing(false)
    }
  }

  const handleAdd = () => {
    if (!name.trim()) return setError('Project name required')
    onAdd({
      id: uuid(),
      name: name.trim(),
      description: description.trim(),
      summary: summary.trim(),
      status,
      tasks: [],
      createdAt: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.title}>New Project</div>

        <div>
          <div style={s.label}>Project Name</div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. LayerZero, Scroll, Monad..." />
        </div>

        <div>
          <div style={s.label}>Description / URL</div>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Paste a URL, description, or anything you know about this project..."
            rows={3}
            style={{ resize: 'vertical' }}
          />
          <button style={s.summarizeBtn} onClick={handleSummarize} disabled={summarizing}>
            {summarizing ? 'summarizing...' : 'auto-summarize with groq →'}
          </button>
        </div>

        {summary && (
          <div>
            <div style={s.label}>Summary</div>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', color: 'var(--text)' }}
            />
          </div>
        )}

        <div>
          <div style={s.label}>Status</div>
          <div style={s.row}>
            {STATUSES.map(st => (
              <button key={st} style={s.statusBtn(status === st)} onClick={() => setStatus(st)}>
                {st}
              </button>
            ))}
          </div>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <div style={s.row}>
          <button style={s.btn(false)} onClick={onClose}>cancel</button>
          <button style={s.btn(true)} onClick={handleAdd}>add project</button>
        </div>
      </div>
    </div>
  )
}
