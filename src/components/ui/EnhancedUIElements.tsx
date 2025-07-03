import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComponentCustomization } from '../../lib/aiThemeGenerator';

// Enhanced interfaces that support AI customization
export interface EnhancedComponentProps {
  customization?: ComponentCustomization;
  aiGenerated?: boolean;
  enableAnimations?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface EnhancedHeadlineProps extends EnhancedComponentProps {
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  colorScheme?: string;
}

export interface EnhancedCTAProps extends EnhancedComponentProps {
  button_text?: string;
  headline?: string;
  onClick?: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  colorScheme?: string;
}

export interface EnhancedCardProps extends EnhancedComponentProps {
  title?: string;
  content?: string;
  variant?: 'default' | 'bordered' | 'shadow' | 'elevated';
  padding?: 'sm' | 'md' | 'lg';
}

// Enhanced Headline with AI customization support
export const EnhancedHeadline: React.FC<EnhancedHeadlineProps> = ({
  text = 'Headline',
  size = 'lg',
  colorScheme = 'primary',
  customization,
  aiGenerated = false,
  enableAnimations = true,
  className = '',
  children,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Build dynamic styles from customization
  const customStyles = customization?.customStyles ? {
    color: customization.customStyles.colors?.text || `var(--color-${colorScheme}-main)`,
    fontSize: customization.customStyles.typography?.fontSize || `var(--font-size-${size})`,
    fontWeight: customization.customStyles.typography?.fontWeight || 'var(--font-weight-semibold)',
    lineHeight: customization.customStyles.typography?.lineHeight || 'var(--line-height-tight)',
    textAlign: customization.customStyles.typography?.textAlign || 'left',
    margin: customization.customStyles.spacing?.margin || '0',
    padding: customization.customStyles.spacing?.padding || '0',
    borderRadius: customization.customStyles.effects?.borderRadius,
    boxShadow: customization.customStyles.effects?.boxShadow,
    transition: customization.customStyles.effects?.transition || 'var(--transition-default)',
    background: customization.customStyles.colors?.background,
  } : {
    color: `var(--color-${colorScheme}-main)`,
    fontSize: `var(--font-size-${size})`,
    fontWeight: 'var(--font-weight-semibold)',
    transition: 'var(--transition-default)',
  };

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const content = customization?.content?.headline || customization?.content?.text || text || children;

  if (enableAnimations && aiGenerated) {
    return (
      <motion.h1
        className={`font-family-primary ${className}`}
        style={customStyles}
        variants={variants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        whileHover={{ scale: 1.02 }}
        {...props}
      >
        {content}
      </motion.h1>
    );
  }

  return (
    <h1 
      className={`font-family-primary ${className}`}
      style={customStyles}
      {...props}
    >
      {content}
    </h1>
  );
};

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

  // Build dynamic styles
  const getButtonStyles = () => {
    const baseStyles = {
      fontSize: `var(--font-size-${size})`,
      fontWeight: 'var(--font-weight-semibold)',
      borderRadius: 'var(--radius-md)',
      transition: 'var(--transition-default)',
      cursor: 'pointer',
      border: 'none',
      outline: 'none',
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

  // Animation variants
  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    tap: { scale: 0.95 }
  };

  const content = customization?.content?.buttonText || button_text;

  const buttonElement = enableAnimations && aiGenerated ? (
    <motion.button
      className={className}
      style={{
        ...buttonStyles,
        transform: isHovered ? (customization?.customStyles?.effects?.transform || 'translateY(-2px)') : 'translateY(0)',
      }}
      variants={buttonVariants}
      initial="hidden"
      animate="visible"
      whileTap="tap"
      whileHover={{ y: -2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {content}
    </motion.button>
  ) : (
    <button
      className={className}
      style={buttonStyles}
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

// Enhanced Card with AI customization
export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  content,
  variant = 'default',
  padding = 'md',
  customization,
  aiGenerated = false,
  enableAnimations = true,
  className = '',
  children,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Build dynamic styles
  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: 'var(--radius-lg)',
      transition: 'var(--transition-default)',
      padding: `var(--spacing-${padding})`,
    };

    if (customization?.customStyles) {
      return {
        ...baseStyles,
        backgroundColor: customization.customStyles.colors?.background || 'var(--color-surface)',
        color: customization.customStyles.colors?.text || 'var(--color-text-primary)',
        border: customization.customStyles.colors?.border ? `1px solid ${customization.customStyles.colors.border}` : 'none',
        borderRadius: customization.customStyles.effects?.borderRadius || baseStyles.borderRadius,
        boxShadow: customization.customStyles.effects?.boxShadow || 'var(--shadow-md)',
        padding: customization.customStyles.spacing?.padding || baseStyles.padding,
        margin: customization.customStyles.spacing?.margin || '0',
        backdropFilter: variant === 'elevated' ? 'blur(10px)' : 'none',
      };
    }

    // Default variant styles
    switch (variant) {
      case 'bordered':
        return {
          ...baseStyles,
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'none',
        };
      case 'shadow':
        return {
          ...baseStyles,
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-lg)',
        };
      case 'elevated':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          boxShadow: 'var(--shadow-xl)',
          backdropFilter: 'blur(10px)',
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: 'var(--color-surface)',
          boxShadow: 'var(--shadow-sm)',
        };
    }
  };

  const cardStyles = getCardStyles();

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const cardContent = (
    <>
      {(title || customization?.content?.headline) && (
        <EnhancedHeadline 
          text={customization?.content?.headline || title}
          size="md"
          aiGenerated={aiGenerated}
          enableAnimations={false}
          className="mb-3"
        />
      )}
      {(content || customization?.content?.text) && (
        <p style={{ 
          color: customization?.customStyles?.colors?.text || 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          lineHeight: 'var(--line-height-relaxed)'
        }}>
          {customization?.content?.text || content}
        </p>
      )}
      {children}
    </>
  );

  if (enableAnimations && aiGenerated) {
    return (
      <motion.div
        className={className}
        style={cardStyles}
        variants={cardVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        whileHover={{ y: -4, boxShadow: 'var(--shadow-xl)' }}
        {...props}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <div className={className} style={cardStyles} {...props}>
      {cardContent}
    </div>
  );
};

// Theme transition wrapper
export const ThemeTransitionWrapper: React.FC<{
  children: React.ReactNode;
  isChanging: boolean;
}> = ({ children, isChanging }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isChanging ? 'changing' : 'stable'}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Smooth loading placeholder for AI-generated content
export const AIContentPlaceholder: React.FC<{
  type: 'headline' | 'paragraph' | 'button' | 'card';
  isLoading: boolean;
}> = ({ type, isLoading }) => {
  if (!isLoading) return null;

  const getPlaceholderStyle = () => {
    switch (type) {
      case 'headline':
        return { height: '2rem', width: '70%' };
      case 'paragraph':
        return { height: '4rem', width: '100%' };
      case 'button':
        return { height: '3rem', width: '8rem' };
      case 'card':
        return { height: '8rem', width: '100%' };
      default:
        return { height: '2rem', width: '50%' };
    }
  };

  return (
    <motion.div
      className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-md"
      style={getPlaceholderStyle()}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
}; 