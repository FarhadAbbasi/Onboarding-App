import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Search, Type, MousePointer, Image, Layout, AlertCircle } from 'lucide-react';
import { 
  Headline, 
  Subheadline, 
  CTA, 
  FeatureCard,
  Testimonial,
  AlertMessage,
  Button,
  Input,
  Card
} from '../../ui/UIElements';

const COMPONENT_CATEGORIES = {
  text: { name: 'Text & Content', icon: Type, color: 'blue' },
  interactive: { name: 'Interactive', icon: MousePointer, color: 'green' },
  layout: { name: 'Layout & Structure', icon: Layout, color: 'purple' },
  media: { name: 'Media & Icons', icon: Image, color: 'orange' },
  feedback: { name: 'Feedback & Alerts', icon: AlertCircle, color: 'red' }
};

const COMPONENTS = [
  {
    id: 'headline',
    type: 'headline',
    label: 'Headline',
    icon: '📰',
    category: 'text',
    description: 'Main titles and headings',
    defaultContent: { headline: 'Your Amazing Headline' },
    preview: <Headline size="sm" className="text-center">Amazing Headline</Headline>
  },
  {
    id: 'subheadline', 
    type: 'subheadline',
    label: 'Subheadline',
    icon: '📝',
    category: 'text',
    description: 'Supporting text and descriptions',
    defaultContent: { subheadline: 'Supporting text that explains more' },
    preview: <Subheadline size="sm" className="text-center text-gray-600">Supporting text</Subheadline>
  },
  {
    id: 'paragraph',
    type: 'paragraph',
    label: 'Text Block',
    icon: '📄',
    category: 'text',
    description: 'Rich text content and paragraphs',
    defaultContent: { text: 'Add your compelling text content here.' },
    preview: <div className="text-xs text-gray-700 leading-relaxed">Add your text content here...</div>
  },
  {
    id: 'cta',
    type: 'cta',
    label: 'Call to Action',
    icon: '🚀',
    category: 'interactive',
    description: 'Action buttons with headlines',
    defaultContent: { button_text: 'Get Started', headline: 'Ready to begin?' },
    preview: <Button size="sm" colorScheme="blue">Get Started</Button>
  },
  {
    id: 'text-input',
    type: 'text-input',
    label: 'Text Input',
    icon: '✏️',
    category: 'interactive',
    description: 'Form inputs for user data',
    defaultContent: { 
      label: 'Email Address', 
      placeholder: 'Enter your email', 
      required: true,
      size: 'md',
      colorScheme: 'indigo'
    },
    preview: (
      <div className="w-full">
        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
        <Input size="sm" placeholder="Enter email..." className="text-xs w-full" />
      </div>
    )
  },
  {
    id: 'link',
    type: 'link', 
    label: 'Link',
    icon: '🔗',
    category: 'interactive',
    description: 'Clickable links and navigation',
    defaultContent: { 
      text: 'Learn More', 
      href: '#', 
      colorScheme: 'indigo',
      variant: 'default',
      underline: true
    },
    preview: <a href="#" className="text-blue-600 underline text-xs hover:text-blue-800">Learn More</a>
  },
  {
    id: 'feature-list',
    type: 'feature-list', 
    label: 'Feature List',
    icon: '⭐',
    category: 'text',
    description: 'Bulleted lists of features',
    defaultContent: { features: ['Amazing Feature 1', 'Incredible Feature 2', 'Fantastic Feature 3'] },
    preview: (
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
          <span>Feature One</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
          <span>Feature Two</span>
        </div>
      </div>
    )
  },
  {
    id: 'testimonial',
    type: 'testimonial',
    label: 'Testimonial', 
    icon: '💬',
    category: 'text',
    description: 'Customer reviews and quotes',
    defaultContent: { quote: 'This product changed my life!', author: 'Happy Customer', role: 'CEO', company: 'Amazing Corp' },
    preview: (
      <Card padding="sm" className="text-xs">
        <div className="italic text-gray-700">"Great product!"</div>
        <div className="text-gray-500 mt-1">- Customer</div>
      </Card>
    )
  },
  {
    id: 'spacer',
    type: 'spacer',
    label: 'Spacer',
    icon: '⬜',
    category: 'layout',
    description: 'Add spacing between elements',
    defaultContent: { 
      height: 'md',
      colorScheme: 'gray'
    },
    preview: (
      <div className="w-full h-4 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
        <span className="text-xs text-gray-500">Space</span>
      </div>
    )
  },
  {
    id: 'icon',
    type: 'icon',
    label: 'Icon',
    icon: '🎨',
    category: 'media',
    description: 'Decorative icons and emojis',
    defaultContent: {
      icon: '⭐',
      size: 'lg',
      colorScheme: 'indigo',
      centered: true
    },
    preview: (
      <div className="text-center">
        <span className="text-lg">⭐</span>
      </div>
    )
  },
  {
    id: 'alert',
    type: 'alert',
    label: 'Alert Message',
    icon: '⚠️',
    category: 'feedback',
    description: 'Notifications and important messages',
    defaultContent: { 
      variant: 'info',
      title: 'Important Notice', 
      message: 'This is an important message for users.',
      colorScheme: 'blue'
    },
    preview: <AlertMessage variant="info" className="text-xs p-2 rounded">Info message</AlertMessage>
  },
  {
    id: 'permission-request',
    type: 'permission-request',
    label: 'Permission Request',
    icon: '🔒',
    category: 'interactive',
    description: 'Request user permissions',
    defaultContent: {
      title: 'Allow Notifications',
      description: 'Get notified about important updates and messages',
      button_text: 'Allow',
      colorScheme: 'green'
    },
    preview: (
      <div className="text-xs space-y-1">
        <div className="font-medium">Allow Notifications</div>
        <div className="text-gray-600">Get updates</div>
        <Button size="xs" colorScheme="green">Allow</Button>
      </div>
    )
  },
  {
    id: 'footer',
    type: 'footer',
    label: 'Footer',
    icon: '📄',
    category: 'layout',
    description: 'Page footer with links',
    defaultContent: { text: 'Copyright © 2024' },
    preview: <div className="text-xs text-gray-500 text-center">© 2024 Company</div>
  }
];

