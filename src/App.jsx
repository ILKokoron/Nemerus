import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SuiClientProvider, WalletProvider, useCurrentAccount, useConnectWallet, useWallets } from '@mysten/dapp-kit'
import '@mysten/dapp-kit/dist/index.css'

import { useStore } from './store/useStore'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import ProjectCard from './components/ProjectCard'
import DetailPanel from './components/DetailPanel'
import AddProjectModal from './components/AddProjectModal'
import TasksView from './components/TasksView'
import Settings from './components/Settings'

const queryClient = new QueryClient()
const networks = { testnet: { url: 'https://fullnode.testnet.sui.io:443' } }

function AppInner() {
  const account = useCurrentAccount()
  const wallets = useWallets()
  const { mutate: connectWallet } = useConnectWallet()
  const wallet = account?.address || null

  const [view, setView] = useState('projects')
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  const store = useStore(wallet)
  const selected = store.projects.find(p => p.id === selectedId) || null

  const handleConnect = () => {
    if (wallets.length > 0) connectWallet({ wallet: wallets[0] })
  }

  const overdueCount = store.projects.filter(p =>
    (p.tasks || []).some(t => !t.done && t.deadline && new Date(t.deadline) < new Date())
  ).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      <Topbar
        wallet={wallet}
        onConnect={handleConnect}
        saving={store.saving}
        lastSaved={store.lastSaved}
      />

      {!wallet ? (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16,
        }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 700, color: 'var(--accent)' }}>
            NEMERUS
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: 1 }}>
            your research. your data. on walrus.
          </div>
          <button
            onClick={handleConnect}
            style={{
              marginTop: 8, padding: '10px 24px', fontSize: 12, borderRadius: 4,
              background: 'var(--accent)', color: '#0a0a0a', border: 'none', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            connect sui wallet
          </button>
          <div style={{ fontSize: 9, color: 'var(--dim)', marginTop: 8, textAlign: 'center', lineHeight: 2 }}>
            no server · no account · data stored on walrus<br />
            named after mneme — the greek muse of memory
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Sidebar
            view={view}
            setView={setView}
            projects={store.projects}
            blobId={store.blobId}
            lastSaved={store.lastSaved}
            walrusOk={true}
          />

          {view === 'projects' && (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 600 }}>
                    Projects
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    {store.loading && <span style={{ fontSize: 10, color: 'var(--dim)' }}>loading...</span>}
                    <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--dim)' }}>
                      <span style={{ color: 'var(--accent)' }}>{store.projects.filter(p=>p.status==='active').length} active</span>
                      {overdueCount > 0 && <span style={{ color: 'var(--red)' }}>{overdueCount} overdue</span>}
                    </div>
                    <button
                      onClick={() => setShowAdd(true)}
                      style={{
                        background: 'var(--accent)', color: '#0a0a0a', border: 'none',
                        padding: '7px 14px', fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: 'pointer',
                      }}
                    >
                      + new project
                    </button>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {store.projects.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--dim)', fontSize: 11, lineHeight: 2 }}>
                      no projects yet<br />
                      <span style={{ fontSize: 9 }}>add your first research project above</span>
                    </div>
                  ) : (
                    store.projects.map(p => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        selected={selectedId === p.id}
                        onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                      />
                    ))
                  )}
                </div>
              </div>

              <DetailPanel
                project={selected}
                onToggleTask={store.toggleTask}
                onAddTask={store.addTask}
                onUpdateProject={store.updateProject}
                groqKey={store.groqKey}
              />
            </>
          )}

          {view === 'tasks' && (
            <TasksView projects={store.projects} onToggleTask={store.toggleTask} />
          )}

          {view === 'settings' && (
            <Settings
              groqKey={store.groqKey}
              setGroqKey={store.setGroqKey}
              blobId={store.blobId}
              wallet={wallet}
            />
          )}
        </div>
      )}

      {showAdd && (
        <AddProjectModal
          onAdd={store.addProject}
          onClose={() => setShowAdd(false)}
          groqKey={store.groqKey}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider>
          <AppInner />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  )
}
