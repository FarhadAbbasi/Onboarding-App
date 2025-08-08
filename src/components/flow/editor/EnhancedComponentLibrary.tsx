import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Search, Type, MousePointer, Layout, Image, AlertCircle, Wand2, Palette } from 'lucide-react';
import { 
  MobileButton,
  MobileInput,
  MobileText,
  MobilePhone,
  MobileApp
} from '../../ui/UIElements';
import type { AIGeneratedTheme, ComponentCustomization } from '../../../lib/aiThemeGenerator';

const COMPONENT_CATEGORIES = {
  text: { name: 'Text & Content', icon: Type, color: 'blue' },
  interactive: { name: 'Interactive', icon: MousePointer, color: 'green' },
  layout: { name: 'Layout & Structure', icon: Layout, color: 'purple' },
  media: { name: 'Media & Icons', icon: Image, color: 'orange' },
  feedback: { name: 'Feedback & Alerts', icon: AlertCircle, color: 'red' }
};

// Mobile component definitions with AI customization support
const MOBILE_COMPONENTS = [
  {
    id: 'mobile-text',
    type: 'text',
    label: 'Mobile Text',
    icon: '📰',
    category: 'text',
    description: 'Mobile-optimized text component',
    aiEnhanced: true,
    defaultContent: { text: 'Your Mobile Text', variant: 'h1', alignment: 'center' },
    preview: <MobileText text="Mobile Headline" variant="h2" className="text-xs" />
  },
  {
    id: 'mobile-button',
    type: 'button',
    label: 'Mobile Button',
    icon: '🚀',
    category: 'interactive',
    description: 'Mobile-optimized button component',
    aiEnhanced: true,
    defaultContent: { text: 'Get Started', variant: 'primary', fullWidth: true },
    preview: <MobileButton text="Mobile Button" className="px-2 py-1 text-xs" />
  },
  {
    id: 'mobile-input',
    type: 'input',
    label: 'Mobile Input',
    icon: '✏️',
    category: 'interactive',
    description: 'Mobile-optimized input field',
    aiEnhanced: false,
    defaultContent: { placeholder: 'Enter text...', type: 'text', label: 'Input Label' },
    preview: <MobileInput placeholder="Enter text..." className="px-2 py-1 text-xs" />
  },
  {
    id: 'mobile-screen',
    type: 'screen',
    label: 'Mobile Screen',
    icon: '📱',
    category: 'layout',
    description: 'Full mobile screen container',
    aiEnhanced: false,
    defaultContent: { name: 'New Screen', bgType: 'color', bgValue: '#FFFFFF' },
    preview: (
      <div className="w-full h-8 bg-gray-100 rounded border border-gray-300 flex items-center justify-center">
        <span className="text-xs text-gray-500">Screen</span>
      </div>
    )
  },
  {
    id: 'mobile-image',
    type: 'image',
    label: 'Mobile Image',
    icon: '🖼️',
    category: 'media',
    description: 'Mobile-optimized image component',
    aiEnhanced: false,
    defaultContent: { 
      src: 'https://via.placeholder.com/150',
      alt: 'Placeholder Image',
      size: 'md',
      alignment: 'center'
    },
    preview: (
      <div className="w-full flex justify-center">
        <div className="w-8 h-8 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
          <span className="text-xs text-gray-500">IMG</span>
        </div>
      </div>
    )
  }
];

interface EnhancedDraggableComponentProps {
  item: typeof MOBILE_COMPONENTS[0];
  customization?: ComponentCustomization;
  theme?: AIGeneratedTheme;
  isAIEnabled: boolean;
}

function EnhancedDraggableComponent({ item, customization, isAIEnabled }: EnhancedDraggableComponentProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: {
      type: item.type,
      defaultContent: item.defaultContent,
      customization: customization,
      aiEnhanced: item.aiEnhanced && isAIEnabled
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group relative p-4 border-2 border-dashed border-gray-200 rounded-lg 
        hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-grab
        ${isDragging ? 'rotate-3 scale-105' : ''}
        ${item.aiEnhanced && isAIEnabled ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' : ''}
      `}
    >
      {/* AI Enhancement Badge */}
      {item.aiEnhanced && isAIEnabled && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Wand2 className="w-3 h-3" />
          AI
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`
          text-2xl w-12 h-12 rounded-lg flex items-center justify-center
          ${item.aiEnhanced && isAIEnabled ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-gray-100'}
        `}>
          {item.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {item.label}
            </h4>
            {customization && (
              <Palette className="w-3 h-3 text-purple-500" />
            )}
          </div>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {item.description}
          </p>
          
          {/* Component Preview */}
          <div className="bg-white rounded border p-2">
            {item.preview}
          </div>
        </div>
      </div>
    </div>
  );
}

interface EnhancedComponentLibraryProps {
  className?: string;
  theme?: AIGeneratedTheme;
  customizations?: ComponentCustomization[];
  isAIEnabled?: boolean;
  isLoadingCustomizations?: boolean;
}

export function EnhancedComponentLibrary({ 
  className, 
  theme, 
  customizations = [], 
  isAIEnabled = false,
  isLoadingCustomizations = false 
}: EnhancedComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Create customization lookup map
  const customizationMap = customizations.reduce((acc, customization) => {
    acc[customization.type] = customization;
    return acc;
  }, {} as Record<string, ComponentCustomization>);

  // Filter components based on search and category
  const filteredComponents = MOBILE_COMPONENTS.filter(item => {
    const matchesSearch = item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group components by category
  const groupedComponents = filteredComponents.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof MOBILE_COMPONENTS>);

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className={`
            p-2 rounded-lg
            ${isAIEnabled ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-blue-500'}
          `}>
            <Type className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isAIEnabled ? 'AI Component Library' : 'Component Library'}
            </h3>
            <p className="text-sm text-gray-500">
              {isAIEnabled ? 'AI-enhanced components' : 'Drag components to canvas'}
            </p>
          </div>
        </div>

        {/* AI Status Indicator */}
        {isAIEnabled && (
          <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">AI Enhancement Active</span>
            </div>
            {theme && (
              <p className="text-xs text-purple-700">
                Using "{theme.name}" theme • {customizations.length} customizations applied
              </p>
            )}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.entries(COMPONENT_CATEGORIES).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === key 
                  ? `bg-${category.color}-100 text-${category.color}-800` 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {Object.entries(groupedComponents).map(([categoryKey, components]) => {
          const category = COMPONENT_CATEGORIES[categoryKey as keyof typeof COMPONENT_CATEGORIES];
          if (!category || components.length === 0) return null;

          return (
            <div key={categoryKey}>
              <div className="flex items-center gap-2 mb-3">
                <category.icon className={`w-4 h-4 text-${category.color}-600`} />
                <h4 className="text-sm font-medium text-gray-900">{category.name}</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {components.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {components.map((component) => (
                  <EnhancedDraggableComponent
                    key={component.id}
                    item={component}
                    customization={customizationMap[component.type]}
                    theme={theme}
                    isAIEnabled={isAIEnabled}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {filteredComponents.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <Search className="w-8 h-8 mx-auto" />
            </div>
            <p className="text-sm text-gray-500">No components found</p>
            <p className="text-xs text-gray-400">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
} 