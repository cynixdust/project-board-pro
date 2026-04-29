import { useAppStore } from '../store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { useMemo } from 'react'
import { FolderOpen, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

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
    const days: Record<string, number> = {}
    projectTimeEntries.forEach(entry => {
      const day = entry.date
      days[day] = (days[day] || 0) + entry.duration / 3600
    })
    return Object.entries(days)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
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
        <StatCard icon={<Target size={20} className="text-pink-400" />} label="Completion" value={`${completionRate}%`} />
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
              <XAxis dataKey="date" tick={{ fill: '#9CA3AF', fontSize: 10 }} tickFormatter={(v: string) => v.split('-').slice(1).join('/')} />
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
                  <div className="bg-blue-500 h-3 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  )
}
