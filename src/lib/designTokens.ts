// =============================================================================
// Layer A: Design-Token Core
// Brand primitives expressed as structured tokens that AI can only pick from
// =============================================================================

export const designTokens = {
  // Type Scale (Minor Third: 1.2 ratio)
  typography: {
    scale: {
      'xs': '0.75rem',    // 12px
      'sm': '0.875rem',   // 14px  
      'base': '1rem',     // 16px
      'lg': '1.2rem',     // 19.2px
      'xl': '1.44rem',    // 23px
      '2xl': '1.728rem',  // 27.6px
      '3xl': '2.074rem',  // 33.2px
      '4xl': '2.488rem',  // 39.8px
      '5xl': '2.986rem',  // 47.8px
    },
    weights: {
      normal: '400',
      medium: '500', 
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    families: {
      sans: 'system-ui, -apple-system, sans-serif',
      display: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
  },

  // Smart Color System with Auto-Contrast
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',  // Base
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      contrast: '#ffffff', // Auto-calculated contrast
    },
    secondary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff', 
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',  // Base
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
      contrast: '#ffffff',
    },
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db', 
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },

  // Spacing Scale (1.5 ratio for larger jumps)
  spacing: {
    section: '4rem',      // Between major sections
    component: '2rem',    // Between components
    inset: '1.5rem',      // Inside containers
    stack: '1rem',        // Stacked elements
    inline: '0.75rem',    // Inline elements
    tight: '0.5rem',      // Tight spacing
    micro: '0.25rem',     // Micro spacing
  },

  // Radius Scale
  radius: {
    none: '0',
    sm: '0.375rem',
    base: '0.5rem', 
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },

  // Shadow Scale
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    glass: '0 8px 32px 0 rgb(31 38 135 / 0.37)',
  },

  // Motion System
  motion: {
    durations: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    curves: {
      ease: 'ease',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out', 
      'ease-in-out': 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  },
} as const;

// Tone-based token variations that AI can select
export const toneVariations = {
  playful: {
    primaryHue: 'pink',
    secondaryHue: 'orange', 
    radius: designTokens.radius['2xl'],
    motionCurve: designTokens.motion.curves.bounce,
    fontFamily: designTokens.typography.families.display,
  },
  professional: {
    primaryHue: 'indigo',
    secondaryHue: 'slate',
    radius: designTokens.radius.md,
    motionCurve: designTokens.motion.curves['ease-out'],
    fontFamily: designTokens.typography.families.sans,
  },
  modern: {
    primaryHue: 'violet',
    secondaryHue: 'cyan',
    radius: designTokens.radius.xl,
    motionCurve: designTokens.motion.curves.smooth,
    fontFamily: designTokens.typography.families.display,
  },
  minimal: {
    primaryHue: 'gray',
    secondaryHue: 'slate',
    radius: designTokens.radius.base,
    motionCurve: designTokens.motion.curves.ease,
    fontFamily: designTokens.typography.families.sans,
  },
} as const;

// CSS Variable Generator
export function generateCSSVariables(tone: keyof typeof toneVariations = 'professional') {
  const variation = toneVariations[tone];
  
  return `
    :root {
      /* Typography Scale */
      --fs-xs: ${designTokens.typography.scale.xs};
      --fs-sm: ${designTokens.typography.scale.sm};
      --fs-base: ${designTokens.typography.scale.base};
      --fs-lg: ${designTokens.typography.scale.lg};
      --fs-xl: ${designTokens.typography.scale.xl};
      --fs-2xl: ${designTokens.typography.scale['2xl']};
      --fs-3xl: ${designTokens.typography.scale['3xl']};
      --fs-4xl: ${designTokens.typography.scale['4xl']};
      --fs-5xl: ${designTokens.typography.scale['5xl']};
      
      /* Spacing Scale */
      --space-section: ${designTokens.spacing.section};
      --space-component: ${designTokens.spacing.component};
      --space-inset: ${designTokens.spacing.inset};
      --space-stack: ${designTokens.spacing.stack};
      --space-inline: ${designTokens.spacing.inline};
      --space-tight: ${designTokens.spacing.tight};
      --space-micro: ${designTokens.spacing.micro};
      
      /* Motion */
      --motion-fast: ${designTokens.motion.durations.fast};
      --motion-base: ${designTokens.motion.durations.base};
      --motion-slow: ${designTokens.motion.durations.slow};
      --motion-curve: ${variation.motionCurve};
      
      /* Theming */
      --radius-base: ${variation.radius};
      --font-family: ${variation.fontFamily};
    }
  `;
}

export type DesignTone = keyof typeof toneVariations;
export type ColorScale = keyof typeof designTokens.colors.primary;
export type SpacingToken = keyof typeof designTokens.spacing;
export type TypographyScale = keyof typeof designTokens.typography.scale; 