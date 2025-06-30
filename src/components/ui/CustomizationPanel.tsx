import React, { useState, useEffect } from 'react';
import { X, Palette, Type, Zap } from 'lucide-react';
import type { ColorScheme, Size } from './UIElements';

export interface CustomizableProps {
  colorScheme?: ColorScheme;
  size?: Size;
  variant?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface CustomizationState extends CustomizableProps {
  elementType: string;
  position: { x: number; y: number };
  isVisible: boolean;
}

// Updated interface to support both usage patterns
export interface CustomizationPanelProps {
  // New props for direct usage
  open?: boolean;
  onClose: () => void;
  element?: React.ReactElement;
  onUpdate: (updates: Partial<CustomizableProps>) => void;
  currentProps?: CustomizableProps;
  
  // Legacy props for useCustomization hook
  customization?: CustomizationState;
}

const colorSchemes: ColorScheme[] = [
  'indigo', 'blue', 'green', 'red', 'yellow', 'purple',
  'pink', 'gray', 'emerald', 'cyan', 'orange', 'slate'
];

const sizes: Size[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

const buttonVariants = ['solid', 'outline', 'ghost'];
const cardVariants = ['default', 'bordered', 'shadow', 'elevated'];
const inputVariants = ['default', 'filled', 'flushed'];
const alertVariants = ['info', 'success', 'error', 'warning'];

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  customization,
  onUpdate,
  onClose,
  open,
  element,
  currentProps
}) => {
  // Handle both legacy and new usage patterns
  const isLegacyMode = !!customization;
  const isVisible = isLegacyMode ? customization.isVisible : open;
  
  // Simple element type extraction
  const elementType = isLegacyMode ? customization.elementType : 'Element';
  const position = isLegacyMode ? customization.position : { x: 0, y: 0 };
  const initialProps = isLegacyMode ? customization : currentProps || {};

  const [localState, setLocalState] = useState<Partial<CustomizableProps>>(initialProps);

  useEffect(() => {
    const props = isLegacyMode ? customization : currentProps || {};
    setLocalState(props);
  }, [customization, currentProps, isLegacyMode]);

  const handleUpdate = (updates: Partial<CustomizableProps>) => {
    const newState = { ...localState, ...updates };
    setLocalState(newState);
    onUpdate(updates);
  };

  const getVariantsForElement = (elementType: string) => {
    switch (elementType.toLowerCase()) {
      case 'button':
      case 'ctabutton':
        return buttonVariants;
      case 'card':
      case 'featurecard':
        return cardVariants;
      case 'input':
      case 'textinput':
        return inputVariants;
      case 'alert':
      case 'alertmessage':
        return alertVariants;
      default:
        return [];
    }
  };

  if (!isVisible) return null;

  const colorMap: Record<ColorScheme, string> = {
    indigo: '#6366f1',
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    yellow: '#f59e0b',
    purple: '#8b5cf6',
    pink: '#ec4899',
    gray: '#6b7280',
    emerald: '#059669',
    cyan: '#06b6d4',
    orange: '#f97316',
    slate: '#64748b'
  };

  const panelStyle = isLegacyMode ? {
    left: position.x,
    top: position.y,
    transform: 'translate(-50%, -100%)',
    marginTop: '-10px'
  } : {
    right: '20px',
    top: '20px'
  };

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-80"
      style={panelStyle}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Customize {elementType}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Color Scheme */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Scheme
        </label>
        <div className="grid grid-cols-6 gap-2">
          {colorSchemes.map((color) => (
            <button
              key={color}
              onClick={() => handleUpdate({ colorScheme: color })}
              className={`
                w-8 h-8 rounded-md border-2 transition-all duration-150
                ${localState.colorScheme === color 
                  ? 'border-gray-900 scale-110' 
                  : 'border-gray-300 hover:border-gray-400'
                }
              `}
              style={{ backgroundColor: colorMap[color] }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Size
        </label>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleUpdate({ size })}
              className={`
                px-3 py-1 text-xs rounded-md border transition-colors
                ${localState.size === size
                  ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Variant */}
      {getVariantsForElement(elementType).length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variant
          </label>
          <div className="flex flex-wrap gap-2">
            {getVariantsForElement(elementType).map((variant) => (
              <button
                key={variant}
                onClick={() => handleUpdate({ variant })}
                className={`
                  px-3 py-1 text-xs rounded-md border transition-colors capitalize
                  ${localState.variant === variant
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {variant}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Classes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Custom Classes
        </label>
        <input
          type="text"
          value={localState.className || ''}
          onChange={(e) => handleUpdate({ className: e.target.value })}
          placeholder="Enter custom CSS classes"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Quick Presets */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Presets
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleUpdate({ 
              colorScheme: 'blue', 
              size: 'lg', 
              variant: 'solid' 
            })}
            className="px-3 py-2 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
          >
            Primary
          </button>
          <button
            onClick={() => handleUpdate({ 
              colorScheme: 'gray', 
              size: 'md', 
              variant: 'outline' 
            })}
            className="px-3 py-2 bg-gray-500 text-white text-xs rounded-md hover:bg-gray-600 transition-colors"
          >
            Secondary
          </button>
          <button
            onClick={() => handleUpdate({ 
              colorScheme: 'green', 
              size: 'lg', 
              variant: 'solid' 
            })}
            className="px-3 py-2 bg-green-500 text-white text-xs rounded-md hover:bg-green-600 transition-colors"
          >
            Success
          </button>
          <button
            onClick={() => handleUpdate({ 
              colorScheme: 'red', 
              size: 'md', 
              variant: 'outline' 
            })}
            className="px-3 py-2 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors"
          >
            Danger
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={() => handleUpdate({ 
            colorScheme: 'indigo', 
            size: 'md', 
            variant: 'solid',
            className: '' 
          })}
          className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-3 py-2 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};

// Hook for managing customization state
export const useCustomization = () => {
  const [customization, setCustomization] = useState<CustomizationState>({
    elementType: '',
    position: { x: 0, y: 0 },
    isVisible: false,
    colorScheme: 'indigo',
    size: 'md',
    variant: 'solid'
  });

  const showCustomization = (
    elementType: string,
    position: { x: number; y: number },
    currentProps: Partial<CustomizableProps> = {}
  ) => {
    setCustomization({
      elementType,
      position,
      isVisible: true,
      ...currentProps
    });
  };

  const hideCustomization = () => {
    setCustomization(prev => ({ ...prev, isVisible: false }));
  };

  const updateCustomization = (updates: Partial<CustomizableProps>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
  };

  return {
    customization,
    showCustomization,
    hideCustomization,
    updateCustomization
  };
}; 