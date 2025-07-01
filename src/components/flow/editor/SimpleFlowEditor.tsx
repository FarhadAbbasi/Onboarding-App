import React, { useEffect, useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  useDraggable
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Trash2, 
  Save,
  Smartphone,
  Monitor,
  Edit3
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { 
  Button, 
  Headline, 
  Subheadline, 
  FeatureCard, 
  CTA, 
  AlertMessage, 
  Testimonial,
  type ColorScheme
} from '../../ui/UIElements';
import type { ParsedBlock, ParsedTheme } from './AIHtmlParser';
import toast from 'react-hot-toast';

interface SimpleFlowEditorProps {
  projectId: string;
  pageId: string;
  onSave?: (blocks: ParsedBlock[], theme: ParsedTheme) => void;
}

// Component library for drag and drop
const COMPONENTS = [
  { 
    id: 'headline', 
    type: 'headline', 
    label: 'Headline',
    icon: '📝',
    defaultContent: { text: 'Your Awesome Headline', colorScheme: 'indigo', size: 'xl' }
  },
  { 
    id: 'subheadline', 
    type: 'subheadline', 
    label: 'Subheadline',
    icon: '📄',
    defaultContent: { text: 'Supporting text that explains your value', colorScheme: 'gray', size: 'lg' }
  },
  { 
    id: 'cta', 
    type: 'cta', 
    label: 'Call to Action',
    icon: '🚀',
    defaultContent: { text: 'Get Started', colorScheme: 'indigo', size: 'lg' }
  },
  { 
    id: 'feature', 
    type: 'feature', 
    label: 'Feature Card',
    icon: '⭐',
    defaultContent: { 
      title: 'Amazing Feature',
      description: 'This feature will help you achieve your goals faster.',
      icon: '⚡',
      colorScheme: 'blue'
    }
  },
  { 
    id: 'testimonial', 
    type: 'testimonial', 
    label: 'Testimonial',
    icon: '💬',
    defaultContent: {
      quote: 'This app completely transformed how I work!',
      name: 'John Smith',
      role: 'Product Manager',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      colorScheme: 'indigo'
    }
  },
  { 
    id: 'alert', 
    type: 'alert', 
    label: 'Alert Message',
    icon: '⚠️',
    defaultContent: {
      variant: 'info',
      title: 'Important Notice',
      message: 'This is an important message for your users.',
      colorScheme: 'blue'
    }
  }
];

interface EditableBlockProps {
  block: ParsedBlock;
  onUpdate: (updates: Partial<ParsedBlock>) => void;
  onDelete: () => void;
  isDragging?: boolean;
}

function EditableBlock({ block, onUpdate, onDelete, isDragging }: EditableBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    const content = block.content as any;
    setEditText(content?.text || content?.title || content?.quote || content?.message || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const content = block.content as any;
    let updatedContent = { ...content };
    
    if (block.type === 'testimonial') {
      updatedContent.quote = editText;
    } else if (block.type === 'feature') {
      updatedContent.title = editText;
    } else if (block.type === 'alert') {
      updatedContent.message = editText;
    } else {
      updatedContent.text = editText;
    }
    
    onUpdate({ content: updatedContent });
    setIsEditing(false);
  };

  const renderComponent = () => {
    const content = block.content as any || {};

    if (isEditing) {
      return (
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        </div>
      );
    }

    switch (block.type) {
      case 'headline':
        return (
          <Headline
            colorScheme={content.colorScheme || 'indigo'}
            size={content.size || 'xl'}
          >
            {content.text || content.headline || 'Headline'}
          </Headline>
        );
      
      case 'subheadline':
        return (
          <Subheadline
            colorScheme={content.colorScheme || 'gray'}
            size={content.size || 'lg'}
          >
            {content.text || 'Subheadline'}
          </Subheadline>
        );
      
      case 'cta':
        return (
          <CTA
            button_text={content.text || content.button_text || 'Call to Action'}
            colorScheme={content.colorScheme || 'indigo'}
            size={content.size || 'lg'}
          />
        );
      
      case 'feature':
        return (
          <FeatureCard
            title={content.title || 'Feature Title'}
            description={content.description || 'Feature description'}
            icon={content.icon || '⚡'}
            colorScheme={content.colorScheme || 'blue'}
          />
        );
      
      case 'testimonial':
        return (
          <Testimonial
            quote={content.quote || 'Great testimonial'}
            avatarUrl={content.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'}
            name={content.name || 'Customer Name'}
            role={content.role || 'Customer Role'}
            colorScheme={content.colorScheme || 'indigo'}
          />
        );
      
      case 'alert':
        return (
          <AlertMessage
            variant={content.variant || 'info'}
            title={content.title}
            colorScheme={content.colorScheme || 'blue'}
          >
            {content.message || 'Alert message'}
          </AlertMessage>
        );
      
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg">
            <span className="text-sm text-gray-600">Unknown: {block.type}</span>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? 'z-50' : ''}`}
    >
      <div className="relative">
        {/* Controls */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            {...attributes}
            {...listeners}
            className="p-1 bg-white border border-gray-300 rounded shadow-sm cursor-grab active:cursor-grabbing hover:bg-gray-50"
          >
            <GripVertical size={14} className="text-gray-500" />
          </div>
          <button
            onClick={handleEdit}
            className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 bg-white border border-gray-300 rounded shadow-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        {/* Component */}
        <div className="hover:ring-2 hover:ring-blue-200 rounded-lg transition-all">
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

function DraggableComponent({ item }: { item: typeof COMPONENTS[0] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ 
    id: item.id,
    data: { type: item.type, content: item.defaultContent }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`bg-white border border-gray-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{item.icon}</span>
        <div>
          <div className="font-medium text-sm text-gray-900">{item.label}</div>
          <div className="text-xs text-gray-500">Drag to add</div>
        </div>
      </div>
    </div>
  );
}

export function SimpleFlowEditor({ projectId, pageId, onSave }: SimpleFlowEditorProps) {
  const [blocks, setBlocks] = useState<ParsedBlock[]>([]);
  const [theme, setTheme] = useState<ParsedTheme>({ html: '' });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: blockRows, error: blockError } = await supabase
          .from('content_blocks')
          .select('*')
          .eq('project_id', projectId)
          .eq('page_id', pageId)
          .order('order_index', { ascending: true });

        if (blockError) throw blockError;

        const { data: pageRow, error: pageError } = await supabase
          .from('onboarding_pages')
          .select('theme')
          .eq('project_id', projectId)
          .eq('page_id', pageId)
          .single();

        if (pageError && !pageError.message.includes('no rows')) throw pageError;

        const loadedBlocks = blockRows?.map((b: any) => ({
          id: b.block_id || b.id,
          type: b.type,
          content: typeof b.content === 'string' && b.content.startsWith('{') 
            ? JSON.parse(b.content) 
            : b.content,
          styles: b.styles
        })) || [];

        setBlocks(loadedBlocks);
        setTheme(pageRow?.theme ? { html: pageRow.theme } : { html: '' });
      } catch (error) {
        console.error('Load error:', error);
        toast.error('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, pageId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Adding new component
    if (active.data.current?.type && !blocks.find(b => b.id === active.id)) {
      const newBlock: ParsedBlock = {
        id: `block-${Date.now()}`,
        type: active.data.current.type,
        content: active.data.current.content
      };
      
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
      return;
    }

    // Reordering
    if (active.id !== over.id) {
      setBlocks(prev => {
        const oldIndex = prev.findIndex(b => b.id === active.id);
        const newIndex = prev.findIndex(b => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleBlockUpdate = (blockId: string, updates: Partial<ParsedBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  };

  const handleBlockDelete = (blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase
        .from('content_blocks')
        .delete()
        .eq('project_id', projectId)
        .eq('page_id', pageId);

      if (blocks.length > 0) {
        const blocksToInsert = blocks.map((block, index) => ({
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

      await supabase
        .from('onboarding_pages')
        .upsert({
          project_id: projectId,
          page_id: pageId,
          theme: theme.html
        });

      toast.success('Page saved!');
      onSave?.(blocks, theme);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-1">Components</h2>
            <p className="text-xs text-gray-600">Drag to canvas</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {COMPONENTS.map(item => (
              <DraggableComponent key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="font-semibold text-gray-900">Page Editor</h1>
                <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`p-1.5 rounded transition-colors ${
                      previewMode === 'mobile' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone size={14} />
                  </button>
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`p-1.5 rounded transition-colors ${
                      previewMode === 'desktop' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Monitor size={14} />
                  </button>
                </div>
              </div>
              
              <Button
                onClick={handleSave}
                disabled={saving}
                colorScheme="green"
                size="sm"
                leftIcon={<Save size={14} />}
                isLoading={saving}
              >
                Save
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-gray-100 p-6">
            <div className={`mx-auto bg-white rounded-lg shadow overflow-hidden ${
              previewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
            }`}>
              <div className="min-h-screen p-8 pl-14"> {/* Extra left padding for controls */}
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-6">
                    {blocks.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-4">📱</div>
                        <h3 className="text-lg font-medium mb-2">Start Building</h3>
                        <p className="text-sm">Drag components from sidebar</p>
                      </div>
                    ) : (
                      blocks.map(block => (
                        <EditableBlock
                          key={block.id}
                          block={block}
                          onUpdate={(updates) => handleBlockUpdate(block.id, updates)}
                          onDelete={() => handleBlockDelete(block.id)}
                          isDragging={activeId === block.id}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            </div>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
              <div className="text-sm font-medium text-gray-900">
                {COMPONENTS.find(item => item.id === activeId)?.label || 'Component'}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
} 