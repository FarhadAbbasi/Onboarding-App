import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
  Headline, 
  Subheadline, 
  CTAButton, 
  FeatureCard,
  Testimonial,
  AlertMessage,
  Button,
  Input,
  Card
} from '../../ui/UIElements';

const COMPONENTS = [
  {
    id: 'headline',
    type: 'headline',
    label: 'Headline',
    icon: '📰',
    defaultContent: { headline: 'Your Amazing Headline' },
    preview: <Headline size="sm" className="text-center">Amazing Headline</Headline>
  },
  {
    id: 'subheadline', 
    type: 'subheadline',
    label: 'Subheadline',
    icon: '📝',
    defaultContent: { subheadline: 'Supporting text that explains more' },
    preview: <Subheadline size="sm" className="text-center text-gray-600">Supporting text</Subheadline>
  },
  {
    id: 'cta',
    type: 'cta',
    label: 'Call to Action',
    icon: '🚀',
    defaultContent: { button_text: 'Get Started', headline: 'Ready to begin?' },
    preview: <CTAButton size="sm" colorScheme="blue">Get Started</CTAButton>
  },
  {
    id: 'feature-list',
    type: 'feature-list', 
    label: 'Feature List',
    icon: '⭐',
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
    defaultContent: { quote: 'This product changed my life!', author: 'Happy Customer', role: 'CEO', company: 'Amazing Corp' },
    preview: (
      <Card padding="sm" className="text-xs">
        <div className="italic text-gray-700">"Great product!"</div>
        <div className="text-gray-500 mt-1">- Customer</div>
      </Card>
    )
  },
  {
    id: 'paragraph',
    type: 'paragraph',
    label: 'Text Block',
    icon: '📄',
    defaultContent: { text: 'Add your compelling text content here.' },
    preview: <div className="text-xs text-gray-700">Add your text content here...</div>
  },
  {
    id: 'input',
    type: 'input',
    label: 'Input Field',
    icon: '📝',
    defaultContent: { placeholder: 'Enter your email', label: 'Email Address' },
    preview: <Input size="sm" placeholder="Enter email..." className="text-xs" />
  },
  {
    id: 'alert',
    type: 'alert',
    label: 'Alert Message',
    icon: '⚠️',
    defaultContent: { title: 'Important Notice', message: 'This is an important message for users.' },
    preview: <AlertMessage variant="info" className="text-xs p-2">Info message</AlertMessage>
  },
  {
    id: 'link',
    type: 'link',
    label: 'Link',
    icon: '🔗',
    defaultContent: { text: 'Learn More', href: '#' },
    preview: <a href="#" className="text-blue-600 underline text-xs">Learn More</a>
  },
  {
    id: 'footer',
    type: 'footer',
    label: 'Footer',
    icon: '📄',
    defaultContent: { text: 'Copyright © 2024' },
    preview: <div className="text-xs text-gray-500 text-center">© 2024 Company</div>
  }
];

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
      className={`bg-white border border-gray-200 rounded-lg p-4 cursor-grab hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : 'hover:border-blue-300'
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{item.icon}</span>
          <div>
            <div className="font-medium text-sm text-gray-900">{item.label}</div>
            <div className="text-xs text-gray-500">Drag to canvas</div>
          </div>
        </div>
        
        {/* Rich Preview */}
        <div className="bg-gray-50 rounded-md p-3 border-2 border-dashed border-gray-200">
          <div className="pointer-events-none">
            {item.preview}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ComponentLibraryProps {
  className?: string;
}

export function ComponentLibrary({ className }: ComponentLibraryProps) {
  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-1">Components</h2>
        <p className="text-xs text-gray-600">Drag to canvas →</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {COMPONENTS.map(item => (
          <DraggableComponent key={item.id} item={item} />
        ))}
      </div>
      
      <div className="p-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Build your onboarding flow by dragging components to the device preview
        </div>
      </div>
    </div>
  );
} 