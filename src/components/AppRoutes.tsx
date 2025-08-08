import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthPage } from './auth/AuthPage'
import { ResetPasswordPage } from './auth/ResetPasswordPage'
import { Dashboard } from './dashboard/Dashboard'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { PublicMobileView } from './preview/PublicMobileView'

export function AppRoutes() {
  const { user, loading } = useAuth()
  const [isResetPassword, setIsResetPassword] = useState(false)
  const [publicProjectId, setPublicProjectId] = useState<string | null>(null)

  useEffect(() => {
    const checkUrlParams = () => {
      // Check if URL contains password reset parameters or public preview
      const urlParams = new URLSearchParams(window.location.search)
      const isRecoveryType = urlParams.get('type') === 'recovery'
      const hasResetTokens = !!urlParams.get('access_token') && !!urlParams.get('refresh_token')
      const projectId = urlParams.get('preview')
      
      console.log('🔍 AppRoutes URL check:', {
        isRecoveryType,
        hasResetTokens,
        access_token: urlParams.get('access_token')?.substring(0, 20) + '...',
        refresh_token: urlParams.get('refresh_token')?.substring(0, 20) + '...',
        projectId,
        fullURL: window.location.href,
        loading,
        user: user?.email
      });
      
      setIsResetPassword(isRecoveryType && hasResetTokens)
      setPublicProjectId(projectId)
    }

    checkUrlParams()
  }, [loading, user])

  const handleBackToAuth = () => {
    // Clear URL parameters and return to auth
    window.history.replaceState({}, '', window.location.pathname)
    setIsResetPassword(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Show public preview if project ID is provided (no auth required)
  if (publicProjectId) {
    return <PublicMobileView projectId={publicProjectId} />
  }

  // Show reset password page FIRST - even if user is logged in
  // This handles the case where Supabase auto-logs in the user from reset tokens
  if (isResetPassword) {
    console.log('🔄 Showing ResetPasswordPage');
    return <ResetPasswordPage onBackToAuth={handleBackToAuth} />
  }

  if (!user) {
    console.log('🔐 Showing AuthPage (no user)');
    return <AuthPage />
  }

  console.log('🏠 Showing Dashboard (user logged in)');
  return <Dashboard />
} 