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
import { supabase } from '../../../lib/supabase';
import { ComponentLibrary } from './ComponentLibrary';
import { CanvasDropZone } from './CanvasDropZone';
import type { ParsedBlock, ParsedTheme } from './AIHtmlParser';
import toast from 'react-hot-toast';

interface DragDropEditorProps {
  projectId: string;
  pageId: string;
  onSave?: (blocks: ParsedBlock[], theme: ParsedTheme) => void;
}

export function DragDropEditor({ projectId, pageId, onSave }: DragDropEditorProps) {
  const [blocks, setBlocks] = useState<ParsedBlock[]>([]);
  const [theme, setTheme] = useState<ParsedTheme>({ html: '' });
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

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
        setBlocks(prev => {
          const newBlocks = [...prev];
          newBlocks.splice(overIndex + 1, 0, newBlock);
          return newBlocks;
        });
      } else {
        setBlocks(prev => [...prev, newBlock]);
      }
      
      // Auto-save after adding new block
      saveToDatabase([...blocks, newBlock], theme);
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
    
    // Auto-save after updating
    saveToDatabase(updatedBlocks, theme);
  };

  const handleBlockDelete = (blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(updatedBlocks);
    
    // Auto-save after deleting
    saveToDatabase(updatedBlocks, theme);
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
        
        {/* Canvas - Right Side */}
        <div className="flex-1 bg-white">
          <CanvasDropZone
            blocks={blocks}
            onBlockUpdate={handleBlockUpdate}
            onBlockDelete={handleBlockDelete}
            activeId={activeId}
            className="h-full"
          />
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
            <div className="text-sm font-medium text-gray-900">
              Dragging component...
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
} 