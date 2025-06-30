import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Settings, Palette } from 'lucide-react';
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

export function ComponentProperties({ 
  selectedBlock, 
  onBlockUpdate, 
  onClose 
}: ComponentPropertiesProps) {
  const [content, setContent] = useState<any>({});
  const [colorScheme, setColorScheme] = useState<ColorScheme>('indigo');

  useEffect(() => {
    if (selectedBlock) {
      setContent(selectedBlock.content || {});
      setColorScheme((selectedBlock.content as any)?.colorScheme || 'indigo');
    }
  }, [selectedBlock]);

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-gray-50 border-l border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Settings size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm">Select a component to customize</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    onBlockUpdate(selectedBlock.id, {
      content: { ...content, colorScheme }
    });
  };

  // Auto-save on any content change
  const updateContent = (newContent: any) => {
    setContent(newContent);
    if (selectedBlock) {
      onBlockUpdate(selectedBlock.id, {
        content: { ...newContent, colorScheme }
      });
    }
  };

  // Auto-save on color scheme change
  const updateColorScheme = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    if (selectedBlock) {
      onBlockUpdate(selectedBlock.id, {
        content: { ...content, colorScheme: scheme }
      });
    }
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
                value={content.headline || ''}
                onChange={(e) => updateContent({ ...content, headline: e.target.value })}
                placeholder="Enter headline"
              />
            </div>
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
                value={content.subheadline || ''}
                onChange={(e) => updateContent({ ...content, subheadline: e.target.value })}
                placeholder="Enter subheadline"
              />
            </div>
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
                value={content.button_text || ''}
                onChange={(e) => updateContent({ ...content, button_text: e.target.value })}
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
          </div>
        );

      case 'feature-list':
        return (
          <div className="space-y-4">
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
                value={content.quote || ''}
                onChange={(e) => updateContent({ ...content, quote: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
                placeholder="Testimonial quote"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Author
              </label>
              <Input
                value={content.author || ''}
                onChange={(e) => updateContent({ ...content, author: e.target.value })}
                placeholder="Author name"
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
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <Input
                value={content.company || ''}
                onChange={(e) => updateContent({ ...content, company: e.target.value })}
                placeholder="Company name"
              />
            </div>
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
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
                rows={4}
                placeholder="Enter your text content"
              />
            </div>
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
                URL
              </label>
              <Input
                value={content.href || ''}
                onChange={(e) => updateContent({ ...content, href: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
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
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No customization options available</p>
          </div>
        );
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
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
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Component Editor */}
          {renderEditor()}

          {/* Color Scheme Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Palette size={14} className="inline mr-1" />
              Color Scheme
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_SCHEMES.map(scheme => (
                <button
                  key={scheme}
                  onClick={() => updateColorScheme(scheme)}
                  className={`w-8 h-8 rounded-md border-2 transition-all ${
                    colorScheme === scheme 
                      ? 'border-gray-900 scale-110' 
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
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500">
          Changes are saved automatically
        </div>
      </div>
    </div>
  );
}
