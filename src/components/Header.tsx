import { useAppStore } from '../store'
import { Search, Bell, Square, PanelLeft, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Header({ onToggleSidebar, sidebarOpen }: { onToggleSidebar: () => void; sidebarOpen: boolean }) {
  const { currentUser, activeTimeEntry, timeTrackingStart, stopTimer, currentProject, projects, setCurrentSettingsTab, setCurrentView } = useAppStore()
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!activeTimeEntry || !timeTrackingStart) return
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - timeTrackingStart) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [activeTimeEntry, timeTrackingStart])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const project = projects.find(p => p.id === currentProject)
  const setCurrentUser = useAppStore(s => s.setCurrentUser)

  return (
    <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="text-gray-400 hover:text-white">
          <PanelLeft size={18} className={`transition-transform ${sidebarOpen ? '' : 'rotate-180'}`} />
        </button>
        <h2 className="text-lg font-semibold text-white">
          {project?.name || 'Select Project'}
        </h2>
        {project && (
          <span className="text-xs text-gray-400">{project.description}</span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activeTimeEntry && (
          <div className="flex items-center gap-2 bg-red-600/20 text-red-400 px-3 py-1 rounded-lg text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {formatTime(elapsed)}
            <button onClick={stopTimer} className="hover:text-white">
              <Square size={14} />
            </button>
          </div>
        )}

        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search tasks..."
            className="bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-3 py-1.5 text-sm text-white placeholder-gray-400 w-64 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="relative">
          <button className="relative text-gray-400 hover:text-white" onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
          </button>

          {showNotifs && (
            <div className="absolute right-0 top-10 w-80 bg-gray-700 rounded-lg shadow-xl border border-gray-600 z-50">
              <div className="p-3 border-b border-gray-600">
                <h4 className="text-white font-medium text-sm">Notifications</h4>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {(() => {
                  const stored = typeof window !== 'undefined' ? localStorage.getItem('notifications') : null
                  const notifications = stored ? JSON.parse(stored) : []
                  if (notifications.length === 0) {
                    return <p className="p-3 text-sm text-gray-400">No notifications</p>
                  }
                  return notifications.map((n: any, i: number) => (
                    <div key={i} className="p-3 border-b border-gray-600 hover:bg-gray-600/50">
                      <p className="text-sm text-gray-200">{n.msg}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                    </div>
                  ))
                })()}
              </div>
              <div className="p-2 border-t border-gray-600">
                <button className="text-xs text-blue-400 hover:text-blue-300 w-full text-center">Mark all as read</button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <div
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-700 px-2 py-1 rounded"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
              {currentUser?.name.charAt(0)}
            </div>
            <span className="text-gray-300 hidden md:block">{currentUser?.name}</span>
          </div>

          {showProfile && (
            <div className="absolute right-0 top-10 w-56 bg-gray-700 rounded-lg shadow-xl border border-gray-600 z-50">
              <div className="p-3 border-b border-gray-600">
                <p className="text-white font-medium text-sm">{currentUser?.name}</p>
                <p className="text-gray-400 text-xs">{currentUser?.email}</p>
                <span className={`text-xs px-2 py-0.5 rounded ${
                  currentUser?.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                  currentUser?.role === 'member' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {currentUser?.role}
                </span>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setShowProfile(false); setCurrentSettingsTab('account'); setCurrentView('settings') }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded flex items-center gap-2"
                >
                  Account Settings
                </button>
                <button
                  onClick={() => { setShowProfile(false); setCurrentSettingsTab('users'); setCurrentView('settings') }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 rounded flex items-center gap-2"
                >
                  User Management
                </button>
                <div className="border-t border-gray-600 my-1" />
                <button
                  onClick={() => { setCurrentUser(null); setShowProfile(false) }}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-600 rounded flex items-center gap-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
