export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type Status = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done'
export type ViewType = 'list' | 'board' | 'gantt' | 'docs' | 'goals' | 'time' | 'dashboard' | 'settings'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'member' | 'viewer'
  password: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assigneeId?: string
  projectId: string
  dueDate?: string
  tags: string[]
  estimatedHours?: number
  loggedHours: number
  subtasks: Subtask[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
  position: number
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface Comment {
  id: string
  userId: string
  content: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  color: string
  members: string[]
  createdAt: string
  icon: string
}

export interface Goal {
  id: string
  title: string
  description: string
  progress: number
  targetDate?: string
  projectId?: string
  milestones: Milestone[]
  createdAt: string
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
  dueDate?: string
}

export interface TimeEntry {
  id: string
  taskId: string
  userId: string
  duration: number
  date: string
  notes: string
  startTime?: string
  endTime?: string
}

export interface DocPage {
  id: string
  title: string
  content: string
  projectId?: string
  parentId?: string
  children: string[]
  createdAt: string
  updatedAt: string
  authorId: string
}

export interface ActivityItem {
  id: string
  userId: string
  action: string
  target: string
  targetType: 'task' | 'project' | 'doc' | 'goal'
  timestamp: string
}
