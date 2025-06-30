import React, { useMemo, useState, useEffect } from 'react';
import type { BlockTree, BlockNode } from '../../lib/schemas';

interface ContentEditorPropertiesProps {
  blockTree: BlockTree;
  selectedBlockId: string | null;
  onBlockUpdate: (blockId: string, updates: Partial<BlockNode>) => void;
}

const blockLabels: Record<string, string> = {
  headline: 'Headline',
  subheadline: 'Subheadline',
  feature: 'Feature',
  cta: 'Call to Action',
  testimonial: 'Testimonial',
};

const defaultStyles = {
  color: '#1e293b', // slate-800
  fontSize: '2rem',
};

const ContentEditorProperties: React.FC<ContentEditorPropertiesProps> = ({ blockTree, selectedBlockId, onBlockUpdate }) => {
  const selectedBlock = useMemo(() => selectedBlockId ? blockTree.nodes[selectedBlockId] : null, [blockTree, selectedBlockId]);

  // Local state for editing
  const [localContent, setLocalContent] = useState('');
  const [localStyles, setLocalStyles] = useState<{ color: string; fontSize: string }>({ color: defaultStyles.color, fontSize: defaultStyles.fontSize });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (selectedBlock) {
      setLocalContent(selectedBlock.content);
      setLocalStyles({
        color: selectedBlock.styles?.color || defaultStyles.color,
        fontSize: selectedBlock.styles?.fontSize || defaultStyles.fontSize,
      });
      setEditing(false);
    }
  }, [selectedBlockId, selectedBlock]);

  // Testimonial special handling
  const [testimonial, setTestimonial] = useState({ text: '', author: '', role: '', company: '' });
  useEffect(() => {
    if (selectedBlock?.type === 'testimonial') {
      try {
        setTestimonial(JSON.parse(selectedBlock.content));
      } catch {
        setTestimonial({ text: '', author: '', role: '', company: '' });
      }
    }
  }, [selectedBlock]);

  const handleSave = () => {
    if (!selectedBlock) return;
    if (selectedBlock.type === 'testimonial') {
      onBlockUpdate(selectedBlock.id, { content: JSON.stringify(testimonial) });
    } else {
      onBlockUpdate(selectedBlock.id, { content: localContent, styles: localStyles });
    }
    setEditing(false);
  };

  const handleCancel = () => {
    if (!selectedBlock) return;
    setLocalContent(selectedBlock.content);
    setLocalStyles({
      color: selectedBlock.styles?.color || defaultStyles.color,
      fontSize: selectedBlock.styles?.fontSize || defaultStyles.fontSize,
    });
    if (selectedBlock.type === 'testimonial') {
      try {
        setTestimonial(JSON.parse(selectedBlock.content));
      } catch {
        setTestimonial({ text: '', author: '', role: '', company: '' });
      }
    }
    setEditing(false);
  };

  return (
    <aside className="w-full h-full bg-gradient-to-b from-white to-gray-50 border-l p-6 flex flex-col shadow-sm rounded-xl">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Properties</h2>
      {!selectedBlock ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-base">
          <span className="mb-2">Select a component to edit its properties</span>
          <span className="text-4xl">🛠️</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <div className="mb-2 text-sm text-gray-500 font-medium uppercase tracking-wider">
              {blockLabels[selectedBlock.type] || 'Block'}
            </div>
            {selectedBlock.type === 'testimonial' ? (
              <>
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  rows={2}
                  value={testimonial.text}
                  onChange={e => { setEditing(true); setTestimonial(t => ({ ...t, text: e.target.value })); }}
                  placeholder="Testimonial text..."
                />
                <input
                  className="w-full p-2 border rounded mb-2"
                  value={testimonial.author}
                  onChange={e => { setEditing(true); setTestimonial(t => ({ ...t, author: e.target.value })); }}
                  placeholder="Author"
                />
                <input
                  className="w-full p-2 border rounded mb-2"
                  value={testimonial.role}
                  onChange={e => { setEditing(true); setTestimonial(t => ({ ...t, role: e.target.value })); }}
                  placeholder="Role"
                />
                <input
                  className="w-full p-2 border rounded"
                  value={testimonial.company}
                  onChange={e => { setEditing(true); setTestimonial(t => ({ ...t, company: e.target.value })); }}
                  placeholder="Company"
                />
              </>
            ) : (
              <>
                <textarea
                  className="w-full p-2 border rounded mb-2"
                  rows={selectedBlock.type === 'feature' ? 2 : 3}
                  value={localContent}
                  onChange={e => { setEditing(true); setLocalContent(e.target.value); }}
                  placeholder={`Edit ${blockLabels[selectedBlock.type]?.toLowerCase() || 'content'}...`}
                />
                {/* Style controls for headline, subheadline, cta */}
                {['headline', 'subheadline', 'cta'].includes(selectedBlock.type) && (
                  <div className="flex gap-4 mt-2">
                    <div className="flex flex-col flex-1">
                      <label className="text-xs text-gray-500 mb-1">Color</label>
                      <input
                        type="color"
                        value={localStyles.color}
                        onChange={e => { setEditing(true); setLocalStyles(s => ({ ...s, color: e.target.value })); }}
                        className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer"
                        style={{ background: 'none' }}
                      />
                    </div>
                    <div className="flex flex-col flex-1">
                      <label className="text-xs text-gray-500 mb-1">Font Size</label>
                      <input
                        type="number"
                        min={12}
                        max={96}
                        value={parseInt(localStyles.fontSize, 10) || 32}
                        onChange={e => { setEditing(true); setLocalStyles(s => ({ ...s, fontSize: `${e.target.value}px` })); }}
                        className="w-full p-2 border rounded"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            {/* Save/Cancel buttons */}
            {editing && (
              <div className="flex gap-2 mt-4 justify-end">
                <button className="btn-primary px-4 py-1 rounded" onClick={handleSave}>Save</button>
                <button className="btn-secondary px-4 py-1 rounded" onClick={handleCancel}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

export default ContentEditorProperties; 