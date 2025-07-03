import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Smartphone, Monitor, Wand2, Save, Code, Palette, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { generatePageContent } from '../../lib/openai'
import { extractColorsFromWebsite, type ColorScheme } from '../../lib/colorExtractor'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { FlowPlan, Page } from '../../lib/schemas'
// import { NewFlowEditor } from './editor/NewFlowEditor'
import { parseAIHtmlToBlocksAndTheme, type ParsedBlock, type ParsedTheme } from './editor/AIHtmlParser'
import { supabase } from '../../lib/supabase'
// import { FlowBlockEditor } from './editor/FlowBlockEditor'
import { EditorLayout } from './editor/EditorLayout'
import { AIThemeManager } from './editor/AIThemeManager'
import type { AIGeneratedTheme, ComponentCustomization } from '../../lib/aiThemeGenerator'
import { applyThemeToDocument } from '../../lib/aiThemeGenerator'

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
  const [blockEditorMode, setBlockEditorMode] = useState(true) // Enable block editor by default

  // AI Theming state
  const [isAIEnabled, setIsAIEnabled] = useState(false)
  const [showThemeManager, setShowThemeManager] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<AIGeneratedTheme | null>(null)
  const [componentCustomizations, setComponentCustomizations] = useState<ComponentCustomization[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const currentPage = pages[currentPageIndex]


  // Generate structured component content for a page if it doesn't have any
  const generateContent = async (pageIndex: number) => {
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

      // Handle structured response with blocks and theme
      if (response.blocks && response.blocks.length > 0) {
        // Handle structured component response (new format)
        const blocks: ParsedBlock[] = response.blocks?.map((block: any, index: number) => ({
          id: `block-${Date.now()}-${index}`,
          type: block.type,
          content: typeof block.content === 'object' ? JSON.stringify(block.content) : block.content,
          styles: {},
          order_index: index
        })) || [];
        
        const theme = {
          html: JSON.stringify(response.theme || {
            backgroundClass: 'bg-gradient-to-br from-blue-50 to-indigo-50', 
            textClass: 'text-gray-900',
            accentColor: 'indigo'
          })
        };

        if (blocks.length > 0 && projectId) {
          try {
            // Delete old blocks for this page
            await supabase.from('content_blocks').delete().eq('project_id', projectId).eq('page_id', page.id);
            
            // Insert new blocks
            for (let i = 0; i < blocks.length; i++) {
              const b = blocks[i];
              const insertRes = await supabase.from('content_blocks').insert({
                project_id: projectId,
                page_id: page.id,
                block_id: b.id,
                type: b.type,
                content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
                order_index: i,
                styles: b.styles || null,
              });
              if (insertRes.error) {
                console.error('[FlowEditor] Error inserting block:', b, insertRes.error);
              }
            }
            
            // Save theme and html_content for this page
            const updateRes = await supabase.from('onboarding_pages').update({ 
              html_content: response.html_content, 
              theme: JSON.stringify(theme)
            }).eq('project_id', projectId).eq('page_id', page.id);
            
            if (updateRes.error) {
              console.error('[FlowEditor] Error updating page:', updateRes.error);
            }
          } catch (error) {
            console.error('[FlowEditor] Error saving parsed data:', error);
          }
        }
      } else {
        // Handle any remaining HTML format
        try {
          const { blocks, theme } = parseAIHtmlToBlocksAndTheme(response.html_content);
          
          if (blocks.length > 0 && projectId) {
            // Delete old blocks for this page
            await supabase.from('content_blocks').delete().eq('project_id', projectId).eq('page_id', page.id);
            
            // Insert new blocks
            for (let i = 0; i < blocks.length; i++) {
              const b = blocks[i];
              const insertRes = await supabase.from('content_blocks').insert({
                project_id: projectId,
                page_id: page.id,
                block_id: b.id,
                type: b.type,
                content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
                order_index: i,
                styles: b.styles || null,
              });
              if (insertRes.error) {
                console.error('[FlowEditor] Error inserting block:', b, insertRes.error);
              }
            }
            
            // Save theme and html_content for this page
            const updateRes = await supabase.from('onboarding_pages').update({ 
              html_content: response.html_content, 
              theme: JSON.stringify(theme)
            }).eq('project_id', projectId).eq('page_id', page.id);
            
            if (updateRes.error) {
              console.error('[FlowEditor] Error updating page:', updateRes.error);
            }
          }
        } catch (error) {
          console.error('[FlowEditor] Error saving parsed data:', error);
        }
      }

      // Update the page state
      const updatedPages = [...pages];
      updatedPages[pageIndex] = {
        ...page,
        html_content: response.html_content
      };
      setPages(updatedPages);
      setHasUnsavedChanges(true);
      
      toast.success(`Generated content for ${page.title}!`);
    } catch (error) {
      console.error('[FlowEditor] Content generation error:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setGeneratingContent(null);
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

  // Auto-generate content for pages without content
  useEffect(() => {
    if (currentPage && !currentPage.html_content && !generatingContent && blockEditorMode) {
      // Check if there are any blocks in the database for this page first
      const checkExistingContent = async () => {
        try {
          const { data: existingBlocks } = await supabase
            .from('content_blocks')
            .select('id')
            .eq('project_id', projectId)
            .eq('page_id', currentPage.id)
            .limit(1);
          
          // Only generate if no blocks exist in database
          if (!existingBlocks || existingBlocks.length === 0) {
            console.log('[FlowEditor] No existing content found for page:', currentPage.id, '- triggering auto-generation');
            generateContent(currentPageIndex);
          } else {
            console.log('[FlowEditor] Existing content found for page:', currentPage.id, '- skipping auto-generation');
          }
        } catch (error) {
          console.error('[FlowEditor] Error checking existing content:', error);
          // If error checking, proceed with generation as fallback
          generateContent(currentPageIndex);
        }
      };
      
      checkExistingContent();
    }
  }, [currentPageIndex, blockEditorMode, projectId])

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
    console.log('[FlowEditor] Regenerate button clicked')
    if (!currentPage) return

    setGeneratingContent(currentPage.id)
    console.log('[FlowEditor] Starting regeneration for page:', currentPage.id)

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

      if (response.blocks && response.blocks.length > 0) {
        
        // Convert AI response to our ParsedBlock format
        const parsedBlocks: ParsedBlock[] = response.blocks.map((block: any, index: number) => ({
          id: `block-${Date.now()}-${index}`,
          type: block.type,
          content: block.content,
          styles: block.styles || {},
          order_index: index
        }))
        
        // Convert AI theme to our ParsedTheme format
        const parsedTheme: ParsedTheme = {
          html: JSON.stringify(response.theme || {
            backgroundClass: 'bg-gradient-to-br from-blue-50 to-indigo-50',
            textClass: 'text-gray-900',
            accentColor: 'indigo'
          })
        }
        
        // Create minimal HTML representation
        const htmlContent = `<div>${parsedBlocks.map(block => 
          `<div data-block-type="${block.type}" data-block-id="${block.id}">${JSON.stringify(block.content)}</div>`
        ).join('')}</div>`
        

        
        // Save to database
        await saveBlocksAndThemeToSupabase(parsedBlocks, parsedTheme, htmlContent)
        
        // Update page state
      setPages(prev => prev.map((page, index) => 
        index === currentPageIndex 
            ? { ...page, html_content: htmlContent }
          : page
      ))
        
        // Increment refresh key to force EditorLayout refresh
        setRefreshKey(prev => prev + 1)

      setHasUnsavedChanges(true)
        toast.success(`Regenerated content for ${currentPage.title}!`)
      } else {
        console.warn('[FlowEditor] No blocks found in AI response')
        toast.error('No content blocks generated. Please try again.')
      }
    } catch (error) {
      console.error('[FlowEditor] Regeneration error:', error)
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
      // Delete old blocks for this specific page
      const deleteRes = await supabase.from('content_blocks').delete()
        .eq('project_id', projectId)
        .eq('page_id', currentPage.id)
      if (deleteRes.error) {
        console.error('[FlowEditor] Error deleting old blocks:', deleteRes.error)
      }
      // Insert new blocks
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i]
        
        const insertRes = await supabase.from('content_blocks').insert({
          project_id: projectId,
          page_id: currentPage.id,
          block_id: b.id,
          type: b.type, // Keep original type for proper UI rendering
          content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
          order_index: i,
          styles: typeof b.styles === 'object' ? JSON.stringify(b.styles) : (b.styles || '{}'),
        })
        if (insertRes.error) {
          console.error(`[FlowEditor] Error inserting block ${i+1}:`, insertRes.error)
        }
      }
      // Save html_content (onboarding_pages table doesn't have theme column)
      const updateRes = await supabase.from('onboarding_pages').update({ 
        html_content
      }).eq('project_id', projectId).eq('page_id', currentPage.id)
      if (updateRes.error) {
        console.error('[FlowEditor] Error updating onboarding_pages:', updateRes.error)
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

  // Load existing theme and customizations on mount
  useEffect(() => {
    loadProjectTheme()
    loadComponentCustomizations()
  }, [projectId])

  const loadProjectTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('project_themes')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (data && !error) {
        const theme = JSON.parse(data.theme_data) as AIGeneratedTheme
        setCurrentTheme(theme)
        setIsAIEnabled(true)
      }
    } catch (error) {
      console.log('No existing theme found')
    }
  }

  const loadComponentCustomizations = async () => {
    try {
      const { data, error } = await supabase
        .from('component_customizations')
        .select('*')
        .eq('project_id', projectId)

      if (data && !error) {
        const customizations = data.map(item => JSON.parse(item.customization_data)) as ComponentCustomization[]
        setComponentCustomizations(customizations)
      }
    } catch (error) {
      console.log('No existing customizations found')
    }
  }

  const handleThemeGenerated = async (theme: AIGeneratedTheme) => {
    console.log('🎨 [FlowEditor] Theme generated:', theme.name);
    setCurrentTheme(theme);
    
    // Apply theme to document immediately
    applyThemeToDocument(theme);
    
    // Force refresh of editor components
    setRefreshKey(prev => prev + 1);
  };

  const handleCustomizationsReady = async (customizations: ComponentCustomization[]) => {
    console.log('🎨 [FlowEditor] Component customizations ready:', customizations.length, 'items');
    
    try {
      // Save component customizations to database
      if (customizations.length > 0) {
        // Delete existing customizations for this project
        await supabase
          .from('component_customizations')
          .delete()
          .eq('project_id', projectId);

        // Insert new customizations
        const customizationsToInsert = customizations.map((customization, index) => ({
          project_id: projectId,
          component_type: customization.type,
          customization_data: JSON.stringify(customization),
          created_at: new Date().toISOString()
        }));

        const { error } = await supabase
          .from('component_customizations')
          .insert(customizationsToInsert);

        if (error) {
          console.error('❌ [FlowEditor] Error saving customizations:', error);
          toast.error('Failed to save component customizations');
        } else {
          console.log('✅ [FlowEditor] Component customizations saved successfully');
          setComponentCustomizations(customizations);
          
          // Force refresh of editor components
          setRefreshKey(prev => prev + 1);
          
          toast.success('🎨 Component customizations applied!');
        }
      }
    } catch (error) {
      console.error('❌ [FlowEditor] Error in handleCustomizationsReady:', error);
      toast.error('Failed to apply customizations');
    }
  };

  // Enable block editor mode when AI theming is activated
  useEffect(() => {
    if (isAIEnabled) {
      setBlockEditorMode(true)
    }
  }, [isAIEnabled])

  if (!currentPage) {
    console.warn('[FlowEditor] No currentPage found for index:', currentPageIndex)
    return <div>Page not found</div>
  }

  const isGenerating = generatingContent === currentPage.id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AI Enhancement Banner */}
      {isAIEnabled && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Enhancement Active</h3>
                  <p className="text-sm text-purple-100">
                    Enhanced page generation with custom themes and intelligent component selection
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium">Theme: {currentTheme?.name || 'Default'}</div>
                  <div className="text-xs text-purple-200">
                    {componentCustomizations.length} custom components
                  </div>
                </div>
                <button
                  onClick={() => setShowThemeManager(!showThemeManager)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                >
                  {showThemeManager ? 'Hide' : 'Show'} Theme Manager
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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

              {/* Editor Mode Toggle */}
              <button
                onClick={() => setBlockEditorMode(!blockEditorMode)}
                className={`btn-secondary flex items-center gap-2 ${blockEditorMode ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <Edit3 size={16} />
                <span>{blockEditorMode ? 'Visual Editor' : 'Switch to Editor'}</span>
              </button>

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

              {/* AI Theme Toggle */}
              <button
                onClick={() => {
                  if (!isAIEnabled) {
                    setIsAIEnabled(true);
                    setShowThemeManager(true);
                    toast.success('🎨 AI Theming Enabled! Generate enhanced pages with custom themes.');
                  } else {
                    setShowThemeManager(!showThemeManager);
                  }
                }}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all relative
                  ${isAIEnabled 
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 shadow-sm' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <Palette className="w-4 h-4" />
                {isAIEnabled ? 'AI Theming Active' : 'Enable AI Theming'}
                {isAIEnabled && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
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
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                        <div className="text-center space-y-4">
                          <LoadingSpinner size="lg" />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI is Creating Your Page</h3>
                            <p className="text-gray-600">
                              Generating beautiful, styled components for "{currentPage.title}"...
                            </p>
                          </div>
                          <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-blue-100">
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span>Using your component library for consistent styling</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : blockEditorMode && projectId ? (
                      <EditorLayout
                        key={`editor-${currentPage.id}-${refreshKey}`}
                        projectId={projectId}
                        pageId={currentPage.id}
                        projectName={projectName}
                        pageTitle={currentPage.title}
                        previewMode={previewMode}
                        onSave={(blocks: ParsedBlock[], theme: ParsedTheme) => {
                          saveBlocksAndThemeToSupabase(blocks, theme, currentPage.html_content || '');
                          setHasUnsavedChanges(true);
                        }}
                      />
                    ) : (!blockEditorMode && !currentPage.html_content && !isGenerating) ? (
                      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-dashed border-blue-200">
                        <div className="text-center space-y-6 max-w-md">
                          <div className="text-blue-400">
                            <Wand2 size={56} className="mx-auto mb-4" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Page Builder</h3>
                            <p className="text-gray-600 leading-relaxed">
                              Generate beautiful, styled content for "<strong>{currentPage.title}</strong>" using our component library.
                            </p>
                          </div>
                          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
                            <div className="flex items-center gap-3 text-sm text-gray-700">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-xs">1</span>
                              </div>
                              <span>AI generates styled components</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 mt-2">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-xs">2</span>
                              </div>
                              <span>Drag & drop to customize</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-700 mt-2">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-xs">3</span>
                              </div>
                              <span>Edit properties in real-time</span>
                            </div>
                          </div>
                          <button
                            onClick={() => generateContent(currentPageIndex)}
                            className="btn-primary flex items-center gap-2 px-6 py-3"
                          >
                            <Wand2 size={18} />
                            Generate with AI
                          </button>
                        </div>
                      </div>
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
                          // MacBook Frame - Compact size
                          <div className="relative">
                            <div className="w-[600px] h-[400px] bg-gray-200 rounded-[6px] p-[12px] shadow-2xl">
                              <div className="w-full h-full bg-black rounded-[3px] p-[2px]">
                                <div className="w-full h-full bg-gray-900 rounded-[1px] p-[8px]">
                                  <div className="w-full h-full bg-white rounded-[2px] overflow-hidden">
                                    {/* MacBook Menu Bar */}
                                    <div className="h-[20px] bg-gray-100 border-b flex items-center px-2 flex-shrink-0">
                                      <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      </div>
                                      <div className="flex-1 text-center text-xs text-gray-600">
                                        {currentPage.title}
                                      </div>
                                    </div>
                                    
                                    <iframe
                                      srcDoc={currentPage.html_content}
                                      className="w-full h-[calc(100%-20px)] border-0"
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
                            
      {/* AI Theme Manager Modal */}
      {showThemeManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setShowThemeManager(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg z-10"
              title="Close"
            >
              ✕
            </button>
            <AIThemeManager
              projectId={projectId}
              projectName={projectName}
              projectCategory={flowPlan.category}
              projectDescription={`A ${flowPlan.category} onboarding flow with ${flowPlan.total_pages} pages`}
              openaiKey={openaiKey}
              onThemeGenerated={handleThemeGenerated}
              onCustomizationsReady={handleCustomizationsReady}
            />
          </div>
        </div>
      )}
    </div>
  )
} 