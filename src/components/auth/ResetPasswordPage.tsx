import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface ResetPasswordPageProps {
  onBackToAuth: () => void
}

export function ResetPasswordPage({ onBackToAuth }: ResetPasswordPageProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isValidReset, setIsValidReset] = useState(false)
  const { updatePassword } = useAuth()

  useEffect(() => {
    // Check if this is a valid password reset flow
    const urlParams = new URLSearchParams(window.location.search)
    const isRecoveryType = urlParams.get('type') === 'recovery'
    const hasResetTokens = !!urlParams.get('access_token') && !!urlParams.get('refresh_token')
    
    if (!isRecoveryType || !hasResetTokens) {
      toast.error('Invalid reset link. Please request a new password reset.')
      onBackToAuth()
    } else {
      setIsValidReset(true)
    }
  }, [onBackToAuth])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password) {
      toast.error('Please enter a new password')
      return
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      toast.success('Password updated successfully!')
      // Clear URL params and redirect to main app
      window.history.replaceState({}, '', window.location.pathname)
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password update failed')
    }
    setLoading(false)
  }

  if (!isValidReset) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="input-field mt-1"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-field mt-1"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              Update Password
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onBackToAuth}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 