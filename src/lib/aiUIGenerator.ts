// AI-Driven Mobile UI Generator with Structured Outputs
// Generates JSON configurations for mobile UI screens using AI with guaranteed schema compliance

import type { 
  UIScreen, 
  UIFlow, 
  AIGenerationContext,
  ComponentType 
} from '../types/ui-schema';

// Simplified schema that works with OpenAI structured outputs
const UI_COMPONENT_SCHEMA = {
  type: "object",
  properties: {
    type: {
      type: "string",
      enum: ["Title", "Input", "Button", "OptionGroup", "Image", "ProgressBar", "Slider", "Card", "ToggleSwitch", "Spacer"]
    },
    props: {
      type: "object",
      properties: {
        // Universal properties that can apply to any component
        text: { type: "string" },
        title: { type: "string" },
        content: { type: "string" },
        value: { type: ["string", "number", "boolean"] },
        label: { type: "string" },
        placeholder: { type: "string" },
        variant: { type: "string" },
        alignment: { type: "string" },
        color: { type: "string" },
        fontWeight: { type: "string" },
        type: { type: "string" },
        required: { type: "boolean" },
        fullWidth: { type: "boolean" },
        disabled: { type: "boolean" },
        highlighted: { type: "boolean" },
        src: { type: "string" },
        alt: { type: "string" },
        size: { type: "string" },
        borderRadius: { type: "string" },
        multiSelect: { type: "boolean" },
        max: { type: "number" },
        min: { type: "number" },
        step: { type: "number" },
        unit: { type: "string" },
        initialValue: { type: "number" },
        showPercentage: { type: "boolean" },
        description: { type: "string" },
        height: { type: "string" },
        clickable: { type: "boolean" },
        imageUrl: { type: "string" },
        options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              label: { type: "string" },
              value: { type: "string" }
            },
            required: ["id", "label", "value"],
            additionalProperties: false
          }
        }
      },
      required: [
        "text", "title", "content", "value", "label", "placeholder", "variant", "alignment", "color", "fontWeight", "type", "required", "fullWidth", "disabled", "highlighted", "src", "alt", "size", "borderRadius", "multiSelect", "max", "min", "step", "unit", "initialValue", "showPercentage", "description", "height", "clickable", "imageUrl", "options"
      ],
      additionalProperties: false
    }
  },
  required: ["type", "props"],
  additionalProperties: false
};

const UI_SCREEN_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    bgType: { 
      type: "string", 
      enum: ["color", "gradient", "image"] 
    },
    bgValue: { type: "string" },
    components: {
      type: "array",
      items: UI_COMPONENT_SCHEMA
    }
  },
  required: ["id", "name", "bgType", "bgValue", "components"],
  additionalProperties: false
};

const UI_FLOW_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    screens: {
      type: "array",
      items: UI_SCREEN_SCHEMA
    },
    theme: {
      type: "object",
      properties: {
        primaryColor: { type: "string" },
        secondaryColor: { type: "string" },
        backgroundColor: { type: "string" },
        textColor: { type: "string" },
        borderRadius: { 
          type: "string", 
          enum: ["sm", "md", "lg", "xl"] 
        },
        spacing: { 
          type: "string", 
          enum: ["compact", "normal", "relaxed"] 
        },
        fontFamily: { type: "string" }
      },
      required: ["primaryColor", "secondaryColor", "backgroundColor", "textColor", "borderRadius", "spacing"],
      additionalProperties: false
    }
  },
  required: ["id", "name", "description", "screens"],
  additionalProperties: false
};

// AI Generation Class with Structured Outputs
export class AIUIGenerator {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey?: string) {
    const envApiKey = import.meta.env.VITE_OPENAI_KEY || '';
    this.apiKey = apiKey || envApiKey;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  async generateSingleScreen(
    screenType: string,
    context: AIGenerationContext
  ): Promise<UIScreen> {
    const prompt = this.buildSingleScreenPrompt(screenType, context);

    const response = await this.callAIWithStructuredOutput(prompt, UI_SCREEN_SCHEMA);
    return this.validateAndCleanScreen(response as UIScreen);
  }

  async generateFlow(
    flowPurpose: string,
    screenCount: number,
    context: AIGenerationContext,
    onScreenGenerated?: (screen: UIScreen, index: number, total: number) => void
  ): Promise<UIFlow> {
    const flowId = `flow-${Date.now()}`;
    const screens: UIScreen[] = [];
    
    // Generate theme first
    const theme = this.generateTheme(context);
    
    // Generate screens one by one
    for (let i = 0; i < screenCount; i++) {
      const screenType = this.getScreenTypeForIndex(i, screenCount, flowPurpose);
      const screenContext = {
        ...context,
        previousScreens: screens,
        screenIndex: i,
        totalScreens: screenCount,
        theme
      };
      
      const screen = await this.generateSingleScreen(screenType, screenContext);
      screens.push(screen);
      
      // Call the callback with the generated screen
      if (onScreenGenerated) {
        onScreenGenerated(screen, i, screenCount);
      }
    }
    
    const flow: UIFlow = {
      id: flowId,
      name: `${context.appName || 'App'} ${flowPurpose}`,
      description: `AI-generated ${flowPurpose} flow for ${context.appName}`,
      screens,
      theme
    };
    
    return flow;
  }

