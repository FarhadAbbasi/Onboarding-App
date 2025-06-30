import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthPage } from './auth/AuthPage'
import { Dashboard } from './dashboard/Dashboard'
import { LoadingSpinner } from './ui/LoadingSpinner'

export function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return <Dashboard />
} 