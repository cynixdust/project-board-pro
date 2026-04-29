import { useAppStore } from '../store'
import { Clock, Play, Square, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function TimeView() {
  const { tasks, currentProject, timeEntries, addTimeEntry, deleteTimeEntry, activeTimeEntry, startTimer, stopTimer, currentUser, users } = useAppStore()
  const [newEntry, setNewEntry] = useState({ taskId: '', duration: '', date: '', notes: '' })
  const [showAdd, setShowAdd] = useState(false)

  const projectTasks = tasks.filter(t => t.projectId === currentProject)
  const projectTaskIds = projectTasks.map(t => t.id)
  const projectEntries = timeEntries.filter(te => projectTaskIds.includes(te.taskId))

  const getTask = (taskId: string) => tasks.find(t => t.id === taskId)
  const getUser = (userId: string) => users.find(u => u.id === userId)

  const handleAddEntry = () => {
    if (!newEntry.taskId || !newEntry.duration) return
    addTimeEntry({
      taskId: newEntry.taskId,
      userId: currentUser?.id || '',
      duration: parseInt(newEntry.duration) * 3600,
      date: newEntry.date || new Date().toISOString().split('T')[0],
      notes: newEntry.notes,
    })
    setNewEntry({ taskId: '', duration: '', date: '', notes: '' })
    setShowAdd(false)
  }

  const totalHours = projectEntries.reduce((sum, e) => sum + e.duration, 0) / 3600

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={20} /> Time Tracking
          </h3>
          <p className="text-sm text-gray-400">Total logged: {totalHours.toFixed(1)} hours</p>
        </div>
        <div className="flex gap-2">
          {activeTimeEntry ? (
            <button
              onClick={stopTimer}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm"
            >
              <Square size={14} /> Stop Timer
            </button>
          ) : (
            <button
              onClick={() => projectTasks[0] && startTimer(projectTasks[0].id)}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm"
            >
              <Play size={14} /> Start Timer
            </button>
          )}
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
          >
            <Clock size={14} /> Log Time
          </button>
        </div>
      </div>

      {activeTimeEntry && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 text-sm">Timer running for task: {getTask(activeTimeEntry.taskId)?.title}</span>
        </div>
      )}

      {showAdd && (
        <div className="bg-gray-700 rounded-lg p-4 mb-4 space-y-3">
          <select
            value={newEntry.taskId}
            onChange={e => setNewEntry({ ...newEntry, taskId: e.target.value })}
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
          >
            <option value="">Select task...</option>
            {projectTasks.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              value={newEntry.duration}
              onChange={e => setNewEntry({ ...newEntry, duration: e.target.value })}
              placeholder="Hours"
              className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
            />
            <input
              type="date"
              value={newEntry.date}
              onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
              className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
            />
          </div>
          <input
            value={newEntry.notes}
            onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })}
            placeholder="Notes..."
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
          />
          <div className="flex gap-2">
            <button onClick={handleAddEntry} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">Save</button>
            <button onClick={() => setShowAdd(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {projectEntries.map(entry => {
          const task = getTask(entry.taskId)
          const user = getUser(entry.userId)
          return (
            <div key={entry.id} className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">{task?.title || 'Unknown task'}</p>
                <p className="text-xs text-gray-400">
                  {user?.name} • {entry.date} • {(entry.duration / 3600).toFixed(1)}h
                </p>
                {entry.notes && <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>}
              </div>
              <button onClick={() => deleteTimeEntry(entry.id)} className="text-gray-500 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>

      {projectEntries.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          <Clock size={48} className="mx-auto mb-3 opacity-30" />
          <p>No time entries yet. Start tracking!</p>
        </div>
      )}
    </div>
  )
}
