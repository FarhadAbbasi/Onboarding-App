import React, { useState, useEffect } from 'react';
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
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: active.data.current.type,
        content: active.data.current.content
      };
      
      // Find insertion index based on drop position
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
      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {/* Component Library - Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Components</h3>
            <p className="text-sm text-gray-500">Drag components to build your page</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ComponentLibrary />
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Device Preview */}
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div className="relative">
              {previewMode === 'mobile' ? (
                // iPhone Frame
                <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden" style={{ width: '375px', height: '667px' }}>
                    {/* Status Bar */}
                    <div className="bg-black text-white text-xs px-6 py-2 flex justify-between items-center">
                      <span>9:41</span>
                      <div className="flex items-center space-x-1">
                        <Smartphone className="w-3 h-3" />
                      </div>
                    </div>
                    
                    {/* Canvas Drop Zone */}
                    <div className="h-full bg-white overflow-auto">
                      <CanvasDropZone
                        blocks={blocks}
                        theme={theme}
                        componentCustomizations={componentCustomizations}
                        onBlockUpdate={handleBlockUpdate}
                        onBlockDelete={handleBlockDelete}
                        onBlockSelect={handleBlockSelect}
                        selectedBlockId={selectedBlock?.id}
                        activeId={activeId}
                        className="min-h-full p-4"
                      />
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

                 {/* Properties Panel - Right Sidebar */}
         {selectedBlock && (
           <div className="w-80 bg-white border-l border-gray-200">
             <ComponentProperties
               selectedBlock={selectedBlock}
               onBlockUpdate={handleBlockUpdate}
               onClose={() => setSelectedBlock(null)}
             />
           </div>
         )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && (
          <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-lg opacity-90">
            <p className="text-sm font-medium text-gray-900">
              {activeId.toString()}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
} 