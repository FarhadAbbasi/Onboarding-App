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
  apiKey: string,
  projectName: string,
  projectCategory: string,
  projectDescription: string,
  targetAudience: string,
  brandPersonality: string,
  preferredColors?: string[]
): Promise<AIGeneratedTheme> {
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const prompt = `
You are an expert UI/UX designer and brand strategist. Generate a comprehensive custom theme for a mobile app onboarding experience.

Project Details:
- Name: "${projectName}"
- Category: ${projectCategory}
- Description: ${projectDescription}
- Target Audience: ${targetAudience}
- Brand Personality: ${brandPersonality}
${preferredColors ? `- Preferred Colors: ${preferredColors.join(', ')}` : ''}

Create a cohesive, beautiful theme that:
1. Reflects the project's personality and target audience
2. Uses modern design principles and accessibility standards
3. Creates emotional connection with users
4. Ensures excellent readability and usability
5. Incorporates subtle animations and micro-interactions

Consider the project category to choose appropriate:
- Color psychology and associations
- Typography that fits the brand personality
- Spacing and sizing that works well for the target audience
- Visual effects that enhance rather than distract

Return ONLY valid JSON matching this structure:
{
  "id": "unique_theme_id",
  "name": "Theme Name (e.g., 'Ocean Breeze Professional')",
  "primaryColors": {
    "main": "#hex",
    "light": "#hex", 
    "dark": "#hex",
    "contrast": "#hex"
  },
  "secondaryColors": {
    "main": "#hex",
    "light": "#hex",
    "dark": "#hex", 
    "contrast": "#hex"
  },
  "neutralColors": {
    "background": "#hex",
    "surface": "#hex",
    "text": {
      "primary": "#hex",
      "secondary": "#hex",
      "muted": "#hex"
    },
    "border": "#hex"
  },
  "typography": {
    "fontFamily": {
      "primary": "Inter, system-ui, sans-serif",
      "secondary": "Inter, system-ui, sans-serif"
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem", 
      "md": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem",
      "2xl": "1.5rem"
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
    "xs": "0.5rem",
    "sm": "0.75rem",
    "md": "1rem", 
    "lg": "1.5rem",
    "xl": "2rem",
    "2xl": "3rem"
  },
  "borderRadius": {
    "sm": "0.375rem",
    "md": "0.5rem",
    "lg": "0.75rem", 
    "xl": "1rem"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    "md": "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    "lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    "xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
  },
  "animations": {
    "transition": "all 0.2s ease-in-out",
    "duration": {
      "fast": "150ms",
      "normal": "200ms", 
      "slow": "300ms"
    },
    "easing": {
      "ease": "ease",
      "easeIn": "ease-in",
      "easeOut": "ease-out",
      "easeInOut": "ease-in-out"
    }
  },
  "gradients": {
    "primary": "linear-gradient(135deg, primaryMain 0%, primaryLight 100%)",
    "secondary": "linear-gradient(135deg, secondaryMain 0%, secondaryLight 100%)",
    "accent": "linear-gradient(135deg, primaryMain 0%, secondaryMain 100%)",
    "background": "linear-gradient(135deg, background 0%, surface 100%)"
  },
  "components": {
    "button": {
      "borderRadius": "0.5rem",
      "fontWeight": "600",
      "textTransform": "none",
      "boxShadow": "0 2px 4px rgba(0, 0, 0, 0.1)"
    },
    "card": {
      "borderRadius": "0.75rem", 
      "boxShadow": "0 4px 6px rgba(0, 0, 0, 0.05)",
      "backdropBlur": "blur(10px)"
    },
    "input": {
      "borderRadius": "0.5rem",
      "borderWidth": "1px",
      "focusRing": "2px solid primaryLight"
    }
  },
  "mood": "choose from: professional, playful, modern, elegant, bold, minimal"
}

Generate harmonious colors that work well together and create a cohesive visual identity.
Use appropriate font combinations and sizing for excellent readability.
Create subtle, purposeful animations that enhance the user experience.
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
  apiKey: string,
  theme: AIGeneratedTheme,
  components: Array<{ type: string; content: any; context: string }>,
  pageContext: string,
  projectPersonality: string
): Promise<ComponentCustomization[]> {
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