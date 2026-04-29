import { useAppStore } from '../store'
import { Target, Plus, Trash2, Check, Circle } from 'lucide-react'
import { useState } from 'react'

export default function GoalsView() {
  const { goals, currentProject, addGoal, updateGoal, deleteGoal } = useAppStore()
  const [showNew, setShowNew] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: '' })

  const projectGoals = goals.filter(g => g.projectId === currentProject)

  const handleAdd = () => {
    if (!newGoal.title.trim()) return
    addGoal({
      ...newGoal,
      progress: 0,
      milestones: [],
    })
    setNewGoal({ title: '', description: '', targetDate: '' })
    setShowNew(false)
  }

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    )
    const progress = Math.round(
      (updatedMilestones.filter(m => m.completed).length / updatedMilestones.length) * 100
    )
    updateGoal(goalId, { milestones: updatedMilestones, progress })
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target size={20} /> Goals & Milestones
        </h3>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm"
        >
          <Plus size={14} /> Add Goal
        </button>
      </div>

      {showNew && (
        <div className="bg-gray-700 rounded-lg p-4 mb-4 space-y-3">
          <input
            value={newGoal.title}
            onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
            placeholder="Goal title..."
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
          />
          <textarea
            value={newGoal.description}
            onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
            placeholder="Description..."
            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400 h-20"
          />
          <input
            type="date"
            value={newGoal.targetDate}
            onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
            className="bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">
              Save
            </button>
            <button onClick={() => setShowNew(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {projectGoals.map(goal => (
          <div key={goal.id} className="bg-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white font-medium">{goal.title}</h4>
                <p className="text-sm text-gray-400">{goal.description}</p>
              </div>
              <button onClick={() => deleteGoal(goal.id)} className="text-gray-500 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>

            {goal.targetDate && (
              <p className="text-xs text-gray-400 mb-3">Target: {goal.targetDate}</p>
            )}

            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-gray-400 uppercase">Milestones</h5>
              {goal.milestones.map(m => (
                <button
                  key={m.id}
                  onClick={() => toggleMilestone(goal.id, m.id)}
                  className="flex items-center gap-2 w-full text-sm hover:bg-gray-600 -mx-2 px-2 py-1 rounded"
                >
                  {m.completed ? <Check size={14} className="text-green-400" /> : <Circle size={14} className="text-gray-500" />}
                  <span className={m.completed ? 'line-through text-gray-500' : 'text-gray-200'}>
                    {m.title}
                  </span>
                  {m.dueDate && <span className="text-xs text-gray-400 ml-auto">{m.dueDate}</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {projectGoals.length === 0 && !showNew && (
        <div className="text-center text-gray-500 mt-8">
          <Target size={48} className="mx-auto mb-3 opacity-30" />
          <p>No goals yet. Create one to track progress!</p>
        </div>
      )}
    </div>
  )
}
