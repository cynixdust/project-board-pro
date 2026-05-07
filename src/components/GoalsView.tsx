import { useAppStore } from '../store'
import {
  Target, Plus, Trash2, Check, Circle, Tag, Calendar, TrendingUp, Award,
  ChevronDown, ChevronRight, Eye, Layers, GitBranch, MessageSquare, BookOpen,
  History, Flame, Users, Lightbulb, AlertCircle, Play, SquareCheck, BarChart3, NotebookPen, Repeat
} from 'lucide-react'
import { useState } from 'react'
import { v4 as uuid } from 'uuid'

export default function GoalsView() {
  const { goals, users, currentProject, addGoal, updateGoal, deleteGoal, addGoalComment, addGoalJournal, addGoalReview, toggleGoalHabit } = useAppStore()
  const [showNew, setShowNew] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '', description: '', targetDate: '', startDate: '',
    effort: '' as '' | 'xs' | 's' | 'm' | 'l' | 'xl', category: '',
    priority: '' as '' | 'low' | 'medium' | 'high' | 'urgent',
    type: 'goal' as 'vision' | 'objective' | 'goal' | 'subgoal',
    status: 'not-started' as 'not-started' | 'in-progress' | 'blocked' | 'completed',
    parentId: '', why: '', isRecurring: false,
    tagInput: '', keyResultTitle: '', keyResultTarget: '', keyResultUnit: '',
    collaboratorIds: [] as string[], assigneeId: '',
  })
  const [tempKeyResults, setTempKeyResults] = useState<Array<{ id: string; title: string; target: number; current: number; unit: string }>>([])
  const [tempTags, setTempTags] = useState<string[]>([])
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [newMilestoneDue, setNewMilestoneDue] = useState('')
  const [showAddSubGoal, setShowAddSubGoal] = useState<string | null>(null)
  const [subGoalInput, setSubGoalInput] = useState({ title: '', description: '', type: 'subgoal' as 'vision' | 'objective' | 'goal' | 'subgoal' })
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree')
  const [activeGoalTab, setActiveGoalTab] = useState<Record<string, string>>({})
  const [commentInput, setCommentInput] = useState<Record<string, string>>({})
  const [journalInput, setJournalInput] = useState<Record<string, string>>({})
  const [journalMood, setJournalMood] = useState<Record<string, string>>({})
  const [reviewInput, setReviewInput] = useState<Record<string, string>>({})

  const projectGoals = goals.filter(g => g.projectId === currentProject)

  const buildHierarchy = () => {
    const rootGoals = projectGoals.filter(g => !g.parentId)
    const childrenMap = new Map<string, typeof projectGoals>()
    projectGoals.forEach(g => {
      if (g.parentId) {
        if (!childrenMap.has(g.parentId)) childrenMap.set(g.parentId, [])
        childrenMap.get(g.parentId)!.push(g)
      }
    })
    return { rootGoals, childrenMap }
  }

  const rollUpProgress = (goalId: string): number => {
    const { childrenMap } = buildHierarchy()
    const children = childrenMap.get(goalId) || []
    if (children.length === 0) {
      const goal = goals.find(g => g.id === goalId)
      return goal?.progress || 0
    }
    const totalProgress = children.reduce((sum, child) => sum + rollUpProgress(child.id), 0)
    return Math.round(totalProgress / children.length)
  }

  const countChildren = (goalId: string): number => {
    const { childrenMap } = buildHierarchy()
    const children = childrenMap.get(goalId) || []
    return children.length + children.reduce((sum, child) => sum + countChildren(child.id), 0)
  }

  const getHabitStreak = (goalId: string): number => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal?.habitDays) return 0
    const sorted = [...goal.habitDays].filter(d => d.completed).sort((a, b) => b.date.localeCompare(a.date))
    if (sorted.length === 0) return 0
    let streak = 1
    for (let i = 0; i < sorted.length - 1; i++) {
      const curr = new Date(sorted[i].date)
      const prev = new Date(sorted[i + 1].date)
      const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) streak++
      else break
    }
    return streak
  }

  const handleAddTag = () => {
    if (!newGoal.tagInput.trim()) return
    setTempTags([...tempTags, newGoal.tagInput.trim()])
    setNewGoal({ ...newGoal, tagInput: '' })
  }

  const handleAddKeyResult = () => {
    if (!newGoal.keyResultTitle.trim() || !newGoal.keyResultTarget) return
    setTempKeyResults([...tempKeyResults, {
      id: uuid(), title: newGoal.keyResultTitle,
      target: parseFloat(newGoal.keyResultTarget), current: 0, unit: newGoal.keyResultUnit || '%',
    }])
    setNewGoal({ ...newGoal, keyResultTitle: '', keyResultTarget: '', keyResultUnit: '' })
  }

  const handleAdd = () => {
    if (!newGoal.title.trim()) return
    addGoal({
      title: newGoal.title, description: newGoal.description, progress: 0,
      targetDate: newGoal.targetDate || undefined, startDate: newGoal.startDate || undefined,
      effort: newGoal.effort || undefined, category: newGoal.category || undefined,
      priority: newGoal.priority || undefined, type: newGoal.type, status: newGoal.status,
      parentId: newGoal.parentId || undefined, why: newGoal.why || undefined,
      isRecurring: newGoal.isRecurring, assigneeId: newGoal.assigneeId || undefined,
      collaboratorIds: newGoal.collaboratorIds, tags: tempTags,
      keyResults: tempKeyResults, milestones: [], projectId: currentProject || '',
    })
    setNewGoal({ title: '', description: '', targetDate: '', startDate: '', effort: '', category: '', priority: '', type: 'goal', status: 'not-started', parentId: '', why: '', isRecurring: false, tagInput: '', keyResultTitle: '', keyResultTarget: '', keyResultUnit: '', collaboratorIds: [], assigneeId: '' })
    setTempTags([])
    setTempKeyResults([])
    setShowNew(false)
  }

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    )
    const progress = goal.milestones.length > 0
      ? Math.round((updatedMilestones.filter(m => m.completed).length / updatedMilestones.length) * 100)
      : 0
    updateGoal(goalId, { milestones: updatedMilestones, progress })
  }

  const addMilestone = (goalId: string) => {
    if (!newMilestoneTitle.trim()) return
    const goal = goals.find(g => g.id === goalId)
    if (!goal) return
    updateGoal(goalId, {
      milestones: [...goal.milestones, { id: uuid(), title: newMilestoneTitle, completed: false, dueDate: newMilestoneDue || undefined }],
    })
    setNewMilestoneTitle('')
    setNewMilestoneDue('')
    setEditingMilestone(null)
  }

  const updateKeyResult = (goalId: string, krId: string, current: number) => {
    const goal = goals.find(g => g.id === goalId)
    if (!goal || !goal.keyResults) return
    const updatedKRs = goal.keyResults.map(kr => kr.id === krId ? { ...kr, current } : kr)
    const avgProgress = Math.round(updatedKRs.reduce((sum, kr) => sum + Math.min(100, (kr.current / kr.target) * 100), 0) / updatedKRs.length)
    updateGoal(goalId, { keyResults: updatedKRs, progress: avgProgress })
  }

  const addSubGoal = (parentId: string) => {
    if (!subGoalInput.title.trim()) return
    const parentGoal = goals.find(g => g.id === parentId)
    addGoal({
      title: subGoalInput.title, description: subGoalInput.description, progress: 0,
      type: subGoalInput.type, status: 'not-started', parentId, category: parentGoal?.category,
      tags: [], collaboratorIds: [], comments: [], journalEntries: [], reviewHistory: [], habitDays: [],
      milestones: [], projectId: currentProject || '',
    })
    setSubGoalInput({ title: '', description: '', type: 'subgoal' })
    setShowAddSubGoal(null)
  }

  const statusConfig: Record<string, { icon: React.ReactNode; color: string; label: string; next: string }> = {
    'not-started': { icon: <SquareCheck size={14} />, color: 'bg-gray-500', label: 'Not Started', next: 'in-progress' },
    'in-progress': { icon: <Play size={14} />, color: 'bg-blue-500', label: 'In Progress', next: 'completed' },
    'blocked': { icon: <AlertCircle size={14} />, color: 'bg-red-500', label: 'Blocked', next: 'in-progress' },
    'completed': { icon: <Check size={14} />, color: 'bg-green-500', label: 'Completed', next: 'not-started' },
  }

  const effortLabels: Record<string, string> = { xs: 'XS', s: 'S', m: 'M', l: 'L', xl: 'XL' }
  const effortColors: Record<string, string> = { xs: 'bg-green-500', s: 'bg-blue-500', m: 'bg-yellow-500', l: 'bg-orange-500', xl: 'bg-red-500' }
  const priorityColors: Record<string, string> = { low: 'bg-gray-500', medium: 'bg-blue-500', high: 'bg-orange-500', urgent: 'bg-red-500' }
  const categoryColors = ['bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-cyan-500']
  const typeConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    vision: { icon: <Eye size={14} />, color: 'text-yellow-400', label: 'Vision' },
    objective: { icon: <Target size={14} />, color: 'text-blue-400', label: 'Objective' },
    goal: { icon: <Layers size={14} />, color: 'text-green-400', label: 'Goal' },
    subgoal: { icon: <GitBranch size={14} />, color: 'text-purple-400', label: 'Sub-goal' },
  }
  const moodConfig: Record<string, { emoji: string; color: string }> = {
    great: { emoji: '😄', color: 'text-green-400' }, good: { emoji: '🙂', color: 'text-blue-400' },
    neutral: { emoji: '😐', color: 'text-gray-400' }, struggling: { emoji: '😟', color: 'text-orange-400' }, stuck: { emoji: '😤', color: 'text-red-400' },
  }
  const getCategoryColor = (cat: string) => {
    const idx = cat.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % categoryColors.length
    return categoryColors[idx]
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId)
    return user ? user.name : 'Unknown'
  }

  const getUserInitials = (userId: string) => {
    const name = getUserName(userId)
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const renderGoalCard = (goal: typeof projectGoals[0], depth = 0) => {
    const isExpanded = expandedGoal === goal.id
    const hasChildren = countChildren(goal.id) > 0
    const { childrenMap } = buildHierarchy()
    const children = childrenMap.get(goal.id) || []
    const effectiveProgress = hasChildren ? rollUpProgress(goal.id) : goal.progress
    const typeConf = typeConfig[goal.type || 'goal']
    const statusConf = statusConfig[goal.status || 'not-started']
    const tab = activeGoalTab[goal.id] || 'progress'
    const streak = getHabitStreak(goal.id)
    const today = new Date().toISOString().split('T')[0]

    return (
      <div key={goal.id} className={`bg-gray-700 rounded-lg overflow-hidden ${depth > 0 ? 'ml-6 border-l-2 border-gray-600' : ''}`}>
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={typeConf.color}>{typeConf.icon}</span>
                <span className="text-xs text-gray-400 uppercase">{typeConf.label}</span>
                {goal.isRecurring && <Repeat size={12} className="text-cyan-400" />}
              </div>
              <h4 className="text-white font-medium">{goal.title}</h4>
              <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
            </div>
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={() => updateGoal(goal.id, { status: statusConf.next as any })}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded text-white ${statusConf.color} hover:opacity-80`}
              >
                {statusConf.icon} {statusConf.label}
              </button>
              <button onClick={() => deleteGoal(goal.id)} className="text-gray-500 hover:text-red-400 p-1">
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {goal.category && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded text-white ${getCategoryColor(goal.category)}`}>
                <Tag size={10} /> {goal.category}
              </span>
            )}
            {goal.priority && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded text-white ${priorityColors[goal.priority]}`}>
                <Award size={10} /> {goal.priority}
              </span>
            )}
            {goal.effort && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded text-white ${effortColors[goal.effort]}`}>
                {effortLabels[goal.effort]}
              </span>
            )}
            {goal.tags?.map(t => (
              <span key={t} className="inline-flex items-center text-xs px-2 py-0.5 rounded bg-gray-600 text-gray-300">
                #{t}
              </span>
            ))}
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span className="flex items-center gap-1">
                <TrendingUp size={12} /> Progress
                {hasChildren && <span className="text-gray-500">(auto)</span>}
              </span>
              <span>{effectiveProgress}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${effectiveProgress === 100 ? 'bg-green-500' : effectiveProgress > 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                style={{ width: `${effectiveProgress}%` }} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
            {goal.startDate && <span className="flex items-center gap-1"><Calendar size={12} /> Start: {formatDate(goal.startDate)}</span>}
            {goal.targetDate && <span className="flex items-center gap-1"><Calendar size={12} /> Due: {formatDate(goal.targetDate)}</span>}
            {goal.assigneeId && (
              <span className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold">
                  {getUserInitials(goal.assigneeId)}
                </div>
                {getUserName(goal.assigneeId)}
              </span>
            )}
            {streak > 0 && (
              <span className="flex items-center gap-1 text-orange-400">
                <Flame size={12} /> {streak} day streak
              </span>
            )}
          </div>

          <div className="flex border-b border-gray-600 mb-3">
            {['progress', 'accountability', 'motivation', 'review'].map(t => (
              <button
                key={t}
                onClick={() => setActiveGoalTab(prev => ({ ...prev, [goal.id]: t }))}
                className={`flex-1 px-2 py-1.5 text-xs capitalize ${tab === t ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-500'}`}
              >
                {t === 'progress' && <BarChart3 size={12} className="inline mr-1" />}
                {t === 'accountability' && <Users size={12} className="inline mr-1" />}
                {t === 'motivation' && <Lightbulb size={12} className="inline mr-1" />}
                {t === 'review' && <History size={12} className="inline mr-1" />}
                {t}
              </button>
            ))}
          </div>

          {tab === 'progress' && (
            <div className="space-y-3">
              {goal.keyResults && goal.keyResults.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-green-400 uppercase flex items-center gap-1">
                    <TrendingUp size={12} /> Key Results
                  </h5>
                  {goal.keyResults.map(kr => {
                    const krProgress = Math.min(100, Math.round((kr.current / kr.target) * 100))
                    return (
                      <div key={kr.id} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-300">
                          <span>{kr.title}</span>
                          <span>{kr.current} / {kr.target} {kr.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-600 rounded-full h-1.5">
                            <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{ width: `${krProgress}%` }} />
                          </div>
                          <input type="number" value={kr.current}
                            onChange={e => updateKeyResult(goal.id, kr.id, parseFloat(e.target.value) || 0)}
                            className="w-16 bg-gray-600 border border-gray-500 rounded px-2 py-0.5 text-xs text-white text-center" step="0.1" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {goal.milestones.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-xs font-semibold text-gray-400 uppercase">Milestones</h5>
                  {goal.milestones.map(m => (
                    <button key={m.id} onClick={() => toggleMilestone(goal.id, m.id)}
                      className="flex items-center gap-2 w-full text-sm hover:bg-gray-600 -mx-2 px-2 py-1 rounded">
                      {m.completed ? <Check size={14} className="text-green-400" /> : <Circle size={14} className="text-gray-500" />}
                      <span className={m.completed ? 'line-through text-gray-500' : 'text-gray-200'}>{m.title}</span>
                      {m.dueDate && <span className="text-xs text-gray-400 ml-auto">{formatDate(m.dueDate)}</span>}
                    </button>
                  ))}
                </div>
              )}

              {goal.isRecurring && goal.habitDays && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-orange-400 uppercase flex items-center gap-1">
                    <Flame size={12} /> Habit Tracker {streak > 0 && `(${streak} day streak)`}
                  </h5>
                  <div className="flex gap-1 flex-wrap">
                    {Array.from({ length: 14 }).map((_, i) => {
                      const d = new Date()
                      d.setDate(d.getDate() - 13 + i)
                      const dateStr = d.toISOString().split('T')[0]
                      const done = goal.habitDays?.find(h => h.date === dateStr)?.completed
                      const isToday = dateStr === today
                      return (
                        <button key={dateStr} onClick={() => toggleGoalHabit(goal.id, dateStr)}
                          className={`w-7 h-7 rounded text-[10px] flex items-center justify-center ${done ? 'bg-orange-500 text-white' : isToday ? 'bg-gray-600 border border-orange-400 text-gray-300' : 'bg-gray-600 text-gray-500'}`}>
                          {d.getDate()}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <button onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                {isExpanded ? 'Hide' : 'Show'} milestones editor
              </button>

              {isExpanded && (
                <div className="space-y-2 pt-2 border-t border-gray-600">
                  {editingMilestone === goal.id ? (
                    <div className="flex gap-2">
                      <input value={newMilestoneTitle} onChange={e => setNewMilestoneTitle(e.target.value)}
                        placeholder="Milestone title..." className="flex-1 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-xs text-white placeholder-gray-400" />
                      <input type="date" value={newMilestoneDue} onChange={e => setNewMilestoneDue(e.target.value)}
                        className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-xs text-white" />
                      <button onClick={() => addMilestone(goal.id)} className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs">Add</button>
                      <button onClick={() => setEditingMilestone(null)} className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs">×</button>
                    </div>
                  ) : (
                    <button onClick={() => setEditingMilestone(goal.id)} className="text-xs text-blue-400 hover:text-blue-300">+ Add Milestone</button>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'accountability' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {goal.assigneeId && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-bold">
                      {getUserInitials(goal.assigneeId)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Owner</p>
                      <p className="text-sm text-white">{getUserName(goal.assigneeId)}</p>
                    </div>
                  </div>
                )}
                {goal.collaboratorIds && goal.collaboratorIds.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-gray-400" />
                    {goal.collaboratorIds.map(cid => (
                      <div key={cid} className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-[10px] text-white font-bold" title={getUserName(cid)}>
                        {getUserInitials(cid)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                  <MessageSquare size={12} /> Activity Log
                </h5>
                <div className="flex gap-2">
                  <input value={commentInput[goal.id] || ''}
                    onChange={e => setCommentInput(prev => ({ ...prev, [goal.id]: e.target.value }))}
                    placeholder="Add a comment..." className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400"
                    onKeyDown={e => { if (e.key === 'Enter' && commentInput[goal.id]?.trim()) { addGoalComment(goal.id, commentInput[goal.id]); setCommentInput(prev => ({ ...prev, [goal.id]: '' })) } }} />
                  <button onClick={() => { if (commentInput[goal.id]?.trim()) { addGoalComment(goal.id, commentInput[goal.id]); setCommentInput(prev => ({ ...prev, [goal.id]: '' })) } }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">Send</button>
                </div>
                {(goal.comments || []).map(c => (
                  <div key={c.id} className="bg-gray-600 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold">
                        {getUserInitials(c.userId)}
                      </div>
                      <span className="text-xs text-gray-300">{getUserName(c.userId)}</span>
                      <span className="text-[10px] text-gray-500">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-200">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'motivation' && (
            <div className="space-y-3">
              {goal.why && (
                <div className="bg-gray-600 rounded p-3">
                  <h5 className="text-xs font-semibold text-yellow-400 uppercase flex items-center gap-1 mb-1">
                    <Lightbulb size={12} /> Why
                  </h5>
                  <p className="text-sm text-gray-200 italic">{goal.why}</p>
                </div>
              )}

              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                  <NotebookPen size={12} /> Journal
                </h5>
                <div className="space-y-1">
                  <textarea value={journalInput[goal.id] || ''}
                    onChange={e => setJournalInput(prev => ({ ...prev, [goal.id]: e.target.value }))}
                    placeholder="Reflect on your progress..." className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400 h-16" />
                  <div className="flex gap-2">
                    <select value={journalMood[goal.id] || ''} onChange={e => setJournalMood(prev => ({ ...prev, [goal.id]: e.target.value }))}
                      className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-xs text-white">
                      <option value="">Mood...</option>
                      <option value="great">😄 Great</option>
                      <option value="good">🙂 Good</option>
                      <option value="neutral">😐 Neutral</option>
                      <option value="struggling">😟 Struggling</option>
                      <option value="stuck">😤 Stuck</option>
                    </select>
                    <button onClick={() => { if (journalInput[goal.id]?.trim()) { addGoalJournal(goal.id, journalInput[goal.id], journalMood[goal.id]); setJournalInput(prev => ({ ...prev, [goal.id]: '' })); setJournalMood(prev => ({ ...prev, [goal.id]: '' })) } }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">Save</button>
                  </div>
                </div>
                {(goal.journalEntries || []).map(j => (
                  <div key={j.id} className="bg-gray-600 rounded p-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">{moodConfig[j.mood || '']?.emoji || '📝'}</span>
                      <span className="text-[10px] text-gray-500">{formatDate(j.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-200">{j.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'review' && (
            <div className="space-y-3">
              {goal.reviewCadence && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <History size={12} /> Review cadence: <span className="text-white capitalize">{goal.reviewCadence}</span>
                </div>
              )}

              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                  <BookOpen size={12} /> Check-in
                </h5>
                <div className="flex gap-2">
                  <textarea value={reviewInput[goal.id] || ''}
                    onChange={e => setReviewInput(prev => ({ ...prev, [goal.id]: e.target.value }))}
                    placeholder="How is progress going? Any blockers?" className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400 h-16" />
                  <button onClick={() => { if (reviewInput[goal.id]?.trim()) { addGoalReview(goal.id, reviewInput[goal.id]); setReviewInput(prev => ({ ...prev, [goal.id]: '' })) } }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm self-end">Check-in</button>
                </div>
              </div>

              {(goal.reviewHistory || []).length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-1">
                    <History size={12} /> Review History
                  </h5>
                  {(goal.reviewHistory || []).map(r => (
                    <div key={r.id} className="bg-gray-600 rounded p-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">{formatDate(r.date)}</span>
                        <span className="text-xs text-blue-400">{r.progressAtReview}% progress</span>
                      </div>
                      <p className="text-sm text-gray-200">{r.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button onClick={() => setShowAddSubGoal(showAddSubGoal === goal.id ? null : goal.id)}
            className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 mt-3">
            <Plus size={12} /> Add Sub-goal
          </button>

          {showAddSubGoal === goal.id && (
            <div className="mt-3 bg-gray-600 rounded p-3 space-y-2">
              <input value={subGoalInput.title} onChange={e => setSubGoalInput({ ...subGoalInput, title: e.target.value })}
                placeholder="Sub-goal title..." className="w-full bg-gray-700 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400" />
              <textarea value={subGoalInput.description} onChange={e => setSubGoalInput({ ...subGoalInput, description: e.target.value })}
                placeholder="Description..." className="w-full bg-gray-700 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400 h-16" />
              <div className="flex gap-2">
                <select value={subGoalInput.type} onChange={e => setSubGoalInput({ ...subGoalInput, type: e.target.value as any })}
                  className="bg-gray-700 border border-gray-500 rounded px-2 py-1.5 text-xs text-white">
                  <option value="subgoal">Sub-goal</option>
                  <option value="goal">Goal</option>
                  <option value="objective">Objective</option>
                </select>
                <button onClick={() => addSubGoal(goal.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm">Add</button>
                <button onClick={() => setShowAddSubGoal(null)} className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-sm">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {children.length > 0 && (
          <div className="border-t border-gray-600">
            {children.map(child => renderGoalCard(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const { rootGoals } = buildHierarchy()
  const orphanedGoals = projectGoals.filter(g => g.parentId && !goals.find(p => p.id === g.parentId))

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Target size={20} /> Goals & Progress
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-700 rounded">
            <button onClick={() => setViewMode('tree')}
              className={`px-3 py-1.5 text-xs rounded-l ${viewMode === 'tree' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Tree</button>
            <button onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-xs rounded-r ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Grid</button>
          </div>
          <button onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">
            <Plus size={14} /> Add Goal
          </button>
        </div>
      </div>

      {showNew && (
        <div className="bg-gray-700 rounded-lg p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-yellow-400">Type & Level</h4>
              <select value={newGoal.type} onChange={e => setNewGoal({ ...newGoal, type: e.target.value as any })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white">
                <option value="vision">Vision (Top Level)</option>
                <option value="objective">Objective</option>
                <option value="goal">Goal</option>
                <option value="subgoal">Sub-goal / Task</option>
              </select>
              {newGoal.type !== 'vision' && (
                <select value={newGoal.parentId} onChange={e => setNewGoal({ ...newGoal, parentId: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white">
                  <option value="">No parent (top level)</option>
                  {projectGoals.map(g => (<option key={g.id} value={g.id}>{g.title}</option>))}
                </select>
              )}
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-400">Status & Assignment</h4>
              <select value={newGoal.status} onChange={e => setNewGoal({ ...newGoal, status: e.target.value as any })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white">
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
              </select>
              <select value={newGoal.assigneeId} onChange={e => setNewGoal({ ...newGoal, assigneeId: e.target.value })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white">
                <option value="">Assign to...</option>
                {users.map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-400">Specific</h4>
            <input value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
              placeholder="Clear goal title..." className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400" />
            <textarea value={newGoal.description} onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
              placeholder="Detailed description..." className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400 h-16" />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-yellow-400">Motivation</h4>
            <input value={newGoal.why} onChange={e => setNewGoal({ ...newGoal, why: e.target.value })}
              placeholder="Why is this goal important? What's the motivation?" className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400" />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={newGoal.isRecurring} onChange={e => setNewGoal({ ...newGoal, isRecurring: e.target.checked })}
                className="rounded" />
              <Repeat size={14} /> Recurring goal (habit tracking)
            </label>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-green-400">Measurable</h4>
            <div className="flex gap-2">
              <input value={newGoal.keyResultTitle} onChange={e => setNewGoal({ ...newGoal, keyResultTitle: e.target.value })}
                placeholder="Key result..." className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400" />
              <input type="number" value={newGoal.keyResultTarget} onChange={e => setNewGoal({ ...newGoal, keyResultTarget: e.target.value })}
                placeholder="Target" className="w-20 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400" />
              <input value={newGoal.keyResultUnit} onChange={e => setNewGoal({ ...newGoal, keyResultUnit: e.target.value })}
                placeholder="Unit" className="w-16 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400" />
              <button onClick={handleAddKeyResult} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm">Add</button>
            </div>
            {tempKeyResults.length > 0 && (
              <div className="space-y-1">
                {tempKeyResults.map(kr => (
                  <div key={kr.id} className="flex items-center justify-between bg-gray-600 rounded px-3 py-1.5 text-sm">
                    <span className="text-gray-200">{kr.title} → {kr.target} {kr.unit}</span>
                    <button onClick={() => setTempKeyResults(tempKeyResults.filter(k => k.id !== kr.id))} className="text-red-400 hover:text-red-300">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-yellow-400">Achievable</h4>
              <select value={newGoal.effort} onChange={e => setNewGoal({ ...newGoal, effort: e.target.value as any })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white">
                <option value="">Effort...</option>
                <option value="xs">XS</option><option value="s">S</option><option value="m">M</option><option value="l">L</option><option value="xl">XL</option>
              </select>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-purple-400">Priority</h4>
              <select value={newGoal.priority} onChange={e => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white">
                <option value="">Priority...</option>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-purple-400">Category & Tags</h4>
            <input value={newGoal.category} onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
              placeholder="Category (e.g. Work, Health, Finance)..." className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400" />
            <div className="flex gap-2">
              <input value={newGoal.tagInput} onChange={e => setNewGoal({ ...newGoal, tagInput: e.target.value })}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
                placeholder="Add tag..." className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400" />
              <button onClick={handleAddTag} className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-sm">Add</button>
            </div>
            {tempTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tempTags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-gray-600 text-gray-300">
                    #{t}
                    <button onClick={() => setTempTags(tempTags.filter(tag => tag !== t))} className="text-red-400 hover:text-red-300 ml-1">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-red-400">Time-bound</h4>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-400">Start</label>
                <input type="date" value={newGoal.startDate} onChange={e => setNewGoal({ ...newGoal, startDate: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-400">Due</label>
                <input type="date" value={newGoal.targetDate} onChange={e => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm">Save Goal</button>
            <button onClick={() => setShowNew(false)} className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-sm">Cancel</button>
          </div>
        </div>
      )}

      {viewMode === 'tree' ? (
        <div className="space-y-4">
          {rootGoals.map(goal => renderGoalCard(goal))}
          {orphanedGoals.map(goal => renderGoalCard(goal))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projectGoals.map(goal => (
            <div key={goal.id} className="bg-gray-700 rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={typeConfig[goal.type || 'goal'].color}>{typeConfig[goal.type || 'goal'].icon}</span>
                      <span className="text-xs text-gray-400 uppercase">{typeConfig[goal.type || 'goal'].label}</span>
                    </div>
                    <h4 className="text-white font-medium">{goal.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="text-gray-500 hover:text-red-400 ml-2">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {goal.category && <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded text-white ${getCategoryColor(goal.category)}`}><Tag size={10} /> {goal.category}</span>}
                  {goal.priority && <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded text-white ${priorityColors[goal.priority]}`}><Award size={10} /> {goal.priority}</span>}
                  {goal.tags?.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded bg-gray-600 text-gray-300">#{t}</span>)}
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span className="flex items-center gap-1"><TrendingUp size={12} /> Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
                <button onClick={() => setShowAddSubGoal(showAddSubGoal === goal.id ? null : goal.id)}
                  className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1 mb-2">
                  <Plus size={12} /> Add Sub-goal
                </button>
                {showAddSubGoal === goal.id && (
                  <div className="bg-gray-600 rounded p-3 space-y-2">
                    <input value={subGoalInput.title} onChange={e => setSubGoalInput({ ...subGoalInput, title: e.target.value })}
                      placeholder="Sub-goal title..." className="w-full bg-gray-700 border border-gray-500 rounded px-3 py-2 text-sm text-white placeholder-gray-400" />
                    <div className="flex gap-2">
                      <button onClick={() => addSubGoal(goal.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm">Add</button>
                      <button onClick={() => setShowAddSubGoal(null)} className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1.5 rounded text-sm">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {projectGoals.length === 0 && !showNew && (
        <div className="text-center text-gray-500 mt-8">
          <Target size={48} className="mx-auto mb-3 opacity-30" />
          <p>No goals yet. Create one to get started!</p>
        </div>
      )}
    </div>
  )
}
