import { useState, useEffect } from 'react'
import { useAppStore } from '../store'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { users, setCurrentUser } = useAppStore()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [logo, setLogo] = useState<string | null>(null)

  useEffect(() => {
    setLogo(localStorage.getItem('app_logo'))
  }, [])

  const handleLogin = () => {
    if (!selectedUserId) {
      setError('Please select a user')
      return
    }
    const user = users.find(u => u.id === selectedUserId)
    if (!user) {
      setError('User not found')
      return
    }
    if (user.password && user.password !== password) {
      setError('Invalid password')
      return
    }
    setCurrentUser(user)
    localStorage.setItem('current_user_id', user.id)
    setError('')
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900">
      <div className="w-96 bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          {logo ? (
            <img src={logo} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock size={32} className="text-white" />
            </div>
          )}
          <h2 className="text-2xl font-bold text-white">Project Board Pro</h2>
          <p className="text-gray-400 mt-2">Sign in to continue</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Select User</label>
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a user...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password (any value)"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            Demo mode: Select any user and enter any password
          </p>
        </div>
      </div>
    </div>
  )
}
