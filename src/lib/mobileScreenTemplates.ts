import type { UIComponent, UIScreen, AIGenerationContext } from '../types/ui-schema';
import OpenAI from 'openai';

// Mobile content generation types
interface MobileScreenContent {
  title: string;
  subtitle: string;
}

interface MobileAuthScreen {
  id: string;
  title: string;
  subtitle: string;
  components: UIComponent[];
}

interface MobileContentResponse {
  success: boolean;
  screens?: MobileScreenContent[];
  error?: string;
}

interface MobileAuthResponse {
  success: boolean;
  screens?: MobileAuthScreen[];
  error?: string;
}

// Generate mobile onboarding content using GPT
async function generateMobileOnboardingContent(
  appName: string,
  category: string,
  features: string[],
  aiConfig: AIGenerationContext
): Promise<MobileContentResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_KEY;
  
  console.log(`🔑 Checking OpenAI API key: ${apiKey ? `Key exists (${apiKey.length} chars, starts with '${apiKey.substring(0, 7)}...')` : 'NO KEY FOUND'}`);
  
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error('❌ OpenAI API key not configured for mobile content generation. Key:', apiKey);
    return { success: false, error: 'API key not configured' };
  }

  
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const prompt = `
You are an expert mobile app onboarding designer. Create compelling content for 3 onboarding screens for a mobile app.

App Details:
- Name: "${appName}"
- Category: ${category}
- Features: ${features.join(', ')}
- Target Audience: ${aiConfig.targetAudience}
- Brand Personality: ${aiConfig.brandPersonality}
- Content Tone: ${aiConfig.contentTone}

Create 3 onboarding screens that:
1. Welcome users and explain the app's main value
2. Highlight key features and benefits
3. Create excitement and call users to action

Each screen should have:
- A compelling title (max 6 words)
- An engaging subtitle (max 15 words)

Return ONLY valid JSON in this exact format:
{
  "screens": [
    {
      "title": "Welcome to ${appName}",
      "subtitle": "Your subtitle here"
    },
    {
      "title": "Feature highlight title",
      "subtitle": "Feature description here"
    },
    {
      "title": "Call to action title",
      "subtitle": "Motivational subtitle here"
    }
  ]
}
`;

  try {
    console.log('🤖 [Mobile] Generating onboarding content for', appName, 'with config:', aiConfig);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('📡 [Mobile] OpenAI API call successful. Usage:', completion.usage);

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    console.log('📝 [Mobile] Raw GPT response:', responseContent);
    
    const parsed = JSON.parse(responseContent);
    
    if (!parsed.screens || !Array.isArray(parsed.screens)) {
      console.error('❌ [Mobile] Invalid response format. Parsed:', parsed);
      throw new Error('Invalid response format');
    }

    console.log('✅ [Mobile] Generated onboarding content:', parsed.screens);
    return { success: true, screens: parsed.screens };

  } catch (error) {
    console.error('❌ [Mobile] Content generation failed with detailed error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      apiKey: apiKey ? 'Present' : 'Missing'
    });
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Generate mobile auth screens with full component selection using GPT
async function generateMobileAuthContent(
  appName: string,
  category: string,
  features: string[],
  primaryColor: string,
  aiConfig: AIGenerationContext
): Promise<MobileAuthResponse> {
  const apiKey = import.meta.env.VITE_OPENAI_KEY;
  
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.warn('OpenAI API key not configured for auth content generation');
    return { success: false, error: 'API key not configured' };
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const prompt = `
You are an expert mobile app UX designer. Create comprehensive sign up and sign in screens using the available UI components.

App Details:
- Name: "${appName}"
- Category: ${category}
- Features: ${features.join(', ')}
- Target Audience: ${aiConfig.targetAudience}
- Brand Personality: ${aiConfig.brandPersonality}
- Content Tone: ${aiConfig.contentTone}

Available UI Components (choose wisely based on app category and onboarding needs):

IMPORTANT: Use proper colors based on the background:
- Background is gradient with primary color: ${primaryColor}
- Use WHITE (#FFFFFF) for titles on colored backgrounds
- Use light gray (#F3F4F6) for subtitles on colored backgrounds  
- Use contrasting colors for readability

1. Title - For headers and text
   {"type": "Title", "props": {"text": "string", "variant": "h1|h2|h3|body|caption", "alignment": "center|left|right", "color": "#FFFFFF", "fontWeight": "normal|medium|semibold|bold"}}

2. Input - For form fields (beautiful mobile-optimized)
   {"type": "Input", "props": {"label": "string", "placeholder": "string", "type": "text|email|password|number", "required": true|false, "color": "#374151"}}

3. CardGrid - For BEAUTIFUL multi-select card grid (2x3 or 3x2 layout)
   {"type": "CardGrid", "props": {
     "title": "What are your goals?", 
     "multiSelect": true, 
     "columns": 2,
     "selectedColor": "${primaryColor}",
     "options": [
               {"id": "1", "title": "Get Fit", "description": "Transform your body", "icon": "fitness", "value": "fitness"},
        {"id": "2", "title": "Lose Weight", "description": "Burn calories", "icon": "fire", "value": "weight_loss"},
        {"id": "3", "title": "Build Muscle", "description": "Gain strength", "icon": "dumbbell", "value": "muscle"},
        {"id": "4", "title": "Stay Healthy", "description": "Maintain wellness", "icon": "health", "value": "health"},
        {"id": "5", "title": "Track Progress", "description": "Monitor results", "icon": "tracking", "value": "tracking"},
        {"id": "6", "title": "Find Motivation", "description": "Stay inspired", "icon": "motivation", "value": "motivation"}
     ]
   }}

4. Card - For individual selection cards (use CardGrid instead for multi-select)

4. OptionGroup - ONLY for simple dropdowns (not for visual selections)
   {"type": "OptionGroup", "props": {"title": "string", "type": "radio", "options": [{"id": "1", "label": "Option 1", "value": "value1"}]}}

5. Button - For actions  
   {"type": "Button", "props": {"text": "string", "variant": "primary|secondary|ghost", "fullWidth": true, "rounded": "lg", "style": {"backgroundColor": "#FFFFFF", "color": "${primaryColor}"}}}

6. Spacer - For spacing
   {"type": "Spacer", "props": {"height": "sm|md|lg|xl"}}

7. ToggleSwitch - For preferences and settings
   {"type": "ToggleSwitch", "props": {"label": "string", "value": false, "description": "string", "color": "#FFFFFF"}}

Create 2 comprehensive auth screens:

1. Sign Up Screen - Should collect essential user info with appropriate components based on app category
2. Sign In Screen - Should be simple but include relevant options like "Remember me" toggle

For a ${category} app, consider what user information would be valuable to collect during sign up (age range, preferences, goals, etc.)

Return ONLY valid JSON in this exact format:
{
  "screens": [
    {
      "id": "sign-up",
      "title": "Join ${appName}",
      "subtitle": "Create your account to get started",
      "components": [
        {"type": "Spacer", "props": {"height": "lg"}},
        {"type": "Title", "props": {"text": "Create Account", "variant": "h2", "alignment": "center", "color": "#FFFFFF", "fontWeight": "bold"}},
        {"type": "Title", "props": {"text": "Join thousands of users already using ${appName}", "variant": "body", "alignment": "center", "color": "#F3F4F6"}},
        {"type": "Spacer", "props": {"height": "lg"}},
        {"type": "Input", "props": {"label": "Full Name", "placeholder": "Enter your full name", "type": "text", "required": true, "color": "#374151"}},
        {"type": "Input", "props": {"label": "Email", "placeholder": "Enter your email", "type": "email", "required": true, "color": "#374151"}},
        {"type": "Input", "props": {"label": "Password", "placeholder": "Create a password", "type": "password", "required": true, "color": "#374151"}},
        {"type": "Spacer", "props": {"height": "md"}},
        {"type": "CardGrid", "props": {
          "title": "What's your main goal?", 
          "multiSelect": true, 
          "columns": 2,
          "selectedColor": "${primaryColor}",
          "options": [
                    {"id": "1", "title": "Get Fit", "description": "Transform your body", "icon": "fitness", "value": "fitness"},
        {"id": "2", "title": "Lose Weight", "description": "Burn calories", "icon": "fire", "value": "weight_loss"},
        {"id": "3", "title": "Build Muscle", "description": "Gain strength", "icon": "dumbbell", "value": "muscle"},
        {"id": "4", "title": "Stay Healthy", "description": "Maintain wellness", "icon": "health", "value": "health"},
        {"id": "5", "title": "Track Progress", "description": "Monitor results", "icon": "tracking", "value": "tracking"},
        {"id": "6", "title": "Find Motivation", "description": "Stay inspired", "icon": "motivation", "value": "motivation"}
          ]
        }},
        {"type": "Spacer", "props": {"height": "md"}},
        {"type": "ToggleSwitch", "props": {"label": "Send me updates and tips", "value": false, "description": "Get the latest features and tips via email", "color": "#FFFFFF"}},
        {"type": "Spacer", "props": {"height": "lg"}},
        {"type": "Button", "props": {"text": "Create Account", "variant": "primary", "fullWidth": true, "rounded": "lg", "style": {"backgroundColor": "#FFFFFF", "color": "${primaryColor}", "fontWeight": "600"}}}
      ]
    },
    {
      "id": "sign-in", 
      "title": "Welcome Back",
      "subtitle": "Sign in to continue your journey",
      "components": [
        {"type": "Spacer", "props": {"height": "xl"}},
        {"type": "Title", "props": {"text": "Welcome Back", "variant": "h2", "alignment": "center", "color": "#FFFFFF", "fontWeight": "bold"}},
        {"type": "Title", "props": {"text": "Sign in to continue", "variant": "body", "alignment": "center", "color": "#F3F4F6"}},
        {"type": "Spacer", "props": {"height": "lg"}},
        {"type": "Input", "props": {"label": "Email", "placeholder": "Enter your email", "type": "email", "required": true, "color": "#374151"}},
        {"type": "Input", "props": {"label": "Password", "placeholder": "Enter your password", "type": "password", "required": true, "color": "#374151"}},
        {"type": "ToggleSwitch", "props": {"label": "Remember me", "value": false, "description": "Stay signed in on this device", "color": "#FFFFFF"}},
        {"type": "Spacer", "props": {"height": "lg"}},
        {"type": "Button", "props": {"text": "Sign In", "variant": "primary", "fullWidth": true, "rounded": "lg", "style": {"backgroundColor": "#FFFFFF", "color": "${primaryColor}", "fontWeight": "600"}}}
      ]
    }
  ]
}

IMPORTANT: Use CardGrid for multi-select options - creates stunning 2x3 grids.
CRITICAL: For CardGrid icons, use descriptive icon names only (e.g., 'camera', 'travel', 'music') that map to professional Lucide SVG icons. DO NOT use emojis.

- Fitness apps: Experience level CardGrid
  {"type": "CardGrid", "props": {"title": "What's your fitness level?", "columns": 2, "options": [
            {"id": "1", "title": "Beginner", "description": "Just starting out", "icon": "beginner", "value": "beginner"},
        {"id": "2", "title": "Intermediate", "description": "Regular workouts", "icon": "intermediate", "value": "intermediate"},
        {"id": "3", "title": "Advanced", "description": "Experienced athlete", "icon": "advanced", "value": "advanced"},
        {"id": "4", "title": "Professional", "description": "Trainer level", "icon": "professional", "value": "pro"}
  ]}}

- Social apps: Interests CardGrid
  {"type": "CardGrid", "props": {"title": "What interests you?", "columns": 3, "options": [
    {"id": "1", "title": "Photography", "description": "Capture moments", "icon": "photography", "value": "photo"},
    {"id": "2", "title": "Travel", "description": "Explore places", "icon": "travel", "value": "travel"},
    {"id": "3", "title": "Food", "description": "Culinary adventures", "icon": "food", "value": "food"},
    {"id": "4", "title": "Art", "description": "Creative expression", "icon": "art", "value": "art"},
    {"id": "5", "title": "Music", "description": "Sound & rhythm", "icon": "music", "value": "music"},
    {"id": "6", "title": "Fashion", "description": "Style & trends", "icon": "fashion", "value": "fashion"}
  ]}}

- Productivity apps: Work type CardGrid
  {"type": "CardGrid", "props": {"title": "What describes you best?", "columns": 2, "options": [
    {"id": "1", "title": "Freelancer", "description": "Independent work", "icon": "freelancer", "value": "freelancer"},
    {"id": "2", "title": "Team Lead", "description": "Managing projects", "icon": "team", "value": "lead"},
    {"id": "3", "title": "Student", "description": "Learning & studying", "icon": "student", "value": "student"},
    {"id": "4", "title": "Entrepreneur", "description": "Building business", "icon": "entrepreneur", "value": "entrepreneur"}
  ]}}

Use CardGrid with 4-6 options for the best visual impact!
`;

  try {
    console.log('[Mobile] Generating comprehensive auth screens for', appName);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    console.log('[Mobile] Raw GPT auth response:', responseContent);
    
    const parsed = JSON.parse(responseContent);
    
    if (!parsed.screens || !Array.isArray(parsed.screens)) {
      throw new Error('Invalid response format');
    }

    console.log('[Mobile] Generated comprehensive auth screens:', parsed.screens);
    return { success: true, screens: parsed.screens };

  } catch (error) {
    console.error('[Mobile] Auth content generation failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export interface MobileScreenTemplate {
  id: string;
  name: string;
  type: 'splash' | 'onboarding' | 'success' | 'auth';
  bgType: 'gradient' | 'image' | 'color';
  bgValue: string;
  overlayColor?: string;
  components: UIComponent[];
}

// Create a beautiful splash screen - proper mobile layout
export const createMobileSplashScreen = (
  appName: string,
  logoUrl?: string,
  primaryColor: string = '#3B82F6'
): MobileScreenTemplate => ({
  id: 'mobile-splash',
  name: 'Splash Screen',
  type: 'splash',
  bgType: 'gradient',
  bgValue: `linear-gradient(135deg, ${adjustColorBrightness(primaryColor, 40)} 0%, ${primaryColor} 30%, ${adjustColorBrightness(primaryColor, -40)} 70%, ${adjustColorBrightness(primaryColor, -60)} 100%)`,
  components: [
    // Center everything vertically
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    // App logo - perfectly centered and circular
    {
      type: 'Image',
      props: {
        src: logoUrl || `https://via.placeholder.com/120x120/${primaryColor.slice(1)}/FFFFFF?text=${""}`,
        alt: `${appName} Logo`,
        size: 'xl',
        alignment: 'center',
        borderRadius: 'full'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    // Loading spinner at bottom
    {
      type: 'LoadingSpinner',
      props: {
        size: 'md',
        color: '#FFFFFF'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'lg' }
    }
  ]
});

// Create beautiful onboarding screen with full background image and overlay
export const createMobileOnboardingScreen = (
  title: string,
  subtitle: string,
  backgroundImageUrl: string,
  currentStep: number,
  totalSteps: number,
  primaryColor: string,
  buttonText: string = 'Continue'
): MobileScreenTemplate => ({
  id: `mobile-onboarding-${currentStep}`,
  name: `Onboarding ${currentStep}`,
  type: 'onboarding',
  bgType: 'image',
  bgValue: backgroundImageUrl,
  components: [
    // Full screen overlay
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    // Content area - pushed to bottom third
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    // Title - smaller, centered
    {
      type: 'Title',
      props: {
        text: title,
        variant: 'h3',
        alignment: 'center',
        color: '#FFFFFF',
        fontWeight: 'bold',
        className: 'text-lg px-6 drop-shadow-lg'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'sm' }
    },
    // Subtitle - smaller, centered
    {
      type: 'Title',
      props: {
        text: subtitle,
        variant: 'caption',
        alignment: 'center',
        color: '#F3F4F6',
        fontWeight: 'normal',
        className: 'text-sm px-8 leading-relaxed drop-shadow-md'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    // Progress dots
    {
      type: 'ProgressDots',
      props: {
        total: totalSteps,
        current: currentStep - 1,
        color: '#FFFFFF'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'lg' }
    },
    // Beautiful mobile button
    {
      type: 'Button',
      props: {
        text: buttonText,
        variant: 'primary',
        fullWidth: false,
        rounded: 'full',
        className: 'mx-6 py-4 px-12 bg-white text-gray-900 font-semibold shadow-xl',
        style: {
          backgroundColor: '#FFFFFF',
          color: primaryColor,
          borderRadius: '9999px',
          fontSize: '16px',
          fontWeight: '600',
          padding: '16px 48px',
          margin: '0 24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }
      }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    }
  ]
});

// Enhanced background management with validation and fallbacks
import { getBackgroundByScreenType } from './backgroundManager';

// Legacy function maintained for compatibility
export const getCategoryBackgroundImage = (category: string, index: number): string => {
  // This is kept for backward compatibility but should eventually be replaced
  const categoryImages: Record<string, string[]> = {
    'Productivity': [
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1559028006-448665bd7c7f?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=800&fit=crop&crop=center'
    ],
    'Social': [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=800&fit=crop&crop=center'
    ],
    'E-commerce': [
      'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400&h=800&fit=crop&crop=center'
    ],
    'Health & Fitness': [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=800&fit=crop&crop=center',
    ],
    'Education': [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=800&fit=crop&crop=center'
    ],
    'Entertainment': [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=800&fit=crop&crop=center&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=800&fit=crop&crop=center&ixlib=rb-4.0.3',
    ]
  };

  const defaultImages = [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=800&fit=crop&crop=center'
  ];

  const images = categoryImages[category] || defaultImages;
  return images[index % images.length];
};

// Step-by-step mobile flow generation

// Step 1: Generate splash screen (no AI content needed)
export const generateSplashScreen = async (
  appName: string,
  logoUrl: string | undefined,
  primaryColor: string,
  category: string = 'default'
): Promise<MobileScreenTemplate> => {
  try {
    console.log(`🚀 Generating splash screen for: ${appName}, category: ${category}, color: ${primaryColor}`);
    
    // Get gradient background for splash screen
    const backgroundConfig = await getBackgroundByScreenType(
      'splash',
      category,
      0,
      primaryColor
    );
    
    console.log(`🎨 Splash screen background config:`, backgroundConfig);
    
    const result = {
      ...createMobileSplashScreen(appName, logoUrl, primaryColor),
      bgType: backgroundConfig.type,
      bgValue: backgroundConfig.value,
      overlayColor: backgroundConfig.overlayColor
    };
    
    console.log(`✅ Enhanced splash screen created:`, result);
    return result;
  } catch (error) {
    console.warn('❌ Failed to get enhanced splash background, using default:', error);
    return createMobileSplashScreen(appName, logoUrl, primaryColor);
  }
};

// Step 2: Generate onboarding screens (3 screens in 1 AI request)
export const generateOnboardingScreens = async (
  appName: string,
  primaryColor: string,
  category: string,
  features: string[],
  aiConfig: AIGenerationContext
): Promise<MobileScreenTemplate[]> => {
  const screens: MobileScreenTemplate[] = [];
  
  try {
    // Generate content for 3 onboarding screens in 1 AI request
    const gptResponse = await generateMobileOnboardingContent(
      appName,
      category,
      features,
      aiConfig
    );

    let onboardingContent: { title: string; subtitle: string }[];

    if (gptResponse.success && gptResponse.screens) {
      onboardingContent = gptResponse.screens.slice(0, 3);
      console.log('[Mobile] Using AI-generated onboarding content:', onboardingContent);
    } else {
      throw new Error('Failed to generate AI content');
    }

    // Create 3 onboarding screens with enhanced background system
    for (let index = 0; index < onboardingContent.length; index++) {
      const content = onboardingContent[index];
      
      try {
        console.log(`📱 Generating onboarding screen ${index + 1}: ${content.title}`);
        
        // Get enhanced background with validation and fallbacks
        const backgroundConfig = await getBackgroundByScreenType(
          'onboarding',
          category,
          index,
          primaryColor
        );
        
        console.log(`🎨 Onboarding screen ${index + 1} background config:`, backgroundConfig);
        
        const screenResult = {
          ...createMobileOnboardingScreen(
            content.title,
            content.subtitle,
            backgroundConfig.value, // Could be image URL or gradient
            index + 1,
            3,
            primaryColor,
            index === 2 ? 'Get Started' : 'Continue'
          ),
          bgType: backgroundConfig.type,
          bgValue: backgroundConfig.value,
          overlayColor: backgroundConfig.overlayColor || (backgroundConfig.type === 'image' ? 'rgba(0, 0, 0, 0.4)' : undefined)
        };
          
        console.log(`✅ Enhanced onboarding screen ${index + 1} created:`, screenResult);
        screens.push(screenResult);
      } catch (error) {
        console.warn(`❌ Failed to get enhanced background for screen ${index}, using gradient fallback:`, error);
        
        // Fallback to gradient instead of old Netflix system
        const fallbackGradient = `linear-gradient(135deg, ${adjustColorBrightness(primaryColor, 40)} 0%, ${primaryColor} 30%, ${adjustColorBrightness(primaryColor, -40)} 70%, ${adjustColorBrightness(primaryColor, -60)} 100%)`;
        console.log(`🎨 Using gradient fallback for screen ${index + 1}:`, fallbackGradient);
        
        screens.push({
          ...createMobileOnboardingScreen(
            content.title,
            content.subtitle,
            fallbackGradient,
            index + 1,
            3,
            primaryColor,
            index === 2 ? 'Get Started' : 'Continue'
          ),
          bgType: 'gradient',
          bgValue: fallbackGradient,
          overlayColor: undefined
        });
      }
    }

  } catch (error) {
    console.warn('❌ AI content generation failed for onboarding, using enhanced fallback:', error);
    
    // Enhanced fallback to simple content with enhanced backgrounds
    const fallbackContent = getFallbackOnboardingContent(appName, features);
    for (let index = 0; index < fallbackContent.length; index++) {
      const content = fallbackContent[index];
      
      try {
        console.log(`🔄 Creating fallback onboarding screen ${index + 1} with enhanced backgrounds`);
        
        // Use enhanced background system for fallback too
        const backgroundConfig = await getBackgroundByScreenType(
          'onboarding',
          category,
          index,
          primaryColor
        );
        
        console.log(`✅ Enhanced fallback background config:`, backgroundConfig);
        
        screens.push({
          ...createMobileOnboardingScreen(
            content.title,
            content.subtitle,
            backgroundConfig.value,
            index + 1,
            3,
            primaryColor,
            index === 2 ? 'Get Started' : 'Continue'
          ),
          bgType: backgroundConfig.type,
          bgValue: backgroundConfig.value,
          overlayColor: backgroundConfig.overlayColor || (backgroundConfig.type === 'image' ? 'rgba(0, 0, 0, 0.4)' : undefined)
        });
      } catch (fallbackError) {
        console.warn(`❌ Enhanced fallback failed for screen ${index}, using basic fallback:`, fallbackError);
        
        // Final fallback to basic gradient
        screens.push({
          ...createMobileOnboardingScreen(
            content.title,
            content.subtitle,
            `linear-gradient(135deg, ${adjustColorBrightness(primaryColor, 40)} 0%, ${primaryColor} 30%, ${adjustColorBrightness(primaryColor, -40)} 70%, ${adjustColorBrightness(primaryColor, -60)} 100%)`,
            index + 1,
            3,
            primaryColor,
            index === 2 ? 'Get Started' : 'Continue'
          ),
          bgType: 'gradient',
          bgValue: `linear-gradient(135deg, ${adjustColorBrightness(primaryColor, 40)} 0%, ${primaryColor} 30%, ${adjustColorBrightness(primaryColor, -40)} 70%, ${adjustColorBrightness(primaryColor, -60)} 100%)`,
          overlayColor: undefined
        });
      }
    }
  }

  return screens;
};

// Step 3: Generate sign up/sign in screens (separate AI request)
export const generateAuthScreens = async (
  appName: string,
  primaryColor: string,
  category: string,
  features: string[],
  aiConfig: AIGenerationContext
): Promise<MobileScreenTemplate[]> => {
  const screens: MobileScreenTemplate[] = [];
  
  try {
    // Generate content for auth screens in separate AI request
    const gptResponse = await generateMobileAuthContent(
      appName,
      category,
      features,
      primaryColor,
      aiConfig
    );

    if (gptResponse.success && gptResponse.screens) {
      console.log('[Mobile] Using AI-generated comprehensive auth screens:', gptResponse.screens);
      
      // Convert AI-generated screens to MobileScreenTemplate format with enhanced backgrounds
      for (let i = 0; i < gptResponse.screens.length; i++) {
        const authScreen = gptResponse.screens[i];
        
        try {
          // Get auth screen background (subtle gradients)
          const backgroundConfig = await getBackgroundByScreenType(
            'auth',
            category,
            i,
            primaryColor
          );
          
          screens.push({
            id: `mobile-${authScreen.id}`,
            name: authScreen.id === 'sign-up' ? 'Sign Up' : 'Sign In',
            type: 'auth',
            bgType: backgroundConfig.type,
            bgValue: backgroundConfig.value,
            overlayColor: backgroundConfig.overlayColor,
            components: authScreen.components
          });
        } catch (error) {
          console.warn(`Failed to get auth background for ${authScreen.id}, using fallback:`, error);
          
          // Fallback to gradient
          screens.push({
            id: `mobile-${authScreen.id}`,
            name: authScreen.id === 'sign-up' ? 'Sign Up' : 'Sign In',
            type: 'auth',
            bgType: 'gradient',
            bgValue: `linear-gradient(135deg, ${adjustColorBrightness(primaryColor, 40)} 0%, ${primaryColor} 30%, ${adjustColorBrightness(primaryColor, -40)} 70%, ${adjustColorBrightness(primaryColor, -60)} 100%)`,
            components: authScreen.components
          });
        }
      }
    } else {
      throw new Error('Failed to generate auth content');
    }

  } catch (error) {
    console.warn('AI content generation failed for auth, using fallback:', error);
    
    // Fallback auth screens
    screens.push(
      createBasicAuthScreen('sign-up', 'Create Account', `Join ${appName} today`, primaryColor, 'Sign Up'),
      createBasicAuthScreen('sign-in', 'Welcome Back', 'Sign in to continue', primaryColor, 'Sign In')
    );
  }

  return screens;
};

// Convert MobileScreenTemplate to UIScreen
// Convert MobileScreenTemplate to UIScreen
function convertMobileScreenToUIScreen(template: MobileScreenTemplate): UIScreen {
  return {
    id: template.id,
    name: template.name,
    bgType: template.bgType,
    bgValue: template.bgValue,
    overlayColor: template.overlayColor,
    components: template.components
  };
}

// Complete flow builder that combines all steps
export const generateCompleteFlow = async (
  appName: string,
  logoUrl: string | undefined,
  primaryColor: string,
  category: string,
  features: string[],
  aiConfig: AIGenerationContext
): Promise<UIScreen[]> => {
  const allScreens: MobileScreenTemplate[] = [];
  
  // Step 1: Splash screen (no AI needed)
  const splashScreen = await generateSplashScreen(appName, logoUrl, primaryColor, category);
  allScreens.push(splashScreen);
  
  // Step 2: Onboarding screens (1 AI request for 3 screens)
  const onboardingScreens = await generateOnboardingScreens(appName, primaryColor, category, features, aiConfig);
  allScreens.push(...onboardingScreens);
  
  // Step 3: Auth screens (separate AI request)
  const authScreens = await generateAuthScreens(appName, primaryColor, category, features, aiConfig);
  allScreens.push(...authScreens);
  
  // Convert MobileScreenTemplate[] to UIScreen[]
  return allScreens.map(convertMobileScreenToUIScreen);
};

// Fallback content for onboarding screens when AI generation is not available
function getFallbackOnboardingContent(
  appName: string,
  features: string[]
): { title: string; subtitle: string }[] {
  return [
    {
      title: `Welcome to ${appName}`,
      subtitle: features[0] || 'Experience something amazing designed just for you.'
    },
    {
      title: 'Powerful Features',
      subtitle: features[1] || 'Everything you need to succeed, beautifully crafted and easy to use.'
    },
    {
      title: 'Get Started Today',
      subtitle: features[2] || 'Join thousands of users who are already loving their experience.'
    }
  ];
}

// Create basic authentication screen template (fallback)
function createBasicAuthScreen(
  type: 'sign-up' | 'sign-in',
  title: string,
  subtitle: string,
  primaryColor: string,
  buttonText: string
): MobileScreenTemplate {
  return {
    id: `mobile-${type}`,
    name: type === 'sign-up' ? 'Sign Up' : 'Sign In',
    type: 'onboarding',
    bgType: 'gradient',
    bgValue: `linear-gradient(135deg, ${adjustColorBrightness(primaryColor, 40)} 0%, ${primaryColor} 30%, ${adjustColorBrightness(primaryColor, -40)} 70%, ${adjustColorBrightness(primaryColor, -60)} 100%)`,
    components: [
      {
        type: 'Spacer',
        props: { height: 'xl' }
      },
      {
        type: 'Spacer',
        props: { height: 'xl' }
      },
      // Title
      {
        type: 'Title',
        props: {
          text: title,
          variant: 'h2',
          alignment: 'center',
          color: '#FFFFFF',
          fontWeight: 'bold',
          className: 'text-xl px-6 drop-shadow-lg'
        }
      },
      {
        type: 'Spacer',
        props: { height: 'sm' }
      },
      // Subtitle
      {
        type: 'Title',
        props: {
          text: subtitle,
          variant: 'body',
          alignment: 'center',
          color: '#F3F4F6',
          fontWeight: 'normal',
          className: 'text-base px-8 leading-relaxed drop-shadow-md'
        }
      },
      {
        type: 'Spacer',
        props: { height: 'xl' }
      },
      // Email input
      {
        type: 'Input',
        props: {
          placeholder: 'Email address',
          type: 'email',
          label: 'Email',
          required: true
        }
      },
      // Password input
      {
        type: 'Input',
        props: {
          placeholder: 'Password',
          type: 'password',
          label: 'Password',
          required: true
        }
      },
      {
        type: 'Spacer',
        props: { height: 'lg' }
      },
      // Action button
      {
        type: 'Button',
        props: {
          text: buttonText,
          variant: 'primary',
          fullWidth: true,
          rounded: 'lg',
          style: {
            backgroundColor: '#FFFFFF',
            color: primaryColor,
            fontWeight: '600'
          }
        }
      },
      {
        type: 'Spacer',
        props: { height: 'xl' }
      }
    ]
  };
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}