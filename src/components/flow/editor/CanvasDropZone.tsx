import React, { useState } from 'react';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable,
  arrayMove 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Trash2, 
  Edit3
} from 'lucide-react';
import { 
  Button, 
  Headline, 
  Subheadline, 
  FeatureCard, 
  CTAButton, 
  AlertMessage, 
  Testimonial,
  Input,
  type ColorScheme
} from '../../ui/UIElements';
import type { ParsedBlock, ParsedTheme } from './AIHtmlParser';

interface EditableBlockProps {
  block: ParsedBlock;
  onUpdate: (updates: Partial<ParsedBlock>) => void;
  onDelete: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isDragging?: boolean;
}

function EditableBlock({ block, onUpdate, onDelete, onSelect, isSelected, isDragging }: EditableBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(block.content);
  
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
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(block.content);
  };

  const handleSaveEdit = () => {
    onUpdate({ content: editContent });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(block.content);
    setIsEditing(false);
  };

  const renderComponent = () => {
    const content = block.content as any;
    
    if (isEditing) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="text-sm font-medium text-blue-900">Editing {block.type}</div>
          {renderEditor()}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit}>Save</Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
          </div>
        </div>
      );
    }

    switch (block.type) {
      case 'headline':
        return (
          <Headline size="lg" className="text-center">
            {content.headline || 'Your Amazing Headline'}
          </Headline>
        );
      case 'subheadline':
        return (
          <Subheadline size="md" className="text-center text-gray-600">
            {content.subheadline || 'Supporting text that explains more'}
          </Subheadline>
        );
      case 'cta':
        return (
          <div className="text-center space-y-4">
            {content.headline && (
              <Headline size="md">{content.headline}</Headline>
            )}
            <CTAButton size="lg" colorScheme="blue">
              {content.button_text || 'Get Started'}
            </CTAButton>
          </div>
        );
      case 'feature-list':
        return (
          <div className="space-y-3">
            <Headline size="md" className="text-center">Features</Headline>
            <div className="grid gap-3">
              {(content.features || []).map((feature: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-800">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'testimonial':
        return (
          <Testimonial
            quote={content.quote || 'This product changed my life!'}
            avatarUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
            name={content.author || 'Happy Customer'}
            role={`${content.role || 'CEO'} at ${content.company || 'Amazing Corp'}`}
            className="mx-auto"
          />
        );
      case 'paragraph':
        return (
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {content.text || 'Add your compelling text content here.'}
            </p>
          </div>
        );
      case 'input':
        return (
          <div className="space-y-2">
            {content.label && (
              <label className="block text-sm font-medium text-gray-700">
                {content.label}
              </label>
            )}
            <Input
              placeholder={content.placeholder || 'Enter text...'}
              size="md"
              className="w-full"
            />
          </div>
        );
      case 'alert':
        return (
          <AlertMessage 
            variant="info" 
            title={content.title}
            className="w-full"
          >
            {content.message || 'Alert message goes here.'}
          </AlertMessage>
        );
      case 'link':
        return (
          <a 
            href={content.href || '#'} 
            className="text-blue-600 hover:text-blue-800 underline"
            target={content.href?.startsWith('http') ? '_blank' : undefined}
            rel={content.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {content.text || 'Link text'}
          </a>
        );
      case 'footer':
        return (
          <footer className="text-center text-sm text-gray-500 py-4 border-t border-gray-200">
            {content.text || 'Footer content'}
          </footer>
        );
      default:
        return (
          <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <span className="text-gray-500">Unknown component: {block.type}</span>
          </div>
        );
    }
  };

  const renderEditor = () => {
    const content = block.content as any;
    
    switch (block.type) {
      case 'headline':
        return (
          <input
            type="text"
            value={content.headline || ''}
            onChange={(e) => setEditContent({ ...content, headline: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter headline"
          />
        );
      case 'subheadline':
        return (
          <input
            type="text"
            value={content.subheadline || ''}
            onChange={(e) => setEditContent({ ...content, subheadline: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter subheadline"
          />
        );
      case 'cta':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={content.headline || ''}
              onChange={(e) => setEditContent({ ...content, headline: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="CTA headline (optional)"
            />
            <input
              type="text"
              value={content.button_text || ''}
              onChange={(e) => setEditContent({ ...content, button_text: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Button text"
            />
          </div>
        );
      case 'feature-list':
        return (
          <div className="space-y-2">
            {(content.features || []).map((feature: string, i: number) => (
              <input
                key={i}
                type="text"
                value={feature}
                onChange={(e) => {
                  const newFeatures = [...(content.features || [])];
                  newFeatures[i] = e.target.value;
                  setEditContent({ ...content, features: newFeatures });
                }}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder={`Feature ${i + 1}`}
              />
            ))}
            <button
              onClick={() => {
                const newFeatures = [...(content.features || []), ''];
                setEditContent({ ...content, features: newFeatures });
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add feature
            </button>
          </div>
        );
      case 'testimonial':
        return (
          <div className="space-y-2">
            <textarea
              value={content.quote || ''}
              onChange={(e) => setEditContent({ ...content, quote: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Testimonial quote"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={content.author || ''}
                onChange={(e) => setEditContent({ ...content, author: e.target.value })}
                className="p-2 border border-gray-300 rounded"
                placeholder="Author name"
              />
              <input
                type="text"
                value={content.role || ''}
                onChange={(e) => setEditContent({ ...content, role: e.target.value })}
                className="p-2 border border-gray-300 rounded"
                placeholder="Role"
              />
            </div>
            <input
              type="text"
              value={content.company || ''}
              onChange={(e) => setEditContent({ ...content, company: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Company"
            />
          </div>
        );
      case 'paragraph':
        return (
          <textarea
            value={content.text || ''}
            onChange={(e) => setEditContent({ ...content, text: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter your text content"
            rows={4}
          />
        );
      default:
        return (
          <textarea
            value={JSON.stringify(editContent, null, 2)}
            onChange={(e) => {
              try {
                setEditContent(JSON.parse(e.target.value));
              } catch {
                // Invalid JSON, ignore
              }
            }}
            className="w-full p-2 border border-gray-300 rounded font-mono text-sm"
            rows={6}
          />
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
        <div 
          className={`rounded-lg transition-all cursor-pointer ${
            isSelected 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:ring-2 hover:ring-blue-200'
          }`}
          onClick={() => onSelect?.()}
        >
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

interface CanvasDropZoneProps {
  blocks: ParsedBlock[];
  theme?: ParsedTheme;
  onBlockUpdate: (blockId: string, updates: Partial<ParsedBlock>) => void;
  onBlockDelete: (blockId: string) => void;
  onBlockSelect?: (block: ParsedBlock) => void;
  selectedBlockId?: string;
  activeId?: string | null;
  className?: string;
}

export function CanvasDropZone({ 
  blocks, 
  theme,
  onBlockUpdate, 
  onBlockDelete, 
  onBlockSelect,
  selectedBlockId,
  activeId,
  className 
}: CanvasDropZoneProps) {
  // Extract theme styles from HTML
  const getThemeStyles = () => {
    if (!theme?.html) return {};
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(theme.html, 'text/html');
      
      // Extract body classes and styles
      const body = doc.body;
      const bodyClasses = body?.className || '';
      
      // Extract main wrapper classes
      const main = body?.querySelector('main');
      const mainClasses = main?.className || '';
      
      // Extract custom CSS from style tags
      const styleTags = doc.querySelectorAll('style');
      let customCSS = '';
      styleTags.forEach(style => {
        customCSS += style.textContent || '';
      });
      
      return {
        bodyClasses,
        mainClasses,
        customCSS
      };
    } catch (error) {
      console.warn('Failed to extract theme styles:', error);
      return {};
    }
  };
  
  const themeStyles = getThemeStyles();
  
  return (
    <div className={`min-h-full ${className}`}>
      {/* Apply custom CSS from theme */}
      {themeStyles.customCSS && (
        <style dangerouslySetInnerHTML={{ __html: themeStyles.customCSS }} />
      )}
      
      {/* Main wrapper with theme styles */}
      <div 
        className={`min-h-full p-8 pl-14 ${themeStyles.bodyClasses} ${themeStyles.mainClasses}`}
        style={{ 
          background: themeStyles.bodyClasses?.includes('bg-gradient') ? undefined : 'inherit'
        }}
      >
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-6">
          {blocks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">👆</div>
              <h3 className="text-lg font-medium mb-2">Start Building</h3>
              <p className="text-sm">Drag components from the left sidebar</p>
            </div>
          ) : (
            blocks.map(block => (
              <EditableBlock
                key={block.id}
                block={block}
                onUpdate={(updates) => onBlockUpdate(block.id, updates)}
                onDelete={() => onBlockDelete(block.id)}
                onSelect={() => onBlockSelect?.(block)}
                isSelected={selectedBlockId === block.id}
                isDragging={activeId === block.id}
              />
            ))
          )}
        </div>
      </SortableContext>
      </div>
    </div>
  );
} 