import { useAppStore } from '../store'
import type { ViewType, Project } from '../types'
import { LayoutList, KanbanSquare, GanttChart, FileText, Target, Clock, FolderOpen, Plus, ChevronDown, BarChart3, Settings, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

const viewConfig: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
  { id: 'list', label: 'List', icon: <LayoutList size={18} /> },
  { id: 'board', label: 'Board', icon: <KanbanSquare size={18} /> },
  { id: 'gantt', label: 'Gantt', icon: <GanttChart size={18} /> },
  { id: 'docs', label: 'Docs', icon: <FileText size={18} /> },
  { id: 'goals', label: 'Goals', icon: <Target size={18} /> },
  { id: 'time', label: 'Time', icon: <Clock size={18} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
]

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const { currentView, setCurrentView, projects, currentProject, setCurrentProject, addProject, updateProject, deleteProject } = useAppStore()
  const [showProjects, setShowProjects] = useState(true)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectIcon, setNewProjectIcon] = useState('folder')
  const [editingProject, setEditingProject] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const iconOptions = ['folder', 'globe', 'smartphone', 'megaphone', 'code', 'database', 'server', 'terminal', 'shield', 'chart']

  const handleAddProject = () => {
    if (!newProjectName.trim()) return
    addProject({
      name: newProjectName,
      description: '',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      members: [],
      icon: newProjectIcon,
    })
    setNewProjectName('')
    setNewProjectIcon('folder')
  }

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} bg-gray-900 text-gray-300 flex flex-col h-screen border-r border-gray-700 overflow-hidden transition-all duration-300`}>
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderOpen size={24} className="text-blue-400" />
          Project Board Pro
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Views</h3>
          {viewConfig.map(view => (
            <button
              key={view.id}
              onClick={() => setCurrentView(view.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                currentView === view.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300'
              }`}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>

        <div>
          <button
            onClick={() => setShowProjects(!showProjects)}
            className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 hover:text-gray-300"
          >
            Projects
            <ChevronDown size={14} className={`transition-transform ${showProjects ? '' : '-rotate-90'}`} />
          </button>

          {showProjects && (
            <div className="space-y-1">
              {projects.map((project: Project) => (
                <div
                  key={project.id}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentProject === project.id
                      ? 'bg-gray-800 text-white'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  {editingProject === project.id ? (
                    <>
                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            updateProject(project.id, { name: editName })
                            setEditingProject(null)
                          }
                          if (e.key === 'Escape') setEditingProject(null)
                        }}
                        className="flex-1 bg-gray-700 text-white text-xs px-2 py-1 rounded"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          updateProject(project.id, { name: editName })
                          setEditingProject(null)
                        }}
                        className="text-green-400 hover:text-green-300"
                      >
                        ✓
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setCurrentProject(project.id)}
                        className="flex-1 flex items-center gap-3 text-left"
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                        {project.name}
                      </button>
                      <button
                        onClick={() => { setEditingProject(project.id); setEditName(project.name) }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-opacity"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this project?')) {
                            deleteProject(project.id)
                            if (currentProject === project.id) setCurrentProject(projects[0]?.id || null)
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}

              <div className="flex gap-1 mt-2">
                <select
                  value={newProjectIcon}
                  onChange={e => setNewProjectIcon(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded px-1 py-1 text-xs text-white"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <input
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddProject()}
                  placeholder="New project..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-500"
                />
                <button onClick={handleAddProject} className="p-1 bg-blue-600 rounded hover:bg-blue-700">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="p-3 border-t border-gray-700">
        {useAppStore.getState().logoUrl ? (
          <img src={useAppStore.getState().logoUrl || undefined} alt="Logo" className="w-full max-h-16 object-contain" />
        ) : (
          <div className="flex items-center gap-2 text-white">
            <FolderOpen size={20} className="text-blue-400" />
            <span className="text-sm font-bold">Project Board Pro</span>
          </div>
        )}
      </div>
    </aside>
  )
}
