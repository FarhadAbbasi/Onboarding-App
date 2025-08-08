import React, { useState, useEffect } from 'react'
import { ArrowLeft, Globe } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { BlockEditor } from '../editor/BlockEditor'
import { PublishModal } from '../publish/PublishModal'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { Database } from '../../lib/supabase'

type Project = Database['public']['Tables']['projects']['Row']
type ContentBlock = Database['public']['Tables']['content_blocks']['Row']

interface ProjectEditorProps {
  project: Project
  onBack: () => void
  onProjectUpdate: (project: Project) => void
}

export function ProjectEditor({ project, onBack, onProjectUpdate }: ProjectEditorProps) {
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)

  // Load content blocks for the publish modal
  useEffect(() => {
  const fetchContentBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('project_id', project.id)
        .order('order_index', { ascending: true })

      if (error) throw error
      setContentBlocks(data || [])
    } catch (error) {
      console.error('Error fetching content blocks:', error)
    } finally {
      setLoading(false)
    }
  }

    fetchContentBlocks()
  }, [project.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-500">{project.url}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPublishModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Globe size={16} />
                Publish
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-[800px]">
          <BlockEditor
            projectId={project.id}
            projectName={project.name}
              />
            </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishModal
          project={project}
          blocks={contentBlocks}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </div>
  )
} 