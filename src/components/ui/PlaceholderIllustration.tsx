import React from 'react';

type IllustrationType = 'welcome' | 'features' | 'success' | 'team' | 'analytics' | 'security' | 'customize' | 'rocket';

interface PlaceholderIllustrationProps {
  type: IllustrationType;
  className?: string;
}

export function PlaceholderIllustration({ type, className = '' }: PlaceholderIllustrationProps) {
  const illustrations: Record<IllustrationType, JSX.Element> = {
    welcome: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="50" y="40" width="200" height="120" rx="20" fill="currentColor" opacity="0.1"/>
        <circle cx="150" cy="100" r="40" fill="currentColor" opacity="0.2"/>
        <path d="M130 100 L145 115 L170 85" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    features: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="40" y="50" width="60" height="60" rx="10" fill="currentColor" opacity="0.2"/>
        <rect x="120" y="50" width="60" height="60" rx="10" fill="currentColor" opacity="0.2"/>
        <rect x="200" y="50" width="60" height="60" rx="10" fill="currentColor" opacity="0.2"/>
        <circle cx="70" cy="80" r="15" fill="currentColor" opacity="0.4"/>
        <circle cx="150" cy="80" r="15" fill="currentColor" opacity="0.4"/>
        <circle cx="230" cy="80" r="15" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
    success: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="150" cy="100" r="60" fill="currentColor" opacity="0.1"/>
        <circle cx="150" cy="100" r="45" fill="currentColor" opacity="0.2"/>
        <path d="M120 100 L140 120 L180 80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    team: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="100" cy="80" r="25" fill="currentColor" opacity="0.2"/>
        <circle cx="150" cy="80" r="25" fill="currentColor" opacity="0.2"/>
        <circle cx="200" cy="80" r="25" fill="currentColor" opacity="0.2"/>
        <path d="M60 140 Q100 120 140 140" fill="currentColor" opacity="0.1"/>
        <path d="M110 140 Q150 120 190 140" fill="currentColor" opacity="0.1"/>
        <path d="M160 140 Q200 120 240 140" fill="currentColor" opacity="0.1"/>
      </svg>
    ),
    analytics: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="60" y="120" width="30" height="40" fill="currentColor" opacity="0.2"/>
        <rect x="100" y="90" width="30" height="70" fill="currentColor" opacity="0.3"/>
        <rect x="140" y="60" width="30" height="100" fill="currentColor" opacity="0.4"/>
        <rect x="180" y="80" width="30" height="80" fill="currentColor" opacity="0.3"/>
        <rect x="220" y="100" width="30" height="60" fill="currentColor" opacity="0.2"/>
      </svg>
    ),
    security: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M150 40 L200 60 L200 120 C200 140 150 160 150 160 S100 140 100 120 L100 60 Z" fill="currentColor" opacity="0.1"/>
        <path d="M150 60 L180 70 L180 110 C180 120 150 130 150 130 S120 120 120 110 L120 70 Z" fill="currentColor" opacity="0.2"/>
        <circle cx="150" cy="95" r="15" fill="currentColor" opacity="0.3"/>
        <rect x="145" y="90" width="10" height="15" rx="2" fill="currentColor" opacity="0.4"/>
      </svg>
    ),
    customize: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="80" y="60" width="140" height="80" rx="10" fill="currentColor" opacity="0.1"/>
        <circle cx="110" cy="90" r="8" fill="currentColor" opacity="0.3"/>
        <circle cx="150" cy="90" r="8" fill="currentColor" opacity="0.3"/>
        <circle cx="190" cy="90" r="8" fill="currentColor" opacity="0.3"/>
        <rect x="100" y="110" width="100" height="8" rx="4" fill="currentColor" opacity="0.2"/>
      </svg>
    ),
    rocket: (
      <svg viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M150 140 L130 100 Q150 40 170 100 Z" fill="currentColor" opacity="0.2"/>
        <path d="M150 100 L140 80 Q150 60 160 80 Z" fill="currentColor" opacity="0.3"/>
        <circle cx="150" cy="90" r="5" fill="currentColor" opacity="0.4"/>
        <path d="M130 140 L120 160 L140 150 M170 140 L180 160 L160 150" stroke="currentColor" strokeWidth="3" opacity="0.3"/>
      </svg>
    )
  };

  return illustrations[type] || illustrations.welcome;
}