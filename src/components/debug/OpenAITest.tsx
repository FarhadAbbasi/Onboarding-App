import React, { useState } from 'react'
import { Wand2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { generateFlowPlan, generatePageContent } from '../../lib/openai'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import toast from 'react-hot-toast'

export function OpenAITest() {
  const [apiKey, setApiKey] = useState('')
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [testData, setTestData] = useState<any>(null)

  const testOpenAI = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter your OpenAI API key')
      return
    }

    if (!apiKey.startsWith('sk-')) {
      toast.error('API key should start with "sk-"')
      return
    }

    setTestResult('testing')
    setErrorMessage('')
    setTestData(null)

    try {
      console.log('[OpenAITest] Testing API key...')
      
      // Test with flow generation first
      const flowResult = await generateFlowPlan(
        'Test App',
        'https://testapp.com',
        'productivity',
        'Task management and collaboration tools',
        'friendly',
        'Test flow generation'
      )

      console.log('[OpenAITest] Flow generation successful:', flowResult)

      // Test page content generation
      const pageResult = await generatePageContent(
        {
          id: 'test-page',
          title: 'Welcome Page',
          purpose: 'Introduce users to the app',
          order_index: 0
        },
        'Test App',
        'productivity',
        'friendly',
        'https://testapp.com'
      )

      console.log('[OpenAITest] Page generation successful:', pageResult)

      setTestData({
        flow: flowResult,
        page: pageResult
      })
      setTestResult('success')
      toast.success('✅ OpenAI integration working perfectly!')
    } catch (error) {
      console.error('[OpenAITest] Test failed:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      setErrorMessage(errorMsg)
      setTestResult('error')
      toast.error(`❌ Test failed: ${errorMsg}`)
    }
  }

  const getStatusIcon = () => {
    switch (testResult) {
      case 'testing':
        return <LoadingSpinner size="sm" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (testResult) {
      case 'testing':
        return 'Testing OpenAI connection...'
      case 'success':
        return 'OpenAI integration working perfectly!'
      case 'error':
        return `Error: ${errorMessage}`
      default:
        return 'Ready to test OpenAI integration'
    }
  }

  const getStatusColor = () => {
    switch (testResult) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'testing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Wand2 className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">OpenAI Integration Test</h3>
          <p className="text-sm text-gray-600">Verify your API key and test flow generation</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="test-api-key" className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            id="test-api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="input-field"
          />
        </div>

        <div className={`p-4 rounded-lg border ${getStatusColor()}`}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        </div>

        <button
          onClick={testOpenAI}
          disabled={testResult === 'testing' || !apiKey.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {testResult === 'testing' ? (
            <>
              <LoadingSpinner size="sm" />
              Testing API...
            </>
          ) : (
            <>
              <Wand2 size={16} />
              Test OpenAI Integration
            </>
          )}
        </button>

        {testData && testResult === 'success' && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-semibold text-green-800 mb-2">Test Results:</h4>
            <div className="space-y-2 text-sm text-green-700">
              <div>✅ Flow Generation: Created {testData.flow.flow_plan.total_pages} pages</div>
              <div>✅ Page Content: Generated {testData.page.blocks?.length || 0} content blocks</div>
              <div>✅ Theme: Applied {testData.page.theme?.accentColor || 'default'} color scheme</div>
            </div>
          </div>
        )}

        {testResult === 'error' && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <h4 className="text-sm font-semibold text-red-800 mb-2">Troubleshooting:</h4>
            <ul className="space-y-1 text-sm text-red-700">
              <li>• Make sure your API key starts with "sk-"</li>
              <li>• Verify you have credits in your OpenAI account</li>
              <li>• Check that you have access to GPT-4 models</li>
              <li>• Ensure your internet connection is stable</li>
              <li>• Try refreshing the page and testing again</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
} 