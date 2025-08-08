import OpenAI from 'openai';

export interface AIGeneratedTheme {
  id: string;
  name: string;
  primaryColors: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  secondaryColors: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  neutralColors: {
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    transition: string;
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  components: {
    button: {
      borderRadius: string;
      fontWeight: string;
      textTransform: string;
      boxShadow: string;
    };
    card: {
      borderRadius: string;
      boxShadow: string;
      backdropBlur: string;
    };
    input: {
      borderRadius: string;
      borderWidth: string;
      focusRing: string;
    };
  };
  mood: 'professional' | 'playful' | 'modern' | 'elegant' | 'bold' | 'minimal';
  cssVariables: string; // CSS custom properties string
}

export interface ComponentCustomization {
  type: string;
  colorScheme: string;
  size: string;
  variant: string;
  customStyles: {
    colors: {
      background?: string;
      text?: string;
      border?: string;
      accent?: string;
    };
    typography: {
      fontSize?: string;
      fontWeight?: string;
      lineHeight?: string;
      textAlign?: 'left' | 'center' | 'right';
    };
    spacing: {
      padding?: string;
      margin?: string;
    };
    effects: {
      borderRadius?: string;
      boxShadow?: string;
      transition?: string;
      transform?: string;
    };
  };
  content?: {
    text?: string;
    headline?: string;
    subtext?: string;
    buttonText?: string;
  };
}

export async function generateProjectTheme(
  projectName: string,
  projectCategory: string,
  projectDescription: string,
  targetAudience: string,
  brandPersonality: string,
  preferredColors?: string[]
): Promise<AIGeneratedTheme> {
  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_KEY in your environment variables.');
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const prompt = `
You are an expert UI/UX designer specializing in MODERN MOBILE APP DESIGN. Generate a comprehensive, visually stunning theme for a mobile onboarding experience.

CRITICAL DESIGN REQUIREMENTS:
- MODERN MOBILE-FIRST: Optimized for mobile screens with contemporary design patterns
- VISUALLY APPEALING: Beautiful gradients, sophisticated colors, premium feel
- CONTEMPORARY: 2024+ design trends, not basic or outdated styles
- ENGAGING: Emotional connection through color psychology and visual hierarchy
- PREMIUM FEEL: High-end app aesthetics with professional polish

Project Details:
- Name: "${projectName}"
- Category: ${projectCategory}
- Description: ${projectDescription}
- Target Audience: ${targetAudience}
- Brand Personality: ${brandPersonality}
${preferredColors ? `- Preferred Colors: ${preferredColors.join(', ')}` : ''}

MODERN DESIGN SPECIFICATIONS:
1. COLORS: Use sophisticated color palettes with excellent contrast
   - Rich, vibrant primary colors (not basic blue/gray)
   - Complementary secondary colors that create visual interest
   - Modern neutral backgrounds (subtle gradients, not plain white)
   - Professional text colors with proper hierarchy

2. GRADIENTS: Create multiple stunning gradients
   - Background gradients that enhance the overall experience
   - Component gradients for buttons and cards
   - Subtle accent gradients for visual interest

3. MOBILE SPACING: Generous, comfortable spacing for mobile
   - Larger touch targets for mobile interaction
   - Comfortable padding and margins
   - Visual breathing room between elements

4. MODERN EFFECTS: Contemporary visual effects
   - Sophisticated shadows with multiple layers
   - Larger border radius for modern rounded corners
   - Smooth animations and micro-interactions

5. TYPOGRAPHY: Modern, readable fonts with proper scale
   - Use modern system fonts or Google Fonts
   - Clear hierarchy with good contrast
   - Mobile-optimized sizing

AVOID: Basic colors, plain white backgrounds, small spacing, harsh shadows, outdated design patterns

Generate a theme that looks like a premium 2024+ mobile app that users would pay for.

Return ONLY valid JSON matching this structure:
{
  "id": "unique_theme_id",
  "name": "Theme Name (e.g., 'Modern Gradient Pro', 'Premium Mobile Experience')",
  "primaryColors": {
    "main": "#modern_vibrant_color",
    "light": "#lighter_variant", 
    "dark": "#darker_variant",
    "contrast": "#high_contrast_text"
  },
  "secondaryColors": {
    "main": "#complementary_color",
    "light": "#lighter_variant",
    "dark": "#darker_variant", 
    "contrast": "#high_contrast_text"
  },
  "neutralColors": {
    "background": "#modern_background (not plain white)",
    "surface": "#elevated_surface_color",
    "text": {
      "primary": "#dark_readable_text",
      "secondary": "#medium_readable_text",
      "muted": "#light_readable_text"
    },
    "border": "#subtle_modern_border"
  },
  "typography": {
    "fontFamily": {
      "primary": "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      "secondary": "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    },
    "fontSize": {
      "xs": "0.875rem",
      "sm": "1rem", 
      "md": "1.125rem",
      "lg": "1.25rem",
      "xl": "1.5rem",
      "2xl": "1.875rem"
    },
    "fontWeight": {
      "normal": "400",
      "medium": "500",
      "semibold": "600", 
      "bold": "700"
    },
    "lineHeight": {
      "tight": "1.25",
      "normal": "1.5",
      "relaxed": "1.75"
    }
  },
  "spacing": {
    "xs": "0.75rem",
    "sm": "1rem",
    "md": "1.5rem", 
    "lg": "2rem",
    "xl": "2.5rem",
    "2xl": "3rem"
  },
  "borderRadius": {
    "sm": "0.5rem",
    "md": "0.75rem",
    "lg": "1rem", 
    "xl": "1.25rem"
  },
  "shadows": {
    "sm": "0 2px 4px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)",
    "md": "0 4px 8px 0 rgba(0, 0, 0, 0.08), 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    "lg": "0 8px 16px 0 rgba(0, 0, 0, 0.1), 0 4px 8px 0 rgba(0, 0, 0, 0.08)",
    "xl": "0 16px 32px 0 rgba(0, 0, 0, 0.12), 0 8px 16px 0 rgba(0, 0, 0, 0.1)"
  },
  "animations": {
    "transition": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "duration": {
      "fast": "200ms",
      "normal": "300ms", 
      "slow": "500ms"
    },
    "easing": {
      "ease": "cubic-bezier(0.4, 0, 0.2, 1)",
      "easeIn": "cubic-bezier(0.4, 0, 1, 1)",
      "easeOut": "cubic-bezier(0, 0, 0.2, 1)",
      "easeInOut": "cubic-bezier(0.4, 0, 0.2, 1)"
    }
  },
  "gradients": {
    "primary": "linear-gradient(135deg, [primary-main] 0%, [primary-light] 100%)",
    "secondary": "linear-gradient(135deg, [secondary-main] 0%, [secondary-light] 100%)",
    "accent": "linear-gradient(135deg, [primary-main] 0%, [secondary-main] 100%)",
    "background": "linear-gradient(135deg, [background] 0%, [surface] 100%)"
  },
  "components": {
    "button": {
      "borderRadius": "0.75rem",
      "fontWeight": "600",
      "textTransform": "none",
      "boxShadow": "0 4px 12px rgba(0, 0, 0, 0.15)"
    },
    "card": {
      "borderRadius": "1rem", 
      "boxShadow": "0 8px 24px rgba(0, 0, 0, 0.12)",
      "backdropBlur": "blur(16px)"
    },
    "input": {
      "borderRadius": "0.75rem",
      "borderWidth": "1px",
      "focusRing": "3px solid rgba([primary-main-rgb], 0.3)"
    }
  },
  "mood": "modern"
}

Create a premium, modern mobile app theme that looks professional and engaging.
Use sophisticated color combinations that work well together.
Ensure the design feels contemporary and would compete with top-tier mobile apps.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UI/UX designer. Generate only valid JSON for custom themes. No markdown blocks or explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated');
    }

    const parsed = JSON.parse(content) as AIGeneratedTheme;
    
    // Generate CSS variables string
    parsed.cssVariables = generateCSSVariables(parsed);
    
    return parsed;
  } catch (error) {
    console.error('Theme generation error:', error);
    throw new Error('Failed to generate custom theme. Please try again.');
  }
}

export async function generateComponentCustomizations(
  theme: AIGeneratedTheme,
  components: Array<{ type: string; content: any; context: string }>,
  pageContext: string,
  projectPersonality: string
): Promise<ComponentCustomization[]> {
  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_KEY in your environment variables.');
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const prompt = `
You are an expert UI designer. Customize components for an onboarding page using the provided theme.

Theme Colors:
- Primary: ${theme.primaryColors.main} (light: ${theme.primaryColors.light}, dark: ${theme.primaryColors.dark})
- Secondary: ${theme.secondaryColors.main}
- Background: ${theme.neutralColors.background}
- Text: ${theme.neutralColors.text.primary}

Theme Style: ${theme.mood}
Project Personality: ${projectPersonality}
Page Context: ${pageContext}

Components to customize:
${components.map((c, i) => `${i + 1}. ${c.type} - ${c.context}`).join('\n')}

For each component, provide intelligent customizations that:
1. Use the theme colors harmoniously
2. Create visual hierarchy and flow
3. Match the project personality
4. Ensure accessibility and readability
5. Add subtle, purposeful styling effects

Return JSON array of customizations:
[
  {
    "type": "component_type",
    "colorScheme": "primary|secondary|neutral", 
    "size": "xs|sm|md|lg|xl|2xl",
    "variant": "solid|outline|ghost",
    "customStyles": {
      "colors": {
        "background": "#hex",
        "text": "#hex", 
        "border": "#hex",
        "accent": "#hex"
      },
      "typography": {
        "fontSize": "1rem",
        "fontWeight": "600",
        "lineHeight": "1.5", 
        "textAlign": "center"
      },
      "spacing": {
        "padding": "1rem 2rem",
        "margin": "1rem 0"
      },
      "effects": {
        "borderRadius": "0.5rem",
        "boxShadow": "shadow",
        "transition": "all 0.2s ease",
        "transform": "hover:scale(1.02)"
      }
    },
    "content": {
      "text": "enhanced text if needed",
      "headline": "enhanced headline if needed"
    }
  }
]

Make each component unique but cohesive within the overall design system.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Generate component customizations as JSON array. No markdown or explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No customizations generated');
    }

