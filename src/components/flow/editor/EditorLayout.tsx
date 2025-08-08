import { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Smartphone, Monitor } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { ComponentLibrary } from './ComponentLibrary';
import { CanvasDropZone } from './CanvasDropZone';
import { ComponentProperties } from './ComponentProperties';
import type { ParsedBlock, ParsedTheme } from './AIHtmlParser';
import type { AIGeneratedTheme, ComponentCustomization } from '../../../lib/aiThemeGenerator';
import { applyThemeToDocument } from '../../../lib/aiThemeGenerator';
import toast from 'react-hot-toast';

interface EditorLayoutProps {
  projectId: string;
  pageId: string;
  projectName: string;
  pageTitle: string;
  previewMode: 'mobile' | 'desktop';
  currentTheme?: AIGeneratedTheme;
  componentCustomizations?: ComponentCustomization[];
  onSave?: (blocks: ParsedBlock[], theme: ParsedTheme) => void;
}

export function EditorLayout({ 
  projectId, 
  pageId, 
  projectName, 
  pageTitle, 
  previewMode,
  currentTheme: propTheme,
  componentCustomizations: propCustomizations,
  onSave
}: EditorLayoutProps) {
  const [blocks, setBlocks] = useState<ParsedBlock[]>([]);
  const [theme, setTheme] = useState<AIGeneratedTheme | null>(propTheme || null);
  const [componentCustomizations, setComponentCustomizations] = useState<ComponentCustomization[]>(propCustomizations || []);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<ParsedBlock | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load all data: blocks, theme, and customizations
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('🎨 [EditorLayout] Loading data for project:', projectId, 'page:', pageId);

        // 1. Load blocks from content_blocks table
        const { data: blockRows, error: blockError } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('project_id', projectId)
          .eq('page_id', pageId)
          .order('order_index', { ascending: true });

        if (blockError) {
          console.error('❌ [EditorLayout] Error fetching blocks:', blockError);
        }

        // 2. Load theme from project_themes table (if not provided via props)
        let loadedTheme = propTheme;
        if (!loadedTheme) {
          const { data: themeRow, error: themeError } = await supabase
            .from('project_themes')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (themeError && !themeError.message.includes('no rows')) {
            console.error('❌ [EditorLayout] Error fetching theme:', themeError);
          } else if (themeRow) {
            try {
              loadedTheme = JSON.parse(themeRow.theme_data) as AIGeneratedTheme;
              console.log('🎨 [EditorLayout] Loaded theme:', loadedTheme?.name || 'unnamed');
            } catch (e) {
              console.error('❌ [EditorLayout] Failed to parse theme data:', e);
            }
          }
        }

        // 3. Load component customizations from component_customizations table
        let loadedCustomizations = propCustomizations || [];
        if (!propCustomizations) {
          const { data: customizationRows, error: customizationError } = await supabase
            .from('component_customizations')
            .select('*')
            .eq('project_id', projectId);

          if (customizationError && !customizationError.message.includes('no rows')) {
            console.error('❌ [EditorLayout] Error fetching customizations:', customizationError);
          } else if (customizationRows && customizationRows.length > 0) {
            loadedCustomizations = customizationRows.map((row: any) => {
              try {
                return JSON.parse(row.customization_data) as ComponentCustomization;
              } catch (e) {
                console.error('❌ [EditorLayout] Failed to parse customization data:', e);
                return null;
              }
            }).filter(Boolean) as ComponentCustomization[];
            console.log('🎨 [EditorLayout] Loaded customizations:', loadedCustomizations.length, 'items');
          }
        }

        // 4. Process loaded blocks with proper content/styles parsing
        const loadedBlocks = blockRows?.map((b: any) => ({
          id: b.block_id,
          type: b.type,
          content: typeof b.content === 'string' && b.content.trim().startsWith('{') 
            ? JSON.parse(b.content) 
            : b.content,
          styles: b.styles && typeof b.styles === 'string' && b.styles.trim().startsWith('{')
            ? JSON.parse(b.styles)
            : (b.styles || {}),
          order_index: b.order_index
        })) || [];

        console.log('📦 [EditorLayout] Loaded blocks:', loadedBlocks.length, 'blocks');
        console.log('🎨 [EditorLayout] Theme loaded:', !!loadedTheme);
        console.log('🎨 [EditorLayout] Customizations loaded:', loadedCustomizations.length);
        
        // 5. Apply theme to document if available
        if (loadedTheme) {
          applyThemeToDocument(loadedTheme);
          console.log('✅ [EditorLayout] Applied theme to document');
        }

                 // 6. Update state
         setBlocks(loadedBlocks);
         setTheme(loadedTheme || null);
         setComponentCustomizations(loadedCustomizations);
      } catch (error) {
        console.error('❌ [EditorLayout] Error loading data:', error);
        toast.error('Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    if (projectId && pageId) {
      loadData();
    }
  }, [projectId, pageId, propTheme, propCustomizations]);

  // Apply theme when it changes
  useEffect(() => {
    if (theme) {
      applyThemeToDocument(theme);
      console.log('✅ [EditorLayout] Theme applied to document');
    }
  }, [theme]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dragging a new component from library
    if (active.data.current?.type && !blocks.find(b => b.id === active.id)) {
      const newBlock: ParsedBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        type: active.data.current.type,
        content: active.data.current.content
      };
      
      // Find insertion index based on drop position
      if (over.id === 'canvas-drop-zone') {
        // Dropped on empty canvas
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
        saveToDatabase(newBlocks);
      } else {
        // Dropped on or near existing block
        const overIndex = blocks.findIndex(b => b.id === over.id);
        if (overIndex >= 0) {
          const newBlocks = [...blocks];
          newBlocks.splice(overIndex + 1, 0, newBlock);
          setBlocks(newBlocks);
          saveToDatabase(newBlocks);
        } else {
          const newBlocks = [...blocks, newBlock];
          setBlocks(newBlocks);
          saveToDatabase(newBlocks);
        }
      }
      
      // Show success feedback
      toast.success(`Added ${active.data.current.type.replace(/-/g, ' ')} to your page`);
      return;
    }

    // Handle reordering existing blocks
    if (active.id !== over.id) {
      setBlocks(prev => {
        const oldIndex = prev.findIndex(b => b.id === active.id);
        const newIndex = prev.findIndex(b => b.id === over.id);
        const newBlocks = arrayMove(prev, oldIndex, newIndex);
        
        // Auto-save after reordering
        saveToDatabase(newBlocks);
        return newBlocks;
      });
    }
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<ParsedBlock>) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    setBlocks(updatedBlocks);
    saveToDatabase(updatedBlocks);
  };

  const handleBlockDelete = (blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(updatedBlocks);
    saveToDatabase(updatedBlocks);
    
    // Clear selection if deleted block was selected
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const handleBlockSelect = (block: ParsedBlock) => {
    setSelectedBlock(block);
  };

  const saveToDatabase = async (blocksToSave: ParsedBlock[]) => {
    try {
      console.log('💾 [EditorLayout] Saving', blocksToSave.length, 'blocks to database');

      // Delete existing blocks for this page
      await supabase
        .from('content_blocks')
        .delete()
        .eq('project_id', projectId)
        .eq('page_id', pageId);

      // Insert new blocks
      if (blocksToSave.length > 0) {
        for (const block of blocksToSave) {
          await supabase.from('content_blocks').upsert({
            project_id: projectId,
            page_id: pageId,
            block_id: block.id,
            type: block.type,
            content: typeof block.content === 'string' ? block.content : JSON.stringify(block.content),
            order_index: blocksToSave.indexOf(block),
            styles: typeof block.styles === 'object' ? JSON.stringify(block.styles) : (block.styles || '{}'),
          }, {
            onConflict: 'project_id,page_id,block_id'
          });
        }

        console.log('✅ [EditorLayout] Blocks saved successfully');
      }

      // Trigger callback if provided
      if (onSave) {
        onSave(blocksToSave, { html: '' }); // Legacy format for compatibility
      }
    } catch (error) {
      console.error('❌ [EditorLayout] Error in saveToDatabase:', error);
      toast.error('Failed to save changes');
    }
  };

  // Get customization for a specific component type
  const getCustomizationForType = (type: string): ComponentCustomization | undefined => {
    return componentCustomizations.find(c => c.type === type);
  };
  
  // Suppress unused warning
  getCustomizationForType;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 flex bg-gray-50">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Device Preview */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="relative" style={{ paddingRight: selectedBlock ? '80px' : '0px' }}>
              {previewMode === 'mobile' ? (
                // iPhone Frame
                <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-visible" style={{ width: '375px', height: '667px' }}>
                    {/* Status Bar */}
                    <div className="bg-black text-white text-xs px-6 py-2 flex justify-between items-center">
                      <span className="font-medium">9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                        </div>
                        <div className="w-6 h-3 border border-white rounded-sm">
                          <div className="w-4 h-1.5 bg-white rounded-sm mt-0.5 ml-0.5"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Canvas Drop Zone with mobile-optimized styling */}
                    <div className="h-full bg-gradient-to-br from-gray-50 to-white overflow-auto relative" style={{ borderRadius: '0 0 2.5rem 2.5rem' }}>
                      <CanvasDropZone
                        blocks={blocks}
                        theme={theme}
                        componentCustomizations={componentCustomizations}
                        onBlockUpdate={handleBlockUpdate}
                        onBlockDelete={handleBlockDelete}
                        onBlockSelect={handleBlockSelect}
                        selectedBlockId={selectedBlock?.id}
                        activeId={activeId}
                        className="min-h-full pb-8"
                      />
                      {/* Home Indicator */}
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black/30 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ) : (
                // MacBook Frame
                <div className="relative">
                  <div className="bg-gray-800 rounded-t-xl p-3">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-gray-700 rounded px-3 py-1 text-gray-300 text-xs flex items-center">
                        <Monitor className="w-3 h-3 mr-2" />
                        {projectName} - {pageTitle}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white shadow-2xl" style={{ width: '1024px', height: '600px' }}>
                    <CanvasDropZone
                      blocks={blocks}
                      theme={theme}
                      componentCustomizations={componentCustomizations}
                      onBlockUpdate={handleBlockUpdate}
                      onBlockDelete={handleBlockDelete}
                      onBlockSelect={handleBlockSelect}
                      selectedBlockId={selectedBlock?.id}
                      activeId={activeId}
                      className="h-full overflow-auto p-8"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Component Library or Properties Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {selectedBlock ? (
            /* Properties Panel when component is selected */
            <ComponentProperties
              selectedBlock={selectedBlock}
              onBlockUpdate={handleBlockUpdate}
              onClose={() => setSelectedBlock(null)}
            />
          ) : (
            /* Component Library when no component is selected */
            <>
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Components</h3>
                    <p className="text-sm text-gray-500">Drag & drop to build</p>
                  </div>
                </div>
                <div className="bg-blue-100/50 rounded-lg p-3 text-sm text-blue-700">
                  💡 <strong>Tip:</strong> Drag components to the device preview to add them to your page
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <ComponentLibrary />
              </div>
              {/* Quick Actions */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-2">Quick Actions</p>
                  <div className="flex justify-center gap-2">
                    <button 
                      className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        // Add a spacer for better spacing
                        const newBlock: ParsedBlock = {
                          id: `spacer-${Date.now()}`,
                          type: 'spacer',
                          content: { height: 'md' },
                          styles: { height: 'md' }
                        };
                        setBlocks(prev => [...prev, newBlock]);
                        saveToDatabase([...blocks, newBlock]);
                      }}
                    >
                      + Spacer
                    </button>
                    <button 
                      className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        // Add a quick CTA
                        const newBlock: ParsedBlock = {
                          id: `cta-${Date.now()}`,
                          type: 'cta',
                          content: { button_text: 'Get Started', headline: 'Ready to begin?' }
                        };
                        setBlocks(prev => [...prev, newBlock]);
                        saveToDatabase([...blocks, newBlock]);
                      }}
                    >
                      + CTA
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Drag Overlay with component preview */}
      <DragOverlay>
        {activeId && (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-2xl opacity-95 transform rotate-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {(() => {
                  const componentName = activeId.toString();
                  // Convert component types to readable names
                  const nameMap: Record<string, string> = {
                    'headline': '📰 Headline',
                    'subheadline': '📝 Subheadline', 
                    'paragraph': '📄 Text Block',
                    'cta': '🚀 Call to Action',
                    'feature-list': '⭐ Feature List',
                    'testimonial': '💬 Testimonial',
                    'text-input': '✏️ Text Input',
                    'alert': '⚠️ Alert',
                    'link': '🔗 Link',
                    'permission-request': '🔒 Permission Request',
                    'spacer': '⬜ Spacer',
                    'icon': '🎨 Icon',
                    'footer': '📄 Footer'
                  };
                  return nameMap[componentName] || componentName.replace(/-/g, ' ');
                })()}
              </p>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Drop on the device to add
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
} 