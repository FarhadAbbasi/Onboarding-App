import React, { useState } from 'react'
import { Wand2, ArrowRight, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateFlowPlan } from '../../lib/openai'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { FlowPlan } from '../../lib/schemas'
import { supabase } from '../../lib/supabase'

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
      const response = await generateFlowPlan(
        formData.openaiKey,
        projectName,
        projectUrl,
        category,
        formData.featureFocus,
        formData.tone,
        notes
      )
      setGeneratedFlow(response.flow_plan)
      toast.success('Flow plan generated!')
    } catch (error) {
      console.error('Flow generation error:', error)
      toast.error('Failed to generate flow plan. Please try again.')
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
      const pagesToInsert = generatedFlow.pages.map((page: any, idx: number) => ({
        project_id: projectId,
        page_id: page.id,
        title: page.title,
        purpose: page.purpose,
        order_index: idx,
        html_content: '',
        theme: '',
      }));
      
      // Use upsert instead of insert to handle existing records
      const { error: upsertError } = await supabase
        .from('onboarding_pages')
        .upsert(pagesToInsert, { 
          onConflict: 'project_id,page_id',
          ignoreDuplicates: false 
        });
        
      if (upsertError) {
        console.error('[FlowPlanner] Error upserting onboarding_pages:', upsertError);
        toast.error('Failed to save onboarding pages.');
        setLoading(false);
        return;
      } else {
        console.log('[FlowPlanner] Upserted onboarding_pages:', pagesToInsert);
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
            Tone & Style
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

        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">AI Flow Generation</span>
          </div>
          
          <div>
            <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700 mb-1">
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
              Your API key is used only for this request and never stored.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What you'll get:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Complete multi-page onboarding flow structure</li>
            <li>• Optimized page sequence for your app category</li>
            <li>• Smart suggestions for essential screens (signup, permissions, tutorial)</li>
            <li>• Estimated completion time for users</li>
          </ul>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !formData.featureFocus.trim() || !formData.openaiKey.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading && <LoadingSpinner size="sm" />}
          <Wand2 size={16} />
          <span>Generate Onboarding Flow</span>
        </button>
      </div>
    </div>
  )
} 