  private validateAndCleanScreen(screen: UIScreen): UIScreen {
    // Clean up components to ensure they have proper props
    const cleanedComponents = screen.components.map(component => {
      const cleanedProps = this.getDefaultPropsForComponent(component.type, component.props);
      return {
        ...component,
        props: cleanedProps
      };
    });
    
    return {
      ...screen,
      components: cleanedComponents
    };
  }

  private getDefaultPropsForComponent(type: string, props: any): any {
    const defaults = {
      Title: {
        text: props.text || 'Sample Text',
        variant: props.variant || 'body',
        alignment: props.alignment || 'left',
        color: props.color || '#000000',
        fontWeight: props.fontWeight || 'normal'
      },
      Input: {
        placeholder: props.placeholder || 'Enter text',
        type: props.type || 'text',
        label: props.label || '',
        required: props.required || false,
        value: props.value || ''
      },
      Button: {
        text: props.text || 'Button',
        variant: props.variant || 'primary',
        fullWidth: props.fullWidth !== false,
        disabled: props.disabled || false
      },
      Card: {
        title: props.title || 'Card Title',
        content: props.content || 'Card content',
        highlighted: props.highlighted || false,
        clickable: props.clickable || false,
        imageUrl: props.imageUrl || null
      },
      OptionGroup: {
        title: props.title || 'Select Options',
        options: props.options || [
          { id: '1', label: 'Option 1', value: 'option1' },
          { id: '2', label: 'Option 2', value: 'option2' }
        ],
        type: props.type || 'radio',
        multiSelect: props.multiSelect || false,
        value: props.value || null
      },
      ProgressBar: {
        value: props.value || 50,
        max: props.max || 100,
        color: props.color || '#3B82F6',
        label: props.label || 'Progress',
        showPercentage: props.showPercentage !== false
      },
      Slider: {
        label: props.label || 'Slider',
        min: props.min || 0,
        max: props.max || 100,
        step: props.step || 1,
        unit: props.unit || '',
        initialValue: props.initialValue || 50,
        color: props.color || '#3B82F6'
      },
      ToggleSwitch: {
        label: props.label || 'Toggle',
        value: props.value !== false,
        color: props.color || '#3B82F6',
        description: props.description || ''
      },
      Spacer: {
        height: props.height || 'md'
      },
      Image: {
        src: props.src || 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Image+Placeholder',
        alt: props.alt || 'Image',
        size: props.size || 'md',
        alignment: props.alignment || 'center',
        borderRadius: props.borderRadius || 'md'
      }
    };

    return { ...defaults[type as keyof typeof defaults], ...props };
  }

  private getScreenTypeForIndex(index: number, total: number, flowPurpose: string): string {
    const screenTypes = {
      onboarding: [
        'Welcome & Introduction',
        'Key Features Overview',
        'Profile Setup',
        'Preferences & Customization',
        'Permissions & Settings',
        'Getting Started Guide',
        'Success & Completion'
      ],
      registration: [
        'Welcome',
        'Personal Information',
        'Account Details',
        'Preferences',
        'Verification',
        'Success'
      ],
      checkout: [
        'Cart Review',
        'Shipping Information',
        'Payment Details',
        'Order Summary',
        'Confirmation'
      ]
    };

    const defaultTypes = [
      'Introduction',
      'Information Gathering',
      'Preferences',
      'Review',
      'Completion'
    ];

    const purposeTypes = screenTypes[flowPurpose as keyof typeof screenTypes] || defaultTypes;
    
    // Map the index to available screen types
    if (index < purposeTypes.length) {
      return purposeTypes[index];
    }
    
    // For additional screens beyond predefined types
    return `Step ${index + 1}`;
  }

