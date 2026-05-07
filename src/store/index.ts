import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { Task, Project, Goal, TimeEntry, DocPage, ViewType, Status, User, KeyResult, HabitDay } from '../types'

const calculateHabitStreak = (days: HabitDay[]): number => {
  const sorted = [...days].filter(d => d.completed).sort((a, b) => b.date.localeCompare(a.date))
  if (sorted.length === 0) return 0
  let streak = 1
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = new Date(sorted[i].date)
    const prev = new Date(sorted[i + 1].date)
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 1) streak++
    else break
  }
  return streak
}

interface AppState {
  tasks: Task[]
  projects: Project[]
  goals: Goal[]
  timeEntries: TimeEntry[]
  docPages: DocPage[]
  users: User[]
  currentUser: User | null
  currentProject: string | null
  currentView: ViewType
  currentSettingsTab: string
  activeTimeEntry: TimeEntry | null
  timeTrackingStart: number | null
  logoUrl: string | null

  setCurrentView: (view: ViewType) => void
  setCurrentSettingsTab: (tab: string) => void
  setCurrentProject: (projectId: string | null) => void
  setLogo: (url: string | null) => void
  setCurrentUser: (user: User | null) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (taskId: string, newStatus: Status, newPosition: number) => void
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  addGoalComment: (goalId: string, content: string) => void
  addGoalJournal: (goalId: string, content: string, mood?: string) => void
  addGoalReview: (goalId: string, notes: string) => void
  toggleGoalHabit: (goalId: string, date: string) => void
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void
  deleteTimeEntry: (id: string) => void
  startTimer: (taskId: string) => void
  stopTimer: () => void
  addDocPage: (doc: Omit<DocPage, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateDocPage: (id: string, updates: Partial<DocPage>) => void
  deleteDocPage: (id: string) => void
  addComment: (taskId: string, content: string) => void
  addSubtask: (taskId: string, title: string) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void
  addUser: (user: Omit<User, 'id'>) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  getProjectTasks: (projectId: string) => Task[]
  getProjectGoals: (projectId: string) => Goal[]
  getProjectTimeEntries: (projectId: string) => TimeEntry[]
  saveToSqlite: () => Promise<void>
}

const defaultUsers: User[] = [
  { id: 'u1', name: 'Alex Chen', email: 'alex@company.com', avatar: '', role: 'admin', password: 'admin123' },
  { id: 'u2', name: 'Sarah Miller', email: 'sarah@company.com', avatar: '', role: 'member', password: 'sarah123' },
  { id: 'u3', name: 'James Wilson', email: 'james@company.com', avatar: '', role: 'member', password: 'james123' },
]

const defaultProjects: Project[] = [
  { id: 'p1', name: 'Website Redesign', description: 'Complete overhaul of company website', color: '#3B82F6', members: ['u1', 'u2'], createdAt: '2026-01-15', icon: 'globe' },
  { id: 'p2', name: 'Mobile App', description: 'iOS and Android app development', color: '#10B981', members: ['u1', 'u3'], createdAt: '2026-02-01', icon: 'smartphone' },
  { id: 'p3', name: 'Marketing Campaign', description: 'Q2 marketing initiatives', color: '#F59E0B', members: ['u2', 'u3'], createdAt: '2026-03-10', icon: 'megaphone' },
]

const defaultTasks: Task[] = [
  { id: 't1', title: 'Design homepage layout', description: 'Create wireframes and mockups for new homepage', status: 'in-progress', priority: 'high', assigneeId: 'u2', projectId: 'p1', dueDate: '2026-05-15', tags: ['design', 'frontend'], estimatedHours: 8, loggedHours: 4, subtasks: [{ id: 'st1', title: 'Wireframe desktop', completed: true }, { id: 'st2', title: 'Wireframe mobile', completed: false }], comments: [], createdAt: '2026-04-01', updatedAt: '2026-04-20', position: 0 },
  { id: 't2', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated deployment', status: 'todo', priority: 'medium', assigneeId: 'u1', projectId: 'p1', dueDate: '2026-05-20', tags: ['devops'], estimatedHours: 6, loggedHours: 0, subtasks: [], comments: [], createdAt: '2026-04-10', updatedAt: '2026-04-10', position: 0 },
  { id: 't3', title: 'Implement user authentication', description: 'Add login, register, and password reset flows', status: 'review', priority: 'high', assigneeId: 'u1', projectId: 'p2', dueDate: '2026-05-10', tags: ['backend', 'security'], estimatedHours: 12, loggedHours: 10, subtasks: [{ id: 'st3', title: 'API endpoints', completed: true }, { id: 'st4', title: 'Frontend forms', completed: true }, { id: 'st5', title: 'Email verification', completed: false }], comments: [], createdAt: '2026-03-15', updatedAt: '2026-04-25', position: 0 },
  { id: 't4', title: 'Create marketing assets', description: 'Design banners, social media posts, and email templates', status: 'backlog', priority: 'low', assigneeId: 'u2', projectId: 'p3', dueDate: '2026-06-01', tags: ['design', 'marketing'], estimatedHours: 10, loggedHours: 2, subtasks: [], comments: [], createdAt: '2026-04-05', updatedAt: '2026-04-05', position: 0 },
  { id: 't5', title: 'Write API documentation', description: 'Document all REST endpoints with examples', status: 'todo', priority: 'medium', assigneeId: 'u3', projectId: 'p2', dueDate: '2026-05-25', tags: ['docs'], estimatedHours: 5, loggedHours: 0, subtasks: [], comments: [], createdAt: '2026-04-15', updatedAt: '2026-04-15', position: 1 },
  { id: 't6', title: 'Performance optimization', description: 'Audit and improve app loading times', status: 'done', priority: 'medium', assigneeId: 'u1', projectId: 'p1', dueDate: '2026-04-30', tags: ['performance'], estimatedHours: 8, loggedHours: 8, subtasks: [{ id: 'st6', title: 'Lighthouse audit', completed: true }], comments: [], createdAt: '2026-03-20', updatedAt: '2026-04-28', position: 0 },
]



export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
  tasks: defaultTasks,
  projects: defaultProjects,
  goals: [
    { id: 'g1', title: 'Launch MVP', description: 'Complete core features and launch MVP', progress: 65, targetDate: '2026-06-30', startDate: '2026-01-01', effort: 'l', category: 'Product', priority: 'high', type: 'objective', status: 'in-progress', tags: ['launch', 'product'], assigneeId: 'u1', collaboratorIds: ['u3'], comments: [{ id: 'gc1', userId: 'u1', content: 'Backend is nearly done, focusing on frontend now', createdAt: '2026-04-20' }], why: 'Establish market presence and get early user feedback', journalEntries: [{ id: 'gj1', content: 'Made great progress on auth this week', createdAt: '2026-04-22', mood: 'good' }], reviewCadence: 'weekly', reviewHistory: [{ id: 'gr1', date: '2026-04-14', notes: 'On track, auth 80% complete', progressAtReview: 55, cadence: 'weekly' }], isRecurring: false, keyResults: [{ id: 'kr1', title: 'User signups', target: 1000, current: 650, unit: 'users' }, { id: 'kr2', title: 'Feature completion', target: 100, current: 65, unit: '%' }], projectId: 'p2', milestones: [{ id: 'm1', title: 'Core features', completed: true }, { id: 'm2', title: 'Beta testing', completed: false, dueDate: '2026-05-15' }, { id: 'm3', title: 'Production deploy', completed: false, dueDate: '2026-06-01' }], createdAt: '2026-01-01' },
    { id: 'g2', title: 'Increase conversion rate', description: 'Improve landing page conversion from 2% to 5%', progress: 30, targetDate: '2026-07-31', startDate: '2026-02-15', effort: 'm', category: 'Marketing', priority: 'medium', type: 'goal', status: 'in-progress', tags: ['growth', 'marketing'], assigneeId: 'u2', collaboratorIds: [], comments: [], why: 'Revenue growth depends on better conversion', journalEntries: [], reviewCadence: 'monthly', reviewHistory: [], isRecurring: false, keyResults: [{ id: 'kr3', title: 'Conversion rate', target: 5, current: 3, unit: '%' }, { id: 'kr4', title: 'A/B tests run', target: 10, current: 3, unit: 'tests' }], projectId: 'p1', milestones: [{ id: 'm4', title: 'A/B test headlines', completed: true }, { id: 'm5', title: 'Optimize CTA buttons', completed: false }], createdAt: '2026-02-15' },
    { id: 'g3', title: 'Build world-class mobile experience', description: 'Create the best mobile app in our category', progress: 0, type: 'vision', status: 'in-progress', tags: ['vision', 'mobile'], assigneeId: 'u1', collaboratorIds: ['u2', 'u3'], comments: [], why: 'Mobile is where our users are', journalEntries: [], reviewCadence: 'monthly', reviewHistory: [], isRecurring: false, projectId: 'p2', milestones: [], createdAt: '2026-01-01' },
    { id: 'g4', title: 'Implement user auth', description: 'Complete login, register, and password reset', progress: 80, targetDate: '2026-05-10', effort: 'm', category: 'Product', priority: 'high', type: 'subgoal', status: 'in-progress', tags: ['backend', 'security'], assigneeId: 'u3', collaboratorIds: ['u1'], comments: [{ id: 'gc2', userId: 'u3', content: 'Email verification is the last piece', createdAt: '2026-04-25' }], why: 'Secure access is foundational to the product', journalEntries: [], parentId: 'g1', projectId: 'p2', milestones: [], createdAt: '2026-03-01' },
    { id: 'g5', title: 'Design onboarding flow', description: 'Create intuitive onboarding for new users', progress: 40, targetDate: '2026-05-20', effort: 's', category: 'Product', priority: 'medium', type: 'subgoal', status: 'in-progress', tags: ['design', 'ux'], assigneeId: 'u2', collaboratorIds: [], comments: [], why: 'First impressions drive retention', journalEntries: [], parentId: 'g1', projectId: 'p2', milestones: [], createdAt: '2026-03-15' },
    { id: 'g6', title: 'Daily exercise routine', description: 'Exercise at least 4 times per week', progress: 70, effort: 's', category: 'Health', priority: 'high', type: 'goal', status: 'in-progress', tags: ['health', 'fitness'], assigneeId: 'u1', collaboratorIds: [], comments: [], why: 'Health is the foundation of productivity', journalEntries: [{ id: 'gj2', content: 'Feeling more energized after 3 weeks', createdAt: '2026-04-20', mood: 'great' }], isRecurring: true, habitDays: [{ date: '2026-04-21', completed: true }, { date: '2026-04-22', completed: true }, { date: '2026-04-23', completed: false }, { date: '2026-04-24', completed: true }, { date: '2026-04-25', completed: true }, { date: '2026-04-26', completed: true }, { date: '2026-04-27', completed: true }], reviewCadence: 'weekly', reviewHistory: [], projectId: 'p1', milestones: [], createdAt: '2026-04-01' },
  ],
  timeEntries: [
    { id: 'te1', taskId: 't1', userId: 'u2', duration: 14400, date: '2026-04-20', notes: 'Worked on wireframes', startTime: '09:00', endTime: '13:00' },
    { id: 'te2', taskId: 't3', userId: 'u1', duration: 21600, date: '2026-04-24', notes: 'Implemented auth endpoints', startTime: '10:00', endTime: '16:00' },
  ],
  docPages: [
    { id: 'd1', title: 'Getting Started', content: '# Getting Started\n\nWelcome to the project!', projectId: 'p1', children: ['d2'], createdAt: '2026-01-15', updatedAt: '2026-01-15', authorId: 'u1' },
    { id: 'd2', title: 'API Reference', content: '# API Reference\n\n## Endpoints\n\n### GET /api/users', projectId: 'p1', parentId: 'd1', children: [], createdAt: '2026-01-16', updatedAt: '2026-01-16', authorId: 'u3' },
  ],
  users: defaultUsers,
  currentProject: 'p1',
  currentView: 'dashboard',
  currentSettingsTab: 'export',
  activeTimeEntry: null,
  timeTrackingStart: null,
  logoUrl: null,
  currentUser: null,

  setCurrentView: (view) => set({ currentView: view }),
  setCurrentSettingsTab: (tab) => set({ currentSettingsTab: tab }),
  setCurrentProject: (projectId) => set({ currentProject: projectId }),
  setLogo: (url) => {
    if (url) localStorage.setItem('app_logo', url)
    else localStorage.removeItem('app_logo')
    set({ logoUrl: url })
  },
  setCurrentUser: (user) => {
    if (user) localStorage.setItem('current_user_id', user.id)
    else localStorage.removeItem('current_user_id')
    set({ currentUser: user })
  },
  addUser: (user) => set((state) => ({
    users: [...state.users, { ...user, id: `u${Date.now()}` }]
  })),
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, ...updates } : u)
  })),
  deleteUser: (id) => set((state) => ({
    users: state.users.filter(u => u.id !== id)
  })),

  saveToSqlite: async () => {
    try {
      const state = get()
      const dbLoc = localStorage.getItem('db_location') || 'project-board.sqlite'
      const initSqlJs = await import('sql.js')
      const SQL = await initSqlJs.default({ locateFile: (file: string) => `https://sql.js.org/dist/${file}` })
      const db = new SQL.Database()

      db.run('CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, title TEXT, status TEXT, priority TEXT, projectId TEXT, assigneeId TEXT, dueDate TEXT, loggedHours REAL, createdAt TEXT)')
      db.run('DELETE FROM tasks')
      state.tasks.forEach((t: any) => {
        db.run('INSERT INTO tasks VALUES (?,?,?,?,?,?,?,?)', [t.id, t.title, t.status, t.priority, t.projectId, t.assigneeId || null, t.dueDate || null, t.loggedHours, t.createdAt])
      })

      const data = db.export()
      const buffer = new Uint8Array(data)
      const blob = new Blob([buffer], { type: 'application/x-sqlite3' })
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64Data = result.split(',')[1]
        if (base64Data) {
          fetch('/save-db', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: base64Data, filename: dbLoc })
          }).catch(() => {
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = dbLoc
            a.click()
          })
        }
      }
      reader.readAsDataURL(blob)
      db.close()
    } catch {
      console.log('SQLite save failed')
    }
  },

  addTask: (task) => set((state) => {
    const newState = { tasks: [...state.tasks, { ...task, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), position: state.tasks.filter(t => t.status === task.status).length }] }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  updateTask: (id, updates) => set((state) => {
    const newState = { tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  deleteTask: (id) => set((state) => {
    const newState = { tasks: state.tasks.filter(t => t.id !== id) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  moveTask: (taskId, newStatus, newPosition) => set((state) => {
    const newState = { tasks: state.tasks.map(t => t.id === taskId ? { ...t, status: newStatus, position: newPosition, updatedAt: new Date().toISOString() } : t) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  addProject: (project) => set((state) => {
    const newState = { projects: [...state.projects, { ...project, id: uuid(), createdAt: new Date().toISOString() }] }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  updateProject: (id, updates) => set((state) => {
    const newState = { projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  deleteProject: (id) => set((state) => {
    const newState = { projects: state.projects.filter(p => p.id !== id), tasks: state.tasks.filter(t => t.projectId !== id) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  addGoal: (goal) => set((state) => {
    const newState = { goals: [...state.goals, { ...goal, id: uuid(), createdAt: new Date().toISOString(), status: goal.status || 'not-started', tags: goal.tags || [], collaboratorIds: goal.collaboratorIds || [], comments: goal.comments || [], journalEntries: goal.journalEntries || [], reviewHistory: goal.reviewHistory || [], habitDays: goal.habitDays || [] }] }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  updateGoal: (id, updates) => set((state) => {
    const newState = { goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  deleteGoal: (id) => set((state) => {
    const newState = { goals: state.goals.filter(g => g.id !== id) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  addGoalComment: (goalId, content) => set((state) => ({
    goals: state.goals.map(g => g.id === goalId
      ? { ...g, comments: [...g.comments, { id: uuid(), userId: state.currentUser?.id || '', content, createdAt: new Date().toISOString() }] }
      : g
    ),
  })),

  addGoalJournal: (goalId, content, mood) => set((state) => ({
    goals: state.goals.map(g => g.id === goalId
      ? { ...g, journalEntries: [...g.journalEntries, { id: uuid(), content, mood: mood as any, createdAt: new Date().toISOString() }] }
      : g
    ),
  })),

  addGoalReview: (goalId, notes) => set((state) => ({
    goals: state.goals.map(g => g.id === goalId
      ? { ...g, reviewHistory: [...g.reviewHistory, { id: uuid(), date: new Date().toISOString().split('T')[0], notes, progressAtReview: g.progress, cadence: g.reviewCadence || 'weekly' }] }
      : g
    ),
  })),

  toggleGoalHabit: (goalId, date) => set((state) => ({
    goals: state.goals.map(g => {
      if (g.id !== goalId) return g
      const days = g.habitDays || []
      const existing = days.find(d => d.date === date)
      const updatedDays = existing
        ? days.map(d => d.date === date ? { ...d, completed: !d.completed } : d)
        : [...days, { date, completed: true }]
      const streak = calculateHabitStreak(updatedDays)
      const newProgress = Math.min(100, streak * 10)
      return { ...g, habitDays: updatedDays, progress: newProgress }
    }),
  })),

  addTimeEntry: (entry) => set((state) => {
    const newState = {
      timeEntries: [...state.timeEntries, { ...entry, id: uuid() }],
      tasks: state.tasks.map(t => t.id === entry.taskId ? { ...t, loggedHours: t.loggedHours + entry.duration / 3600 } : t)
    }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  updateTimeEntry: (id, updates) => set((state) => {
    const newState = { timeEntries: state.timeEntries.map(te => te.id === id ? { ...te, ...updates } : te) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  deleteTimeEntry: (id) => set((state) => {
    const newState = { timeEntries: state.timeEntries.filter(te => te.id !== id) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  startTimer: (taskId) => set({
    activeTimeEntry: { id: '', taskId, userId: get().currentUser?.id || '', duration: 0, date: new Date().toISOString().split('T')[0], notes: '' },
    timeTrackingStart: Date.now(),
  }),

  stopTimer: () => {
    const state = get()
    if (state.activeTimeEntry && state.timeTrackingStart) {
      const duration = Math.floor((Date.now() - state.timeTrackingStart) / 1000)
      if (duration > 0) {
        get().addTimeEntry({ ...state.activeTimeEntry, duration })
      }
    }
    set({ activeTimeEntry: null, timeTrackingStart: null })
  },

  addDocPage: (doc) => set((state) => {
    const newState = { docPages: [...state.docPages, { ...doc, id: uuid(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  updateDocPage: (id, updates) => set((state) => {
    const newState = { docPages: state.docPages.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  deleteDocPage: (id) => set((state) => {
    const newState = { docPages: state.docPages.filter(d => d.id !== id) }
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  addComment: (taskId, content) => set((state) => {
    const newState = { tasks: state.tasks.map(t =>
      t.id === taskId ? { ...t, comments: [...t.comments, { id: uuid(), userId: state.currentUser?.id || '', content, createdAt: new Date().toISOString() }] } : t
    )}
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  addSubtask: (taskId, title) => set((state) => {
    const newState = { tasks: state.tasks.map(t =>
      t.id === taskId ? { ...t, subtasks: [...t.subtasks, { id: uuid(), title, completed: false }] } : t
    )}
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  toggleSubtask: (taskId, subtaskId) => set((state) => {
    const newState = { tasks: state.tasks.map(t =>
      t.id === taskId ? { ...t, subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st) } : t
    )}
    setTimeout(() => get().saveToSqlite(), 1000)
    return newState
  }),

  getProjectTasks: (projectId) => get().tasks.filter(t => t.projectId === projectId),
  getProjectGoals: (projectId) => get().goals.filter(g => g.projectId === projectId),
  getProjectTimeEntries: (projectId) => {
    const projectTasks = get().tasks.filter(t => t.projectId === projectId).map(t => t.id)
    return get().timeEntries.filter(te => projectTasks.includes(te.taskId))
  },
}),
    {
      name: 'project-board-storage',
      partialize: (state) => ({
        tasks: state.tasks,
        projects: state.projects,
        goals: state.goals,
        timeEntries: state.timeEntries,
        docPages: state.docPages,
        users: state.users,
        currentUser: state.currentUser,
        currentProject: state.currentProject,
        currentView: state.currentView,
        currentSettingsTab: state.currentSettingsTab,
        logoUrl: state.logoUrl,
      }),
      migrate: (persistedState: any) => {
        const state = persistedState || {}
        return {
          tasks: (state.tasks || []).map((t: any) => ({
            ...t,
            tags: t.tags || [],
            subtasks: t.subtasks || [],
            comments: t.comments || [],
          })),
          projects: state.projects || defaultProjects,
          goals: (state.goals || []).map((g: any) => ({
            ...g,
            keyResults: g.keyResults || [],
            type: g.type || 'goal',
            status: g.status || 'not-started',
            tags: g.tags || [],
            collaboratorIds: g.collaboratorIds || [],
            comments: g.comments || [],
            journalEntries: g.journalEntries || [],
            reviewHistory: g.reviewHistory || [],
            habitDays: g.habitDays || [],
          })),
          timeEntries: state.timeEntries || [],
          docPages: state.docPages || [],
          users: state.users || defaultUsers,
          currentUser: state.currentUser || null,
          currentProject: state.currentProject || 'p1',
          currentView: state.currentView || 'dashboard',
          currentSettingsTab: state.currentSettingsTab || 'export',
          logoUrl: state.logoUrl || null,
          activeTimeEntry: null,
          timeTrackingStart: null,
        } as any
      },
    }
  )
)
