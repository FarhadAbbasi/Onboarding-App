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
  Edit3,
  Wand2
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
import type { AIGeneratedTheme, ComponentCustomization } from '../../../lib/aiThemeGenerator';

interface EditableBlockProps {
  block: ParsedBlock;
  theme?: AIGeneratedTheme;
  customization?: ComponentCustomization;
  onUpdate: (updates: Partial<ParsedBlock>) => void;
  onDelete: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isDragging?: boolean;
}

function EditableBlock({ 
  block, 
  theme, 
  customization, 
  onUpdate, 
  onDelete, 
  onSelect, 
  isSelected, 
  isDragging 
}: EditableBlockProps) {
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
  };

  const handleSaveEdit = () => {
    onUpdate({ content: editContent });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(block.content);
    setIsEditing(false);
  };

  // Get component styling based on theme and customizations
  const getComponentStyling = () => {
    const content = block.content || {};
    const styles = block.styles || {};
    
    // Start with styles-based styling, fallback to content, then defaults
    let colorScheme = (styles as any)?.colorScheme || (content as any)?.colorScheme as ColorScheme || 'indigo';
    let size = (styles as any)?.size || (content as any)?.size as Size || 'md';
    let variant = (styles as any)?.variant || (content as any)?.variant || 'solid';
    
    // Apply customization overrides if available
    if (customization) {
      if (customization.colorScheme) {
        colorScheme = customization.colorScheme as ColorScheme;
      }
      if (customization.size) {
        size = customization.size as Size;
      }
      if (customization.variant) {
        variant = customization.variant;
      }
    }

    // Generate custom CSS from block styles, theme and customization
    let customStyles: React.CSSProperties = {};
    
    // Apply block-level styles first
    const blockStyles = block.styles || {};
    if (blockStyles) {
      if ((blockStyles as any).textAlign) {
        customStyles.textAlign = (blockStyles as any).textAlign;
      }
      if ((blockStyles as any).fontWeight) {
        customStyles.fontWeight = (blockStyles as any).fontWeight;
      }
      if ((blockStyles as any).marginTop) {
        const marginMap = { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' };
        customStyles.marginTop = marginMap[(blockStyles as any).marginTop as keyof typeof marginMap] || (blockStyles as any).marginTop;
      }
      if ((blockStyles as any).marginBottom) {
        const marginMap = { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' };
        customStyles.marginBottom = marginMap[(blockStyles as any).marginBottom as keyof typeof marginMap] || (blockStyles as any).marginBottom;
      }
    }
    
    // Apply customization overrides
    if (customization?.customStyles) {
      const customizationStyles = customization.customStyles;
      
      // Apply color overrides
      if (customizationStyles.colors?.background) {
        customStyles.backgroundColor = customizationStyles.colors.background;
      }
      if (customizationStyles.colors?.text) {
        customStyles.color = customizationStyles.colors.text;
      }
      if (customizationStyles.colors?.border) {
        customStyles.borderColor = customizationStyles.colors.border;
      }
      
      // Apply typography overrides
      if (customizationStyles.typography?.fontSize) {
        customStyles.fontSize = customizationStyles.typography.fontSize;
      }
      if (customizationStyles.typography?.fontWeight) {
        customStyles.fontWeight = customizationStyles.typography.fontWeight;
      }
      if (customizationStyles.typography?.lineHeight) {
        customStyles.lineHeight = customizationStyles.typography.lineHeight;
      }
      if (customizationStyles.typography?.textAlign) {
        customStyles.textAlign = customizationStyles.typography.textAlign;
      }
      
      // Apply spacing overrides
      if (customizationStyles.spacing?.padding) {
        customStyles.padding = customizationStyles.spacing.padding;
      }
      if (customizationStyles.spacing?.margin) {
        customStyles.margin = customizationStyles.spacing.margin;
      }
      
      // Apply effects overrides
      if (customizationStyles.effects?.borderRadius) {
        customStyles.borderRadius = customizationStyles.effects.borderRadius;
      }
      if (customizationStyles.effects?.boxShadow) {
        customStyles.boxShadow = customizationStyles.effects.boxShadow;
      }
      if (customizationStyles.effects?.transition) {
        customStyles.transition = customizationStyles.effects.transition;
      }
    }

    return { colorScheme, size, variant, customStyles };
  };

  const renderComponent = () => {
    const content = block.content || {};
    const styles = block.styles || {};
    const { colorScheme, size, variant, customStyles } = getComponentStyling();
    
    // Common wrapper for applying custom styles and selection
    const WrapperDiv = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
      <div 
        style={{
          ...customStyles,
          // Ensure theme colors are applied when no custom styles exist
          ...((!customStyles.backgroundColor && theme) && { backgroundColor: theme.neutralColors.surface }),
          ...((!customStyles.color && theme) && { color: theme.neutralColors.text.primary }),
          ...((!customStyles.fontFamily && theme) && { fontFamily: theme.typography.fontFamily.primary })
        }}
        className={`${className} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded' : ''} transition-all duration-200`}
      >
        {children}
      </div>
    );

    switch (block.type) {
      case 'headline':
        return (
          <WrapperDiv>
            <Headline
              size={size === 'xs' ? 'sm' : size === 'sm' ? 'md' : size === 'md' ? 'lg' : size === 'lg' ? 'xl' : size === 'xl' ? '2xl' : '3xl'}
              colorScheme={colorScheme}
            >
              {((content as any)?.headline || (content as any)?.text || 'Your Headline Here')}
            </Headline>
          </WrapperDiv>
        );

      case 'subheadline':
        return (
          <WrapperDiv>
            <Subheadline
              size={size}
              colorScheme={colorScheme}
            >
              {((content as any)?.text || 'Your subheadline here')}
            </Subheadline>
          </WrapperDiv>
        );

      case 'paragraph':
        return (
          <WrapperDiv>
            <p className={`text-${colorScheme}-600 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
              {((content as any)?.text || 'Your paragraph text here')}
            </p>
          </WrapperDiv>
        );

      case 'spacer':
        const spacerHeight = (styles as any)?.height || (content as any)?.height || 'md';
        const heightMap = { xs: '0.5rem', sm: '1rem', md: '2rem', lg: '3rem', xl: '4rem', '2xl': '5rem' };
        return (
          <div style={{ height: heightMap[spacerHeight as keyof typeof heightMap] || '2rem' }} />
        );

      case 'icon':
        const iconSize = (styles as any)?.size || (content as any)?.size || 'md';
        const sizeMap = { xs: '1rem', sm: '1.5rem', md: '2rem', lg: '2.5rem', xl: '3rem', '2xl': '4rem' };
        return (
          <WrapperDiv className={(styles as any)?.centered || (content as any)?.centered ? 'text-center' : ''}>
            <span style={{ fontSize: sizeMap[iconSize as keyof typeof sizeMap] || '2rem' }}>
              {((content as any)?.icon || '⭐')}
            </span>
          </WrapperDiv>
        );

      case 'cta':
        return (
          <WrapperDiv>
            <CTA
              button_text={((content as any)?.button_text || 'Click me')}
              headline={((content as any)?.headline || 'Ready to get started?')}
              colorScheme={colorScheme}
              size={size}
              variant={variant}
            />
          </WrapperDiv>
        );

      case 'feature-list':
        const features = (content as any)?.features || ['Feature 1', 'Feature 2', 'Feature 3'];
        return (
          <WrapperDiv>
            <FeatureList 
              features={features}
              colorScheme={colorScheme}
              size={size}
            />
          </WrapperDiv>
        );

      case 'testimonial':
        return (
          <WrapperDiv>
            <Testimonial
              quote={((content as any)?.quote || 'This app changed my life!')}
              author={((content as any)?.author || 'Happy User')}
              role={((content as any)?.role || 'Customer')}
              company={((content as any)?.company || 'Company Inc.')}
              colorScheme={colorScheme}
              size={size}
            />
          </WrapperDiv>
        );

      case 'text-input':
        return (
          <WrapperDiv>
            <div className="space-y-2">
              <label className={`block text-sm font-medium text-${colorScheme}-700`}>
                {((content as any)?.label || 'Input Label')}
              </label>
              <input
                type="text"
                placeholder={((content as any)?.placeholder || 'Enter text...')}
                required={((content as any)?.required || false)}
                className={`w-full px-3 py-2 border border-${colorScheme}-300 rounded-lg focus:ring-2 focus:ring-${colorScheme}-500 focus:border-transparent`}
              />
            </div>
          </WrapperDiv>
        );

      case 'alert':
        const alertVariant = (content as any)?.variant || 'info';
        const alertColorMap = {
          info: 'blue',
          success: 'green', 
          warning: 'yellow',
          error: 'red'
        };
        const alertColor = alertColorMap[alertVariant as keyof typeof alertColorMap] || colorScheme;
        return (
          <WrapperDiv>
            <div className={`p-4 rounded-lg bg-${alertColor}-50 border border-${alertColor}-200`}>
              <h4 className={`font-medium text-${alertColor}-800`}>
                {((content as any)?.title || 'Alert Title')}
              </h4>
              <p className={`text-sm text-${alertColor}-700 mt-1`}>
                {((content as any)?.message || 'Alert message goes here')}
              </p>
            </div>
          </WrapperDiv>
        );

      case 'link':
        return (
          <WrapperDiv>
            <a
              href={((content as any)?.href || '#')}
              className={`text-${colorScheme}-600 hover:text-${colorScheme}-800 ${
                (styles as any)?.underline || (content as any)?.underline ? 'underline' : ''
              } ${
                (styles as any)?.fontWeight || (content as any)?.fontWeight === 'bold' ? 'font-bold' : ''
              }`}
            >
              {((content as any)?.text || 'Link text')}
            </a>
          </WrapperDiv>
        );

      case 'permission-request':
        return (
          <WrapperDiv>
            <div className={`p-6 rounded-lg bg-${colorScheme}-50 border border-${colorScheme}-200 text-center`}>
              <h3 className={`text-lg font-semibold text-${colorScheme}-900 mb-2`}>
                {((content as any)?.title || 'Permission Required')}
              </h3>
              <p className={`text-${colorScheme}-700 mb-4`}>
                {((content as any)?.description || 'We need permission to continue')}
              </p>
              <Button
                colorScheme={colorScheme}
                size={size}
                variant={variant}
              >
                {((content as any)?.button_text || 'Allow')}
              </Button>
            </div>
          </WrapperDiv>
        );

      case 'footer':
        return (
          <WrapperDiv>
            <footer className={`text-center py-4 text-${colorScheme}-600 ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'
            }`}>
              {((content as any)?.text || 'Footer text here')}
            </footer>
          </WrapperDiv>
        );

      default:
        return (
          <WrapperDiv>
            <div className="p-4 bg-gray-100 rounded border-2 border-dashed border-gray-300">
              <p className="text-gray-600 text-sm">Unknown block type: {block.type}</p>
              <pre className="text-xs text-gray-500 mt-2 overflow-hidden">
                {JSON.stringify(content, null, 2)}
              </pre>
            </div>
          </WrapperDiv>
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
            onChange={(e) => setEditContent({ ...editContent as any, text: e.target.value, headline: e.target.value, subheadline: e.target.value })}
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
  theme?: AIGeneratedTheme | null;
  componentCustomizations?: ComponentCustomization[];
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
  componentCustomizations = [],
  onBlockUpdate, 
  onBlockDelete, 
  onBlockSelect,
  selectedBlockId,
  activeId,
  className 
}: CanvasDropZoneProps) {
  const blockIds = blocks.map(block => block.id);

  const { isOver } = useDroppable({
    id: 'canvas-drop-zone',
  });

  // Get customization for a specific component type
  const getCustomizationForType = (type: string): ComponentCustomization | undefined => {
    return componentCustomizations.find(c => c.type === type);
  };

  const getThemeStyles = () => {
    if (!theme) return {};
    
    return {
      backgroundColor: theme.neutralColors.background,
      color: theme.neutralColors.text.primary,
      fontFamily: theme.typography.fontFamily.primary,
    };
  };
  
  return (
    <div className={`min-h-full ${className}`}>
      {/* Canvas container with theme application */}
      <div 
        className="canvas-theme-container min-h-full p-8 pl-14"
        style={getThemeStyles()}
      >
        <DropZone isEmpty={blocks.length === 0}>
          <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-6">
              {blocks.map((block) => (
                <EditableBlock
                  key={block.id}
                  block={block}
                  theme={theme}
                  customization={getCustomizationForType(block.type)}
                  onUpdate={(updates) => onBlockUpdate(block.id, updates)}
                  onDelete={() => onBlockDelete(block.id)}
                  onSelect={() => onBlockSelect?.(block)}
                  isSelected={selectedBlockId === block.id}
                  isDragging={activeId === block.id}
                />
              ))}

              {/* Empty state when no blocks */}
              {blocks.length === 0 && (
                <div className="text-center py-16 text-gray-500">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No components yet</h3>
                  <p className="text-sm text-gray-500">Drag components from the library to build your page</p>
                </div>
              )}
            </div>
          </SortableContext>
        </DropZone>
      </div>
    </div>
  );
} 