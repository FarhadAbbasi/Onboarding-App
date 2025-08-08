// AI-Driven Mobile UI Generator - JSON Schema Types
// This defines the complete structure for AI-generated mobile UIs

// Base interface for all components with common properties
export interface BaseComponent {
  id?: string;
  styles?: Record<string, any>;
  customStyles?: Record<string, any>;
  className?: string;
}

export type UIScreen = {
  id: string;
  name: string;
  bgType?: "color" | "gradient" | "image";
  bgValue?: string;
  overlayColor?: string;
  components: UIComponent[];
};

export type UIComponent =
  | HTMLComponent
  | TitleComponent
  | InputComponent
  | ButtonComponent
  | OptionGroupComponent
  | ImageComponent
  | ProgressBarComponent
  | SliderComponent
  | CardComponent
  | ToggleComponent
  | SpacerComponent
  | BottomSheetComponent
  | ProgressDotsComponent
  | PlaceholderIllustrationComponent
  | LoadingSpinnerComponent
  | CardGridComponent;

// ===== CORE COMPONENTS =====

export type HTMLComponent = BaseComponent & {
  type: "HTML";
  props: {
    html: string;
    allowScripts?: boolean;
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type TitleComponent = BaseComponent & {
  type: "Title";
  props: {
    text: string;
    variant?: "h1" | "h2" | "h3" | "body" | "caption";
    alignment?: "center" | "left" | "right";
    color?: string;
    fontWeight?: "normal" | "medium" | "semibold" | "bold";
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type InputComponent = BaseComponent & {
  type: "Input";
  props: {
    label?: string;
    placeholder: string;
    type: "text" | "email" | "password" | "number";
    icon?: string;
    required?: boolean;
    value?: string;
    color?: string;
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type ButtonComponent = BaseComponent & {
  type: "Button";
  props: {
    text: string;
    action?: "next" | "submit" | "custom" | "back";
    variant?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
    icon?: string;
    disabled?: boolean;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type OptionGroupComponent = BaseComponent & {
  type: "OptionGroup";
  props: {
    title?: string;
    type?: "radio" | "checkbox";
    multiSelect?: boolean;
    options: OptionItem[];
    value?: string | string[];
    color?: string;
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type OptionItem = {
  id: string;
  label: string;
  value: string;
  icon?: string;
  description?: string;
};

export type ImageComponent = BaseComponent & {
  type: "Image";
  props: {
    src: string;
    alt?: string;
    size?: "sm" | "md" | "lg" | "xl";
    alignment?: "center" | "left" | "right";
    borderRadius?: "none" | "sm" | "md" | "lg" | "full";
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

// ===== ADVANCED COMPONENTS =====

export type ProgressBarComponent = BaseComponent & {
  type: "ProgressBar";
  props: {
    value: number;
    max: number;
    color?: string;
    label?: string;
    showPercentage?: boolean;
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type SliderComponent = BaseComponent & {
  type: "Slider";
  props: {
    label: string;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    initialValue?: number;
    color?: string;
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type CardComponent = BaseComponent & {
  type: "Card";
  props: {
    title: string;
    content?: string;
    icon?: string;
    highlighted?: boolean;
    clickable?: boolean;
    imageUrl?: string;
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type ToggleComponent = BaseComponent & {
  type: "ToggleSwitch";
  props: {
    label: string;
    value: boolean;
    color?: string;
    description?: string;
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type SpacerComponent = BaseComponent & {
  type: "Spacer";
  props: {
    height?: "sm" | "md" | "lg" | "xl";
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type BottomSheetComponent = BaseComponent & {
  type: "BottomSheet";
  props: {
    title: string;
    content: string;
    trigger_text: string;
    action_text?: string;
    isOpen?: boolean;
    variant?: "default" | "success" | "warning" | "info";
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

// ===== SCREEN FLOW TYPES =====

export type UIFlow = {
  id: string;
  name: string;
  description?: string;
  screens: UIScreen[];
  theme?: UITheme;
};

export type UITheme = {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: "sm" | "md" | "lg" | "xl";
  spacing: "compact" | "normal" | "relaxed";
  fontFamily?: string;
};

// ===== SCREEN NAVIGATION =====

export type ScreenAction = {
  type: "navigate" | "submit" | "validate" | "custom";
  target?: string; // screen ID for navigation
  data?: Record<string, any>;
};

// ===== AI GENERATION CONTEXT =====

export type AIGenerationContext = {
  appType: string; // "fitness", "onboarding", "ecommerce", etc.
  appName?: string; // Name of the application
  targetAudience: string;
  brandPersonality: string;
  colorPreferences?: string[];
  contentTone: "formal" | "casual" | "friendly" | "professional";
  flowPurpose: string; // "user registration", "product selection", etc.
  description?: string; // Additional description or notes about the app
};

// ===== VALIDATION SCHEMAS =====

export const COMPONENT_TYPES = [
  "HTML",
  "Title",
  "Input", 
  "Button",
  "OptionGroup",
  "Image",
  "ProgressBar",
  "Slider",
  "Card",
  "ToggleSwitch",
  "Spacer",
  "BottomSheet"
] as const;

export const TEXT_VARIANTS = ["h1", "h2", "h3", "body", "caption"] as const;
export const BUTTON_VARIANTS = ["primary", "secondary", "ghost"] as const;
export const SIZE_VARIANTS = ["sm", "md", "lg", "xl"] as const;
export const ALIGNMENT_OPTIONS = ["center", "left", "right"] as const;

// ===== UTILITY TYPES =====

export type ComponentType = typeof COMPONENT_TYPES[number];
export type TextVariant = typeof TEXT_VARIANTS[number];
export type ButtonVariant = typeof BUTTON_VARIANTS[number];
export type SizeVariant = typeof SIZE_VARIANTS[number];
export type Alignment = typeof ALIGNMENT_OPTIONS[number];

// ===== EXAMPLE SCREEN DATA =====

export const EXAMPLE_WELCOME_SCREEN: UIScreen = {
  id: "welcome",
  name: "Welcome",
  bgType: "gradient",
  bgValue: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  components: [
    {
      type: "Title",
      props: {
        text: "Welcome to Fitly",
        variant: "h1",
        alignment: "center",
        color: "#FFFFFF",
        fontWeight: "bold"
      }
    },
    {
      type: "Title",
      props: {
        text: "Your personal fitness journey starts here",
        variant: "body",
        alignment: "center",
        color: "#E5E7EB"
      }
    },
    {
      type: "Image",
      props: {
        src: "/fitness-illustration.png",
        alt: "Fitness illustration",
        size: "lg",
        alignment: "center"
      }
    },
    {
      type: "Button",
      props: {
        text: "Get Started",
        action: "next",
        variant: "primary",
        fullWidth: true
      }
    }
  ]
};

export const EXAMPLE_ONBOARDING_FLOW: UIFlow = {
  id: "fitness-onboarding",
  name: "Fitness App Onboarding",
  description: "Complete user onboarding flow for a fitness application",
  screens: [
    EXAMPLE_WELCOME_SCREEN,
    {
      id: "goals",
      name: "Fitness Goals",
      bgType: "color",
      bgValue: "#F8FAFC",
      components: [
        {
          type: "Title",
          props: {
            text: "What are your fitness goals?",
            variant: "h2",
            alignment: "center"
          }
        },
        {
          type: "OptionGroup",
          props: {
            type: "checkbox",
            multiSelect: true,
            options: [
              { id: "1", label: "Lose Weight", value: "weight_loss", icon: "⚖️" },
              { id: "2", label: "Build Muscle", value: "muscle_gain", icon: "💪" },
              { id: "3", label: "Improve Endurance", value: "endurance", icon: "🏃" },
              { id: "4", label: "Stay Healthy", value: "health", icon: "❤️" }
            ]
          }
        },
        {
          type: "Button",
          props: {
            text: "Continue",
            action: "next",
            variant: "primary",
            fullWidth: true
          }
        }
      ]
    }
  ],
  theme: {
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    borderRadius: "lg",
    spacing: "normal"
  }
};

// ===== NEW COMPONENTS =====

export type ProgressDotsComponent = BaseComponent & {
  type: "ProgressDots";
  props: {
    total: number;
    current: number;
    color?: string;
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type PlaceholderIllustrationComponent = BaseComponent & {
  type: "PlaceholderIllustration";
  props: {
    type: 'welcome' | 'features' | 'success' | 'team' | 'analytics' | 'security' | 'customize' | 'rocket';
    color?: string;
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type LoadingSpinnerComponent = BaseComponent & {
  type: "LoadingSpinner";
  props: {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type CardGridComponent = BaseComponent & {
  type: "CardGrid";
  props: {
    title?: string;
    multiSelect?: boolean;
    columns?: 2 | 3;
    selectedColor?: string;
    unselectedColor?: string;
    options: CardGridOption[];
    selectedValues?: string[];
    style?: Record<string, any>;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type CardGridOption = {
  id: string;
  title: string;
  description: string;
  icon: string;
  value: string;
};