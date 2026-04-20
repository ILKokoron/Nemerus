import { useState, useEffect, useCallback } from 'react'
import { uploadToWalrus, fetchFromWalrus } from '../lib/walrus'

const LS_BLOB_KEY = (wallet) => `nemerus_blob_${wallet}`
const LS_GROQ_KEY = 'nemerus_groq_key'

export function useStore(walletAddress) {
  const [projects, setProjects] = useState([])
  const [blobId, setBlobId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const [groqKey, setGroqKeyState] = useState(() => localStorage.getItem(LS_GROQ_KEY) || '')

  const setGroqKey = (key) => {
    localStorage.setItem(LS_GROQ_KEY, key)
    setGroqKeyState(key)
  }

  useEffect(() => {
    if (!walletAddress) return
    const stored = localStorage.getItem(LS_BLOB_KEY(walletAddress))
    if (stored) {
      setBlobId(stored)
      loadFromWalrus(stored)
    }
  }, [walletAddress])

  const loadFromWalrus = useCallback(async (id) => {
    setLoading(true)
    try {
      const data = await fetchFromWalrus(id)
      setProjects(data.projects || [])
    } catch (e) {
      console.error('Load failed:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const save = useCallback(async (updatedProjects) => {
    if (!walletAddress) return
    setSaving(true)
    try {
      const payload = {
        wallet: walletAddress,
        lastUpdated: new Date().toISOString(),
        projects: updatedProjects,
      }
      const newBlobId = await uploadToWalrus(payload)
      setBlobId(newBlobId)
      localStorage.setItem(LS_BLOB_KEY(walletAddress), newBlobId)
      setLastSaved(new Date())
    } catch (e) {
      console.error('Save failed:', e)
      throw e
    } finally {
      setSaving(false)
    }
  }, [walletAddress])

  const addProject = useCallback(async (project) => {
    const updated = [...projects, project]
    setProjects(updated)
    await save(updated)
  }, [projects, save])

  const updateProject = useCallback(async (id, changes) => {
    const updated = projects.map(p => p.id === id ? { ...p, ...changes } : p)
    setProjects(updated)
    await save(updated)
  }, [projects, save])

  const deleteProject = useCallback(async (id) => {
    const updated = projects.filter(p => p.id !== id)
    setProjects(updated)
    await save(updated)
  }, [projects, save])

  const addTask = useCallback(async (projectId, task) => {
    const updated = projects.map(p =>
      p.id === projectId ? { ...p, tasks: [...(p.tasks || []), task] } : p
    )
    setProjects(updated)
    await save(updated)
  }, [projects, save])

  const toggleTask = useCallback(async (projectId, taskId) => {
    const updated = projects.map(p =>
      p.id === projectId
        ? { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }
        : p
    )
    setProjects(updated)
    await save(updated)
  }, [projects, save])

  return {
    projects, blobId, saving, loading, lastSaved,
    groqKey, setGroqKey,
    addProject, updateProject, deleteProject, addTask, toggleTask,
  }
}
