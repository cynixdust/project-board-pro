import { useAppStore } from '../store'
import { Search, Filter, ArrowUpDown, CheckSquare, Square, Plus } from 'lucide-react'
import { useState } from 'react'
import type { Priority, Status, Task } from '../types'
import TaskForm from './TaskForm'

const priorityColors: Record<Priority, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
}

const statusLabels: Record<Status, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'Review',
  done: 'Done',
}

export default function ListView() {
  const { tasks, currentProject, updateTask, addTask, deleteTask, users } = useAppStore()
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'status'>('priority')
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const projectTasks = tasks
    .filter(t => t.projectId === currentProject)
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 }
        return order[a.priority] - order[b.priority]
      }
      if (sortBy === 'dueDate') return (a.dueDate || '').localeCompare(b.dueDate || '')
      return a.status.localeCompare(b.status)
    })

  const handleAddTask = () => {
    setEditingTask(null)
    setShowForm(true)
  }

  const handleSaveTask = (data: any) => {
    if (editingTask) {
      updateTask(editingTask.id, data)
    } else {
      addTask(data)
    }
    setShowForm(false)
    setEditingTask(null)
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button className="flex items-center gap-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-600">
          <Filter size={14} /> Filters
        </button>
        <button
          onClick={() => setSortBy(sortBy === 'priority' ? 'dueDate' : sortBy === 'dueDate' ? 'status' : 'priority')}
          className="flex items-center gap-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-gray-600"
        >
          <ArrowUpDown size={14} /> Sort
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-800">
            <tr className="text-left text-gray-400 text-xs uppercase">
              <th className="p-2 w-8"></th>
              <th className="p-2">Task</th>
              <th className="p-2">Status</th>
              <th className="p-2">Priority</th>
              <th className="p-2">Assignee</th>
              <th className="p-2">Due Date</th>
              <th className="p-2">Time</th>
              <th className="p-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {projectTasks.map(task => {
              const assignee = users.find(u => u.id === task.assigneeId)
              return (
                <tr key={task.id} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="p-2">
                    <button onClick={() => updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })}>
                      {task.status === 'done' ? <CheckSquare size={16} className="text-green-500" /> : <Square size={16} className="text-gray-500" />}
                    </button>
                  </td>
                  <td className="p-2">
                    <div>
                      <span className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-white'}`}>
                        {task.title}
                      </span>
                      {(task.tags || []).length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {(task.tags || []).map(tag => (
                            <span key={tag} className="text-[10px] bg-gray-600 text-gray-300 px-1 py-0.5 rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-2">
                    <span className="text-xs bg-gray-600 px-2 py-1 rounded text-gray-300">
                      {statusLabels[task.status]}
                    </span>
                  </td>
                  <td className="p-2">
                    <div className={`w-3 h-3 rounded-full ${priorityColors[task.priority]} inline-block mr-2`} />
                    <span className="capitalize text-gray-300">{task.priority}</span>
                  </td>
                  <td className="p-2">
                    {assignee && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white">
                          {assignee.name.charAt(0)}
                        </div>
                        <span className="text-gray-300">{assignee.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-2 text-gray-300">{task.dueDate || '-'}</td>
                  <td className="p-2 text-gray-300">{task.loggedHours}h</td>
                  <td className="p-2">
                    <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-400 text-xs">×</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="flex gap-2 mt-3 p-2">
          <button onClick={handleAddTask} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white">
            <Plus size={12} /> Add task
          </button>
        </div>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask || undefined}
          onSave={handleSaveTask}
          onCancel={() => { setShowForm(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}
