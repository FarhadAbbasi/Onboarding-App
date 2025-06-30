import React, { useState, useEffect } from 'react'
import { Plus, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { ProjectCard } from './ProjectCard'
import { NewProjectModal } from './NewProjectModal'
import { ProjectEditor } from './ProjectEditor'
import { FlowManager } from '../flow/FlowManager'
import type { Database } from '../../lib/supabase'
import ContentEditor from '../editor/ContentEditor'

type Project = Database['public']['Tables']['projects']['Row']

export function Dashboard() {
  const { user, signOut } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showFlowManager, setShowFlowManager] = useState(false)
  const [showContentEditor, setShowContentEditor] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      toast.error('Failed to load projects')
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = (project: Project) => {
    setProjects(prev => [project, ...prev])
    setSelectedProject(project)
    setShowFlowManager(true)
    setShowNewProjectModal(false)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      toast.error('Failed to sign out')
    }
  }

  if (selectedProject && showFlowManager) {
    return (
      <FlowManager
        projectId={selectedProject.id}
        projectName={selectedProject.name}
        projectUrl={selectedProject.url}
        category={selectedProject.category}
        notes={selectedProject.notes || undefined}
        onBack={() => {
          setSelectedProject(null)
          setShowFlowManager(false)
        }}
        onComplete={() => {
          setSelectedProject(null)
          setShowFlowManager(false)
          fetchProjects() // Refresh projects to show updated data
        }}
      />
    )
  }

  if (selectedProject) {
    return (
      <ProjectEditor 
        project={selectedProject} 
        onBack={() => setSelectedProject(null)}
        onProjectUpdate={(updatedProject: Project) => {
          setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p))
          setSelectedProject(updatedProject)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AppRamps</h1>
              <p className="text-sm text-gray-500">Create beautiful onboarding pages</p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Projects</h2>
            <p className="text-gray-600">Manage your onboarding pages</p>
          </div>
          
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first onboarding page to get started</p>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="btn-primary"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => setSelectedProject(project)}
                onCreateFlow={() => {
                  setSelectedProject(project)
                  setShowFlowManager(true)
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

      {/* Floating Content Editor Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white rounded-full shadow-lg p-4 hover:bg-blue-700 transition"
        onClick={() => setShowContentEditor(true)}
        title="Open Content Editor"
      >
        <span className="font-bold text-lg">✚</span> Content Editor
      </button>

      {/* Content Editor Modal */}
      {showContentEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-5xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowContentEditor(false)}
              title="Close"
            >
              ✕
            </button>
            <ContentEditor />
          </div>
        </div>
      )}
    </div>
  )
} 