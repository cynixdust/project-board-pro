import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Clock, MessageSquare, CheckSquare, AlertTriangle, ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '../types'
import { useAppStore } from '../store'
import { useState } from 'react'

const priorityIcons: Record<string, React.ReactNode> = {
  urgent: <AlertTriangle size={14} className="text-red-500" />,
  high: <ArrowUp size={14} className="text-orange-500" />,
  medium: <ArrowUp size={14} className="text-yellow-500" />,
  low: <ArrowDown size={14} className="text-green-500" />,
}

export function TaskCard({ task, index, overlay }: { task: Task; index: number; overlay?: boolean }) {
  const { users, updateTask, deleteTask } = useAppStore()
  const assignee = users.find(u => u.id === task.assigneeId)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', status: task.status, position: index },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const tags = task.tags || []
  const subtasks = task.subtasks || []
  const comments = task.comments || []

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={overlay ? undefined : style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      className={`bg-gray-700 rounded-lg p-3 cursor-pointer hover:ring-1 hover:ring-blue-500 transition-all ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {!overlay && <GripVertical size={14} className="text-gray-500 cursor-grab" />}
          <span className="text-xs font-medium text-gray-400 uppercase">{priorityIcons[task.priority]}</span>
        </div>
        <div className="flex items-center gap-1">
          {subtasks.length > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <CheckSquare size={12} />
              {subtasks.filter(st => st.completed).length}/{subtasks.length}
            </span>
          )}
          <button onClick={() => { setIsEditing(true); setEditTitle(task.title) }} className="text-gray-500 hover:text-white">
            <Pencil size={12} />
          </button>
          <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-400">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <input
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { updateTask(task.id, { title: editTitle }); setIsEditing(false) }
            if (e.key === 'Escape') setIsEditing(false)
          }}
          className="text-sm bg-gray-600 text-white px-2 py-1 rounded w-full mb-1"
          autoFocus
        />
      ) : (
        <h4 className="text-sm font-medium text-white mb-1">{task.title}</h4>
      )}

      {task.description && (
        <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {tags.map(tag => (
            <span key={tag} className="text-[10px] bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {task.loggedHours > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={12} />
              {task.loggedHours}h
            </span>
          )}
          {comments.length > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MessageSquare size={12} />
              {comments.length}
            </span>
          )}
          {assignee && (
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium">
              {assignee.name.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
