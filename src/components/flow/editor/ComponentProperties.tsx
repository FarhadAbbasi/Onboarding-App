import React, { useState, useEffect, useCallback } from 'react';
import { X, Plus, Trash2, Settings, Palette, Type } from 'lucide-react';
import { 
  Button, 
  Input, 
  type ColorScheme,
  type Size 
} from '../../ui/UIElements';
import type { ParsedBlock } from './AIHtmlParser';

interface ComponentPropertiesProps {
  selectedBlock: ParsedBlock | null;
  onBlockUpdate: (blockId: string, updates: Partial<ParsedBlock>) => void;
  onClose: () => void;
}

const COLOR_SCHEMES: ColorScheme[] = [
  'indigo', 'blue', 'green', 'red', 'yellow', 'purple', 
  'pink', 'gray', 'emerald', 'cyan', 'orange', 'slate'
];

const SIZES: Size[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ComponentProperties({ 
  selectedBlock, 
  onBlockUpdate, 
  onClose 
}: ComponentPropertiesProps) {
  const [content, setContent] = useState<any>(selectedBlock?.content || {});
  const [colorScheme, setColorScheme] = useState(content.colorScheme || 'indigo');
  const [size, setSize] = useState(content.size || 'md');
  const [variant, setVariant] = useState(content.variant || 'solid');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Longer debounce for text content to reduce excessive updates
  const debouncedContent = useDebounce(content, 1000); // Increased from 500ms to 1000ms

  useEffect(() => {
    if (selectedBlock) {
      const blockContent = selectedBlock.content || {};
      setContent(blockContent);
      setColorScheme((blockContent as any)?.colorScheme || 'indigo');
      setSize((blockContent as any)?.size || 'md');
      setVariant((blockContent as any)?.variant || 'solid');
    }
  }, [selectedBlock]);

  // Track changes and mark as unsaved
  useEffect(() => {
    if (selectedBlock && JSON.stringify(content) !== JSON.stringify(selectedBlock.content)) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [content, selectedBlock]);

  // Manual save function
  const handleManualSave = () => {
    if (selectedBlock && hasUnsavedChanges) {
      onBlockUpdate(selectedBlock.id, {
        content: { ...content, colorScheme, size, variant }
      });
      setHasUnsavedChanges(false);
    }
  };

  if (!selectedBlock) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Settings size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select a component to customize</p>
        </div>
      </div>
    );
  }

  // Immediate update for non-text properties (colors, sizes, variants)
  const updateImmediate = (updates: any) => {
    const newContent = { ...content, ...updates };
    setContent(newContent);
    
    if (updates.colorScheme !== undefined) setColorScheme(updates.colorScheme);
    if (updates.size !== undefined) setSize(updates.size);
    if (updates.variant !== undefined) setVariant(updates.variant);
    
    // Apply immediately for styling properties
    onBlockUpdate(selectedBlock.id, {
      content: newContent
    });
  };

  // Debounced update for text content
  const updateContent = (newContent: any) => {
    setContent(newContent);
  };

  const addFeature = () => {
    const features = content.features || [];
    updateContent({
      ...content,
      features: [...features, 'New Feature']
    });
  };

  const updateFeature = (index: number, value: string) => {
    const features = [...(content.features || [])];
    features[index] = value;
    updateContent({ ...content, features });
  };

  const removeFeature = (index: number) => {
    const features = [...(content.features || [])];
    features.splice(index, 1);
    updateContent({ ...content, features });
  };

  const getVariantOptions = (type: string) => {
    switch (type) {
      case 'cta':
      case 'button':
        return ['solid', 'outline', 'ghost'];
      case 'card':
      case 'featureCard':
        return ['default', 'bordered', 'shadow', 'elevated'];
      case 'input':
        return ['default', 'filled', 'flushed'];
      case 'alert':
        return ['info', 'success', 'error', 'warning'];
      default:
        return ['solid', 'outline', 'ghost'];
    }
  };

  const renderStyleControls = () => (
    <div className="space-y-4 border-t pt-4">
      {/* Color Scheme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Palette size={14} className="inline mr-1" />
          Color Scheme
        </label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_SCHEMES.map(scheme => (
            <button
              key={scheme}
              onClick={() => updateImmediate({ colorScheme: scheme })}
              className={`w-8 h-8 rounded-md border-2 transition-all ${
                colorScheme === scheme 
                  ? 'border-gray-900 scale-110 shadow-md' 
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{
                background: {
                  indigo: '#6366f1', blue: '#3b82f6', green: '#10b981',
                  red: '#ef4444', yellow: '#f59e0b', purple: '#8b5cf6',
                  pink: '#ec4899', gray: '#6b7280', emerald: '#059669',
                  cyan: '#06b6d4', orange: '#f97316', slate: '#64748b'
                }[scheme]
              }}
              title={scheme}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Type size={14} className="inline mr-1" />
          Size
        </label>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((sizeOption) => (
            <button
              key={sizeOption}
              onClick={() => updateImmediate({ size: sizeOption })}
              className={`px-3 py-1 text-xs rounded-md border transition-colors capitalize ${
                size === sizeOption
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {sizeOption}
            </button>
          ))}
        </div>
      </div>

      {/* Variant */}
      {getVariantOptions(selectedBlock.type).length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variant
          </label>
          <div className="flex flex-wrap gap-2">
            {getVariantOptions(selectedBlock.type).map((variantOption) => (
              <button
                key={variantOption}
                onClick={() => updateImmediate({ variant: variantOption })}
                className={`px-3 py-1 text-xs rounded-md border transition-colors capitalize ${
                  variant === variantOption
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {variantOption}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderEditor = () => {
    switch (selectedBlock.type) {
      case 'headline':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headline Text
              </label>
              <Input
                value={content.headline || content.text || ''}
                onChange={(e) => updateContent({ ...content, headline: e.target.value, text: e.target.value })}
                placeholder="Enter headline"
              />
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'subheadline':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subheadline Text
              </label>
              <Input
                value={content.subheadline || content.text || ''}
                onChange={(e) => updateContent({ ...content, subheadline: e.target.value, text: e.target.value })}
                placeholder="Enter subheadline"
              />
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'paragraph':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Content
              </label>
              <textarea
                value={content.text || ''}
                onChange={(e) => updateContent({ ...content, text: e.target.value })}
                placeholder="Enter paragraph text"
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <Input
                value={content.button_text || content.text || ''}
                onChange={(e) => updateContent({ ...content, button_text: e.target.value, text: e.target.value })}
                placeholder="Button text"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Headline (Optional)
              </label>
              <Input
                value={content.headline || ''}
                onChange={(e) => updateContent({ ...content, headline: e.target.value })}
                placeholder="CTA headline"
              />
            </div>
            
            {/* Headline Styling Controls */}
            {content.headline && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                <label className="text-sm font-medium text-gray-700">Headline Styling</label>
                
                {/* Headline Size */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Headline Size</label>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((sizeOption) => (
                      <button
                        key={sizeOption}
                        onClick={() => updateContent({ ...content, headlineSize: sizeOption })}
                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                          content.headlineSize === sizeOption
                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {sizeOption}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Headline Color */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Headline Color</label>
                  <div className="grid grid-cols-6 gap-1">
                    {COLOR_SCHEMES.map(scheme => (
                      <button
                        key={scheme}
                        onClick={() => updateContent({ ...content, headlineColorScheme: scheme })}
                        className={`w-6 h-6 rounded border transition-all ${
                          content.headlineColorScheme === scheme 
                            ? 'border-gray-900 scale-110' 
                            : 'border-gray-200'
                        }`}
                        style={{
                          background: {
                            indigo: '#6366f1', blue: '#3b82f6', green: '#10b981',
                            red: '#ef4444', yellow: '#f59e0b', purple: '#8b5cf6',
                            pink: '#ec4899', gray: '#6b7280', emerald: '#059669',
                            cyan: '#06b6d4', orange: '#f97316', slate: '#64748b'
                          }[scheme]
                        }}
                        title={scheme}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {renderStyleControls()}
          </div>
        );

      case 'feature-list':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Title
              </label>
              <Input
                value={content.title || 'Key Features'}
                onChange={(e) => updateContent({ ...content, title: e.target.value })}
                placeholder="Section title"
              />
            </div>
            
            {/* Title Styling Controls */}
            <div className="p-3 bg-gray-50 rounded-lg space-y-3">
              <label className="text-sm font-medium text-gray-700">Title Styling</label>
              
              {/* Title Size */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Title Size</label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((sizeOption) => (
                    <button
                      key={sizeOption}
                      onClick={() => updateContent({ ...content, titleSize: sizeOption })}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        content.titleSize === sizeOption
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {sizeOption}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Title Color */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Title Color</label>
                <div className="grid grid-cols-6 gap-1">
                  {COLOR_SCHEMES.map(scheme => (
                    <button
                      key={scheme}
                      onClick={() => updateContent({ ...content, titleColorScheme: scheme })}
                      className={`w-6 h-6 rounded border transition-all ${
                        content.titleColorScheme === scheme 
                          ? 'border-gray-900 scale-110' 
                          : 'border-gray-200'
                      }`}
                      style={{
                        background: {
                          indigo: '#6366f1', blue: '#3b82f6', green: '#10b981',
                          red: '#ef4444', yellow: '#f59e0b', purple: '#8b5cf6',
                          pink: '#ec4899', gray: '#6b7280', emerald: '#059669',
                          cyan: '#06b6d4', orange: '#f97316', slate: '#64748b'
                        }[scheme]
                      }}
                      title={scheme}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Features
              </label>
              <Button
                size="sm"
                variant="outline"
                onClick={addFeature}
                className="flex items-center gap-1"
              >
                <Plus size={14} />
                Add
              </Button>
            </div>
            
            <div className="space-y-2">
              {(content.features || []).map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    size="sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFeature(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'testimonial':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quote
              </label>
              <textarea
                value={content.quote || content.text || ''}
                onChange={(e) => updateContent({ ...content, quote: e.target.value, text: e.target.value })}
                placeholder="Testimonial quote"
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <Input
                  value={content.author || ''}
                  onChange={(e) => updateContent({ ...content, author: e.target.value })}
                  placeholder="Author name"
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <Input
                  value={content.role || ''}
                  onChange={(e) => updateContent({ ...content, role: e.target.value })}
                  placeholder="Job title"
                  size="sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <Input
                value={content.company || ''}
                onChange={(e) => updateContent({ ...content, company: e.target.value })}
                placeholder="Company name"
                size="sm"
              />
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer Text
              </label>
              <Input
                value={content.text || ''}
                onChange={(e) => updateContent({ ...content, text: e.target.value })}
                placeholder="Footer content"
              />
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'text-input':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Input Label
              </label>
              <Input
                value={content.label || ''}
                onChange={(e) => updateContent({ ...content, label: e.target.value })}
                placeholder="Input label"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <Input
                value={content.placeholder || ''}
                onChange={(e) => updateContent({ ...content, placeholder: e.target.value })}
                placeholder="Placeholder text"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="required"
                checked={content.required || false}
                onChange={(e) => updateContent({ ...content, required: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="required" className="text-sm text-gray-700">
                Required field
              </label>
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'alert':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Title
              </label>
              <Input
                value={content.title || ''}
                onChange={(e) => updateContent({ ...content, title: e.target.value })}
                placeholder="Alert title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Message
              </label>
              <textarea
                value={content.message || content.text || ''}
                onChange={(e) => updateContent({ ...content, message: e.target.value, text: e.target.value })}
                placeholder="Alert message"
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['info', 'success', 'error', 'warning'].map((variantOption) => (
                  <button
                    key={variantOption}
                    onClick={() => updateContent({ ...content, variant: variantOption })}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors capitalize ${
                      content.variant === variantOption
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {variantOption}
                  </button>
                ))}
              </div>
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'link':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Text
              </label>
              <Input
                value={content.text || ''}
                onChange={(e) => updateContent({ ...content, text: e.target.value })}
                placeholder="Link text"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link URL
              </label>
              <Input
                value={content.href || ''}
                onChange={(e) => updateContent({ ...content, href: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="underline"
                checked={content.underline !== false}
                onChange={(e) => updateContent({ ...content, underline: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="underline" className="text-sm text-gray-700">
                Show underline on hover
              </label>
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'spacer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spacer Height
              </label>
              <div className="flex flex-wrap gap-2">
                {['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((heightOption) => (
                  <button
                    key={heightOption}
                    onClick={() => updateContent({ ...content, height: heightOption })}
                    className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                      content.height === heightOption
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {heightOption}
                  </button>
                ))}
              </div>
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'icon':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon/Emoji
              </label>
              <Input
                value={content.icon || ''}
                onChange={(e) => updateContent({ ...content, icon: e.target.value })}
                placeholder="Enter emoji or icon (e.g., 🎉, ⭐, 🚀)"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="centered"
                checked={content.centered !== false}
                onChange={(e) => updateContent({ ...content, centered: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="centered" className="text-sm text-gray-700">
                Center align icon
              </label>
            </div>
            {renderStyleControls()}
          </div>
        );

      case 'permission-request':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permission Title
              </label>
              <Input
                value={content.title || ''}
                onChange={(e) => updateContent({ ...content, title: e.target.value })}
                placeholder="Permission request title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={content.description || ''}
                onChange={(e) => updateContent({ ...content, description: e.target.value })}
                placeholder="Explain why this permission is needed"
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={2}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <Input
                value={content.button_text || 'Allow Permission'}
                onChange={(e) => updateContent({ ...content, button_text: e.target.value })}
                placeholder="Button text"
              />
            </div>
            {renderStyleControls()}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">Basic content editing</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (JSON)
              </label>
              <textarea
                value={JSON.stringify(content, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    updateContent(parsed);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-md font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows={6}
              />
            </div>
            {renderStyleControls()}
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div>
          <h3 className="font-semibold text-gray-900">Component Properties</h3>
          <p className="text-xs text-gray-500 capitalize">{selectedBlock.type}</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        {renderEditor()}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {hasUnsavedChanges ? (
          <div className="space-y-2">
            <Button
              onClick={handleManualSave}
              className="w-full"
              size="sm"
            >
              Save Changes
            </Button>
            <div className="text-center text-xs text-amber-600">
              <div className="flex items-center justify-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                Unsaved changes
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-gray-500">
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              All changes saved
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
 