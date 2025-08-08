import React, { useState } from 'react';
import { X, Wand2, ArrowRight, ArrowLeft, Smartphone, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { AIUIGenerator } from '../../lib/aiUIGenerator';
import { TemplateSelector, type AppTemplate, type UserInfoField } from '../../lib/templateSelector';
import { getSmartColors } from '../../lib/colorUtils';
import { MobileFrame } from '../ui/MobileFrame';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { AppStoreAPI } from '../../lib/appStoreAPI';
import { ColorDetector } from '../../lib/colorDetection';
import { generateCompleteFlow } from '../../lib/mobileScreenTemplates';
import type { UIFlow, AIGenerationContext } from '../../types/ui-schema';
import type { Database } from '../../lib/supabase';

type Project = Database['public']['Tables']['projects']['Row'];

interface NewProjectWizardProps {
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

type WizardStep = 'project-details' | 'app-info-preview' | 'preview' | 'generating';
type InputMethod = 'url' | 'manual';

const categories = [
  'Productivity',
  'Social', 
  'E-commerce',
  'Education',
  'Health & Fitness',
  'Entertainment',
  'Business',
  'Travel',
  'Finance',
  'Other'
];

const tones = [
  { value: 'professional', label: 'Professional', description: 'Formal and trustworthy' },
  { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { value: 'casual', label: 'Casual', description: 'Relaxed and conversational' },
  { value: 'formal', label: 'Formal', description: 'Official and structured' }
];

const brandPersonalities = [
  { value: 'modern', label: 'Modern', description: 'Clean and contemporary' },
  { value: 'playful', label: 'Playful', description: 'Fun and energetic' },
  { value: 'professional', label: 'Professional', description: 'Serious and reliable' },
  { value: 'minimalist', label: 'Minimalist', description: 'Simple and elegant' },
  { value: 'bold', label: 'Bold', description: 'Strong and confident' }
];

const flowPurposes = [
  { value: 'user-onboarding', label: 'User Onboarding', description: 'Welcome new users and explain features' },
  { value: 'product-showcase', label: 'Product Showcase', description: 'Highlight key features and benefits' },
  { value: 'user-registration', label: 'User Registration', description: 'Collect user information and preferences' },
  { value: 'feature-introduction', label: 'Feature Introduction', description: 'Introduce specific app features' },
  { value: 'getting-started', label: 'Getting Started', description: 'Guide users through initial setup' }
];

const colorSchemes = [
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Professional & trustworthy',
    primary: '#3B82F6',
    secondary: '#06B6D4', 
    accent: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'forest-green', 
    name: 'Forest Green',
    description: 'Natural & growth-focused',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#34D399',
    gradient: 'linear-gradient(135deg, #85FFBD 0%, #FFFB7D 100%)'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange', 
    description: 'Energetic & creative',
    primary: '#F59E0B',
    secondary: '#F97316',
    accent: '#FB923C',
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Premium & innovative',
    primary: '#8B5CF6',
    secondary: '#A855F7',
    accent: '#C084FC',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'cherry-red',
    name: 'Cherry Red',
    description: 'Bold & attention-grabbing',
    primary: '#EF4444',
    secondary: '#DC2626',
    accent: '#F87171',
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  },
  {
    id: 'midnight-black',
    name: 'Midnight Black',
    description: 'Elegant & sophisticated',
    primary: '#1F2937',
    secondary: '#374151',
    accent: '#6B7280',
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)'
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Luxurious & feminine',
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#F472B6',
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
  },
  {
    id: 'electric-teal',
    name: 'Electric Teal',
    description: 'Modern & tech-savvy',
    primary: '#14B8A6',
    secondary: '#0D9488',
    accent: '#2DD4BF',
    gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
];

export function NewProjectWizard({ onClose, onProjectCreated }: NewProjectWizardProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<WizardStep>('project-details');
  const [loading, setLoading] = useState(false);
  const [inputMethod, setInputMethod] = useState<InputMethod>('url');
  
  // Project details
  const [projectData, setProjectData] = useState({
    name: '',
    url: '',
    category: '',
    notes: '',
    prompt: ''
  });
  
  // App Store data
  const [appStoreData, setAppStoreData] = useState<{
    name: string;
    description: string;
    logo: string;
    genre: string;
    screenshots: string[];
    colorPalette?: string[];
    developerName?: string;
    rating?: number;
    price?: string;
    features?: string[];
  } | null>(null);

  // AI Configuration
  const [aiConfig, setAiConfig] = useState<AIGenerationContext>({
    appType: '',
    targetAudience: '',
    brandPersonality: 'modern',
    colorPreferences: [],
    contentTone: 'friendly',
    flowPurpose: 'user-onboarding'
  });

  // Add a separate state for color scheme selection
  const [selectedColorSchemeId, setSelectedColorSchemeId] = useState('ocean-blue');

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null);
  const [additionalUserFields, setAdditionalUserFields] = useState<UserInfoField[]>([]);
  const [templateConfidence, setTemplateConfidence] = useState<number>(0);

  // Generated content
  const [generatedFlow, setGeneratedFlow] = useState<UIFlow | null>(null);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);

  const handleProjectDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProjectData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const fetchAppStoreData = async () => {
    setLoading(true);
    try {
      const appData = await AppStoreAPI.fetchAppData(projectData.url);
      
      if (!appData) {
        toast.error('Failed to fetch app information. Please check the URL.');
        setLoading(false);
        return;
      }

      // Detect colors from logo and screenshots
      console.log('🎨 Starting color detection for app:', appData.name);
      console.log('🎨 Logo URL:', appData.logo);
      console.log('🎨 Screenshots:', appData.screenshots);
      
      const colorPalette = await ColorDetector.detectColorPalette(appData.logo, appData.screenshots);
      console.log('🎨 Final detected palette:', colorPalette);
      
      const suggestedSchemeId = ColorDetector.matchToColorScheme(colorPalette);
      console.log('🎨 Suggested scheme ID:', suggestedSchemeId);
      
      setAppStoreData({
        ...appData,
        colorPalette: [colorPalette.primary, colorPalette.secondary, colorPalette.accent]
      });

      // Update project data with fetched info
      setProjectData(prev => ({
        ...prev,
        category: AppStoreAPI.mapGenreToCategory(appData.genre),
        prompt: appData.description.slice(0, 500),
        notes: `Genre: ${appData.genre}
Developer: ${appData.developerName || 'Unknown'}
Rating: ${appData.rating ? `${appData.rating.toFixed(1)} stars` : 'Not rated'}`
      }));

      // Set the detected color scheme
      setSelectedColorSchemeId(suggestedSchemeId);
      
      // Auto-populate AI config based on app data
      setAiConfig(prev => ({
        ...prev,
        targetAudience: appData.genre === 'Games' ? 'Gamers and casual players' : 
                       appData.genre === 'Business' ? 'Professionals and entrepreneurs' :
                       appData.genre === 'Education' ? 'Students and learners' :
                       appData.genre === 'Social Networking' ? 'Social media users' :
                       'General users',
        flowPurpose: 'user-onboarding',
        brandPersonality: appData.genre === 'Games' ? 'playful' : 
                         appData.genre === 'Business' ? 'professional' : 'modern',
        contentTone: appData.genre === 'Games' ? 'casual' : 
                    appData.genre === 'Business' ? 'professional' : 'friendly'
      }));

      setCurrentStep('app-info-preview');
      toast.success('App information fetched successfully!');
    } catch (error) {
      console.error('Error fetching app data:', error);
      toast.error('Failed to fetch app information. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleAiConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setAiConfig(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleNext = async () => {
    if (currentStep === 'project-details') {
      if (!projectData.name) {
        toast.error('Please enter a project name');
        return;
      }
      
      if (inputMethod === 'url') {
        if (!projectData.url) {
          toast.error('Please enter an App Store URL');
          return;
        }
        await fetchAppStoreData();
      } else {
        // Manual input validation
        if (!projectData.category || !projectData.prompt) {
          toast.error('Please fill in all required fields');
          return;
        }
        // Set default AI config for manual input
        setAiConfig(prev => ({
          ...prev,
          targetAudience: projectData.prompt.slice(0, 100),
          flowPurpose: 'user-onboarding',
          brandPersonality: 'modern',
          contentTone: 'friendly'
        }));
        generateMobileFlow();
      }
    } else if (currentStep === 'app-info-preview') {
      generateMobileFlow();
    } else if (currentStep === 'preview') {
      createProject();
    }
  };

  const handleBack = () => {
    if (currentStep === 'app-info-preview') {
      setCurrentStep('project-details');
    } else if (currentStep === 'preview') {
      setCurrentStep(inputMethod === 'url' ? 'app-info-preview' : 'project-details');
    }
  };

  const generateMobileFlow = async () => {
    setCurrentStep('generating');
    setLoading(true);

    try {
      // First, use GPT to select the best template based on the prompt
      const templateSelector = new TemplateSelector();
      const templateResult = await templateSelector.selectBestTemplate(
        projectData.prompt,
        projectData.category
      );

      setSelectedTemplate(templateResult.template);
      setAdditionalUserFields(templateResult.additionalUserFields);
      setTemplateConfidence(templateResult.confidence);

      console.log('🎯 Template Selected:', templateResult.template.name, 
                  `(${templateResult.confidence}% confidence)`);

      // Map project category to AI context
      const contextWithProject: AIGenerationContext = {
        ...aiConfig,
        appType: templateResult.template.id,
        appName: projectData.name,
        flowPurpose: `${aiConfig.flowPurpose} for ${projectData.name}`,
        description: `${projectData.prompt}

Template: ${templateResult.template.name}
${projectData.notes ? `Additional Notes: ${projectData.notes}` : ''}`
      };

      // Generate flow using the new template system
      const selectedColorScheme = colorSchemes.find(scheme => scheme.id === selectedColorSchemeId) || colorSchemes[0];
      const enhancedFlow = {
        id: `mobile-flow-${Date.now()}`,
        name: `${projectData.name} Mobile Onboarding`,
        description: `Beautiful mobile onboarding for ${projectData.name}`,
        screens: await generateCompleteFlow(
          projectData.name,
          appStoreData?.logo,
          selectedColorScheme.primary,
          projectData.category,
          appStoreData?.features || [],
          contextWithProject
        ),
        theme: {
          primaryColor: selectedColorScheme.primary,
          secondaryColor: selectedColorScheme.secondary,
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          borderRadius: 'lg' as const,
          spacing: 'normal' as const,
          fontFamily: 'Inter, system-ui, sans-serif'
        }
      };
      
      setGeneratedFlow(enhancedFlow);
      setCurrentStep('preview');
      toast.success('Modern onboarding flow created successfully!');

    } catch (error) {
      console.error('Flow generation error:', error);
      
      // Fallback to the main comprehensive flow
      try {
        const selectedColorScheme = colorSchemes.find(scheme => scheme.id === selectedColorSchemeId) || colorSchemes[0];
        const mainFlow = {
          id: `mobile-flow-fallback-${Date.now()}`,
          name: `${projectData.name} Mobile Onboarding`,
          description: `Mobile onboarding for ${projectData.name}`,
          screens: await generateCompleteFlow(
            projectData.name,
            undefined,
            selectedColorScheme.primary,
            projectData.category,
            [],
            // Fallback AI config
            {
              appType: projectData.category,
              appName: projectData.name,
              targetAudience: 'general users',
              brandPersonality: 'friendly',
              contentTone: 'friendly',
              flowPurpose: 'onboard new users'
            }
          ),
          theme: {
            primaryColor: selectedColorScheme.primary,
            secondaryColor: selectedColorScheme.secondary,
            backgroundColor: '#FFFFFF',
            textColor: '#1F2937',
            borderRadius: 'lg' as const,
            spacing: 'normal' as const,
            fontFamily: 'Inter, system-ui, sans-serif'
          }
        };
        setGeneratedFlow(mainFlow);
        setCurrentStep('preview');
        toast.success('Comprehensive onboarding flow created successfully!');
      } catch (fallbackError) {
        console.error('Main flow generation error:', fallbackError);
        toast.error('Failed to generate onboarding flow. Please check your inputs and try again.');
        setCurrentStep('ai-config');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create template-based flow with GPT-generated user info forms
  const createTemplateBasedFlow = (
    template: AppTemplate,
    additionalFields: UserInfoField[],
    projectData: any,
    aiConfig: AIGenerationContext
  ) => {
    // Use selected color scheme with smart color calculations
    const selectedColorScheme = colorSchemes.find(scheme => scheme.id === selectedColorSchemeId) || colorSchemes[0];

    // Default colors for general use
    const colors = {
      primary: selectedColorScheme.primary,
      secondary: selectedColorScheme.secondary,
      accent: selectedColorScheme.accent,
      background: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      gradient: selectedColorScheme.gradient,
      cardGradient: selectedColorScheme.gradient
    };

    // Create 9 unique screens with varied content
    const screens = [];
    
    // Screen 1: Welcome/Splash Screen
    const welcomeScreen = {
      id: 'welcome-splash',
      name: 'Welcome',
      bgType: 'gradient' as const,
      bgValue: selectedColorScheme.gradient
    };
    const welcomeColors = getSmartColors(welcomeScreen, selectedColorScheme);
    
    screens.push({
      ...welcomeScreen,
      components: [
        {
          type: 'Spacer' as const,
          props: { height: 'xl' as const }
        },
        {
          type: 'Title' as const,
          props: {
            text: template.features[0] || '🚀',
            variant: 'h1' as const,
            alignment: 'center' as const,
            color: welcomeColors.text,
            fontWeight: 'bold' as const
          }
        },
        {
          type: 'Title' as const,
          props: {
            text: `Welcome to ${projectData.name}`,
            variant: 'h1' as const,
            alignment: 'center' as const,
            color: welcomeColors.text,
            fontWeight: 'bold' as const
          }
        },
        {
          type: 'Title' as const,
          props: {
            text: template.description,
            variant: 'body' as const,
            alignment: 'center' as const,
            color: welcomeColors.textSecondary,
            fontWeight: 'normal' as const
          }
        },
        {
          type: 'Spacer' as const,
          props: { height: 'xl' as const }
        },
        {
          type: 'Button' as const,
          props: {
            text: 'Get Started',
            variant: 'primary' as const,
            fullWidth: true
          }
        }
      ]
    });

    // Screen 2: Features Overview
    const featuresScreen = {
      id: 'features-overview',
      name: 'Key Features',
      bgType: 'color' as const,
      bgValue: '#F8FAFC'
    };
    const featuresColors = getSmartColors(featuresScreen, selectedColorScheme);
    
    screens.push({
      ...featuresScreen,
      components: [
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'Title' as const,
          props: {
            text: 'What You Can Do',
            variant: 'h1' as const,
            alignment: 'center' as const,
            color: featuresColors.text,
            fontWeight: 'bold' as const
          }
        },
        {
          type: 'Spacer' as const,
          props: { height: 'md' as const }
        },
        ...template.features.slice(0, 3).map((feature, idx) => ({
          type: 'Card' as const,
          props: {
            title: `✨ ${feature}`,
            content: `Discover how ${feature.toLowerCase()} can help you achieve your goals with ${projectData.name}.`,
            highlighted: idx === 0
          }
        })),
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'Button' as const,
          props: {
            text: 'Continue',
            variant: 'primary' as const,
            fullWidth: true
          }
        }
      ]
    });

    // Screen 3-6: User Info Collection (using template fields + additional fields)
    const allUserFields = [...(template.screens.reduce((acc, screen) => [...acc, ...(screen.userInfoFields || [])], [])), ...additionalFields];
    const fieldsPerScreen = Math.ceil(allUserFields.length / 4);
    
    for (let screenIndex = 0; screenIndex < 4; screenIndex++) {
      const screenFields = allUserFields.slice(screenIndex * fieldsPerScreen, (screenIndex + 1) * fieldsPerScreen);
      if (screenFields.length === 0) continue;

      const userInfoScreen = {
        id: `user-info-${screenIndex + 1}`,
        name: `Setup Step ${screenIndex + 1}`,
        bgType: screenIndex % 2 === 0 ? 'gradient' as const : 'color' as const,
        bgValue: screenIndex % 2 === 0 ? selectedColorScheme.gradient : '#F8FAFC'
      };
      const userInfoColors = getSmartColors(userInfoScreen, selectedColorScheme);

      screens.push({
        ...userInfoScreen,
        components: [
          {
            type: 'Spacer' as const,
            props: { height: 'lg' as const }
          },
          {
            type: 'Title' as const,
            props: {
              text: screenIndex === 0 ? 'Tell Us About Yourself' : 
                    screenIndex === 1 ? 'Your Preferences' :
                    screenIndex === 2 ? 'Customize Experience' : 'Final Details',
              variant: 'h1' as const,
              alignment: 'center' as const,
              color: userInfoColors.text,
              fontWeight: 'bold' as const
            }
          },
          {
            type: 'Title' as const,
            props: {
              text: `Help us personalize ${projectData.name} for you`,
              variant: 'body' as const,
              alignment: 'center' as const,
              color: userInfoColors.textSecondary,
              fontWeight: 'normal' as const
            }
          },
          {
            type: 'Spacer' as const,
            props: { height: 'lg' as const }
          },
          ...screenFields.map((field) => {
            if (field.type === 'checkbox' || field.type === 'select') {
              return {
                type: 'OptionGroup' as const,
                props: {
                  title: field.label,
                  type: field.type === 'checkbox' ? 'checkbox' as const : 'radio' as const,
                  multiSelect: field.type === 'checkbox',
                  options: (field.options || []).map((option, idx) => ({
                    id: `${field.id}-${idx}`,
                    label: option,
                    value: option.toLowerCase().replace(/\s+/g, '-')
                  }))
                }
              };
            } else {
              return {
                type: 'Input' as const,
                props: {
                  label: field.label,
                  placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
                  type: field.type === 'textarea' ? 'text' as const : field.type as any,
                  required: field.required || false
                }
              };
            }
          }),
          {
            type: 'Spacer' as const,
            props: { height: 'lg' as const }
          },
          {
            type: 'ProgressBar' as const,
            props: {
              value: ((screenIndex + 3) / 9) * 100,
              max: 100,
              label: 'Setup Progress',
              showPercentage: true
            }
          },
          {
            type: 'Spacer' as const,
            props: { height: 'lg' as const }
          },
          {
            type: 'Button' as const,
            props: {
              text: 'Continue',
              variant: 'primary' as const,
              fullWidth: true
            }
          }
        ]
      });
    }

    // Screen 7: Permissions/Settings
    screens.push({
      id: 'permissions',
      name: 'Permissions',
      bgType: 'color' as const,
      bgValue: colors.background,
      components: [
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'Title' as const,
          props: {
            text: '🔐 Privacy & Permissions',
            variant: 'h1' as const,
            alignment: 'center' as const,
            color: colors.text,
            fontWeight: 'bold' as const
          }
        },
        {
          type: 'Title' as const,
          props: {
            text: `Help ${projectData.name} work better for you`,
            variant: 'body' as const,
            alignment: 'center' as const,
            color: colors.textSecondary,
            fontWeight: 'normal' as const
          }
        },
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'ToggleSwitch' as const,
          props: {
            label: 'Push Notifications',
            value: true,
            description: `Get updates about new ${template.category.toLowerCase()} features`
          }
        },
        {
          type: 'ToggleSwitch' as const,
          props: {
            label: 'Location Services',
            value: false,
            description: 'Enable location-based features and recommendations'
          }
        },
        {
          type: 'ToggleSwitch' as const,
          props: {
            label: 'Analytics',
            value: true,
            description: 'Help us improve the app with anonymous usage data'
          }
        },
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'Button' as const,
          props: {
            text: 'Continue',
            variant: 'primary' as const,
            fullWidth: true
          }
        }
      ]
    });

    // Screen 8: Preview/Summary
    screens.push({
      id: 'preview-summary',
      name: 'Almost Ready',
      bgType: 'gradient' as const,
      bgValue: colors.gradient,
      components: [
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'Title' as const,
          props: {
            text: '🎉 You\'re All Set!',
            variant: 'h1' as const,
            alignment: 'center' as const,
            color: colors.accent,
            fontWeight: 'bold' as const
          }
        },
        {
          type: 'Title' as const,
          props: {
            text: `Your personalized ${projectData.name} experience is ready`,
            variant: 'body' as const,
            alignment: 'center' as const,
            color: colors.secondary,
            fontWeight: 'normal' as const
          }
        },
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'Card' as const,
          props: {
            title: '✨ What\'s Next?',
            content: `Start exploring all the ${template.category.toLowerCase()} features we've prepared just for you.`,
            highlighted: true
          }
        },
        {
          type: 'Card' as const,
          props: {
            title: '🚀 Quick Start',
            content: `${template.features[0] || 'Core features'} are now ready to use based on your preferences.`,
            highlighted: false
          }
        },
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'ProgressBar' as const,
          props: {
            value: 90,
            max: 100,
            label: 'Setup Progress',
            showPercentage: true
          }
        },
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'Button' as const,
          props: {
            text: 'Continue',
            variant: 'primary' as const,
            fullWidth: true
          }
        }
      ]
    });

    // Screen 9: Completion
    screens.push({
      id: 'completion',
      name: 'Welcome Aboard!',
      bgType: 'gradient' as const,
      bgValue: colors.gradient,
      components: [
        {
          type: 'Spacer' as const,
          props: { height: 'xl' as const }
        },
        {
          type: 'Title' as const,
          props: {
            text: '🎊',
            variant: 'h1' as const,
            alignment: 'center' as const,
            color: colors.accent,
            fontWeight: 'bold' as const
          }
        },
        {
          type: 'Title' as const,
          props: {
            text: 'Welcome Aboard!',
            variant: 'h1' as const,
            alignment: 'center' as const,
            color: colors.primary,
            fontWeight: 'bold' as const
          }
        },
        {
          type: 'Title' as const,
          props: {
            text: `You're ready to start your ${template.category.toLowerCase()} journey with ${projectData.name}`,
            variant: 'body' as const,
            alignment: 'center' as const,
            color: colors.secondary,
            fontWeight: 'normal' as const
          }
        },
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'ProgressBar' as const,
          props: {
            value: 100,
            max: 100,
            label: 'Setup Complete',
            showPercentage: true
          }
        },
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'Card' as const,
          props: {
            title: '🎯 Your Journey Starts Now',
            content: `${template.features.join(', ')} - everything is ready for you in ${projectData.name}.`,
            highlighted: true
          }
        },
        {
          type: 'Spacer' as const,
          props: { height: 'lg' as const }
        },
        {
          type: 'Button' as const,
          props: {
            text: `Start Using ${projectData.name}`,
            variant: 'primary' as const,
            fullWidth: true
          }
        }
      ]
    });

    return {
      id: `template-flow-${Date.now()}`,
      name: `${projectData.name} - ${template.name}`,
      description: `Onboarding flow based on ${template.name} template with personalized user information collection`,
      screens,
      theme: {
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        backgroundColor: colors.background,
        textColor: colors.text,
        borderRadius: 'lg' as const,
        spacing: 'normal' as const,
        fontFamily: aiConfig.brandPersonality === 'modern' ? 'Inter, system-ui, sans-serif' : 
                   aiConfig.brandPersonality === 'playful' ? 'Poppins, system-ui, sans-serif' : 
                   'Roboto, system-ui, sans-serif'
      }
    };
  };

  // Create the main onboarding flow with beautiful, modern screens inspired by top apps
  const createCustomizedDemo = (projectData: any, aiConfig: AIGenerationContext) => {
    // Enhanced color schemes with gradients and modern palettes
    const categoryColors = {
      'productivity': { 
        primary: '#3B82F6', 
        secondary: '#10B981', 
        accent: '#F59E0B',
        background: '#F8FAFC',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        cardGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      'social': { 
        primary: '#8B5CF6', 
        secondary: '#EC4899', 
        accent: '#06B6D4',
        background: '#FDF4FF',
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        cardGradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
      },
      'e-commerce': { 
        primary: '#059669', 
        secondary: '#DC2626', 
        accent: '#F59E0B',
        background: '#F0FDF4',
        gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        cardGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      },
      'education': { 
        primary: '#F59E0B', 
        secondary: '#3B82F6', 
        accent: '#10B981',
        background: '#FFFBEB',
        gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
        cardGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      },
      'health & fitness': { 
        primary: '#10B981', 
        secondary: '#059669', 
        accent: '#8B5CF6',
        background: '#F0FDF4',
        gradient: 'linear-gradient(135deg, #d1ead3 0%, #d1ead3 100%)',
        cardGradient: 'linear-gradient(135deg, #85FFBD 0%, #FFFB7D 100%)'
      },
      'entertainment': { 
        primary: '#EF4444', 
        secondary: '#F97316', 
        accent: '#8B5CF6',
        background: '#FEF2F2',
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        cardGradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
      },
      'business': { 
        primary: '#374151', 
        secondary: '#6B7280', 
        accent: '#3B82F6',
        background: '#F9FAFB',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        cardGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      },
      'travel': { 
        primary: '#06B6D4', 
        secondary: '#0891B2', 
        accent: '#F59E0B',
        background: '#F0F9FF',
        gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        cardGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
      },
      'finance': { 
        primary: '#1F2937', 
        secondary: '#059669', 
        accent: '#F59E0B',
        background: '#F9FAFB',
        gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
        cardGradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
      },
      'other': { 
        primary: '#6366F1', 
        secondary: '#8B5CF6', 
        accent: '#EC4899',
        background: '#F8FAFC',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        cardGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
      }
    };

    // Use selected color scheme instead of category-based colors
    const selectedColorScheme = colorSchemes.find(scheme => scheme.id === selectedColorSchemeId) || colorSchemes[0];
    const colors = {
      primary: selectedColorScheme.primary,
      secondary: selectedColorScheme.secondary,
      accent: selectedColorScheme.accent,
      background: '#F8FAFC',
      text: '#1F2937',
      textSecondary: '#6B7280',
      gradient: selectedColorScheme.gradient,
      cardGradient: selectedColorScheme.gradient
    };

    // Enhanced category content with modern copy and engaging messaging
    const categoryContent = {
      'productivity': {
        icon: '⚡',
        heroTitle: 'Supercharge Your Productivity',
        heroSubtitle: 'Transform how you work with smart automation and intuitive design',
        tagline: 'Work smarter, not harder',
        welcomeMessage: `Welcome to ${projectData.name}! Ready to revolutionize your workflow?`,
        features: [
          { icon: '🎯', title: 'Smart Focus Mode', desc: 'AI-powered distraction blocking and deep work sessions' },
          { icon: '⚡', title: 'Lightning Automation', desc: 'Automate repetitive tasks and save hours every day' },
          { icon: '📊', title: 'Intelligent Analytics', desc: 'Track your productivity patterns and optimize performance' }
        ],
        benefits: ['Save 2+ hours daily', 'Reduce stress and overwhelm', 'Achieve more with less effort'],
        testimonial: {
          text: "This app completely transformed my workflow. I'm getting twice as much done!",
          author: "Sarah Chen",
          role: "Product Manager",
          rating: 5
        }
      },

      'social': {
        icon: '✨',
        heroTitle: 'Connect & Share',
        heroSubtitle: 'Build meaningful connections with people who matter',
        tagline: 'Where friendships flourish',
        welcomeMessage: `Welcome to ${projectData.name}! Let's build your community together.`,
        features: [
          { icon: '💬', title: 'Rich Conversations', desc: 'Express yourself with messages, voice notes, and reactions' },
          { icon: '🌟', title: 'Discover Stories', desc: 'Find inspiring content and trending conversations' },
          { icon: '👥', title: 'Group Experiences', desc: 'Create and join communities around shared interests' }
        ],
        benefits: ['Stay closer to friends', 'Share your moments', 'Discover new interests'],
        testimonial: {
          text: "I love how easy it is to stay connected with everyone I care about!",
          author: "Marcus Thompson",
          role: "College Student",
          rating: 5
        }
      },
      'e-commerce': {
        icon: '🛍️',
        heroTitle: 'Shop with Confidence',
        heroSubtitle: 'Discover amazing products at unbeatable prices',
        tagline: 'Your shopping destination',
        welcomeMessage: `Welcome to ${projectData.name}! Let's find what you're looking for.`,
        features: [
          { icon: '🔍', title: 'Smart Discovery', desc: 'AI-powered recommendations based on your preferences' },
          { icon: '💳', title: 'Secure Payments', desc: 'Shop safely with encrypted checkout and buyer protection' },
          { icon: '📦', title: 'Fast Delivery', desc: 'Free shipping on orders over $50 with express options' }
        ],
        benefits: ['Best prices guaranteed', 'Hassle-free returns', 'Exclusive member deals'],
        testimonial: {
          text: "Amazing selection and super fast delivery. My new favorite shopping app!",
          author: "Jessica Rivera",
          role: "Fashion Enthusiast",
          rating: 5
        }
      },
      'education': {
        icon: '📚',
        heroTitle: 'Learn Without Limits',
        heroSubtitle: 'Unlock your potential with personalized learning experiences',
        tagline: 'Knowledge at your fingertips',
        welcomeMessage: `Welcome to ${projectData.name}! Your learning journey starts here.`,
        features: [
          { icon: '🧠', title: 'Adaptive Learning', desc: 'Personalized curriculum that adapts to your pace and style' },
          { icon: '🎓', title: 'Expert Instructors', desc: 'Learn from industry professionals and certified educators' },
          { icon: '🏆', title: 'Achievement System', desc: 'Track progress with badges, certificates, and milestones' }
        ],
        benefits: ['Learn at your own pace', 'Master new skills', 'Advance your career'],
        testimonial: {
          text: "The personalized approach helped me finally understand complex topics!",
          author: "David Park",
          role: "Software Engineer",
          rating: 5
        }
      },
      'health & fitness': {
        icon: '💪',
        heroTitle: 'Transform Your Health',
        heroSubtitle: 'Achieve your fitness goals with personalized guidance',
        tagline: 'Your wellness companion',
        welcomeMessage: `Welcome to ${projectData.name}! Let's start your transformation journey.`,
        features: [
          { icon: '🏃', title: 'Custom Workouts', desc: 'Personalized exercise routines based on your goals and fitness level' },
          { icon: '🥗', title: 'Nutrition Tracking', desc: 'Smart meal planning and calorie tracking with barcode scanning' },
          { icon: '📈', title: 'Progress Analytics', desc: 'Detailed insights into your health and fitness improvements' }
        ],
        benefits: ['Reach fitness goals faster', 'Build healthy habits', 'Feel more energetic'],
        testimonial: {
          text: "Lost 20 pounds and feel the best I have in years. This app changed my life!",
          author: "Lisa Rodriguez",
          role: "Marketing Director",
          rating: 5
        }
      },
      'entertainment': {
        icon: '🎬',
        heroTitle: 'Endless Entertainment',
        heroSubtitle: 'Discover your next favorite show, movie, or game',
        tagline: 'Entertainment reimagined',
        welcomeMessage: `Welcome to ${projectData.name}! Get ready for endless fun.`,
        features: [
          { icon: '🎭', title: 'Curated Content', desc: 'Handpicked entertainment tailored to your taste' },
          { icon: '🎮', title: 'Interactive Features', desc: 'Engage with content through games, polls, and social features' },
          { icon: '🌟', title: 'Premium Quality', desc: 'High-definition streaming with exclusive content' }
        ],
        benefits: ['Never be bored again', 'Discover hidden gems', 'Share favorite moments'],
        testimonial: {
          text: "Found so many amazing shows I never would have discovered otherwise!",
          author: "Alex Morgan",
          role: "Film Student",
          rating: 5
        }
      },
      'business': {
        icon: '💼',
        heroTitle: 'Grow Your Business',
        heroSubtitle: 'Professional tools to scale and succeed',
        tagline: 'Business success simplified',
        welcomeMessage: `Welcome to ${projectData.name}! Let's accelerate your business growth.`,
        features: [
          { icon: '📊', title: 'Business Analytics', desc: 'Real-time insights and reporting for data-driven decisions' },
          { icon: '👥', title: 'Team Collaboration', desc: 'Streamline communication and project management' },
          { icon: '💰', title: 'Revenue Optimization', desc: 'Tools to increase sales and improve profitability' }
        ],
        benefits: ['Increase revenue', 'Improve efficiency', 'Scale operations'],
        testimonial: {
          text: "Our revenue increased 40% in the first quarter using these tools!",
          author: "Michael Chen",
          role: "CEO",
          rating: 5
        }
      },
      'travel': {
        icon: '✈️',
        heroTitle: 'Adventure Awaits',
        heroSubtitle: 'Discover amazing destinations and plan perfect trips',
        tagline: 'Your travel companion',
        welcomeMessage: `Welcome to ${projectData.name}! Where will you go next?`,
        features: [
          { icon: '🗺️', title: 'Smart Planning', desc: 'AI-powered trip planning with personalized recommendations' },
          { icon: '🏨', title: 'Best Deals', desc: 'Exclusive discounts on flights, hotels, and activities' },
          { icon: '📸', title: 'Travel Journal', desc: 'Document and share your adventures' }
        ],
        benefits: ['Save up to 40%', 'Stress-free planning', 'Local experiences'],
        testimonial: {
          text: "Found the most amazing hidden gems I never would have discovered!",
          author: "Chris Lee",
          role: "Travel Blogger",
          rating: 5
        }
      },
      'finance': {
        icon: '💰',
        heroTitle: 'Financial Freedom',
        heroSubtitle: 'Take control of your money and build wealth',
        tagline: 'Your financial success starts here',
        welcomeMessage: `Welcome to ${projectData.name}! Ready to master your finances?`,
        features: [
          { icon: '📊', title: 'Budget Tracking', desc: 'Monitor your spending and savings goals' },
          { icon: '📈', title: 'Investment Insights', desc: 'Make informed investment decisions' },
          { icon: '🔒', title: 'Secure Banking', desc: 'Bank-level security for your money' }
        ],
        benefits: ['Build wealth', 'Save more money', 'Financial freedom'],
        testimonial: {
          text: "Finally got my finances organized and started investing. Great app!",
          author: "Robert Kim",
          role: "Engineer",
          rating: 5
        }
      },
      'other': {
        icon: '🚀',
        heroTitle: 'Something Amazing',
        heroSubtitle: 'Discover a new way to achieve your goals',
        tagline: 'Experience something amazing',
        welcomeMessage: `Welcome to ${projectData.name}! Ready to explore?`,
        features: [
          { icon: '✨', title: 'Unique Features', desc: 'Innovative tools designed for you' },
          { icon: '🎯', title: 'Personalized Experience', desc: 'Tailored to your specific needs' },
          { icon: '🌟', title: 'Premium Quality', desc: 'Best-in-class user experience' }
        ],
        benefits: ['Stand out from the crowd', 'Achieve your goals', 'Premium experience'],
        testimonial: {
          text: "This app is incredible! Exactly what I needed.",
          author: "Taylor Johnson",
          role: "Creator",
          rating: 5
        }
      }
    };

    const categoryKey = (projectData.category || 'other') as keyof typeof categoryContent;
    const content = categoryContent[categoryKey] || categoryContent['other'];

    return {
        id: `generated-flow-${Date.now()}`,
      name: `${projectData.name} Onboarding Flow`,
      description: `Complete onboarding experience for ${projectData.name}`,
        screens: [

        // Screen 1: Beautiful Welcome Splash (Inspired by modern app designs)
          {
          id: 'splash',
            name: 'Welcome',
            bgType: 'gradient' as const,
          bgValue: colors.gradient,
            components: [
              {
                type: 'Spacer' as const,
                props: { height: 'lg' as const }
              },
              // App Logo/Icon
              {
                type: 'Title' as const,
                props: {
                  text: content.icon,
                  variant: 'h1' as const,
                  alignment: 'center' as const,
                  color: '#FFFFFF',
                  fontWeight: 'bold' as const
                }
              },
              // App Name
              {
                type: 'Title' as const,
                props: {
                  text: projectData.name.toUpperCase(),
                  variant: 'h1' as const,
                  alignment: 'center' as const,
                  color: '#FFFFFF',
                  fontWeight: 'bold' as const
                }
              },
              {
                type: 'Spacer' as const,
                props: { height: 'md' as const }
              },
              // Hero Tagline
              {
                type: 'Title' as const,
                props: {
                text: content.heroTitle || content.tagline,
                variant: 'h2' as const,
                alignment: 'center' as const,
                color: '#F9FAFB',
                fontWeight: 'semibold' as const
              }
            },
              // Subtitle
              {
                type: 'Title' as const,
                props: {
                text: content.heroSubtitle || `Discover ${content.tagline.toLowerCase()}`,
                  variant: 'body' as const,
                  alignment: 'center' as const,
                color: '#D1D5DB',
                fontWeight: 'normal' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'xl' as const }
            },
            {
              type: 'Button' as const,
              props: {
                text: 'Get Started',
                variant: 'primary' as const,
                fullWidth: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            {
              type: 'Title' as const,
              props: {
                text: 'Join thousands of satisfied users',
                variant: 'caption' as const,
                alignment: 'center' as const,
                color: '#D1D5DB',
                fontWeight: 'normal' as const
              }
            }
          ]
        },

        // Screen 2: Beautiful Feature Showcase (Like Zumba's second screen)
        {
          id: 'feature-1',
          name: 'Key Feature 1',
          bgType: 'gradient' as const,
          bgValue: colors.cardGradient,
          components: [
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            // Large icon/emoji at top
            {
              type: 'Title' as const,
              props: {
                text: content.features[0].icon,
                variant: 'h1' as const,
                alignment: 'center' as const,
                color: '#FFFFFF',
                fontWeight: 'bold' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            // Main feature title
            {
              type: 'Title' as const,
              props: {
                text: content.features[0].title,
                variant: 'h1' as const,
                alignment: 'center' as const,
                color: '#FFFFFF',
                fontWeight: 'bold' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'sm' as const }
            },
            // Feature description
            {
              type: 'Title' as const,
              props: {
                text: content.features[0].desc,
                variant: 'body' as const,
                alignment: 'center' as const,
                color: '#F3F4F6',
                fontWeight: 'normal' as const
                }
              },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            // Benefit highlight card
            {
              type: 'Card' as const,
              props: {
                title: '✨ Key Benefit',
                content: content.benefits[0] || 'Amazing results guaranteed!',
                highlighted: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            // Action button
            {
              type: 'Button' as const,
              props: {
                text: 'Continue',
                variant: 'primary' as const,
                fullWidth: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'sm' as const }
            },
            // Progress indicator
            {
              type: 'Title' as const,
              props: {
                text: '1 of 3 features',
                variant: 'caption' as const,
                alignment: 'center' as const,
                color: '#E5E7EB',
                fontWeight: 'normal' as const
              }
            }
          ]
        },

        // Screen 3: Create Account Screen (Clean, modern layout like the reference)
        {
          id: 'feature-2',
          name: 'Create Account',
          bgType: 'color' as const,
          bgValue: colors.background,
          components: [
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            // App name/logo at top
            {
              type: 'Title' as const,
              props: {
                text: projectData.name.toUpperCase(),
                variant: 'h2' as const,
                alignment: 'center' as const,
                color: '#1F2937',
                fontWeight: 'bold' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            // Main heading
            {
              type: 'Title' as const,
              props: {
                text: 'Create your account',
                variant: 'h1' as const,
                alignment: 'left' as const,
                color: '#1F2937',
                fontWeight: 'bold' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'sm' as const }
            },
            // Subtitle with benefits
            {
              type: 'Title' as const,
              props: {
                text: `Join ${content.welcomeMessage.split(' ')[2] || 'millions'} who have ${content.benefits[0]?.toLowerCase() || 'transformed their lives'} through ${projectData.name}.`,
                variant: 'body' as const,
                alignment: 'left' as const,
                color: '#6B7280',
                fontWeight: 'normal' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            // Email input
            {
              type: 'Input' as const,
              props: {
                label: 'Email Address',
                placeholder: 'screensdesigns@gmail.com',
                type: 'email' as const,
                required: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            // Continue button
            {
              type: 'Button' as const,
              props: {
                text: 'Continue',
                variant: 'primary' as const,
                fullWidth: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            // Or divider
            {
              type: 'Title' as const,
              props: {
                text: 'or',
                variant: 'body' as const,
                alignment: 'center' as const,
                color: '#9CA3AF',
                fontWeight: 'normal' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            // Social login buttons
            {
              type: 'Button' as const,
              props: {
                text: '🍎 Continue with Apple',
                variant: 'secondary' as const,
                fullWidth: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'sm' as const }
            },
            {
              type: 'Button' as const,
              props: {
                text: '🔵 Continue with Google',
                variant: 'secondary' as const,
                fullWidth: true
              }
            }
            ]
          },

        // Screen 4: Welcome Screen with Testimonials (Like "Hi, Julia!" screen)
        {
          id: 'feature-3',
          name: 'Welcome Screen',
          bgType: 'color' as const,
          bgValue: colors.background,
          components: [
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            // App name with colorful accent
            {
              type: 'Title' as const,
              props: {
                text: projectData.name.toUpperCase(),
                variant: 'h2' as const,
                alignment: 'center' as const,
                color: colors.primary,
                fontWeight: 'bold' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            // Personal welcome message
            {
              type: 'Title' as const,
              props: {
                text: 'Hi, Julia!',
                variant: 'h1' as const,
                alignment: 'left' as const,
                color: '#1F2937',
                fontWeight: 'bold' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'sm' as const }
            },
            // Welcome description
            {
              type: 'Title' as const,
              props: {
                text: content.welcomeMessage || `Welcome to the ${projectData.name} community. Now, let's personalize your ${content.tagline.toLowerCase()}...`,
                variant: 'body' as const,
                alignment: 'left' as const,
                color: '#6B7280',
                fontWeight: 'normal' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            // First testimonial
            {
              type: 'Card' as const,
              props: {
                title: '😊',
                content: `"${content.testimonial?.text || 'Amazing app! Exactly what I needed.'}"`,
                highlighted: false
              }
            },
            {
              type: 'Title' as const,
              props: {
                text: `-${content.testimonial?.author || 'Happy User'}`,
                variant: 'caption' as const,
                alignment: 'right' as const,
                color: '#9CA3AF',
                fontWeight: 'normal' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            // Second testimonial (if available)
            {
              type: 'Card' as const,
              props: {
                title: '🌟',
                content: `"I was worried that the amazing energy of ${content.features[0]?.title.toLowerCase() || 'the features'} wouldn't come through on the screen but I was so wrong! ${content.benefits[0] || 'The results are amazing'}!"`,
                highlighted: false
              }
            },
            {
              type: 'Title' as const,
              props: {
                text: '-Jamie',
                variant: 'caption' as const,
                alignment: 'right' as const,
                color: '#9CA3AF',
                fontWeight: 'normal' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            // Third testimonial
            {
              type: 'Card' as const,
              props: {
                title: '💪',
                content: `"I feel good, I look good, ${content.benefits[1]?.toLowerCase() || 'I\'ve achieved my goals'}. ${content.benefits[2] || 'Life-changing'}!"`,
                highlighted: false
              }
            },
            {
              type: 'Title' as const,
              props: {
                text: '-Chevon',
                variant: 'caption' as const,
                alignment: 'right' as const,
                color: '#9CA3AF',
                fontWeight: 'normal' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'xl' as const }
            },
            {
              type: 'Button' as const,
              props: {
                text: 'Ready to Start!',
                variant: 'primary' as const,
                fullWidth: true
              }
            }
          ]
        },

        // Screen 5: Sign Up
        {
          id: 'signup',
          name: 'Create Account',
          bgType: 'gradient' as const,
          bgValue: 'linear-gradient(135deg, #f6f9fc 0%, #e9f4f8 100%)',
          components: [
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            {
              type: 'Title' as const,
              props: {
                text: '🎉 Join the Community',
                variant: 'h1' as const,
                alignment: 'center' as const,
                color: '#1F2937',
                fontWeight: 'bold' as const
              }
            },
            {
              type: 'Title' as const,
              props: {
                text: `Create your ${projectData.name} account and unlock all features`,
                variant: 'body' as const,
                alignment: 'center' as const,
                color: '#6B7280',
                fontWeight: 'normal' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
              },
              {
                type: 'Input' as const,
                props: {
                  placeholder: 'Enter your full name',
                  type: 'text' as const,
                  label: 'Full Name',
                  required: true
                }
              },
              {
                type: 'Input' as const,
                props: {
                  placeholder: 'your.email@example.com',
                  type: 'email' as const,
                  label: 'Email Address',
                  required: true
                }
              },
              {
                type: 'Input' as const,
                props: {
                placeholder: 'Create a strong password',
                type: 'password' as const,
                label: 'Password',
                required: true
              }
            },
            {
              type: 'Input' as const,
              props: {
                placeholder: 'Confirm your password',
                type: 'password' as const,
                label: 'Confirm Password',
                required: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            {
              type: 'ToggleSwitch' as const,
              props: {
                label: 'I agree to the Terms of Service and Privacy Policy',
                value: false,
                description: 'Required to create your account',
                color: colors.primary
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            {
              type: 'Button' as const,
              props: {
                text: 'Create Account',
                variant: 'primary' as const,
                fullWidth: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            {
              type: 'Title' as const,
              props: {
                text: 'Already have an account? Sign In',
                variant: 'caption' as const,
                alignment: 'center' as const,
                color: colors.primary,
                fontWeight: 'medium' as const
              }
            }
          ]
        },

        // Screen 6: Login
        {
          id: 'login',
          name: 'Sign In',
          bgType: 'gradient' as const,
          bgValue: 'linear-gradient(135deg, #f6f9fc 0%, #e9f4f8 100%)',
          components: [
            {
              type: 'Spacer' as const,
              props: { height: 'xl' as const }
            },
            {
              type: 'Title' as const,
              props: {
                text: '👋 Welcome Back',
                variant: 'h1' as const,
                alignment: 'center' as const,
                color: '#1F2937',
                fontWeight: 'bold' as const
              }
            },
            {
              type: 'Title' as const,
              props: {
                text: `Sign in to your ${projectData.name} account`,
                variant: 'body' as const,
                alignment: 'center' as const,
                color: '#6B7280',
                fontWeight: 'normal' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'xl' as const }
            },
            {
              type: 'Input' as const,
              props: {
                placeholder: 'your.email@example.com',
                type: 'email' as const,
                label: 'Email Address',
                required: true
              }
            },
            {
              type: 'Input' as const,
              props: {
                placeholder: 'Enter your password',
                type: 'password' as const,
                label: 'Password',
                required: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            {
              type: 'ToggleSwitch' as const,
              props: {
                label: 'Remember me',
                value: false,
                description: 'Stay signed in on this device',
                color: colors.primary
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            {
              type: 'Button' as const,
              props: {
                text: 'Sign In',
                variant: 'primary' as const,
                fullWidth: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            {
              type: 'Title' as const,
              props: {
                text: 'Forgot your password?',
                variant: 'caption' as const,
                alignment: 'center' as const,
                color: colors.primary,
                fontWeight: 'medium' as const
              }
            }
          ]
        },

        // Screen 7: Profile Setup
        {
          id: 'profile-setup',
          name: 'Complete Profile',
          bgType: 'color' as const,
          bgValue: '#FFFFFF',
          components: [
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            {
              type: 'Title' as const,
              props: {
                text: '👤 Complete Your Profile',
                variant: 'h1' as const,
                alignment: 'center' as const,
                color: '#1F2937',
                fontWeight: 'bold' as const
              }
            },
            {
              type: 'Title' as const,
              props: {
                text: `Help us personalize your ${projectData.name} experience`,
                variant: 'body' as const,
                alignment: 'center' as const,
                color: '#6B7280',
                fontWeight: 'normal' as const
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
              {
                type: 'ProgressBar' as const,
                props: {
                value: 30,
                  max: 100,
                  label: 'Profile Completion',
                color: colors.primary,
                  showPercentage: true
                }
              },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            {
              type: 'Input' as const,
              props: {
                placeholder: aiConfig.targetAudience.includes('professional') ? 'Your role or company' : 'Tell us about yourself',
                type: 'text' as const,
                label: aiConfig.targetAudience.includes('professional') ? 'Job Title / Company' : 'About You',
                required: false
              }
            },
            {
              type: 'Input' as const,
              props: {
                placeholder: 'Your location (optional)',
                type: 'text' as const,
                label: 'Location',
                required: false
              }
            },
                         {
               type: 'Input' as const,
               props: {
                 placeholder: 'Your phone number (optional)',
                 type: 'text' as const,
                 label: 'Phone Number',
                 required: false
               }
             },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            {
              type: 'Card' as const,
              props: {
                title: '🔒 Privacy First',
                content: 'Your information is secure and will only be used to improve your experience.',
                highlighted: false
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
              },
              {
                type: 'Button' as const,
                props: {
                text: 'Continue',
                  variant: 'primary' as const,
                  fullWidth: true
                }
              }
            ]
          },

        // Screen 8: Preferences & Settings
          {
            id: 'preferences',
          name: 'Customize Experience',
            bgType: 'gradient' as const,
            bgValue: 'linear-gradient(135deg, #fef7ff 0%, #fdf2f8 100%)',
            components: [
              {
                type: 'Spacer' as const,
                props: { height: 'lg' as const }
              },
              {
                type: 'Title' as const,
                props: {
                text: '⚙️ Customize Your Experience',
                variant: 'h1' as const,
                  alignment: 'center' as const,
                  color: '#1F2937',
                  fontWeight: 'bold' as const
                }
              },
              {
                type: 'Title' as const,
                props: {
                text: `Set your preferences to get the most out of ${projectData.name}`,
                  variant: 'body' as const,
                  alignment: 'center' as const,
                color: '#6B7280',
                fontWeight: 'normal' as const
                }
              },
              {
                type: 'Spacer' as const,
              props: { height: 'lg' as const }
            },
            {
              type: 'ProgressBar' as const,
              props: {
                value: 75,
                max: 100,
                label: 'Setup Progress',
                color: colors.primary,
                showPercentage: true
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
              },
              {
                type: 'OptionGroup' as const,
                props: {
                title: `🎯 What interests you most about ${projectData.category.toLowerCase()}?`,
                  type: 'checkbox' as const,
                  multiSelect: true,
                  options: [
                  { id: '1', label: content.features[0].title, value: 'feature1' },
                  { id: '2', label: content.features[1].title, value: 'feature2' },
                  { id: '3', label: content.features[2].title, value: 'feature3' },
                  { id: '4', label: '🔔 Updates & News', value: 'updates' },
                  { id: '5', label: '🎁 Special Offers', value: 'offers' },
                  { id: '6', label: '💡 Tips & Tutorials', value: 'tips' }
                  ]
                }
              },
              {
                type: 'Spacer' as const,
                props: { height: 'md' as const }
              },
              {
                type: 'ToggleSwitch' as const,
                props: {
                  label: 'Enable Push Notifications',
                  value: true,
                description: `Get updates about new ${projectData.category.toLowerCase()} features`,
                color: colors.primary
                }
              },
              {
              type: 'ToggleSwitch' as const,
                props: {
                label: 'Email Updates',
                value: false,
                description: 'Receive weekly tips and feature updates',
                color: colors.primary
              }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'lg' as const }
              },
              {
                type: 'Button' as const,
                props: {
                text: 'Save Preferences',
                  variant: 'primary' as const,
                  fullWidth: true
                }
              }
            ]
          },

        // Screen 9: Completion & Welcome
          {
            id: 'complete',
          name: 'Welcome Aboard!',
            bgType: 'gradient' as const,
          bgValue: colors.gradient,
            components: [
              {
                type: 'Spacer' as const,
                props: { height: 'xl' as const }
              },
              {
                type: 'Title' as const,
                props: {
                text: '🎉',
                  variant: 'h1' as const,
                  alignment: 'center' as const,
                  color: '#FFFFFF',
                  fontWeight: 'bold' as const
                }
              },
              {
                type: 'Title' as const,
                props: {
                text: aiConfig.brandPersonality === 'playful' ? 'You\'re Ready to Rock!' : 'Welcome Aboard!',
                variant: 'h1' as const,
                alignment: 'center' as const,
                color: '#FFFFFF',
                fontWeight: 'bold' as const
              }
            },
            {
              type: 'Title' as const,
              props: {
                text: `Your personalized ${projectData.name} experience is ready. Let's achieve great things together!`,
                  variant: 'body' as const,
                  alignment: 'center' as const,
                color: '#E5E7EB',
                fontWeight: 'normal' as const
                }
              },
              {
                type: 'Spacer' as const,
                props: { height: 'lg' as const }
              },
              {
                type: 'ProgressBar' as const,
                props: {
                  value: 100,
                  max: 100,
                  label: 'Setup Complete',
                  color: '#FFFFFF',
                  showPercentage: true
                }
              },
              {
                type: 'Spacer' as const,
                props: { height: 'lg' as const }
              },
              {
                type: 'Card' as const,
                props: {
                  title: '🚀 What\'s Next?',
                content: `Start exploring all the personalized ${projectData.category.toLowerCase()} features we've prepared just for you.`,
                  highlighted: true
                }
              },
              {
                type: 'Card' as const,
                props: {
                title: '💡 Pro Tip',
                content: `Visit your dashboard to see personalized recommendations and track your progress.`,
                  highlighted: false
                }
              },
              {
                type: 'Card' as const,
                props: {
                title: '🎯 Your Journey Begins',
                content: `${content.benefits.join(', ')} - that's what awaits you in ${projectData.name}.`,
                  highlighted: false
                }
              },
              {
                type: 'Spacer' as const,
                props: { height: 'lg' as const }
              },
              {
                type: 'Button' as const,
                props: {
                  text: `Start Using ${projectData.name}`,
                  variant: 'primary' as const,
                  fullWidth: true
                }
            },
            {
              type: 'Spacer' as const,
              props: { height: 'md' as const }
            },
            {
              type: 'Title' as const,
              props: {
                text: 'Need help? Visit our support center anytime',
                variant: 'caption' as const,
                alignment: 'center' as const,
                color: '#D1D5DB',
                fontWeight: 'normal' as const
                }
              }
            ]
          }
        ],
        theme: {
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
          backgroundColor: '#FFFFFF',
          textColor: '#1F2937',
          borderRadius: 'lg' as const,
          spacing: 'normal' as const,
        fontFamily: aiConfig.brandPersonality === 'modern' ? 'Inter, system-ui, sans-serif' : aiConfig.brandPersonality === 'playful' ? 'Poppins, system-ui, sans-serif' : 'Roboto, system-ui, sans-serif'
      }
    };
  };

  const createProject = async () => {
    if (!user || !generatedFlow) return;

    setLoading(true);
    try {
      // Create project in database
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: projectData.name,
          url: projectData.url,
          category: projectData.category,
          notes: projectData.notes || null
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Save the generated flow as onboarding pages
      const pagesToInsert = generatedFlow.screens.map((screen, index) => ({
        project_id: project.id,
        page_id: `${project.id}-${screen.id}`,
        title: screen.name,
        purpose: screen.name,
        order_index: index,
        html_content: JSON.stringify(screen), // Store the complete screen JSON
        theme: JSON.stringify(generatedFlow.theme || {}),
      }));

      const { error: pagesError } = await supabase
        .from('onboarding_pages')
        .insert(pagesToInsert);

      if (pagesError) {
        console.error('Error creating onboarding pages:', pagesError);
        toast.error('Project created but failed to save mobile UI flow');
      } else {
        toast.success('Project created with AI-generated mobile UI flow!');
      }

      onProjectCreated(project);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'project-details':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone size={24} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Project</h2>
              <p className="text-gray-600">Tell us about your app to get started</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field"
                  placeholder="My Awesome Onboarding"
                  value={projectData.name}
                  onChange={handleProjectDataChange}
                />
              </div>

              {/* Input Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you like to provide app information?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setInputMethod('url')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      inputMethod === 'url' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔗</div>
                      <div className="font-medium text-gray-900">App Store URL</div>
                      <div className="text-sm text-gray-600 mt-1">Auto-detect from App Store</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMethod('manual')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      inputMethod === 'manual' 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">✏️</div>
                      <div className="font-medium text-gray-900">Manual Entry</div>
                      <div className="text-sm text-gray-600 mt-1">Fill out form manually</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Conditional Fields */}
              {inputMethod === 'url' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    App Store URL *
                  </label>
                  <input
                    type="url"
                    name="url"
                    required
                    className="input-field"
                    placeholder="https://apps.apple.com/app/id123456789"
                    value={projectData.url}
                    onChange={handleProjectDataChange}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter your app's App Store URL and we'll fetch the details automatically
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Category *
                    </label>
                    <select
                      name="category"
                      required
                      className="input-field"
                      value={projectData.category}
                      onChange={handleProjectDataChange}
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Description *
                    </label>
                    <textarea
                      name="prompt"
                      rows={4}
                      className="input-field"
                      placeholder="Describe your app: What does it do? Who is it for? What are the main features?"
                      value={projectData.prompt}
                      onChange={handleProjectDataChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Scheme
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {colorSchemes.slice(0, 8).map(scheme => (
                        <button
                          key={scheme.id}
                          type="button"
                          onClick={() => setSelectedColorSchemeId(scheme.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            selectedColorSchemeId === scheme.id 
                              ? 'border-blue-500' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          title={scheme.name}
                        >
                          <div className="flex justify-center gap-1">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ background: scheme.primary }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ background: scheme.secondary }}
                            />
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ background: scheme.accent }}
                            />
                          </div>
                          <div className="text-xs text-gray-600 mt-2 text-center">
                            {scheme.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'app-info-preview':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">App Information Detected</h2>
              <p className="text-gray-600">Here's what we found about your app</p>
            </div>

            {appStoreData && (
              <div className="space-y-6">
                {/* App Header */}
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-lg">
                  <img 
                    src={appStoreData.logo} 
                    alt={appStoreData.name}
                    className="w-24 h-24 rounded-2xl shadow-md"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{appStoreData.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{appStoreData.genre}</p>
                    <p className="text-sm text-gray-700 mt-3 line-clamp-3">{appStoreData.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      {appStoreData.developerName && <span>By {appStoreData.developerName}</span>}
                      {appStoreData.rating && <span>⭐ {appStoreData.rating.toFixed(1)}</span>}
                      {appStoreData.price && <span>{appStoreData.price}</span>}
                    </div>
                  </div>
                </div>

                {/* Screenshots */}
                {appStoreData.screenshots.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Screenshots</h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {appStoreData.screenshots.map((screenshot, index) => (
                        <img 
                          key={index}
                          src={screenshot} 
                          alt={`Screenshot ${index + 1}`}
                          className="h-48 rounded-lg shadow-md flex-shrink-0"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Detected Color Palette */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Color Analysis</h4>
                  <div className="space-y-3">
                    {/* Detected colors */}
                    {appStoreData.colorPalette && appStoreData.colorPalette.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Detected from app icon:</p>
                        <div className="flex gap-2">
                          {appStoreData.colorPalette.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-12 h-12 rounded-lg shadow-sm border border-gray-200"
                              style={{ background: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Suggested scheme */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">🎨 AI Suggested Color Scheme:</p>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-2">
                          {colorSchemes.find(s => s.id === selectedColorSchemeId) && (
                            <>
                              <div 
                                className="w-8 h-8 rounded-full shadow-sm"
                                style={{ background: colorSchemes.find(s => s.id === selectedColorSchemeId)?.primary }}
                              />
                              <div 
                                className="w-8 h-8 rounded-full shadow-sm"
                                style={{ background: colorSchemes.find(s => s.id === selectedColorSchemeId)?.secondary }}
                              />
                              <div 
                                className="w-8 h-8 rounded-full shadow-sm"
                                style={{ background: colorSchemes.find(s => s.id === selectedColorSchemeId)?.accent }}
                              />
                            </>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {colorSchemes.find(s => s.id === selectedColorSchemeId)?.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Best match based on your app's colors
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* All Available Color Schemes */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Choose Your Color Scheme:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {colorSchemes.map((scheme) => (
                          <button
                            key={scheme.id}
                            onClick={() => setSelectedColorSchemeId(scheme.id)}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              selectedColorSchemeId === scheme.id
                                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex gap-1">
                                <div 
                                  className="w-4 h-4 rounded-full shadow-sm"
                                  style={{ background: scheme.primary }}
                                />
                                <div 
                                  className="w-4 h-4 rounded-full shadow-sm"
                                  style={{ background: scheme.secondary }}
                                />
                                <div 
                                  className="w-4 h-4 rounded-full shadow-sm"
                                  style={{ background: scheme.accent }}
                                />
                              </div>
                              {selectedColorSchemeId === scheme.id && (
                                <div className="text-blue-600">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="font-medium text-gray-900 text-sm">{scheme.name}</p>
                            <p className="text-xs text-gray-600">{scheme.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Features */}
                {appStoreData.features && appStoreData.features.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h4>
                    <ul className="space-y-2">
                      {appStoreData.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Project Details */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Project Configuration</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Project Name</p>
                      <p className="font-medium text-gray-900">{projectData.name}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">App Category</p>
                      <p className="font-medium text-gray-900">{projectData.category}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Additional Info</p>
                      <p className="font-medium text-gray-900 whitespace-pre-line text-sm">{projectData.notes}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'generating':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LoadingSpinner size="lg" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Mobile UI Flow</h2>
            <p className="text-gray-600 mb-6">
              AI is creating your personalized mobile onboarding experience...
            </p>
            <div className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-sm text-gray-600 space-y-2">
                <div>✓ Analyzing your app requirements</div>
                <div>✓ Generating mobile-optimized screens</div>
                <div>✓ Creating custom components</div>
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Applying AI intelligence...</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preview':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Preview Your Mobile UI</h2>
              <p className="text-gray-600">
                Your AI-generated mobile onboarding flow is ready! Preview it below.
              </p>
              {selectedTemplate && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Selected Template:</strong> {selectedTemplate.name}
                  </div>
                  <div className="text-xs text-blue-600 mt-2">
                    Confidence: {templateConfidence}% | {additionalUserFields.length} custom fields added
                  </div>
                </div>
              )}
            </div>

            {generatedFlow && (
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  <div className="flex items-center gap-2 justify-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{generatedFlow.name}</h3>
                    <span className="text-sm text-gray-500">
                      ({generatedFlow.screens.length} screens)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Screen {currentScreenIndex + 1} of {generatedFlow.screens.length}</span>
                    <div className="flex gap-1">
                      {generatedFlow.screens.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentScreenIndex ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <MobileFrame
                  flow={generatedFlow}
                  currentScreenIndex={currentScreenIndex}
                  onScreenChange={setCurrentScreenIndex}
                  showNavigation={true}
                />
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900">New Project Wizard</h1>
              <div className="flex items-center gap-2">
                {(inputMethod === 'url' ? ['project-details', 'app-info-preview', 'preview'] : ['project-details', 'preview']).map((step, index) => {
                  const steps = inputMethod === 'url' 
                    ? ['project-details', 'app-info-preview', 'preview', 'generating']
                    : ['project-details', 'preview', 'generating'];
                  const currentIndex = steps.indexOf(currentStep);
                  const stepIndex = steps.indexOf(step);
                  
                  return (
                    <div
                      key={step}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step
                          ? 'bg-blue-600 text-white'
                          : currentIndex > stepIndex
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          {renderStepContent()}

          {/* Navigation */}
          {currentStep !== 'generating' && (
            <div className="flex gap-3 pt-6 border-t">
              {currentStep !== 'project-details' && (
                <button
                  onClick={handleBack}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    {currentStep === 'preview' ? 'Create Project' : 
                     currentStep === 'app-info-preview' ? 'Generate Flow' :
                     currentStep === 'project-details' && inputMethod === 'manual' ? 'Generate Flow' : 
                     'Next'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}