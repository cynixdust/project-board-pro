import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import BoardView from './components/BoardView'
import ListView from './components/ListView'
import GanttView from './components/GanttView'
import DocsView from './components/DocsView'
import GoalsView from './components/GoalsView'
import TimeView from './components/TimeView'
import DashboardView from './components/DashboardView'
import SettingsView from './components/SettingsView'
import LoginPage from './components/LoginPage'
import { useAppStore } from './store'
import { useState } from 'react'

function ViewRouter() {
  const { currentView } = useAppStore()

  switch (currentView) {
    case 'dashboard': return <DashboardView />
    case 'list': return <ListView />
    case 'board': return <BoardView />
    case 'gantt': return <GanttView />
    case 'docs': return <DocsView />
    case 'goals': return <GoalsView />
    case 'time': return <TimeView />
    case 'settings': return <SettingsView />
    default: return <DashboardView />
  }
}

export default function App() {
  const { currentUser } = useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!currentUser) {
    return <LoginPage />
  }

  return (
    <BrowserRouter>
      <div className="h-screen flex bg-gray-800 text-white">
        <Sidebar isOpen={sidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="*" element={<ViewRouter />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}
