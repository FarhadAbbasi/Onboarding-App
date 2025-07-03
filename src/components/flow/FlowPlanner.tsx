import React, { useState } from 'react'
import { Wand2, ArrowRight, Clock, Bug } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateFlowPlan } from '../../lib/openai'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { FlowPlan } from '../../lib/schemas'
import { supabase } from '../../lib/supabase'
import { OpenAITest } from '../debug/OpenAITest'

interface FlowPlannerProps {
  projectId: string;
  projectName: string;
  projectUrl: string;
  category: string;
  notes?: string;
  onFlowGenerated: (plan: FlowPlan, openaiKey: string) => void;
}

const tones = [
  { value: 'professional', label: 'Professional', description: 'Formal and trustworthy' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'modern', label: 'Modern', description: 'Clean and contemporary' },
  { value: 'playful', label: 'Playful', description: 'Fun and energetic' }
] as const

export function FlowPlanner({ projectId, projectName, projectUrl, category, notes, onFlowGenerated }: FlowPlannerProps) {
  const [formData, setFormData] = useState({
    featureFocus: '',
    tone: 'friendly' as const,
    openaiKey: ''
  })
  const [loading, setLoading] = useState(false)
  const [generatedFlow, setGeneratedFlow] = useState<FlowPlan | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleGenerate = async () => {
    if (!formData.featureFocus.trim()) {
      toast.error('Please describe your key features')
      return
    }

    if (!formData.openaiKey.trim()) {
      toast.error('Please provide your OpenAI API key')
      return
    }

    setLoading(true)

    try {
      console.log('[FlowPlanner] Starting flow generation...')
      const response = await generateFlowPlan(
        formData.openaiKey,
        projectName,
        projectUrl,
        category,
        formData.featureFocus,
        formData.tone,
        notes
      )
      console.log('[FlowPlanner] Flow generated successfully:', response)
      setGeneratedFlow(response.flow_plan)
      toast.success('Flow plan generated!')
    } catch (error) {
      console.error('[FlowPlanner] Flow generation error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async () => {
    if (!generatedFlow) return;
    setLoading(true);
    try {
      if (!projectId) {
        console.error('[FlowPlanner] No projectId provided as prop');
        toast.error('No projectId found. Cannot save onboarding pages.');
        setLoading(false);
        return;
      }

      // First, check if pages already exist for this project
      const { data: existingPages } = await supabase
        .from('onboarding_pages')
        .select('id, title, order_index')
        .eq('project_id', projectId)
        .order('order_index');

      if (existingPages && existingPages.length > 0) {
        console.log('[FlowPlanner] Pages already exist for project, skipping creation');
        onFlowGenerated(generatedFlow, formData.openaiKey);
        return;
      }

      // Create new pages using deterministic page_id based on title
      const pagesToInsert = generatedFlow.pages.map((page: any, idx: number) => ({
        project_id: projectId,
        page_id: `${projectId}-${page.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${idx}`,
        title: page.title,
        purpose: page.purpose,
        order_index: idx,
        html_content: '',
        theme: '',
      }));
      
      const { error: insertError } = await supabase
        .from('onboarding_pages')
        .insert(pagesToInsert);
        
      if (insertError) {
        console.error('[FlowPlanner] Error inserting onboarding_pages:', insertError);
        toast.error('Failed to save onboarding pages.');
        setLoading(false);
        return;
      } else {
        console.log('[FlowPlanner] Inserted onboarding_pages:', pagesToInsert);
      }
      onFlowGenerated(generatedFlow, formData.openaiKey);
    } catch (error) {
      console.error('Accept flow plan error:', error);
      toast.error('Failed to accept flow plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (generatedFlow) {
    return (
      <div className="card max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wand2 size={24} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Flow Plan Generated!</h2>
          <p className="text-gray-600">
            Your {generatedFlow.total_pages}-page onboarding flow is ready
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{generatedFlow.flow_name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock size={16} />
              <span>{generatedFlow.estimated_completion_time}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedFlow.pages.map((page, index) => (
              <div key={page.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <h4 className="font-medium text-gray-900">{page.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{page.purpose}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setGeneratedFlow(null)}
            className="btn-secondary"
          >
            Generate New Plan
          </button>
          <button
            onClick={handleAccept}
            className="btn-primary flex items-center gap-2"
          >
            <span>Continue with This Flow</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wand2 size={24} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Onboarding Flow</h2>
        <p className="text-gray-600">
          Let AI design a complete multi-page onboarding experience for {projectName}
        </p>
      </div>

      {/* AI Enhancement Roadmap */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI-Enhanced Flow Generation</h3>
            <p className="text-sm text-purple-600">Advanced features for intelligent page creation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
              <h4 className="font-medium text-gray-900">Smart Theme Generation</h4>
            </div>
            <p className="text-sm text-gray-600">AI analyzes your project and generates custom color schemes, typography, and visual themes</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold text-sm">2</span>
              </div>
              <h4 className="font-medium text-gray-900">Intelligent Components</h4>
            </div>
            <p className="text-sm text-gray-600">Pre-built UI components automatically customized to match your brand and user flow</p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold text-sm">3</span>
              </div>
              <h4 className="font-medium text-gray-900">Drag & Drop Editor</h4>
            </div>
            <p className="text-sm text-gray-600">Visual editor with live preview in device frames for real-time customization</p>
          </div>
        </div>

        <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center gap-2 text-sm text-purple-700">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Enhanced Mode:</span>
            <span>All generated pages will include custom themes, styled components, and drag-and-drop editing capabilities</span>
          </div>
        </div>
      </div>

      {/* Debug Panel Toggle */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Bug className="w-4 h-4" />
          {showDebug ? 'Hide' : 'Show'} API Debug Tools
        </button>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="mb-8">
          <OpenAITest />
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="featureFocus" className="block text-sm font-medium text-gray-700 mb-2">
            Key Features & Focus *
          </label>
          <textarea
            id="featureFocus"
            name="featureFocus"
            rows={3}
            className="input-field"
            placeholder="Describe your app's main features and what users should focus on during onboarding (e.g., 'photo editing with AI filters, social sharing, premium subscriptions')"
            value={formData.featureFocus}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-2">
            Communication Tone
          </label>
          <select
            id="tone"
            name="tone"
            className="input-field"
            value={formData.tone}
            onChange={handleInputChange}
          >
            {tones.map(tone => (
              <option key={tone.value} value={tone.value}>
                {tone.label} - {tone.description}
              </option>
            ))}
          </select>
          </div>
          
          <div>
          <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key *
            </label>
            <input
              type="password"
              id="openaiKey"
              name="openaiKey"
              className="input-field"
              placeholder="sk-..."
              value={formData.openaiKey}
              onChange={handleInputChange}
            />
            <p className="text-xs text-gray-500 mt-1">
            Your API key is only used for this session and not stored permanently
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !formData.featureFocus.trim() || !formData.openaiKey.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Generating Flow Plan...
            </>
          ) : (
            <>
          <Wand2 size={16} />
              Generate Onboarding Flow
            </>
          )}
        </button>
      </div>
    </div>
  )
} 