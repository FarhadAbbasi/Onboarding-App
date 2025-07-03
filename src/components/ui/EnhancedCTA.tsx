import React, { useState } from 'react';
import type { ComponentCustomization } from '../../lib/aiThemeGenerator';
import { EnhancedHeadline } from './EnhancedUIElements';

export interface EnhancedCTAProps {
  button_text?: string;
  headline?: string;
  onClick?: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  colorScheme?: string;
  customization?: ComponentCustomization;
  aiGenerated?: boolean;
  enableAnimations?: boolean;
  className?: string;
}

// Enhanced CTA Button with AI customization
export const EnhancedCTA: React.FC<EnhancedCTAProps> = ({
  button_text = 'Get Started',
  headline,
  onClick,
  variant = 'solid',
  size = 'md',
  colorScheme = 'primary',
  customization,
  aiGenerated = false,
  enableAnimations = true,
  className = '',
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Show with animation on mount
  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  // Build dynamic styles
  const getButtonStyles = () => {
    const baseStyles = {
      fontSize: `var(--font-size-${size})`,
      fontWeight: 'var(--font-weight-semibold)',
      borderRadius: 'var(--radius-md)',
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
    };

    if (customization?.customStyles) {
      return {
        ...baseStyles,
        backgroundColor: customization.customStyles.colors?.background || `var(--color-${colorScheme}-main)`,
        color: customization.customStyles.colors?.text || `var(--color-${colorScheme}-contrast)`,
        fontSize: customization.customStyles.typography?.fontSize || baseStyles.fontSize,
        fontWeight: customization.customStyles.typography?.fontWeight || baseStyles.fontWeight,
        padding: customization.customStyles.spacing?.padding || `var(--spacing-${size === 'sm' ? 'sm' : 'md'}) var(--spacing-lg)`,
        margin: customization.customStyles.spacing?.margin || '0',
        borderRadius: customization.customStyles.effects?.borderRadius || baseStyles.borderRadius,
        boxShadow: customization.customStyles.effects?.boxShadow || 'var(--shadow-md)',
        transition: customization.customStyles.effects?.transition || baseStyles.transition,
        border: customization.customStyles.colors?.border ? `1px solid ${customization.customStyles.colors.border}` : 'none',
        transform: isHovered ? (customization.customStyles.effects?.transform || 'translateY(-2px)') : 'translateY(0)',
      };
    }

    // Default variant styles
    switch (variant) {
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: `var(--color-${colorScheme}-main)`,
          border: `2px solid var(--color-${colorScheme}-main)`,
          padding: `var(--spacing-${size === 'sm' ? 'sm' : 'md'}) var(--spacing-lg)`,
        };
      case 'ghost':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: `var(--color-${colorScheme}-main)`,
          padding: `var(--spacing-${size === 'sm' ? 'sm' : 'md'}) var(--spacing-lg)`,
        };
      default: // solid
        return {
          ...baseStyles,
          backgroundColor: `var(--color-${colorScheme}-main)`,
          color: `var(--color-${colorScheme}-contrast)`,
          padding: `var(--spacing-${size === 'sm' ? 'sm' : 'md'}) var(--spacing-lg)`,
          boxShadow: 'var(--shadow-md)',
        };
    }
  };

  const buttonStyles = getButtonStyles();
  const content = customization?.content?.buttonText || button_text;

  const buttonElement = (
    <button
      className={`${className} ${enableAnimations && aiGenerated ? 'transition-all duration-300 ease-out' : ''}`}
      style={{
        ...buttonStyles,
        opacity: enableAnimations && aiGenerated ? (isVisible ? 1 : 0) : 1,
        transform: enableAnimations && aiGenerated ? 
          `${isVisible ? 'scale(1)' : 'scale(0.9)'} ${isHovered ? 'translateY(-2px)' : 'translateY(0)'}` : 
          buttonStyles.transform
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {content}
    </button>
  );

  if (headline) {
    return (
      <div className="text-center space-y-4">
        <EnhancedHeadline 
          text={customization?.content?.headline || headline}
          size="lg"
          colorScheme={colorScheme}
          aiGenerated={aiGenerated}
          enableAnimations={enableAnimations}
        />
        {buttonElement}
      </div>
    );
  }

  return buttonElement;
}; 