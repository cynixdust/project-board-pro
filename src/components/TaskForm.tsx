import { useAppStore } from '../store'
import type { Task, Status, Priority } from '../types'
import { useState } from 'react'
import { X } from 'lucide-react'

export default function TaskForm({ task, onSave, onCancel }: {
  task?: Task
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const { users, currentProject } = useAppStore()
  const [title, setTitle] = useState(task?.title || '')
  const [status, setStatus] = useState<Status>(task?.status || 'todo')
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium')
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '')
  const [dueDate, setDueDate] = useState(task?.dueDate || '')
  const [loggedHours, setLoggedHours] = useState(task?.loggedHours?.toString() || '')

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: '',
      status,
      priority,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate || undefined,
      loggedHours: parseFloat(loggedHours) || 0,
      projectId: currentProject || '',
      tags: [],
      subtasks: [],
      comments: [],
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-96 shadow-2xl border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">{task ? 'Edit Task' : 'New Task'}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Task title..."
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
            autoFocus
          />
          <div className="grid grid-cols-2 gap-2">
            <select value={status} onChange={e => setStatus(e.target.value as Status)} className="bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm text-white">
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </select>
            <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm text-white">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm text-white">
            <option value="">Unassigned</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm text-white" />
            <input type="number" value={loggedHours} onChange={e => setLoggedHours(e.target.value)} placeholder="Hours" className="bg-gray-700 border border-gray-600 rounded px-2 py-2 text-sm text-white" />
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm">{task ? 'Update' : 'Create'}</button>
            <button onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
