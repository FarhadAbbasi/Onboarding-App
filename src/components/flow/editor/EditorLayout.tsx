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
import toast from 'react-hot-toast';

interface EditorLayoutProps {
  projectId: string;
  pageId: string;
  projectName: string;
  pageTitle: string;
  previewMode: 'mobile' | 'desktop';
  onSave?: (blocks: ParsedBlock[], theme: ParsedTheme) => void;
}

export function EditorLayout({ 
  projectId, 
  pageId, 
  projectName, 
  pageTitle, 
  previewMode,
  onSave 
}: EditorLayoutProps) {
  const [blocks, setBlocks] = useState<ParsedBlock[]>([]);
  const [theme, setTheme] = useState<ParsedTheme>({ html: '' });
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

  // Load blocks and theme from database
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch blocks
        const { data: blockRows, error: blockError } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('project_id', projectId)
          .eq('page_id', pageId)
          .order('order_index', { ascending: true });

        if (blockError) {
          console.error('Error fetching blocks:', blockError);
        }

        // Fetch theme
        const { data: pageRow, error: pageError } = await supabase
          .from('onboarding_pages')
          .select('theme')
          .eq('project_id', projectId)
          .eq('page_id', pageId)
          .single();

        if (pageError && !pageError.message.includes('no rows')) {
          console.error('Error fetching theme:', pageError);
        }

        setBlocks(
          blockRows?.map((b: any) => ({
            id: b.block_id,
            type: b.type,
            content: typeof b.content === 'string' && b.content.trim().startsWith('{') 
              ? JSON.parse(b.content) 
              : b.content,
            styles: b.styles || undefined,
          })) || []
        );

        setTheme(pageRow?.theme ? { html: pageRow.theme } : { html: '' });
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, pageId]);

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
        saveToDatabase(newBlocks, theme);
      } else {
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
        saveToDatabase(newBlocks, theme);
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
        saveToDatabase(newBlocks, theme);
        return newBlocks;
      });
    }
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<ParsedBlock>) => {
    const updatedBlocks = blocks.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    );
    setBlocks(updatedBlocks);
    saveToDatabase(updatedBlocks, theme);
  };

  const handleBlockDelete = (blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(updatedBlocks);
    saveToDatabase(updatedBlocks, theme);
    
    // Clear selection if deleted block was selected
    if (selectedBlock?.id === blockId) {
      setSelectedBlock(null);
    }
  };

  const handleBlockSelect = (block: ParsedBlock) => {
    setSelectedBlock(block);
  };

  const saveToDatabase = async (blocksToSave: ParsedBlock[], themeToSave: ParsedTheme) => {
    try {
      // Delete existing blocks
      await supabase
        .from('content_blocks')
        .delete()
        .eq('project_id', projectId)
        .eq('page_id', pageId);

      // Insert new blocks
      if (blocksToSave.length > 0) {
        const blocksToInsert = blocksToSave.map((block, index) => ({
          project_id: projectId,
          page_id: pageId,
          block_id: block.id,
          type: block.type,
          content: typeof block.content === 'object' 
            ? JSON.stringify(block.content) 
            : block.content,
          order_index: index,
          styles: block.styles || null
        }));

        const { error } = await supabase
          .from('content_blocks')
          .insert(blocksToInsert);

        if (error) throw error;
      }

      // Update theme
      await supabase
        .from('onboarding_pages')
        .upsert({
          project_id: projectId,
          page_id: pageId,
          theme: themeToSave.html
        });

      // Call parent callback
      onSave?.(blocksToSave, themeToSave);
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save changes');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading editor...</p>
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
      <div className="h-full flex">
        {/* Component Library - Fixed Left Sidebar */}
        <ComponentLibrary className="w-80 flex-shrink-0" />
        
        {/* Device Preview - Center */}
        <div className="flex-1 flex justify-center items-center p-4 bg-gray-100 min-w-0">
          {previewMode === 'mobile' ? (
            // iPhone Frame
            <div className="relative">
              <div className="w-[300px] h-[600px] bg-black rounded-[50px] p-[6px] shadow-2xl">
                <div className="w-full h-full bg-gray-900 rounded-[44px] p-[3px]">
                  <div className="w-full h-full bg-white rounded-[41px] overflow-hidden relative">
                    {/* iPhone Notch */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[25px] bg-black rounded-b-[12px] z-10"></div>
                    {/* iPhone Home Indicator */}
                    <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[100px] h-[4px] bg-black rounded-[2px] opacity-60"></div>
                    
                    {/* Canvas Content - Hide scrollbar */}
                    <div className="w-full h-full overflow-y-auto scrollbar-hide">
                      <CanvasDropZone
                        blocks={blocks}
                        theme={theme}
                        onBlockUpdate={handleBlockUpdate}
                        onBlockDelete={handleBlockDelete}
                        onBlockSelect={handleBlockSelect}
                        selectedBlockId={selectedBlock?.id}
                        activeId={activeId}
                        className="min-h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // MacBook Frame - Smaller size
            <div className="relative">
              <div className="w-[700px] h-[450px] bg-gray-200 rounded-[6px] p-[15px] shadow-2xl">
                <div className="w-full h-full bg-black rounded-[3px] p-[2px]">
                  <div className="w-full h-full bg-gray-900 rounded-[1px] p-[15px]">
                    <div className="w-full h-full bg-white rounded-[3px] overflow-hidden">
                      {/* MacBook Menu Bar */}
                      <div className="h-[24px] bg-gray-100 border-b flex items-center px-3">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                          <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="flex-1 text-center text-xs text-gray-600">
                          {pageTitle} - {projectName}
                        </div>
                      </div>
                      
                      {/* Canvas Content */}
                      <div className="w-full h-[calc(100%-24px)] overflow-y-auto">
                        <CanvasDropZone
                          blocks={blocks}
                          theme={theme}
                          onBlockUpdate={handleBlockUpdate}
                          onBlockDelete={handleBlockDelete}
                          onBlockSelect={handleBlockSelect}
                          selectedBlockId={selectedBlock?.id}
                          activeId={activeId}
                          className="min-h-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Component Properties - Fixed Right Sidebar */}
        <ComponentProperties
          selectedBlock={selectedBlock}
          onBlockUpdate={handleBlockUpdate}
          onClose={() => setSelectedBlock(null)}
        />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="bg-white border-2 border-blue-400 rounded-lg p-3 shadow-xl opacity-90 transform rotate-2">
            <div className="text-sm font-medium text-blue-600">
              Drop into canvas
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
} 