    const parsed = JSON.parse(content);
    return parsed.customizations || parsed || [];
  } catch (error) {
    console.error('Component customization error:', error);
    return [];
  }
}

function generateCSSVariables(theme: AIGeneratedTheme): string {
  return `
    :root {
      /* Primary Colors */
      --color-primary-main: ${theme.primaryColors.main};
      --color-primary-light: ${theme.primaryColors.light};
      --color-primary-dark: ${theme.primaryColors.dark};
      --color-primary-contrast: ${theme.primaryColors.contrast};
      
      /* Secondary Colors */
      --color-secondary-main: ${theme.secondaryColors.main};
      --color-secondary-light: ${theme.secondaryColors.light};
      --color-secondary-dark: ${theme.secondaryColors.dark};
      --color-secondary-contrast: ${theme.secondaryColors.contrast};
      
      /* Neutral Colors */
      --color-background: ${theme.neutralColors.background};
      --color-surface: ${theme.neutralColors.surface};
      --color-text-primary: ${theme.neutralColors.text.primary};
      --color-text-secondary: ${theme.neutralColors.text.secondary};
      --color-text-muted: ${theme.neutralColors.text.muted};
      --color-border: ${theme.neutralColors.border};
      
      /* Typography */
      --font-family-primary: ${theme.typography.fontFamily.primary};
      --font-family-secondary: ${theme.typography.fontFamily.secondary};
      
      /* Font Sizes */
      --font-size-xs: ${theme.typography.fontSize.xs};
      --font-size-sm: ${theme.typography.fontSize.sm};
      --font-size-md: ${theme.typography.fontSize.md};
      --font-size-lg: ${theme.typography.fontSize.lg};
      --font-size-xl: ${theme.typography.fontSize.xl};
      --font-size-2xl: ${theme.typography.fontSize['2xl']};
      
      /* Font Weights */
      --font-weight-normal: ${theme.typography.fontWeight.normal};
      --font-weight-medium: ${theme.typography.fontWeight.medium};
      --font-weight-semibold: ${theme.typography.fontWeight.semibold};
      --font-weight-bold: ${theme.typography.fontWeight.bold};
      
      /* Spacing */
      --spacing-xs: ${theme.spacing.xs};
      --spacing-sm: ${theme.spacing.sm};
      --spacing-md: ${theme.spacing.md};
      --spacing-lg: ${theme.spacing.lg};
      --spacing-xl: ${theme.spacing.xl};
      --spacing-2xl: ${theme.spacing['2xl']};
      
      /* Border Radius */
      --radius-sm: ${theme.borderRadius.sm};
      --radius-md: ${theme.borderRadius.md};
      --radius-lg: ${theme.borderRadius.lg};
      --radius-xl: ${theme.borderRadius.xl};
      
      /* Shadows */
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      --shadow-xl: ${theme.shadows.xl};
      
      /* Animations */
      --transition-default: ${theme.animations.transition};
      --duration-fast: ${theme.animations.duration.fast};
      --duration-normal: ${theme.animations.duration.normal};
      --duration-slow: ${theme.animations.duration.slow};
      
      /* Gradients */
      --gradient-primary: ${theme.gradients.primary.replace('primaryMain', theme.primaryColors.main).replace('primaryLight', theme.primaryColors.light)};
      --gradient-secondary: ${theme.gradients.secondary.replace('secondaryMain', theme.secondaryColors.main).replace('secondaryLight', theme.secondaryColors.light)};
      --gradient-accent: ${theme.gradients.accent.replace('primaryMain', theme.primaryColors.main).replace('secondaryMain', theme.secondaryColors.main)};
      --gradient-background: ${theme.gradients.background.replace('background', theme.neutralColors.background).replace('surface', theme.neutralColors.surface)};
    }
  `.replace(/\s+/g, ' ').trim();
}

export function applyThemeToDocument(theme: AIGeneratedTheme): void {
  // Remove existing theme styles
  const existingStyle = document.getElementById('ai-generated-theme');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and inject new theme styles
  const styleElement = document.createElement('style');
  styleElement.id = 'ai-generated-theme';
  styleElement.textContent = theme.cssVariables;
  document.head.appendChild(styleElement);

  // Add smooth transition for theme changes
  document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
} 