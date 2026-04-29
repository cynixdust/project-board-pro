import { useAppStore } from '../store'
import { TaskCard } from './TaskCard'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, Status } from '../types'

const columns: { id: Status; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'bg-gray-500' },
  { id: 'todo', label: 'To Do', color: 'bg-blue-500' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-yellow-500' },
  { id: 'review', label: 'Review', color: 'bg-purple-500' },
  { id: 'done', label: 'Done', color: 'bg-green-500' },
]

export default function BoardView() {
  const { tasks, currentProject, moveTask, addTask } = useAppStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [newTaskName, setNewTaskName] = useState<Record<string, string>>({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const projectTasks = tasks.filter(t => t.projectId === currentProject)

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const overData = over.data.current
    if (overData?.type === 'column') {
      moveTask(taskId, overData.columnId, 0)
    } else if (overData?.type === 'task') {
      moveTask(taskId, overData.status, overData.position)
    }
  }

  const handleAddTask = (status: Status) => {
    const title = newTaskName[status]?.trim()
    if (!title) return
    addTask({
      title,
      description: '',
      status,
      priority: 'medium',
      projectId: currentProject || '',
      tags: [],
      loggedHours: 0,
      subtasks: [],
      comments: [],
    })
    setNewTaskName(prev => ({ ...prev, [status]: '' }))
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 p-4 h-full overflow-x-auto">
        {columns.map(col => {
          const colTasks = projectTasks.filter(t => t.status === col.id).sort((a, b) => a.position - b.position)
          return (
            <div key={col.id} className="flex-1 min-w-[260px] max-w-[300px] flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${col.color}`} />
                  <span className="text-sm font-semibold text-gray-300">{col.label}</span>
                  <span className="text-xs bg-gray-700 rounded-full px-2 py-0.5 text-gray-400">{colTasks.length}</span>
                </div>
                <button className="text-gray-500 hover:text-white">
                  <Plus size={16} />
                </button>
              </div>

              <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {colTasks.map((task, idx) => (
                    <TaskCard key={task.id} task={task} index={idx} />
                  ))}

                  <div className="flex gap-1">
                    <input
                      value={newTaskName[col.id] || ''}
                      onChange={e => setNewTaskName(prev => ({ ...prev, [col.id]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && handleAddTask(col.id)}
                      placeholder="+ Add task..."
                      className="flex-1 bg-gray-700/50 border border-gray-600 rounded px-2 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </SortableContext>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} index={0} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
