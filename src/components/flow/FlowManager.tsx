import React, { useState } from 'react'
import { ArrowLeft, CheckCircle, Circle, ArrowRight } from 'lucide-react'
import { FlowPlanner } from './FlowPlanner'
import { FlowEditor } from './FlowEditor'
import { FlowPublisher } from './FlowPublisher'
import type { FlowPlan, Page } from '../../lib/schemas'

interface FlowManagerProps {
  projectId: string
  projectName: string
  projectUrl: string
  category: string
  notes?: string
  onBack: () => void
  onComplete: () => void
}

type FlowStep = 'planning' | 'editing' | 'publishing'

export function FlowManager({ 
  projectId, 
  projectName, 
  projectUrl, 
  category, 
  notes, 
  onBack, 
  onComplete 
}: FlowManagerProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('planning')
  const [flowPlan, setFlowPlan] = useState<FlowPlan | null>(null)
  const [editedPages, setEditedPages] = useState<Page[]>([])
  const [openaiKey, setOpenaiKey] = useState('')

  const steps = [
    { id: 'planning', label: 'Plan Flow', description: 'AI generates onboarding structure' },
    { id: 'editing', label: 'Edit Content', description: 'Customize each page with AI assistance' },
    { id: 'publishing', label: 'Publish Flow', description: 'Deploy your onboarding experience' }
  ]

  const handleFlowGenerated = (plan: FlowPlan, apiKey: string) => {
    setFlowPlan(plan)
    setOpenaiKey(apiKey)
    setCurrentStep('editing')
  }

  const handlePagesUpdated = (pages: Page[]) => {
    setEditedPages(pages)
    setCurrentStep('publishing')
  }

  const handlePublishComplete = () => {
    onComplete()
  }

  const handleBackToPlanning = () => {
    setCurrentStep('planning')
    setFlowPlan(null)
    setEditedPages([])
  }

  const handleBackToEditing = () => {
    setCurrentStep('editing')
  }

  const getStepStatus = (stepId: string) => {
    const stepIndex = steps.findIndex(s => s.id === stepId)
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'upcoming'
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'planning':
        return (
          <FlowPlanner
            projectId={projectId}
            projectName={projectName}
            projectUrl={projectUrl}
            category={category}
            notes={notes}
            onFlowGenerated={handleFlowGenerated}
          />
        )

      case 'editing':
        if (!flowPlan) return null
        return (
          <FlowEditor
            flowPlan={flowPlan}
            projectName={projectName}
            projectUrl={projectUrl}
            openaiKey={openaiKey}
            onSave={handlePagesUpdated}
            onBack={handleBackToPlanning}
            projectId={projectId}
          />
        )

      case 'publishing':
        if (!flowPlan || !editedPages.length) return null
        return (
          <FlowPublisher
            projectId={projectId}
            flowPlan={flowPlan}
            pages={editedPages}
            projectName={projectName}
            onComplete={handlePublishComplete}
            onBack={handleBackToEditing}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                <span>Back to Dashboard</span>
              </button>
              
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-gray-900">Create Onboarding Flow</h1>
                <p className="text-sm text-gray-600">{projectName}</p>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
              {steps.map((step, index) => {
                const status = getStepStatus(step.id)
                const isLast = index === steps.length - 1

                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        status === 'completed' 
                          ? 'bg-green-600 text-white' 
                          : status === 'current'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle size={16} />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      
                      <div className="text-left">
                        <div className={`font-medium text-sm ${
                          status === 'current' ? 'text-blue-900' : 'text-gray-700'
                        }`}>
                          {step.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.description}
                        </div>
                      </div>
                    </div>

                    {!isLast && (
                      <ArrowRight size={16} className="text-gray-400" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {renderStep()}
      </div>
    </div>
  )
} 