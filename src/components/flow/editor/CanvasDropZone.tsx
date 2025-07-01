import React, { useState } from 'react';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { 
  GripVertical, 
  Trash2, 
  Edit3
} from 'lucide-react';
import { 
  CTA,
  Headline, 
  Subheadline,
  Button,
  Testimonial,
  type ColorScheme,
  type Size,
  FeatureList
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

  // Update edit content when block content changes (but preserve during editing)
  React.useEffect(() => {
    if (!isEditing) {
      setEditContent(block.content);
    }
  }, [block.content, isEditing]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Don't reset editContent here - use current block content
  };

  const handleSaveEdit = () => {
    onUpdate({ content: editContent });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(block.content); // Reset to original
    setIsEditing(false);
  };

  const renderComponent = () => {
    const content = block.content || {};
    
    // Extract customizable properties with defaults
    const colorScheme = (content as any)?.colorScheme as ColorScheme || 'indigo';
    const size = (content as any)?.size as Size || 'md';
    const variant = (content as any)?.variant || 'solid';

    switch (block.type) {
      case 'headline':
        return (
          <Headline
            size={size === 'xs' ? 'sm' : size === 'sm' ? 'md' : size === 'md' ? 'lg' : size === 'lg' ? 'xl' : size === 'xl' ? '2xl' : '3xl'}
            colorScheme={colorScheme}
            className={`${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          >
            {(content as any)?.headline || (content as any)?.text || 'Your Headline Here'}
          </Headline>
        );

      case 'subheadline':
        return (
          <Subheadline
            size={size}
            colorScheme={colorScheme}
            className={`${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          >
            {(content as any)?.subheadline || (content as any)?.text || 'Your subheadline description goes here'}
          </Subheadline>
        );

      case 'paragraph':
        return (
          <p className={`text-${size} text-${colorScheme}-800 leading-relaxed ${isSelected ? 'ring-2 ring-blue-500 rounded p-2' : ''}`}>
            {(content as any)?.text || 'Your paragraph text content goes here. Add meaningful content that engages your users.'}
          </p>
        );

      case 'cta':
        return (
          <div className="space-y-4">
            {(content as any)?.headline && (
              <Headline size="lg" colorScheme={colorScheme}>
                {(content as any).headline}
              </Headline>
            )}
            <CTA
              button_text={(content as any)?.button_text || (content as any)?.text || 'Get Started'}
              headline={(content as any)?.headline}
              colorScheme={colorScheme}
              size={size}
              variant={variant as any}
              className={isSelected ? 'ring-2 ring-blue-500 rounded' : ''}
            />
          </div>
        );

      case 'feature-list':
        const features = (content as any)?.features || ['Feature 1', 'Feature 2', 'Feature 3'];
        return (
          <div className={`${isSelected ? 'ring-2 ring-blue-500 rounded p-4' : ''}`}>
            <FeatureList
              title={(content as any)?.title || 'Key Features'}
              features={features}
              colorScheme={colorScheme}
              size={size}
              titleSize={(content as any)?.titleSize || 'lg'}
              titleColorScheme={(content as any)?.titleColorScheme || colorScheme}
              variant="checkmarks"
            />
          </div>
        );

      case 'testimonial':
        return (
          <Testimonial
            quote={(content as any)?.quote || (content as any)?.text || 'This product has transformed how we work. Highly recommended!'}
            avatarUrl="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            name={(content as any)?.author || 'John Doe'}
            role={(content as any)?.role || 'CEO'}
            colorScheme={colorScheme}
            variant={variant as any}
            className={`${isSelected ? 'ring-2 ring-blue-500' : ''}`}
          />
        );

      case 'text-input':
        const inputContent = typeof content === 'string' ? { label: content } : content as any;
        return (
          <div className={`w-full ${isSelected ? 'ring-2 ring-blue-500 rounded p-2' : ''}`}>
            <label className={`block text-sm font-medium text-${colorScheme}-700 mb-1`}>
              {inputContent?.label || 'Input Label'}
              {inputContent?.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              placeholder={inputContent?.placeholder || 'Enter text...'}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-${colorScheme}-500 focus:border-${colorScheme}-500 text-${size}`}
              disabled
            />
          </div>
        );

      case 'spacer':
        const spacerHeight = {
          xs: 'h-2',
          sm: 'h-4', 
          md: 'h-8',
          lg: 'h-12',
          xl: 'h-16',
          '2xl': 'h-24'
        }[(content as any)?.height || 'md'];
        
        return (
          <div className={`w-full ${spacerHeight} ${isSelected ? 'ring-2 ring-blue-500 rounded bg-gray-100 border-2 border-dashed border-gray-300' : ''}`}>
            {isSelected && (
              <div className="flex items-center justify-center h-full text-xs text-gray-500">
                Spacer ({(content as any)?.height || 'md'})
              </div>
            )}
          </div>
        );

      case 'icon':
        const iconSize = {
          xs: 'text-sm',
          sm: 'text-base',
          md: 'text-xl', 
          lg: 'text-3xl',
          xl: 'text-4xl',
          '2xl': 'text-6xl'
        }[(content as any)?.size || 'lg'];
        
        const iconAlignment = (content as any)?.centered ? 'text-center' : 'text-left';
        
        return (
          <div className={`w-full ${iconAlignment} ${isSelected ? 'ring-2 ring-blue-500 rounded p-2' : ''}`}>
            <span className={`${iconSize} text-${colorScheme}-600`}>
              {(content as any)?.icon || '⭐'}
            </span>
          </div>
        );

      case 'alert':
        return (
          <div className={`p-4 rounded-md border ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {(content as any)?.variant === 'success' && <span className="text-green-500">✓</span>}
                {(content as any)?.variant === 'error' && <span className="text-red-500">✕</span>}
                {(content as any)?.variant === 'warning' && <span className="text-yellow-500">⚠</span>}
                {(!((content as any)?.variant) || (content as any)?.variant === 'info') && <span className="text-blue-500">ℹ</span>}
              </div>
              <div className="ml-3">
                {(content as any)?.title && (
                  <h4 className={`text-${size} font-medium text-${colorScheme}-900`}>
                    {(content as any).title}
                  </h4>
                )}
                <p className={`text-${size} text-${colorScheme}-700`}>
                  {(content as any)?.message || 'Alert message goes here'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'link':
        return (
          <a
            href="#"
            className={`text-${colorScheme}-600 hover:text-${colorScheme}-500 transition-colors text-${size} ${
              (content as any)?.underline !== false ? 'underline underline-offset-4' : ''
            } ${(content as any)?.variant === 'bold' ? 'font-semibold' : ''} ${isSelected ? 'ring-2 ring-blue-500 rounded px-1' : ''}`}
          >
            {(content as any)?.text || 'Link Text'}
          </a>
        );

      case 'permission-request':
        return (
          <div className={`bg-white border border-gray-200 rounded-lg p-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="text-center space-y-3">
              <div className={`w-12 h-12 bg-${colorScheme}-100 rounded-full flex items-center justify-center mx-auto`}>
                <span className={`text-${colorScheme}-600 text-xl`}>🔒</span>
              </div>
              <h3 className={`text-${size} font-semibold text-gray-900`}>
                {(content as any)?.title || 'Permission Required'}
              </h3>
              <p className={`text-sm text-gray-600`}>
                {(content as any)?.description || 'This app needs permission to function properly'}
              </p>
              <button
                className={`bg-${colorScheme}-600 text-white py-2 px-6 rounded-md hover:bg-${colorScheme}-700 transition-colors text-${size} font-medium`}
                disabled
              >
                {(content as any)?.button_text || 'Allow'}
              </button>
            </div>
          </div>
        );

      case 'footer':
        return (
          <footer className={`py-6 text-center text-${size} text-${colorScheme}-600 border-t border-${colorScheme}-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
            {(content as any)?.text || '© 2024 Your Company. All rights reserved.'}
          </footer>
        );

      default:
        // Fallback for unknown types
        return (
          <div className={`p-4 border border-gray-200 rounded bg-gray-50 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="text-sm text-gray-600 mb-2">Component: {block.type}</div>
            <div className="text-xs text-gray-500 font-mono">
              {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
            </div>
          </div>
        );
    }
  };

  const renderEditor = () => {
    switch (block.type) {
      case 'headline':
      case 'subheadline':
      case 'paragraph':
        return (
          <input
            type="text"
            value={(editContent as any)?.text || (editContent as any)?.headline || (editContent as any)?.subheadline || ''}
            onChange={(e) => setEditContent({ ...editContent, text: e.target.value, headline: e.target.value, subheadline: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder={`Enter ${block.type} text`}
            autoFocus
          />
        );
      case 'cta':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={(editContent as any)?.button_text || (editContent as any)?.text || ''}
              onChange={(e) => setEditContent({ ...editContent, button_text: e.target.value, text: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Button text"
              autoFocus
            />
            <input
              type="text"
              value={(editContent as any)?.headline || ''}
              onChange={(e) => setEditContent({ ...editContent, headline: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="CTA headline (optional)"
            />
          </div>
        );
      case 'feature-list':
        return (
          <div className="space-y-2">
            {((editContent as any)?.features || ['Feature 1', 'Feature 2', 'Feature 3']).map((feature: string, index: number) => (
              <input
                key={index}
                type="text"
                value={feature}
                onChange={(e) => {
                  const features = [...((editContent as any)?.features || [])];
                  features[index] = e.target.value;
                  setEditContent({ ...editContent, features });
                }}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder={`Feature ${index + 1}`}
              />
            ))}
          </div>
        );
      case 'testimonial':
        return (
          <div className="space-y-2">
            <textarea
              value={(editContent as any)?.quote || (editContent as any)?.text || ''}
              onChange={(e) => setEditContent({ ...editContent, quote: e.target.value, text: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Testimonial quote"
              rows={3}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={(editContent as any)?.author || ''}
                onChange={(e) => setEditContent({ ...editContent, author: e.target.value })}
                className="p-2 border border-gray-300 rounded"
                placeholder="Author name"
              />
              <input
                type="text"
                value={(editContent as any)?.role || ''}
                onChange={(e) => setEditContent({ ...editContent, role: e.target.value })}
                className="p-2 border border-gray-300 rounded"
                placeholder="Role"
              />
            </div>
            <input
              type="text"
              value={(editContent as any)?.company || ''}
              onChange={(e) => setEditContent({ ...editContent, company: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Company"
            />
          </div>
        );
      case 'paragraph':
        return (
          <textarea
            value={(editContent as any)?.text || ''}
            onChange={(e) => setEditContent({ ...editContent, text: e.target.value })}
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

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group relative bg-blue-50 border-2 border-blue-200 rounded-lg p-4"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700">Editing {block.type}</span>
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
          {renderEditor()}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging || isSortableDragging ? 'opacity-50 z-50' : ''}`}
    >
      <div className="relative">
        {/* Controls */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
              ? 'ring-2 ring-blue-500 bg-blue-50/30' 
              : 'hover:ring-2 hover:ring-blue-200/50'
          }`}
          onClick={() => onSelect?.()}
        >
          {renderComponent()}
        </div>
      </div>
    </div>
  );
}

interface DropZoneProps {
  children: React.ReactNode;
  isEmpty: boolean;
}

function DropZone({ children, isEmpty }: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'canvas-drop-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-full transition-all duration-200 ${
        isOver && isEmpty 
          ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg' 
          : isOver 
          ? 'bg-blue-50/50' 
          : ''
      }`}
    >
      {children}
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
  // Extract theme from structured data
  const getThemeStyles = () => {
    if (!theme?.html) return { backgroundClass: 'bg-gradient-to-br from-blue-50 to-indigo-50', textClass: 'text-gray-900' };
    
    try {
      // Try to parse theme as JSON first (new structure)
      const themeData = JSON.parse(theme.html);
      return {
        backgroundClass: themeData.backgroundClass || 'bg-gradient-to-br from-blue-50 to-indigo-50',
        textClass: themeData.textClass || 'text-gray-900'
      };
    } catch (error) {
      // Fallback to old HTML parsing
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(theme.html, 'text/html');
        const main = doc.body?.querySelector('main');
        const mainClasses = main?.className || '';
        
        const backgroundMatch = mainClasses.match(/bg-[\w-]+/g);
        const textMatch = mainClasses.match(/text-[\w-]+/g);
        
        return {
          backgroundClass: backgroundMatch?.join(' ') || 'bg-gradient-to-br from-blue-50 to-indigo-50',
          textClass: textMatch?.join(' ') || 'text-gray-900'
        };
      } catch {
        return { backgroundClass: 'bg-gradient-to-br from-blue-50 to-indigo-50', textClass: 'text-gray-900' };
      }
    }
  };
  
  const { backgroundClass, textClass } = getThemeStyles();
  
  return (
    <div className={`min-h-full ${className}`}>
      {/* Canvas container with clean theme application */}
      <div className={`canvas-theme-container min-h-full p-8 pl-14 ${backgroundClass} ${textClass}`}>
        <DropZone isEmpty={blocks.length === 0}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-6 min-h-[400px]">
              {blocks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-4">👆</div>
                  <h3 className="text-lg font-medium mb-2">Start Building</h3>
                  <p className="text-sm">Drag components from the left sidebar to get started</p>
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg max-w-sm mx-auto">
                    <p className="text-xs text-gray-600">
                      💡 <strong>Tip:</strong> Select any component to customize its colors, size, and content in the properties panel
                    </p>
                  </div>
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
        </DropZone>
      </div>
    </div>
  );
} 