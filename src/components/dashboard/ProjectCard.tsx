import React from 'react'
import { Calendar, ExternalLink, Workflow, Smartphone } from 'lucide-react'
import type { Database } from '../../lib/supabase'

type Project = Database['public']['Tables']['projects']['Row']

interface ProjectCardProps {
  project: Project
  onClick: () => void
  onCreateFlow?: () => void
  onEditScreens?: () => void
}

export function ProjectCard({ project, onClick, onCreateFlow, onEditScreens }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div 
      onClick={onClick}
      className="card hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{project.category}</p>
        </div>
        <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>URL:</strong> {project.url}
        </p>
        {project.notes && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {project.notes}
          </p>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={12} />
          <span>Updated {formatDate(project.updated_at)}</span>
        </div>
        
        <div className="flex gap-2">
          {onEditScreens && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEditScreens()
              }}
              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              title="Edit Mobile Screens"
            >
              <Smartphone size={16} />
            </button>
          )}
          
          {onCreateFlow && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCreateFlow()
              }}
              className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
              title="Create Onboarding Flow"
            >
              <Workflow size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 