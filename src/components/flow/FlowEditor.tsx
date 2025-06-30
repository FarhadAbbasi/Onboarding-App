import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Smartphone, Monitor, Wand2, Save, Code, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import { generatePageContent } from '../../lib/openai'
import { extractColorsFromWebsite, type ColorScheme } from '../../lib/colorExtractor'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { FlowPlan, Page } from '../../lib/schemas'
// import { NewFlowEditor } from './editor/NewFlowEditor'
import { parseAIHtmlToBlocksAndTheme } from './editor/AIHtmlParser'
import { supabase } from '../../lib/supabase'
import type { ParsedBlock, ParsedTheme } from './editor/AIHtmlParser'
// import { FlowBlockEditor } from './editor/FlowBlockEditor'
import { EditorLayout } from './editor/EditorLayout'

interface FlowEditorProps {
  flowPlan: FlowPlan
  projectName: string
  projectUrl: string
  openaiKey: string
  onSave: (pages: Page[]) => void
  onBack: () => void
  projectId: string
}

export function FlowEditor({
  flowPlan,
  projectName,
  projectUrl,
  openaiKey,
  onSave,
  onBack,
  projectId
}: FlowEditorProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [pages, setPages] = useState<Page[]>(flowPlan.pages)
  const [generatingContent, setGeneratingContent] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile')
  const [showCode, setShowCode] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [colorScheme, setColorScheme] = useState<ColorScheme | null>(null)
  const [isExtractingColors, setIsExtractingColors] = useState(false)
  const [blockEditorMode, setBlockEditorMode] = useState(false)

  const currentPage = pages[currentPageIndex]
  

  // Generate HTML content for a page if it doesn't have any
  const generateContentForPage = async (pageIndex: number) => {
    const page = pages[pageIndex]
    if (page.html_content) return // Already has content

    setGeneratingContent(page.id)

    try {
      const response = await generatePageContent(
        openaiKey,
        page,
        projectName,
        flowPlan.category,
        flowPlan.tone,
        projectUrl,
        colorScheme || undefined
      )

      // Parse HTML to blocks/theme
      const { blocks, theme } = parseAIHtmlToBlocksAndTheme(response.html_content)

      // If blocks found, save to Supabase and enable block editor mode
      if (blocks.length > 0) {
        if (projectId) {

          try {
            // Delete old blocks for this page
            const deleteRes = await supabase.from('content_blocks').delete().eq('project_id', projectId).eq('page_id', page.id)
            if (deleteRes.error) {
              console.error('[FlowEditor] Error deleting old blocks:', deleteRes.error)
            }
            // Insert new blocks for this page
            for (let i = 0; i < blocks.length; i++) {
              const b = blocks[i]
              const insertRes = await supabase.from('content_blocks').insert({
                project_id: projectId,
                page_id: page.id,
                block_id: b.id,
                type: b.type,
                content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
                order_index: i,
                styles: b.styles || null,
              })
              if (insertRes.error) {
                console.error('[FlowEditor] Error inserting block:', b, insertRes.error)
              } else {
                console.log('[FlowEditor] Inserted block:', b, insertRes)
              }
            }
            // Save theme and html_content for this page
            const updateRes = await supabase.from('onboarding_pages').update({ html_content: response.html_content, theme: theme.html }).eq('project_id', projectId).eq('page_id', page.id)
            if (updateRes.error) {
              console.error('[FlowEditor] Error updating onboarding_pages:', updateRes.error)
            } else {
              console.log('[FlowEditor] Updated onboarding_pages:', updateRes)
            }
            // Update local pages state with theme and full blocks
            setPages(prev => prev.map((p, i) =>
              i === pageIndex
                ? { ...p, html_content: response.html_content, theme: theme.html }
                : p
            ))
            console.log('[FlowEditor] Updated local page with theme and blocks:', {
              ...pages[pageIndex],
              html_content: response.html_content,
              theme: theme.html,
            });
          } catch (supabaseError) {
            console.error('[FlowEditor] Unexpected error during Supabase save:', supabaseError, 'projectId:', projectId, 'pageId:', page.id)
          }
        } else {
          console.error('[FlowEditor] No projectId provided! Cannot save to Supabase. projectId:', projectId)
        }
        setBlockEditorMode(true)
        console.log('[FlowEditor] Switched to block editor mode.')
      } else {
        console.warn('[FlowEditor] No blocks found after parsing. Falling back to HTML preview.')
      }
      setHasUnsavedChanges(true)
      toast.success(`Page generated: ${page.title}`)
    } catch (error) {
      console.error('Content generation error:', error)
      toast.error('Failed to generate page content. Please try again.')
    } finally {
      setGeneratingContent(null)
    }
  }

  // Extract colors from website URL
  useEffect(() => {
    const extractColors = async () => {
      if (!colorScheme && projectUrl) {
        setIsExtractingColors(true)
        try {
          const extracted = await extractColorsFromWebsite(projectUrl)
          setColorScheme(extracted)
          toast.success('Brand colors extracted from website!')
        } catch (error) {
          console.warn('Failed to extract colors:', error)
        } finally {
          setIsExtractingColors(false)
        }
      }
    }
    extractColors()
  }, [projectUrl, colorScheme])

  // Auto-generate content for the first page
  useEffect(() => {
    if (currentPage && !currentPage.html_content) {
      console.log('[FlowEditor] Auto-generating content for page index:', currentPageIndex)
      generateContentForPage(currentPageIndex)
    }
  }, [currentPageIndex])

  const navigateToPage = (index: number) => {
    if (index >= 0 && index < pages.length) {
      setCurrentPageIndex(index)
    }
  }

  const handleSave = () => {
    onSave(pages)
    setHasUnsavedChanges(false)
    toast.success('Flow saved successfully!')
  }

  const handleRegenerateContent = async () => {
    if (!currentPage) return

    setGeneratingContent(currentPage.id)

    try {
      const response = await generatePageContent(
        openaiKey,
        currentPage,
        projectName,
        flowPlan.category,
        flowPlan.tone,
        projectUrl,
        colorScheme || undefined
      )

      setPages(prev => prev.map((page, index) =>
        index === currentPageIndex
          ? { ...page, html_content: response.html_content }
          : page
      ))

      setHasUnsavedChanges(true)
      toast.success('Page regenerated!')
    } catch (error) {
      console.error('Content regeneration error:', error)
      toast.error('Failed to regenerate content. Please try again.')
    } finally {
      setGeneratingContent(null)
    }
  }

  // Save blocks and theme to Supabase after code edit
  const saveBlocksAndThemeToSupabase = async (blocks: ParsedBlock[], theme: ParsedTheme, html_content: string) => {
    if (!projectId) {
      console.error('[FlowEditor] No projectId provided! Cannot save to Supabase. projectId:', projectId)
      return;
    }
    try {
      // Delete old blocks
      const deleteRes = await supabase.from('content_blocks').delete().eq('project_id', projectId)
      if (deleteRes.error) {
        console.error('[FlowEditor] Error deleting old blocks:', deleteRes.error)
      } else {
        console.log('[FlowEditor] Deleted old blocks:', deleteRes)
      }
      // Insert new blocks
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i]
        const insertRes = await supabase.from('content_blocks').insert({
          project_id: projectId,
          type: b.type,
          content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
          order_index: i,
          styles: b.styles || null,
        })
        if (insertRes.error) {
          console.error('[FlowEditor] Error inserting block:', b, insertRes.error)
        } else {
          console.log('[FlowEditor] Inserted block:', b.id, insertRes)
        }
      }
      // Save theme and html_content
      const updateRes = await supabase.from('onboarding_pages').update({ html_content, theme: theme.html }).eq('project_id', projectId)
      if (updateRes.error) {
        console.error('[FlowEditor] Error updating onboarding_pages:', updateRes.error)
      } else {
        console.log('[FlowEditor] Updated onboarding_pages:', updateRes)
      }
    } catch (supabaseError) {
      console.error('[FlowEditor] Unexpected error during Supabase save:', supabaseError, 'projectId:', projectId)
    }
  }

  // Call save after code edit
  const handleCodeEdit = (newHtml: string) => {
    const { blocks, theme } = parseAIHtmlToBlocksAndTheme(newHtml)
    setPages(prev => prev.map((page, index) =>
      index === currentPageIndex
        ? { ...page, html_content: newHtml }
        : page
    ))
    setHasUnsavedChanges(true)
    saveBlocksAndThemeToSupabase(blocks, theme, newHtml)
  }

  if (!currentPage) {
    console.warn('[FlowEditor] No currentPage found for index:', currentPageIndex)
    return <div>Page not found</div>
  }

  const isGenerating = generatingContent === currentPage.id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                <span>Back to Plan</span>
              </button>

              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-bold text-gray-900">{flowPlan.flow_name}</h1>
                <p className="text-sm text-gray-600">
                  Page {currentPageIndex + 1} of {pages.length}: {currentPage.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Preview Mode Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded-md transition-colors ${previewMode === 'mobile'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Smartphone size={16} />
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded-md transition-colors ${previewMode === 'desktop'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Monitor size={16} />
                </button>
              </div>

              {/* Color Scheme Display */}
              {colorScheme && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border">
                  <Palette size={16} className="text-gray-600" />
                  <div className="flex gap-1">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: colorScheme.primary }}
                      title={`Primary: ${colorScheme.primary}`}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: colorScheme.secondary }}
                      title={`Secondary: ${colorScheme.secondary}`}
                    />
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: colorScheme.accent }}
                      title={`Accent: ${colorScheme.accent}`}
                    />
                  </div>
                  <span className="text-xs text-gray-600">Brand Colors</span>
                </div>
              )}

              {isExtractingColors && (
                <div className="flex items-center gap-2 text-blue-600">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">Extracting colors...</span>
                </div>
              )}

              {/* Show Code Toggle */}
              <button
                onClick={() => setShowCode(!showCode)}
                className={`btn-secondary flex items-center gap-2 ${showCode ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <Code size={16} />
                <span>{showCode ? 'Hide Code' : 'Show Code'}</span>
              </button>

              {/* Regenerate Content */}
              <button
                onClick={handleRegenerateContent}
                disabled={isGenerating}
                className="btn-secondary flex items-center gap-2"
              >
                {isGenerating && <LoadingSpinner size="sm" />}
                <Wand2 size={16} />
                <span>Regenerate</span>
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={!hasUnsavedChanges}
                className={`btn-primary flex items-center gap-2 ${!hasUnsavedChanges ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                <Save size={16} />
                <span>Save Flow</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateToPage(currentPageIndex - 1)}
              disabled={currentPageIndex === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {/* Page Indicators */}
            <div className="flex items-center gap-2">
              {pages.map((page, index) => (
                <button
                  key={page.id}
                  onClick={() => navigateToPage(index)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${index === currentPageIndex
                      ? 'bg-blue-600 text-white'
                      : index < currentPageIndex || pages[index].html_content
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  title={page.title}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => navigateToPage(currentPageIndex + 1)}
              disabled={currentPageIndex === pages.length - 1}
              className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Main Editor Area */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className={`grid gap-8 ${showCode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>

              {/* Code Editor (when visible) */}
              {showCode && (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">HTML Code</h3>
                    <textarea
                      value={currentPage.html_content || ''}
                      onChange={(e) => handleCodeEdit(e.target.value)}
                      className="w-full h-96 p-4 font-mono text-sm border border-gray-300 rounded-md resize-none"
                      placeholder="HTML content will be generated here..."
                    />
                  </div>
                </div>
              )}

                            {/* Preview */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{currentPage.title}</h2>
                      <p className="text-sm text-gray-600">{currentPage.purpose}</p>
                    </div>
                    
                    {isGenerating && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm">Generating page...</span>
                      </div>
                    )}
                  </div>

                  {/* Editor Layout - ComponentLibrary outside, Device frames inside */}
                  <div className="h-[800px]">
                    {blockEditorMode && projectId && currentPage.html_content ? (
                      <EditorLayout
                        projectId={projectId}
                        pageId={currentPage.id}
                        projectName={projectName}
                        pageTitle={currentPage.title}
                        previewMode={previewMode}
                        onSave={(blocks: ParsedBlock[], theme: ParsedTheme) => {
  
                          saveBlocksAndThemeToSupabase(blocks, theme, currentPage.html_content || '');
                          setHasUnsavedChanges(true);
                          toast.success('Page updated successfully!');
                        }}
                      />
                    ) : currentPage.html_content ? (
                      <div className="flex justify-center items-center h-full">
                        {previewMode === 'mobile' ? (
                          // iPhone Frame
                          <div className="relative">
                            <div className="w-[340px] h-[700px] bg-black rounded-[60px] p-[8px] shadow-2xl">
                              <div className="w-full h-full bg-gray-900 rounded-[52px] p-[4px]">
                                <div className="w-full h-full bg-white rounded-[48px] overflow-hidden relative">
                                  {/* iPhone Notch */}
                                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[30px] bg-black rounded-b-[15px] z-10"></div>
                                  {/* iPhone Home Indicator */}
                                  <div className="absolute bottom-[8px] left-1/2 transform -translate-x-1/2 w-[134px] h-[5px] bg-black rounded-[3px] opacity-60"></div>
                                  
                                  <iframe
                                    srcDoc={currentPage.html_content}
                                    className="w-full h-full border-0"
                                    title={`Preview of ${currentPage.title}`}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // MacBook Frame
                          <div className="relative">
                            <div className="w-[900px] h-[600px] bg-gray-200 rounded-[8px] p-[20px] shadow-2xl">
                              <div className="w-full h-full bg-black rounded-[4px] p-[3px]">
                                <div className="w-full h-full bg-gray-900 rounded-[2px] p-[20px]">
                                  <div className="w-full h-full bg-white rounded-[4px] overflow-hidden">
                                    {/* MacBook Menu Bar */}
                                    <div className="h-[28px] bg-gray-100 border-b flex items-center px-4">
                                      <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                      </div>
                                      <div className="flex-1 text-center text-xs text-gray-600">
                                        {currentPage.title} - {projectName}
                                      </div>
                                    </div>
                                    
                                    <iframe
                                      srcDoc={currentPage.html_content}
                                      className="w-full h-[calc(100%-28px)] border-0"
                                      title={`Preview of ${currentPage.title}`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : !isGenerating ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <Smartphone size={32} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Page will be generated automatically</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <LoadingSpinner size="lg" />
                          <p className="mt-4 text-sm">Generating beautiful page...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 