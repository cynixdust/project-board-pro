const fs = require('fs');
const path = require('path');

const dashboardContent = `import { useAppStore } from '../store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { useMemo } from 'react'
import { FolderOpen, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react'

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function DashboardView() {
  const { tasks, goals, timeEntries, currentProject, users } = useAppStore()

  const projectTasks = tasks.filter(t => t.projectId === currentProject)
  const projectGoals = goals.filter(g => g.projectId === currentProject)
  const projectTaskIds = projectTasks.map(t => t.id)
  const projectTimeEntries = timeEntries.filter(te => projectTaskIds.includes(te.taskId))

  const stats = useMemo(() => {
    const total = projectTasks.length
    const completed = projectTasks.filter(t => t.status === 'done').length
    const inProgress = projectTasks.filter(t => t.status === 'in-progress').length
    const overdue = projectTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length
    const totalHours = projectTimeEntries.reduce((sum, e) => sum + e.duration, 0) / 3600
    return { total, completed, inProgress, overdue, totalHours }
  }, [projectTasks, projectTimeEntries])

  const statusData = [
    { name: 'Backlog', value: projectTasks.filter(t => t.status === 'backlog').length },
    { name: 'To Do', value: projectTasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: projectTasks.filter(t => t.status === 'in-progress').length },
    { name: 'Review', value: projectTasks.filter(t => t.status === 'review').length },
    { name: 'Done', value: projectTasks.filter(t => t.status === 'done').length },
  ].filter(d => d.value > 0)

  const priorityData = [
    { name: 'Urgent', value: projectTasks.filter(t => t.priority === 'urgent').length },
    { name: 'High', value: projectTasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: projectTasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: projectTasks.filter(t => t.priority === 'low').length },
  ].filter(d => d.value > 0)

  const timeByDay = useMemo(() => {
    const days = {}
    projectTimeEntries.forEach(entry => {
      const day = entry.date
      days[day] = (days[day] || 0) + entry.duration / 3600
    })
    return Object.entries(days).sort(([a], [b]) => a.localeCompare(b)).slice(-14)
      .map(([date, hours]) => ({ date, hours: Math.round(hours * 10) / 10 }))
  }, [projectTimeEntries])

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Dashboard</h3>
        <p className="text-gray-400">Analytics and insights for your project</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard icon={<FolderOpen size={20} className="text-blue-400" />} label="Total Tasks" value={stats.total} />
        <StatCard icon={<CheckCircle size={20} className="text-green-400" />} label="Completed" value={stats.completed} />
        <StatCard icon={<Clock size={20} className="text-yellow-400" />} label="In Progress" value={stats.inProgress} />
        <StatCard icon={<TrendingUp size={20} className="text-red-400" />} label="Overdue" value={stats.overdue} />
        <StatCard icon={<Clock size={20} className="text-purple-400" />} label="Hours Logged" value={stats.totalHours.toFixed(1)} />
        <StatCard icon={<Target size={20} className="text-pink-400" />} label="Completion" value={\`${completionRate}%\`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Tasks by Status</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Tasks by Priority</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {priorityData.map((_, index) => (
                  <Cell key={\`cell-\${index}\`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ color: '#9CA3AF' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Time Logged (Last 14 Days)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timeByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
              <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="hours" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="text-white font-medium mb-4">Goals Progress</h4>
          <div className="space-y-4">
            {projectGoals.map(goal => (
              <div key={goal.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{goal.title}</span>
                  <span className="text-gray-400">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: \`${goal.progress}%\` }} />
                </div>
              </div>
            ))}
            {projectGoals.length === 0 && (
              <p className="text-gray-500 text-center py-8">No goals created yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="text-white font-medium mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {[...projectTasks]
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5)
            .map(task => {
              const assignee = users.find(u => u.id === task.assigneeId)
              return (
                <div key={task.id} className="flex items-center gap-3 text-sm border-b border-gray-600 pb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                    {assignee?.name.charAt(0) || '?'}
                  </div>
                  <div className="flex-1">
                    <span className="text-white">{task.title}</span>
                    <span className="text-gray-400 ml-2">{task.status}</span>
                  </div>
                  <span className="text-gray-500 text-xs">{new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}
`;

