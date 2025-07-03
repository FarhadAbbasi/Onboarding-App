import React from 'react';
import type { ReactNode } from 'react';

export interface ThemeTransitionWrapperProps {
  children: ReactNode;
  isChanging: boolean;
  className?: string;
}

// Theme transition wrapper using CSS transitions
export const ThemeTransitionWrapper: React.FC<ThemeTransitionWrapperProps> = ({ 
  children, 
  isChanging, 
  className = '' 
}) => {
  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${className}`}
      style={{
        opacity: isChanging ? 0.7 : 1,
        transform: isChanging ? 'scale(0.98)' : 'scale(1)',
      }}
    >
      {children}
    </div>
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
    <div
      className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-md animate-pulse"
      style={{
        ...getPlaceholderStyle(),
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear'
      }}
    />
  );
}; 