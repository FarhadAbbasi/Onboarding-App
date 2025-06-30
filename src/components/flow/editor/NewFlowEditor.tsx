import React, { useState, useEffect } from 'react';
import { FlowDnDProvider } from './FlowDnDContext';
import { ThemeRenderer } from './ThemeRenderer';
import BlocksRenderer from './BlocksRenderer';
import { parseAIHtmlToBlocksAndTheme, serializeBlocksAndThemeToHtml } from './AIHtmlParser';
import type { ParsedBlock, ParsedTheme } from './AIHtmlParser';
import { supabase } from '../../../lib/supabase';

interface NewFlowEditorProps {
  initialHtml?: string;
  projectId?: string;
  onSave?: (blocks: ParsedBlock[], theme: ParsedTheme) => void;
}

export const NewFlowEditor: React.FC<NewFlowEditorProps> = ({ initialHtml, projectId, onSave }) => {
  const [blocks, setBlocks] = useState<ParsedBlock[]>([]);
  const [theme, setTheme] = useState<ParsedTheme>({ html: '' });
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load from Supabase if projectId is provided
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!projectId) return;
      setLoading(true);
      // Fetch blocks
      const { data: blockRows } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });
      // Fetch theme (from onboarding_pages or similar)
      const { data: pageRow } = await supabase
        .from('onboarding_pages')
        .select('html_content, theme')
        .eq('project_id', projectId)
        .limit(1)
        .single();
      let loadedBlocks: ParsedBlock[] = [];
      let loadedTheme: ParsedTheme = { html: '' };
      if (blockRows && blockRows.length > 0) {
        loadedBlocks = blockRows.map((b: any) => ({
          id: b.id,
          type: b.type,
          content: b.content,
          styles: b.styles || undefined,
        }));
      }
      if (pageRow) {
        if (pageRow.theme) {
          loadedTheme = { html: pageRow.theme };
        } else if (pageRow.html_content) {
          // fallback: parse theme from html_content if theme column is missing
          const { theme: parsedTheme } = parseAIHtmlToBlocksAndTheme(pageRow.html_content);
          loadedTheme = parsedTheme;
        }
      }
      setBlocks(loadedBlocks);
      setTheme(loadedTheme);
      setReady(loadedBlocks.length > 0 && !!loadedTheme.html);
      setLoading(false);
    };
    if (projectId) {
      loadFromSupabase();
    } else if (initialHtml) {
      const { blocks: parsedBlocks, theme: parsedTheme } = parseAIHtmlToBlocksAndTheme(initialHtml);
      setBlocks(parsedBlocks);
      setTheme(parsedTheme);
      setReady(parsedBlocks.length > 0 && !!parsedTheme.html);
    }
  }, [projectId, initialHtml]);

  // Save handler
  const handleSave = async () => {
    if (onSave) onSave(blocks, theme);
    if (!projectId) return;
    // Save blocks
    await supabase.from('content_blocks').delete().eq('project_id', projectId);
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      await supabase.from('content_blocks').insert({
        id: b.id,
        project_id: projectId,
        type: b.type,
        content: b.content,
        order_index: i,
        styles: b.styles || null,
      });
    }
    // Save theme (serialize to html_content)
    const html = serializeBlocksAndThemeToHtml(blocks, theme);
    await supabase.from('onboarding_pages').update({ html_content: html }).eq('project_id', projectId);
  };

  // Block CRUD (add/delete/edit) - for demo, just add a headline
  const handleAddBlock = () => {
    setBlocks(bs => [
      ...bs,
      {
        id: `block-${bs.length + 1}`,
        type: 'headline',
        content: 'New Headline',
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

  if (loading) return <div className="text-gray-400 p-8 text-center">Loading...</div>;
  if (!ready) return <div className="text-gray-400 p-8 text-center">No valid theme or blocks to render.</div>;

  return (
    <FlowDnDProvider initialBlocks={blocks}>
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-4 flex gap-4 items-center">
          <button onClick={handleAddBlock} className="px-3 py-1 bg-blue-600 text-white rounded">Add Headline</button>
          <button onClick={handleSave} className="ml-2 px-3 py-1 bg-green-600 text-white rounded">Save</button>
        </div>
        <ThemeRenderer theme={theme}>
          <BlocksRenderer onEditBlock={handleEditBlock} onDeleteBlock={handleDeleteBlock} />
        </ThemeRenderer>
      </div>
    </FlowDnDProvider>
  );
}; 