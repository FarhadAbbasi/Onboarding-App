import React, { useState } from 'react'
import { X, Wand2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { generateOnboardingContent } from '../../lib/openai'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { Database } from '../../lib/supabase'

type Project = Database['public']['Tables']['projects']['Row']

interface NewProjectModalProps {
  onClose: () => void
  onProjectCreated: (project: Project) => void
}

const categories = [
  'Productivity',
  'Social',
  'E-commerce',
  'Education',
  'Health & Fitness',
  'Entertainment',
  'Business',
  'Travel',
  'Finance',
  'Other'
]

export function NewProjectModal({ onClose, onProjectCreated }: NewProjectModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.url || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!user) {
      toast.error('User not authenticated')
      return
    }

    setLoading(true)

    try {
      // Create project in Supabase
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: formData.name,
          url: formData.url,
          category: formData.category,
          notes: formData.notes || null
        })
        .select()
        .single()

      if (projectError) throw projectError

      // Generate content automatically
      try {
        const generatedContent = await generateOnboardingContent(
          formData.name,
          formData.url,
          formData.category,
          formData.notes
        )

        // Create content blocks
        const contentBlocks = [
          { type: 'headline' as const, content: generatedContent.headline, order_index: 0 },
          { type: 'subheadline' as const, content: generatedContent.subheadline, order_index: 1 },
          { type: 'cta' as const, content: generatedContent.cta, order_index: 2 },
          { type: 'testimonial' as const, content: JSON.stringify(generatedContent.testimonial), order_index: 3 },
          ...generatedContent.features.map((feature, index) => ({
            type: 'feature' as const,
            content: feature,
            order_index: 4 + index
          }))
        ]

        const { error: blocksError } = await supabase
          .from('content_blocks')
          .insert(
            contentBlocks.map(block => ({
              project_id: project.id,
              ...block
            }))
          )

        if (blocksError) {
          console.error('Error creating content blocks:', blocksError)
          toast.error('Project created but content generation failed')
        } else {
          toast.success('Project created with AI-generated content!')
        }
      } catch (error) {
        console.error('Error generating content:', error)
        toast.success('Project created successfully! (Content generation failed)')
      }

      onProjectCreated(project)
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                App Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="input-field"
                placeholder="My Awesome App"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                App URL *
              </label>
              <input
                type="url"
                id="url"
                name="url"
                required
                className="input-field"
                placeholder="https://myapp.com"
                value={formData.url}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                className="input-field"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="input-field"
                placeholder="Describe your app's features or target users (optional)"
                value={formData.notes}
                onChange={handleInputChange}
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Wand2 size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">AI Content Generation</span>
              </div>
              <p className="text-sm text-gray-600">
                Content will be generated automatically using AI when you create the project.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading && <LoadingSpinner size="sm" />}
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 