const settingsContent = `import { useAppStore } from '../store'
import { useState, useCallback } from 'react'
import { Download, Upload, Database, Image, Palette, Bell, FileSpreadsheet, FileText, FileJson } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { saveAs } from 'file-saver'
import initSqlJs from 'sql.js'

export default function SettingsView() {
  const { tasks, projects, goals, timeEntries, currentProject, setLogo } = useAppStore()
  const [activeSection, setActiveSection] = useState('export')
  const [logoPreview, setLogoPreview] = useState(localStorage.getItem('app_logo'))
  const [dbStatus, setDbStatus] = useState('Ready')

  const projectTasks = tasks.filter(t => t.projectId === currentProject)
  const projectGoals = goals.filter(g => g.projectId === currentProject)

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = ev.target?.result
      setLogoPreview(result)
      localStorage.setItem('app_logo', result)
      setLogo(result)
    }
    reader.readAsDataURL(file)
  }, [setLogo])

  const exportCSV = () => {
    const headers = ['Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Tags', 'Logged Hours']
    const rows = projectTasks.map(t => [
      t.title, t.status, t.priority,
      t.assigneeId || '', t.dueDate || '',
      t.tags.join(';'), t.loggedHours
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    saveAs(blob, \`tasks_\${currentProject}_\${new Date().toISOString().split('T')[0]}.csv\`)
  }

  const exportExcel = () => {
    const wsData = [
      ['Task Export', '', '', '', '', '', ''],
      ['Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Tags', 'Logged Hours'],
      ...projectTasks.map(t => [t.title, t.status, t.priority, t.assigneeId || '', t.dueDate || '', t.tags.join(';'), t.loggedHours])
    ]
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    saveAs(blob, \`tasks_\${currentProject}_\${new Date().toISOString().split('T')[0]}.xlsx\`)
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    const project = projects.find(p => p.id === currentProject)
    doc.setFontSize(18)
    doc.text(project?.name || 'Project', 14, 22)
    doc.setFontSize(10)
    doc.text(\`Exported: \${new Date().toLocaleDateString()}\`, 14, 30)

    const tableData = projectTasks.map(t => [t.title, t.status, t.priority, t.dueDate || '', \`\${t.loggedHours}h\`])
    doc.autoTable({
      head: [['Task', 'Status', 'Priority', 'Due Date', 'Hours']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] },
    })
    doc.save(\`tasks_\${currentProject}_\${new Date().toISOString().split('T')[0]}.pdf\`)
  }

  const exportMSProject = () => {
    let xml = \`<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <SaveVersion>14</SaveVersion>
  <Tasks>
\`
    projectTasks.forEach((t, i) => {
      xml += \`    <Task>
      <UID>\${i + 1}</UID>
      <ID>\${i + 1}</ID>
      <Name>\${t.title}</Name>
      <Priority>\${t.priority === 'urgent' ? 1000 : t.priority === 'high' ? 700 : t.priority === 'medium' ? 500 : 300}</Priority>
      <Duration>PT\${t.estimatedHours || 8}H0M0S</Duration>
      <Start>\${t.createdAt}</Start>
      \${t.dueDate ? \`<Finish>\${t.dueDate}T17:00:00</Finish>\` : ''}
    </Task>
\`
    })
    xml += \`  </Tasks>
</Project>\`
    const blob = new Blob([xml], { type: 'application/xml' })
    saveAs(blob, \`project_\${currentProject}_\${new Date().toISOString().split('T')[0]}.xml\`)
  }

  const exportJSON = () => {
    const data = {
      project: projects.find(p => p.id === currentProject),
      tasks: projectTasks,
      goals: projectGoals,
      timeEntries: timeEntries.filter(te => projectTasks.map(t => t.id).includes(te.taskId))
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    saveAs(blob, \`project_data_\${currentProject}_\${new Date().toISOString().split('T')[0]}.json\`)
  }

  const initSQLite = async () => {
    setDbStatus('Initializing...')
    try {
      const SQL = await initSqlJs({ locateFile: (file) => \`https://sql.js.org/dist/\${file}\` })
      const db = new SQL.Database()
      db.run(\`CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY, title TEXT, status TEXT, priority TEXT,
        projectId TEXT, assigneeId TEXT, dueDate TEXT, loggedHours REAL, createdAt TEXT
      )\`)
      projectTasks.forEach(t => {
        db.run(
          'INSERT OR REPLACE INTO tasks VALUES (?,?,?,?,?,?,?,?,?)',
          [t.id, t.title, t.status, t.priority, t.projectId, t.assigneeId || null, t.dueDate || null, t.loggedHours, t.createdAt]
        )
      })
      const data = db.export()
      const buffer = new Uint8Array(data)
      const blob = new Blob([buffer], { type: 'application/x-sqlite3' })
      saveAs(blob, \`projectboard_\${new Date().toISOString().split('T')[0]}.sqlite\`)
      db.close()
      setDbStatus('Database exported successfully!')
    } catch(e) {
      setDbStatus('Error initializing database')
    }
  }

  const sections = [
    { id: 'export', label: 'Export Data', icon: <Download size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'database', label: 'Database', icon: <Database size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  ]

  return (
    <div className="flex h-full">
      <div className="w-56 bg-gray-700/50 border-r border-gray-600 flex flex-col">
        <div className="p-4 border-b border-gray-600">
          <h3 className="text-white font-semibold">Settings</h3>
        </div>
        <nav className="p-2 space-y-1">
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={\`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors \${
                activeSection === sec.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
              }\`}
            >
              {sec.icon}
              {sec.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeSection === 'export' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Export Data</h3>
            <p className="text-gray-400 mb-6">Export your project data in various formats</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <ExportCard icon={<FileSpreadsheet size={24} />} label="Excel (.xlsx)" onClick={exportExcel} color="bg-green-600" />
              <ExportCard icon={<FileText size={24} />} label="PDF Document" onClick={exportPDF} color="bg-red-600" />
              <ExportCard icon={<FileJson size={24} />} label="CSV File" onClick={exportCSV} color="bg-blue-600" />
              <ExportCard icon={<FileText size={24} />} label="MS Project XML" onClick={exportMSProject} color="bg-orange-600" />
              <ExportCard icon={<Download size={24} />} label="JSON Backup" onClick={exportJSON} color="bg-purple-600" />
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2">Export Summary</h4>
              <p className="text-sm text-gray-300">Tasks: {projectTasks.length}</p>
              <p className="text-sm text-gray-300">Goals: {projectGoals.length}</p>
              <p className="text-sm text-gray-300">Time Entries: {timeEntries.filter(te => projectTasks.map(t => t.id).includes(te.taskId)).length}</p>
            </div>
          </div>
        )}

        {activeSection === 'appearance' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Appearance</h3>
            <p className="text-gray-400 mb-6">Customize the look and feel</p>

            <div className="bg-gray-700 rounded-lg p-6 mb-4">
              <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                <Image size={18} /> Logo
              </h4>
              {logoPreview && (
                <div className="mb-4">
                  <img src={logoPreview} alt="Logo preview" className="max-h-20 bg-gray-800 p-2 rounded" />
                </div>
              )}
              <label className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer w-fit">
                <Upload size={16} />
                Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
              <p className="text-xs text-gray-400 mt-2">Recommended: PNG or SVG, 200x60px</p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h4 className="text-white font-medium mb-4">Theme</h4>
              <div className="grid grid-cols-3 gap-3">
                {['Dark', 'Darker', 'Blue'].map(theme => (
                  <button key={theme} className="bg-gray-600 hover:bg-gray-500 text-white p-3 rounded text-sm">
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'database' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Database</h3>
            <p className="text-gray-400 mb-6">Manage local SQLite database</p>

            <div className="bg-gray-700 rounded-lg p-6 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <Database size={24} className="text-blue-400" />
                <div>
                  <h4 className="text-white font-medium">Local Database</h4>
                  <p className="text-sm text-gray-400">SQLite database stored locally</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={initSQLite} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm">
                  <Download size={16} /> Export SQLite DB
                </button>
                <label className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded text-sm cursor-pointer">
                  <Upload size={16} /> Import DB
                  <input type="file" accept=".sqlite,.db" className="hidden" />
                </label>
              </div>
              {dbStatus !== 'Ready' && (
                <p className={\`text-sm mt-3 \${dbStatus.includes('success') ? 'text-green-400' : 'text-yellow-400'\`}>
                  {dbStatus}
                </p>
              )}
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <h4 className="text-white font-medium mb-3">Storage Info</h4>
              <p className="text-sm text-gray-300">LocalStorage: {JSON.stringify(localStorage).length} bytes used</p>
              <p className="text-sm text-gray-300 mt-1">Tasks cached: {tasks.length}</p>
              <p className="text-sm text-gray-300">Projects: {projects.length}</p>
            </div>
          </div>
        )}

        {activeSection === 'notifications' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Notifications</h3>
            <p className="text-gray-400 mb-6">Configure notification preferences</p>
            <div className="bg-gray-700 rounded-lg p-6 space-y-4">
              {['Email notifications', 'Task due reminders', 'Project updates', 'Team mentions'].map(setting => (
                <label key={setting} className="flex items-center justify-between">
                  <span className="text-gray-200">{setting}</span>
                  <input type="checkbox" defaultChecked className="toggle toggle-primary" />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ExportCard({ icon, label, onClick, color }) {
  return (
    <button onClick={onClick} className={\`\${color} hover:opacity-90 text-white p-4 rounded-lg flex flex-col items-center gap-2 transition-opacity\`}>
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
`;

fs.writeFileSync(path.join(__dirname, 'src/components/DashboardView.tsx'), dashboardContent)
fs.writeFileSync(path.join(__dirname, 'src/components/SettingsView.tsx'), settingsContent)
console.log('Files written successfully')
