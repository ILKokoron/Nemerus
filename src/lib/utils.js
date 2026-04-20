export function daysUntil(deadline) {
  if (!deadline) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const d = new Date(deadline)
  d.setHours(0, 0, 0, 0)
  return Math.round((d - now) / (1000 * 60 * 60 * 24))
}

export function deadlineColor(days) {
  if (days === null) return 'gray'
  if (days < 0) return 'red'
  if (days <= 1) return 'red'
  if (days <= 3) return 'yellow'
  return 'green'
}

export function deadlineLabel(days) {
  if (days === null) return ''
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'today'
  if (days === 1) return '1d left'
  return `${days}d left`
}

export function shortAddr(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function timeAgo(date) {
  if (!date) return null
  const secs = Math.floor((new Date() - date) / 1000)
  if (secs < 60) return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

export function getProjectUrgency(project) {
  if (!project.tasks) return 'none'
  const pending = project.tasks.filter(t => !t.done)
  const days = pending.map(t => daysUntil(t.deadline)).filter(d => d !== null)
  if (days.some(d => d < 0)) return 'overdue'
  if (days.some(d => d <= 1)) return 'urgent'
  if (days.some(d => d <= 3)) return 'soon'
  return 'ok'
}
