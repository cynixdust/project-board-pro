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

export type GoalType = 'vision' | 'objective' | 'goal' | 'subgoal'
export type GoalStatus = 'not-started' | 'in-progress' | 'blocked' | 'completed'
export type ReviewCadence = 'weekly' | 'monthly'

export interface GoalComment {
  id: string
  userId: string
  content: string
  createdAt: string
}

export interface JournalEntry {
  id: string
  content: string
  createdAt: string
  mood?: 'great' | 'good' | 'neutral' | 'struggling' | 'stuck'
}

export interface ReviewEntry {
  id: string
  date: string
  notes: string
  progressAtReview: number
  cadence: ReviewCadence
}

export interface HabitDay {
  date: string
  completed: boolean
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
  startDate?: string
  effort?: 'xs' | 's' | 'm' | 'l' | 'xl'
  category?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  keyResults?: KeyResult[]
  type: GoalType
  parentId?: string
  status?: GoalStatus
  tags?: string[]
  assigneeId?: string
  collaboratorIds?: string[]
  comments?: GoalComment[]
  why?: string
  journalEntries?: JournalEntry[]
  reviewCadence?: ReviewCadence
  reviewHistory?: ReviewEntry[]
  isRecurring?: boolean
  habitDays?: HabitDay[]
}

export interface KeyResult {
  id: string
  title: string
  target: number
  current: number
  unit: string
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