  private buildSingleScreenPrompt(screenType: string, context: any): string {
    const extendedContext = context as any;
    const screenNumber = (extendedContext.screenIndex || 0) + 1;
    const totalScreens = extendedContext.totalScreens || 1;
    
    let previousScreensSummary = '';
    if (extendedContext.previousScreens && extendedContext.previousScreens.length > 0) {
      const prevScreenNames = extendedContext.previousScreens.map((s: UIScreen) => s.name).join(', ');
      previousScreensSummary = `\nPrevious screens in flow: ${prevScreenNames}`;
    }

    return `Generate a single mobile app screen for: ${screenType} (Screen ${screenNumber} of ${totalScreens}).

Context:
- App Name: ${context.appName || 'Mobile App'}
- App Type: ${context.appType}
- Target Audience: ${context.targetAudience}
- Brand Personality: ${context.brandPersonality}
- Content Tone: ${context.contentTone}
- Screen Purpose: ${screenType}${previousScreensSummary}
${context.description ? `- Description: ${context.description}` : ''}
${extendedContext.theme ? `- Theme Colors: Primary: ${extendedContext.theme.primaryColor}, Secondary: ${extendedContext.theme.secondaryColor}` : ''}

Create a DETAILED and CONTENT-RICH ${screenType} screen with:
1. Multiple relevant components (aim for 6-12 components)
2. Realistic, engaging content specific to ${context.appType} and ${context.targetAudience}
3. Clear visual hierarchy using different Title variants (h1, h2, body)
4. Appropriate spacing with Spacer components
5. Interactive elements where appropriate (Buttons, Inputs, OptionGroups, etc.)
6. Progress indicators if this is part of a multi-step flow
7. Rich, descriptive text that provides value to users

For ${screenType}, focus on:
${this.getScreenTypeGuidance(screenType, context)}

Available Components:
- Title: For headings and text (use multiple with different variants: h1, h2, h3, body, caption)
- Input: For form fields (with descriptive labels and placeholders)
- Button: For actions (primary/secondary variants, descriptive text)
- Card: For feature highlights or information blocks (with title and detailed content)
- OptionGroup: For choices (with clear, descriptive options)
- ProgressBar: For showing progress through the flow
- ToggleSwitch: For settings or preferences
- Image: For visual elements (use placeholder images)
- Slider: For numeric selections
- Spacer: For proper spacing between sections

Remember: This is screen ${screenNumber} of ${totalScreens}, so ${screenNumber === 1 ? 'introduce the app clearly' : screenNumber === totalScreens ? 'provide a satisfying conclusion' : 'maintain flow continuity'}.`;
  }

  private getScreenTypeGuidance(screenType: string, context: AIGenerationContext): string {
    const screenTypeLower = screenType.toLowerCase();
    
    if (screenTypeLower.includes('welcome') || screenTypeLower.includes('introduction')) {
      return `- Eye-catching hero title with app name
- Compelling tagline or value proposition
- Visual elements (use Image component with descriptive placeholder)
- Key benefits or features (use Cards or multiple Titles)
- Clear call-to-action button to proceed
- Optional: Brief description of what users will achieve`;
    }
    
    if (screenTypeLower.includes('profile') || screenTypeLower.includes('personal')) {
      return `- Clear section heading
- Multiple Input fields for user information (name, email, etc.)
- Helpful labels and placeholders for each field
- Optional fields marked clearly
- Progress indicator showing step in process
- Continue button with descriptive text
- Optional: Privacy notice or data usage information`;
    }
    
    if (screenTypeLower.includes('preference') || screenTypeLower.includes('customization')) {
      return `- Descriptive heading about personalizing experience
- Multiple preference options using OptionGroups, ToggleSwitches, or Sliders
- Clear descriptions for each preference
- Visual organization with Cards or sections
- Examples of how preferences affect the experience
- Save/Continue button`;
    }
    
    if (screenTypeLower.includes('feature') || screenTypeLower.includes('overview')) {
      return `- Engaging headline about key features
- 3-5 feature Cards with titles and descriptions
- Visual hierarchy with different text sizes
- Benefits-focused content
- Optional: Icons or images for each feature
- Navigation buttons (Skip/Continue)`;
    }
    
    if (screenTypeLower.includes('success') || screenTypeLower.includes('completion')) {
      return `- Congratulatory headline
- Summary of what was accomplished
- Next steps or quick actions (use Cards or Buttons)
- Encouraging message about getting started
- Primary CTA button to enter the app
- Optional: Quick tips or resources`;
    }
    
    if (screenTypeLower.includes('permission') || screenTypeLower.includes('settings')) {
      return `- Clear explanation of why permissions are needed
- List of permissions with ToggleSwitches
- Description for each permission explaining the benefit
- Optional vs required permissions clearly marked
- Privacy-focused messaging
- Continue button`;
    }
    
    // Default guidance
    return `- Clear, descriptive heading
- Relevant content components based on the screen's purpose
- Logical flow and visual hierarchy
- Appropriate interactive elements
- Clear call-to-action
- Consistent with the app's ${context.brandPersonality} personality`;
  }