function DraggableComponent({ item }: { item: typeof COMPONENTS[0] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ 
    id: item.id,
    data: { type: item.type, content: item.defaultContent }
  });

  const categoryColor = COMPONENT_CATEGORIES[item.category as keyof typeof COMPONENT_CATEGORIES]?.color || 'gray';
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group bg-white border border-gray-200 rounded-lg p-3 cursor-grab hover:shadow-lg transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-95' : 'hover:border-blue-300 hover:-translate-y-0.5'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-lg bg-${categoryColor}-50 border border-${categoryColor}-200 flex items-center justify-center text-sm`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-gray-900 truncate">{item.label}</div>
              <div className="text-xs text-gray-500 truncate">{item.description}</div>
            </div>
          </div>
          <div className={`w-2 h-2 rounded-full bg-${categoryColor}-400 opacity-60 group-hover:opacity-100 transition-opacity`}></div>
        </div>
        
        {/* Enhanced Preview */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 group-hover:border-gray-300 transition-colors">
          <div className="pointer-events-none">
            {item.preview}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Drag to add</span>
          <div className="w-4 h-4 rounded bg-gray-100 flex items-center justify-center">
            <div className="w-2 h-2 border border-gray-400 border-dashed"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, items, searchTerm }: { 
  category: string, 
  items: typeof COMPONENTS, 
  searchTerm: string 
}) {
  const categoryInfo = COMPONENT_CATEGORIES[category as keyof typeof COMPONENT_CATEGORIES];
  if (!categoryInfo) return null;

  const filteredItems = items.filter(item => 
    item.category === category &&
    (item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (filteredItems.length === 0) return null;

  const Icon = categoryInfo.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-2">
        <div className={`w-5 h-5 rounded bg-${categoryInfo.color}-100 text-${categoryInfo.color}-600 flex items-center justify-center`}>
          <Icon size={12} />
        </div>
        <h3 className="text-sm font-medium text-gray-700">{categoryInfo.name}</h3>
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-xs text-gray-500">{filteredItems.length}</span>
      </div>
      <div className="space-y-2">
        {filteredItems.map(item => (
          <DraggableComponent key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

interface ComponentLibraryProps {
  className?: string;
}

export function ComponentLibrary({ className }: ComponentLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Object.keys(COMPONENT_CATEGORIES);
  const filteredComponents = selectedCategory 
    ? COMPONENTS.filter(item => item.category === selectedCategory)
    : COMPONENTS;

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
      {/* Enhanced Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Layout size={16} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Components</h2>
            <p className="text-xs text-gray-600">Drag & drop to build</p>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="p-3 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              selectedCategory === null 
                ? 'bg-blue-100 text-blue-700 font-medium' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {categories.map(category => {
            const categoryInfo = COMPONENT_CATEGORIES[category as keyof typeof COMPONENT_CATEGORIES];
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  selectedCategory === category 
                    ? `bg-${categoryInfo.color}-100 text-${categoryInfo.color}-700 font-medium` 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {categoryInfo.name}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Components List */}
      <div className="flex-1 overflow-y-auto">
        {searchTerm ? (
          // Search Results
          <div className="p-3 space-y-2">
            {filteredComponents
              .filter(item => 
                item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.type.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(item => (
                <DraggableComponent key={item.id} item={item} />
              ))
            }
          </div>
        ) : selectedCategory ? (
          // Selected Category
          <div className="p-3">
            <CategorySection 
              category={selectedCategory} 
              items={COMPONENTS} 
              searchTerm={searchTerm} 
            />
          </div>
        ) : (
          // All Categories
          <div className="p-3 space-y-6">
            {categories.map(category => (
              <CategorySection 
                key={category} 
                category={category} 
                items={COMPONENTS} 
                searchTerm={searchTerm} 
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Enhanced Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 text-center space-y-1">
          <div className="font-medium">💡 Pro Tip</div>
          <div>Drag components to the device preview to build your onboarding flow</div>
        </div>
      </div>
    </div>
  );
} 