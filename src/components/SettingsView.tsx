import { useAppStore } from '../store'
import { useState } from 'react'
import { Image, Plus, Pencil, Trash2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { saveAs } from 'file-saver'

export default function SettingsView() {
  const { tasks, currentProject, setLogo, users, currentUser, currentSettingsTab, setCurrentSettingsTab, addUser, updateUser, deleteUser } = useAppStore()
  const [dbLocation, setDbLocation] = useState(localStorage.getItem('db_location') || 'project-board.sqlite')
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', role: 'member' as 'admin' | 'member' | 'viewer', avatar: '', password: '' })

  const projectTasks = tasks.filter(t => t.projectId === currentProject)

  const handleLogoUpload = (e: any) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev: any) => {
      const result = ev.target?.result
      localStorage.setItem('app_logo', result)
      setLogo(result)
    }
    reader.readAsDataURL(file)
  }

  const exportCSV = () => {
    const headers = ['Title', 'Status', 'Priority']
    const rows = projectTasks.map(t => [t.title, t.status, t.priority])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    saveAs(blob, `tasks_${currentProject}.csv`)
  }

  const exportExcel = () => {
    const wsData = [['Title', 'Status', 'Priority'], ...projectTasks.map(t => [t.title, t.status, t.priority])]
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, `tasks_${currentProject}.xlsx`)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    const tableData = projectTasks.map(t => [t.title, t.status, t.priority])
    ;(doc as any).autoTable({ head: [['Task', 'Status', 'Priority']], body: tableData })
    doc.save(`tasks_${currentProject}.pdf`)
  }

  return (
    <div className="flex h-full">
      <div className="w-56 bg-gray-700/50 border-r border-gray-600 flex flex-col">
        <div className="p-4 border-b border-gray-600">
          <h3 className="text-white font-semibold">Settings</h3>
        </div>
        {['export', 'appearance', 'database', 'account', 'users'].map(tab => (
          <button
            key={tab}
            onClick={() => setCurrentSettingsTab(tab)}
            className={`w-full text-left px-3 py-2 text-sm ${currentSettingsTab === tab ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {currentSettingsTab === 'export' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Export Data</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <button onClick={exportExcel} className="bg-green-600 p-4 rounded text-white">Excel Export</button>
              <button onClick={exportPDF} className="bg-red-600 p-4 rounded text-white">PDF Export</button>
              <button onClick={exportCSV} className="bg-blue-600 p-4 rounded text-white">CSV Export</button>
            </div>
          </div>
        )}

        {currentSettingsTab === 'appearance' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Appearance</h3>
            <div className="bg-gray-700 p-6 rounded">
              <label className="flex items-center gap-2 text-white cursor-pointer">
                <Image size={16} /> Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {currentSettingsTab === 'database' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Database</h3>
            <div className="bg-gray-700 p-6 rounded mb-4">
              <div className="flex gap-2 mb-2">
                <input value={dbLocation} onChange={e => setDbLocation(e.target.value)} className="flex-1 bg-gray-600 text-white p-2 rounded" />
                <button
                  onClick={async () => {
                    try {
                      const handle = await (window as any).showSaveFilePicker({
                        suggestedName: 'project-board.sqlite',
                        types: [{ description: 'SQLite Database', accept: { 'application/x-sqlite3': ['.sqlite', '.db'] } }]
                      })
                      const path = (handle as any).name || 'project-board.sqlite'
                      setDbLocation(path)
                      localStorage.setItem('db_location', path)
                    } catch (e) {
                      if ((e as any)?.name !== 'AbortError') console.error('File picker error:', e)
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                >
                  Browse...
                </button>
              </div>
              <p className="text-sm text-gray-300">DB Location: {dbLocation}</p>
            </div>
          </div>
        )}

        {currentSettingsTab === 'account' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Account Settings</h3>
            <div className="bg-gray-700 p-6 rounded mb-4">
              <p className="text-white mb-2">Name: {currentUser?.name}</p>
              <p className="text-gray-300">Email: {currentUser?.email}</p>
              <p className="text-gray-400 text-sm mt-2">Role: {currentUser?.role}</p>
            </div>
          </div>
        )}

        {currentSettingsTab === 'users' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-2">User Management</h3>
            <p className="text-gray-400 text-sm mb-6">Add, edit, or remove users</p>

            <div className="bg-gray-700 rounded-lg p-6 mb-6">
              <h4 className="text-white font-medium mb-4">{editingUser ? 'Edit User' : 'Add New User'}</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  placeholder="Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                />
                <input
                  placeholder="Email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value as 'admin' | 'member' | 'viewer' })}
                  className="bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
                <input
                  type="password"
                  placeholder={editingUser ? 'New password (optional)' : 'Password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (editingUser) {
                      const updates: any = { name: formData.name, email: formData.email, role: formData.role }
                      if (formData.password) updates.password = formData.password
                      updateUser(editingUser, updates)
                      setEditingUser(null)
                    } else {
                      addUser({ ...formData, avatar: '', password: formData.password || 'changeme' })
                    }
                    setFormData({ name: '', email: '', role: 'member', avatar: '', password: '' })
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm flex items-center gap-2"
                >
                  <Plus size={14} /> {editingUser ? 'Update User' : 'Add User'}
                </button>
                {editingUser && (
                  <button
                    onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', role: 'member', avatar: '', password: '' }) }}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {users.map(u => (
                <div key={u.id} className="bg-gray-700 p-3 rounded flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{u.name}</p>
                    <p className="text-gray-400 text-xs">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${u.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{u.role}</span>
                  <button
                    onClick={() => { setFormData({ name: u.name, email: u.email, role: u.role, avatar: u.avatar || '', password: '' }); setEditingUser(u.id) }}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="text-gray-400 hover:text-red-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