  private buildFlowPrompt(flowPurpose: string, screenCount: number, context: AIGenerationContext): string {
    return `Generate a complete mobile app onboarding flow with ${screenCount} screens.

Context:
- App Name: ${context.appName || 'Mobile App'}
- App Type: ${context.appType}
- Target Audience: ${context.targetAudience}
- Brand Personality: ${context.brandPersonality}
- Content Tone: ${context.contentTone}
- Flow Purpose: ${flowPurpose}
${context.description ? `- Description: ${context.description}` : ''}

Create ${screenCount} screens that flow logically together:
1. Welcome/Introduction screen
2. Profile setup or data collection
3. Preferences or customization
4. Completion/success screen

Use engaging content for ${context.targetAudience} with ${context.brandPersonality} brand personality.

Components: Title, Input, Button, Card, OptionGroup, ProgressBar, ToggleSwitch, Spacer

Include a theme with colors appropriate for ${context.appType}.`;
  }

  private async callAIWithStructuredOutput(prompt: string, schema: any): Promise<any> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not provided');
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-2024-08-06',
          messages: [
            {
              role: 'system',
              content: 'You are a mobile UI/UX expert creating engaging mobile app onboarding experiences. Generate relevant, engaging content appropriate for the target audience.'
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "mobile_ui_response",
              strict: true,
              schema: schema
            }
          },
          temperature: 0.7,
          max_tokens: 8000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from AI');
      }

      return JSON.parse(content);
    } catch (error) {
      console.error('AI generation error:', error);
      throw new Error(`Failed to generate UI with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Utility method for backwards compatibility
  async getComponentSuggestions(
    screenType: string,
    purpose: string
  ): Promise<Array<{type: ComponentType, usage: string, required: boolean}>> {
    const suggestions = [
      { type: 'Title' as ComponentType, usage: 'Main heading for the screen', required: true },
      { type: 'Button' as ComponentType, usage: 'Primary action button', required: true },
      { type: 'Card' as ComponentType, usage: 'Content blocks', required: false },
      { type: 'Spacer' as ComponentType, usage: 'Spacing between elements', required: false }
    ];

    if (screenType.includes('form') || screenType.includes('profile')) {
      suggestions.push({ type: 'Input' as ComponentType, usage: 'Form input fields', required: true });
  }

    if (screenType.includes('choice') || screenType.includes('preference')) {
      suggestions.push({ type: 'OptionGroup' as ComponentType, usage: 'Multiple choice options', required: true });
    }

    return suggestions;
  }

  private generateTheme(context: AIGenerationContext) {
    const themes = {
      fitness: {
        primaryColor: '#10B981',
        secondaryColor: '#3B82F6',
        backgroundColor: '#F8FAFC',
        textColor: '#1F2937'
      },
      ecommerce: {
        primaryColor: '#7C3AED',
        secondaryColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        textColor: '#111827'
      },
      productivity: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        backgroundColor: '#F9FAFB',
        textColor: '#374151'
      },
      social: {
        primaryColor: '#EC4899',
        secondaryColor: '#8B5CF6',
        backgroundColor: '#FEF7FF',
        textColor: '#1F2937'
      }
    };

    const defaultTheme = themes.fitness;
    const selectedTheme = themes[context.appType as keyof typeof themes] || defaultTheme;

    return {
      ...selectedTheme,
      borderRadius: 'lg' as const,
      spacing: 'normal' as const,
      fontFamily: context.brandPersonality === 'modern' 
        ? 'Inter, system-ui, sans-serif' 
        : context.brandPersonality === 'playful'
        ? 'Poppins, system-ui, sans-serif'
        : 'Roboto, system-ui, sans-serif'
    };
  }
}

// Utility functions for easier usage
export const generateWelcomeScreen = async (context: AIGenerationContext): Promise<UIScreen> => {
  const generator = new AIUIGenerator();
  return generator.generateSingleScreen('welcome', context);
};

export const generateQuickDemo = (appName: string = 'Demo App'): UIScreen => {
  return {
    id: 'demo-welcome',
    name: 'Welcome',
    bgType: 'gradient',
    bgValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    components: [
      {
        type: 'Spacer',
        props: { height: 'xl' }
      },
      {
        type: 'Title',
        props: {
          text: `Welcome to ${appName}`,
          variant: 'h1',
          alignment: 'center',
          color: '#FFFFFF',
          fontWeight: 'bold'
        }
      },
      {
        type: 'Title',
        props: {
          text: 'Get started with your personalized experience',
          variant: 'body',
          alignment: 'center',
          color: '#E5E7EB'
        }
      },
      {
        type: 'Spacer',
        props: { height: 'lg' }
      },
      {
        type: 'Button',
        props: {
          text: 'Get Started',
          variant: 'primary',
          fullWidth: true
        }
      }
    ]
  };
};