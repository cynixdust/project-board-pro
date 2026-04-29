import { useAppStore } from '../store'
import { useMemo } from 'react'
import type { Task } from '../types'

export default function GanttView() {
  const { tasks, currentProject } = useAppStore()

  const projectTasks = tasks.filter(t => t.projectId === currentProject)

  const { dates, startMs, endMs } = useMemo(() => {
    const allDates = projectTasks
      .filter(t => t.dueDate)
      .map(t => new Date(t.dueDate!))
    if (allDates.length === 0) {
      const now = new Date()
      return {
        dates: Array.from({ length: 14 }, (_, i) => {
          const d = new Date(now)
          d.setDate(d.getDate() + i)
          return d
        }),
        startMs: now.getTime(),
        endMs: now.getTime() + 14 * 86400000,
      }
    }
    const min = new Date(Math.min(...allDates.map(d => d.getTime())))
    const max = new Date(Math.max(...allDates.map(d => d.getTime())))
    min.setDate(min.getDate() - 3)
    max.setDate(max.getDate() + 3)
    const dates = []
    for (let d = new Date(min); d <= max; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d))
    }
    return { dates, startMs: min.getTime(), endMs: max.getTime() }
  }, [projectTasks])

  const getBarStyle = (task: Task): React.CSSProperties => {
    if (!task.dueDate) return { display: 'none' }
    const due = new Date(task.dueDate).getTime()
    const created = new Date(task.createdAt).getTime()
    const barStart = Math.max(created, startMs)
    const barEnd = Math.min(due, endMs)
    const left = ((barStart - startMs) / (endMs - startMs)) * 100
    const width = Math.max(((barEnd - barStart) / (endMs - startMs)) * 100, 2)
    return {
      left: `${left}%`,
      width: `${width}%`,
    }
  }

  return (
    <div className="p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Gantt Chart</h3>

      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          <div className="flex border-b border-gray-700 sticky top-0 bg-gray-800 z-10" style={{ width: dates.length * 60 }}>
            <div className="w-64 flex-shrink-0 p-2 text-xs text-gray-400">Task</div>
            <div className="flex">
              {dates.map((date, i) => (
                <div key={i}              className="text-center text-xs text-gray-400 p-1" style={{ width: 60 }}>
                  {date.getDate()}/{date.getMonth() + 1}
                </div>
              ))}
            </div>
          </div>

          {projectTasks.map(task => (
            <div key={task.id}              className="flex items-center border-b border-gray-700/50 hover:bg-gray-700/30" style={{ width: dates.length * 60 }}>
              <div className="w-64 flex-shrink-0 p-2">
                <span className="text-sm text-white truncate block">{task.title}</span>
                <span className="text-xs text-gray-400">{task.priority}</span>
              </div>
              <div className="relative flex-1 h-8">
                {task.dueDate && (
                  <div
                    className={`absolute top-1 h-6 rounded ${
                      task.status === 'done' ? 'bg-green-500' :
                      task.status === 'in-progress' ? 'bg-yellow-500' :
                      task.status === 'review' ? 'bg-purple-500' :
                      task.status === 'todo' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}
                    style={getBarStyle(task)}
                  >
                    <span className="text-[10px] text-white px-1 truncate block">{task.title}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
