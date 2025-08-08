import React, { useEffect, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '../../../lib/supabase';
import { ThemeRenderer } from './ThemeRenderer';
import type { ParsedBlock, ParsedTheme } from './AIHtmlParser';

interface FlowBlockEditorProps {
  projectId: string;
  pageId: string;
}

export const FlowBlockEditor: React.FC<FlowBlockEditorProps> = ({ projectId, pageId }) => {
  const [blocks, setBlocks] = useState<ParsedBlock[]>([]);
  const [theme, setTheme] = useState<ParsedTheme>({ html: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch blocks and theme on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch blocks for this page
      const { data: blockRows, error: blockError } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('project_id', projectId)
        .eq('page_id', pageId)
        .order('order_index', { ascending: true });
      if (blockError) {
        console.error('[FlowBlockEditor] Error fetching blocks:', blockError);
      } else {
        console.log('[FlowBlockEditor] Fetched blocks:', blockRows);
      }
      // Fetch theme for this page
      let pageRow = null;
      let pageError = null;
      try {
        const res = await supabase
          .from('onboarding_pages')
          .select('theme, html_content')
          .eq('project_id', projectId)
          .eq('page_id', pageId)
          .limit(1)
          .single();
        pageRow = res.data;
        pageError = res.error;
      } catch (err) {
        pageError = err;
      }
      if (pageError) {
        console.error('[FlowBlockEditor] Error fetching onboarding_pages:', pageError);
        // Fallback: if no row, create one using upsert to avoid duplicate key errors
        if (String(pageError).includes('no rows returned')) {
          const { error: upsertError } = await supabase
            .from('onboarding_pages')
            .upsert({
              project_id: projectId,
              page_id: pageId,
              theme: '',
              html_content: '',
              title: pageId, // Use pageId as fallback title
              purpose: '', // Empty purpose as fallback
              order_index: 0 // Default order index
            }, { 
              onConflict: 'project_id,page_id',
              ignoreDuplicates: false 
            });
            
          if (upsertError) {
            console.error('[FlowBlockEditor] Error upserting onboarding_pages row:', upsertError);
          } else {
            console.log('[FlowBlockEditor] Upserted onboarding_pages row for project:', projectId, 'page:', pageId);
            // Try fetching again
            const retry = await supabase
              .from('onboarding_pages')
              .select('theme, html_content')
              .eq('project_id', projectId)
              .eq('page_id', pageId)
              .limit(1)
              .single();
            pageRow = retry.data;
            pageError = retry.error;
            if (pageError) {
              console.error('[FlowBlockEditor] Error fetching onboarding_pages after upsert:', pageError);
            } else {
              console.log('[FlowBlockEditor] Fetched onboarding_pages after upsert:', pageRow);
            }
          }
        }
      } else {
        console.log('[FlowBlockEditor] Fetched onboarding_pages:', pageRow);
      }
      setBlocks(
        blockRows?.map((b: any) => ({
          id: b.id,
          type: b.type,
          content: typeof b.content === 'string' && b.content.trim().startsWith('{') ? JSON.parse(b.content) : b.content,
          styles: b.styles || undefined,
        })) || []
      );
      setTheme(pageRow?.theme ? { html: pageRow.theme } : { html: '' });
      setLoading(false);
    };
    fetchData();
  }, [projectId, pageId]);

  // DnD Kit setup
  const sensors = useSensors(useSensor(PointerSensor));
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex(b => b.id === active.id);
    const newIndex = blocks.findIndex(b => b.id === over.id);
    setBlocks(arrayMove(blocks, oldIndex, newIndex));
  };

  // Block CRUD
  const handleAddBlock = (type: string) => {
    setBlocks(bs => [
      ...bs,
      {
        id: `block-${Date.now()}`,
        type,
        content: '',
      },
    ]);
  };
  const handleDeleteBlock = (id: string) => {
    setBlocks(bs => bs.filter(b => b.id !== id));
  };
  const handleEditBlock = (id: string) => {
    const newContent = window.prompt('Edit block content:');
    if (newContent !== null) {
      setBlocks(bs => bs.map(b => b.id === id ? { ...b, content: newContent } : b));
    }
  };

  // Save handler
  const handleSave = async () => {
    setSaving(true);
    // Save blocks for this page
    const { error: delError } = await supabase.from('content_blocks').delete().eq('project_id', projectId).eq('page_id', pageId);
    if (delError) {
      console.error('[FlowBlockEditor] Error deleting old blocks:', delError);
    } else {
      console.log('[FlowBlockEditor] Deleted old blocks for project:', projectId, 'page:', pageId);
    }
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const { error: insError } = await supabase.from('content_blocks').insert({
        project_id: projectId,
        page_id: pageId,
        block_id: b.id,
        type: b.type,
        content: typeof b.content === 'string' ? b.content : JSON.stringify(b.content),
        order_index: i,
        styles: b.styles || null,
      });
      if (insError) {
        console.error('[FlowBlockEditor] Error inserting block:', b, insError);
      } else {
        console.log('[FlowBlockEditor] Inserted block:', b.id);
      }
    }
    // Save theme (if needed)
    const { error: updError } = await supabase.from('onboarding_pages').update({ theme: theme.html }).eq('project_id', projectId).eq('page_id', pageId);
    if (updError) {
      console.error('[FlowBlockEditor] Error updating onboarding_pages theme:', updError);
    } else {
      console.log('[FlowBlockEditor] Updated onboarding_pages theme for project:', projectId, 'page:', pageId);
    }
    setSaving(false);
  };

  function renderBlockPreview(block: ParsedBlock) {
    const content = block.content as any;
    switch (block.type) {
      case 'headline':
        return <h1 className="text-2xl font-bold text-gray-900 my-2">{content.headline || 'Headline'}</h1>;
      case 'paragraph':
        return <p className="text-base text-gray-700 my-2">{content.text || 'Paragraph text'}</p>;
      case 'cta':
        return (
          <button className="bg-blue-600 text-white px-4 py-2 rounded shadow my-2">
            {content.headline || content.button_text || 'Call to Action'}
          </button>
        );
      case 'testimonial':
        return (
          <blockquote className="italic text-gray-700 border-l-4 border-blue-400 pl-2 my-2">
            “{content.quote || 'Testimonial'}”
          </blockquote>
        );
      case 'feature-list':
        return (
          <ul className="list-disc pl-6 my-2">
            {(content.features || []).map((f: string, i: number) => (
              <li key={i} className="text-blue-800">{f}</li>
            ))}
          </ul>
        );
      case 'form':
        return <div className="my-2"><span className="font-semibold">Form:</span> {content.title || 'Form Title'}</div>;
      case 'permissions':
        return <div className="my-2"><span className="font-semibold">Permissions:</span> {content.title || 'Permissions'}</div>;
      case 'profile-setup':
        return <div className="my-2"><span className="font-semibold">Profile Setup:</span> {content.title || 'Profile Setup'}</div>;
      default:
        return <div className="my-2">{typeof content === 'string' ? content : JSON.stringify(content)}</div>;
    }
  }

  if (loading) return <div className="text-gray-400 p-8 text-center">Loading...</div>;
  console.log('[FlowBlockEditor] blocks to render:', blocks);
  if (!blocks.length || !theme.html) return <div className="text-gray-400 p-8 text-center">No valid theme or blocks to render.</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-4 flex gap-4 items-center">
        <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-white rounded" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
      <ThemeRenderer theme={theme}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <div key={block.id} className="mb-4 bg-white rounded shadow p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-medium">{block.type}</div>
                  <div className="text-base text-gray-900">
                    {renderBlockPreview(block)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEditBlock(block.id)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDeleteBlock(block.id)} className="text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </ThemeRenderer>
    </div>
  );
}; 