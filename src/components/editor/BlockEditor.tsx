import React, { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Plus, Edit2, Trash2, Monitor, Smartphone, Save, ChevronLeft, ChevronRight, Wand2, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { EditorLayout } from '../flow/editor/EditorLayout'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { generatePageContent } from '../../lib/openai'
import type { ParsedBlock, ParsedTheme } from '../flow/editor/AIHtmlParser'

interface Page {
  id: string
  project_id: string
  page_id: string
  title: string
  purpose: string
  html_content?: string
  order_index: number
}

interface BlockEditorProps {
  projectId: string
  projectName: string
}

export function BlockEditor({ projectId, projectName }: BlockEditorProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile')
  const [showAddPageModal, setShowAddPageModal] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPagePurpose, setNewPagePurpose] = useState('')
  const [saving, setSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [openaiKey, setOpenaiKey] = useState('')

  // Load pages from database
  useEffect(() => {
    const loadPages = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('onboarding_pages')
          .select('*')
          .eq('project_id', projectId)
          .order('order_index', { ascending: true })

        if (error) throw error

        if (data && data.length > 0) {
          setPages(data)
        } else {
          // Create a default page if none exist
          await createDefaultPage()
        }
      } catch (error) {
        console.error('Error loading pages:', error)
        toast.error('Failed to load pages')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadPages()
    }
  }, [projectId])

  const createDefaultPage = async () => {
    const defaultPage = {
      project_id: projectId,
      page_id: 'welcome',
      title: 'Welcome',
      purpose: 'Introduce users to your app',
      html_content: '',
      order_index: 0
    }

    try {
      const { data, error } = await supabase
        .from('onboarding_pages')
        .insert(defaultPage)
        .select()
        .single()

      if (error) throw error
      if (data) {
        setPages([data])
      }
    } catch (error) {
      console.error('Error creating default page:', error)
      toast.error('Failed to create default page')
    }
  }

  const handleAddPage = async () => {
    if (!newPageTitle.trim() || !newPagePurpose.trim()) {
      toast.error('Please fill in both title and purpose')
      return
    }

    setSaving(true)
    try {
      const pageId = newPageTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      const newPage = {
        project_id: projectId,
        page_id: pageId,
        title: newPageTitle,
        purpose: newPagePurpose,
        html_content: '',
        order_index: pages.length
      }

      // Use upsert to avoid duplicates
      const { data, error } = await supabase
        .from('onboarding_pages')
        .upsert(newPage, { 
          onConflict: 'project_id,page_id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) throw error
      if (data) {
        // Check if page already exists in local state
        const existingPageIndex = pages.findIndex(p => p.page_id === pageId)
        if (existingPageIndex >= 0) {
          // Update existing page
          const updatedPages = [...pages]
          updatedPages[existingPageIndex] = data
          setPages(updatedPages)
        } else {
          // Add new page
          setPages([...pages, data])
        }
        setNewPageTitle('')
        setNewPagePurpose('')
        setShowAddPageModal(false)
        toast.success('Page saved successfully!')
      }
    } catch (error) {
      console.error('Error adding page:', error)
      toast.error('Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePage = async (pageIndex: number) => {
    if (pages.length <= 1) {
      toast.error('Cannot delete the last page')
      return
    }

    if (!confirm('Are you sure you want to delete this page? This will also delete all its content blocks.')) {
      return
    }

    setSaving(true)
    try {
      const pageToDelete = pages[pageIndex]
      
      // Delete content blocks first
      await supabase
        .from('content_blocks')
        .delete()
        .eq('project_id', projectId)
        .eq('page_id', pageToDelete.page_id)

      // Delete the page
      const { error } = await supabase
        .from('onboarding_pages')
        .delete()
        .eq('id', pageToDelete.id)

      if (error) throw error

      const updatedPages = pages.filter((_, index) => index !== pageIndex)
      setPages(updatedPages)
      
      // Adjust current page index if necessary
      if (currentPageIndex >= updatedPages.length) {
        setCurrentPageIndex(Math.max(0, updatedPages.length - 1))
      } else if (currentPageIndex > pageIndex) {
        setCurrentPageIndex(currentPageIndex - 1)
      }

      toast.success('Page deleted successfully!')
    } catch (error) {
      console.error('Error deleting page:', error)
      toast.error('Failed to delete page')
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateContent = async () => {
    if (!openaiKey.trim()) {
      toast.error('Please enter your OpenAI API key')
      return
    }

    const currentPage = pages[currentPageIndex]
    if (!currentPage) return

    setIsGenerating(true)
    try {
      const response = await generatePageContent(
        openaiKey,
        {
          id: currentPage.page_id,
          title: currentPage.title,
          purpose: currentPage.purpose,
          order_index: currentPage.order_index
        },
        projectName,
        'mobile app', // Default category
        'friendly', // Default tone
        '', // No app URL for now
        { primary: 'indigo', secondary: 'blue', accent: 'green', background: 'white', text: 'gray' }
      )

      if (response.blocks && response.blocks.length > 0) {
        // Save the blocks to the database
        await supabase
          .from('content_blocks')
          .delete()
          .eq('project_id', projectId)
          .eq('page_id', currentPage.page_id)

        for (let i = 0; i < response.blocks.length; i++) {
          const block = response.blocks[i]
          await supabase
            .from('content_blocks')
            .insert({
              project_id: projectId,
              page_id: currentPage.page_id,
              block_id: `block-${Date.now()}-${i}`,
              type: block.type,
              content: JSON.stringify(block.content),
              order_index: i
            })
        }

                 // Update the theme if available
         if (response.theme) {
           await supabase
             .from('onboarding_pages')
             .update({
               theme: response.theme.background || response.theme.custom_css || ''
             })
             .eq('id', currentPage.id)
         }

        toast.success('Content generated successfully!')
        setShowAIModal(false)
      }
    } catch (error) {
      console.error('Error generating content:', error)
      toast.error('Failed to generate content. Please check your API key.')
    } finally {
      setIsGenerating(false)
    }
  }

  const currentPage = pages[currentPageIndex]

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading pages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{projectName}</h2>
            <p className="text-sm text-gray-600">Multi-page onboarding editor</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Preview Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded transition-colors ${
                  previewMode === 'mobile' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Smartphone size={16} />
              </button>
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded transition-colors ${
                  previewMode === 'desktop' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Monitor size={16} />
              </button>
            </div>

            {/* AI Generate Button */}
            <button
              onClick={() => setShowAIModal(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Wand2 size={16} />
              Generate with AI
            </button>

            {/* Add Page Button */}
            <button
              onClick={() => setShowAddPageModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Add Page
            </button>
          </div>
        </div>

        {/* Page Navigation */}
        {pages.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0 flex-1">
                {pages.map((page, index) => (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPageIndex(index)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                      index === currentPageIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {page.title}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === pages.length - 1}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            </div>

            {currentPage && (
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                <button
                  onClick={() => handleDeletePage(currentPageIndex)}
                  className="text-red-600 hover:text-red-700 p-2"
                  title="Delete page"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Current Page Info */}
        {currentPage && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">{currentPage.title}</h3>
                <p className="text-sm text-blue-700">{currentPage.purpose}</p>
              </div>
              <div className="text-sm text-blue-600">
                Page {currentPageIndex + 1} of {pages.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 p-6">
        {currentPage ? (
          <div className="h-full bg-white rounded-lg border border-gray-200">
            <EditorLayout
              projectId={projectId}
              pageId={currentPage.page_id}
              projectName={projectName}
              pageTitle={currentPage.title}
              previewMode={previewMode}
              onSave={(blocks: ParsedBlock[], theme: ParsedTheme) => {
                // Optional: Add any additional save logic here
                console.log('Page saved:', currentPage.page_id, blocks.length, 'blocks')
              }}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pages found</h3>
              <p className="text-gray-600 mb-4">Create your first page to get started</p>
              <button
                onClick={() => setShowAddPageModal(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Add Page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Page Modal */}
      {showAddPageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Page</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => setNewPageTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Welcome, Features, Sign Up"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <textarea
                  value={newPagePurpose}
                  onChange={(e) => setNewPagePurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  placeholder="Describe what this page should accomplish..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddPageModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPage}
                disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {saving ? <LoadingSpinner size="sm" /> : <Plus size={16} />}
                Add Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Generate with AI</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="sk-..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your API key is only used for this session and not stored
                </p>
              </div>

              {currentPage && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Generating content for: <strong>{currentPage.title}</strong>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentPage.purpose}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAIModal(false)}
                className="flex-1 btn-secondary"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateContent}
                disabled={isGenerating || !openaiKey.trim()}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isGenerating ? <LoadingSpinner size="sm" /> : <Wand2 size={16} />}
                {isGenerating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
