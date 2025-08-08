import type { UIComponent } from '../types/ui-schema';

export interface ScreenTemplate {
  id: string;
  name: string;
  type: 'splash' | 'onboarding' | 'feature' | 'form' | 'success';
  components: UIComponent[];
}

export const createSplashScreen = (
  appName: string,
  logoUrl?: string,
  backgroundColor?: string,
  textColor?: string
): ScreenTemplate => ({
  id: 'splash-screen',
  name: 'Splash Screen',
  type: 'splash',
  components: [
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    {
      type: 'Image',
      props: {
        src: logoUrl || 'https://via.placeholder.com/120x120/E5E7EB/9CA3AF?text=Logo',
        alt: `${appName} Logo`,
        width: 120,
        height: 120,
        className: 'mx-auto rounded-2xl shadow-lg'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'lg' }
    },
    {
      type: 'Title',
      props: {
        text: appName,
        variant: 'h1',
        alignment: 'center',
        color: textColor || '#FFFFFF',
        fontWeight: 'bold'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    {
      type: 'LoadingSpinner',
      props: {
        size: 'sm',
        color: textColor || '#FFFFFF'
      }
    }
  ]
});

export const createOnboardingScreen = (
  title: string,
  subtitle: string,
  illustrationType: 'welcome' | 'features' | 'success' | 'team' | 'analytics' | 'security' | 'customize' | 'rocket',
  currentStep: number,
  totalSteps: number,
  primaryColor: string,
  buttonText: string = 'Continue'
): ScreenTemplate => ({
  id: `onboarding-${currentStep}`,
  name: `Onboarding ${currentStep}`,
  type: 'onboarding',
  components: [
    {
      type: 'Spacer',
      props: { height: 'lg' }
    },
    {
      type: 'PlaceholderIllustration',
      props: {
        type: illustrationType,
        className: 'w-64 h-48 mx-auto',
        color: primaryColor
      }
    },
    {
      type: 'Spacer',
      props: { height: 'lg' }
    },
    {
      type: 'Title',
      props: {
        text: title,
        variant: 'h1',
        alignment: 'center',
        color: '#1F2937',
        fontWeight: 'bold'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'md' }
    },
    {
      type: 'Title',
      props: {
        text: subtitle,
        variant: 'body',
        alignment: 'center',
        color: '#6B7280',
        fontWeight: 'normal'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'xl' }
    },
    {
      type: 'ProgressDots',
      props: {
        total: totalSteps,
        current: currentStep - 1,
        color: primaryColor
      }
    },
    {
      type: 'Spacer',
      props: { height: 'lg' }
    },
    {
      type: 'Button',
      props: {
        text: buttonText,
        variant: 'primary',
        fullWidth: true,
        rounded: 'full'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'md' }
    }
  ]
});

export const createFeatureScreen = (
  icon: string,
  title: string,
  description: string,
  features: { icon: string; title: string; desc: string }[],
  currentStep: number,
  totalSteps: number,
  primaryColor: string
): ScreenTemplate => ({
  id: `feature-${currentStep}`,
  name: `Feature ${currentStep}`,
  type: 'feature',
  components: [
    {
      type: 'Spacer',
      props: { height: 'md' }
    },
    {
      type: 'Title',
      props: {
        text: icon,
        variant: 'h1',
        alignment: 'center',
        color: primaryColor,
        fontWeight: 'bold'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'sm' }
    },
    {
      type: 'Title',
      props: {
        text: title,
        variant: 'h2',
        alignment: 'center',
        color: '#1F2937',
        fontWeight: 'bold'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'sm' }
    },
    {
      type: 'Title',
      props: {
        text: description,
        variant: 'body',
        alignment: 'center',
        color: '#6B7280',
        fontWeight: 'normal'
      }
    },
    {
      type: 'Spacer',
      props: { height: 'lg' }
    },
    ...features.flatMap((feature, index) => [
      {
        type: 'Card' as const,
        props: {
          title: `${feature.icon} ${feature.title}`,
          content: feature.desc,
          highlighted: index === 0
        }
      },
      {
        type: 'Spacer' as const,
        props: { height: 'sm' as const }
      }
    ]).slice(0, -1), // Remove last spacer
    {
      type: 'Spacer',
      props: { height: 'lg' }
    },
    {
      type: 'ProgressDots',
      props: {
        total: totalSteps,
        current: currentStep - 1,
        color: primaryColor
      }
    },
    {
      type: 'Spacer',
      props: { height: 'lg' }
    },
    {
      type: 'Button',
      props: {
        text: currentStep === totalSteps ? 'Get Started' : 'Next',
        variant: 'primary',
        fullWidth: true,
        rounded: 'full'
      }
    }
  ]
});

export const standardOnboardingFlow = [
  {
    title: "Welcome to {appName}",
    subtitle: "Your journey to {benefit} starts here",
    illustration: 'welcome' as const
  },
  {
    title: "Powerful Features",
    subtitle: "Everything you need to {action}",
    illustration: 'features' as const
  },
  {
    title: "Stay Connected",
    subtitle: "Join thousands of users already enjoying {appName}",
    illustration: 'team' as const
  }
];

export const generateSimpleOnboardingFlow = (
  appName: string,
  logoUrl: string | undefined,
  primaryColor: string,
  category: string,
  features: string[]
) => {
  const screens = generateOnboardingFlow(appName, logoUrl, primaryColor, category, features);
  
  return {
    id: `onboarding-flow-${Date.now()}`,
    name: `${appName} Onboarding`,
    description: `Modern onboarding flow for ${appName}`,
    screens,
    theme: {
      primaryColor,
      secondaryColor: adjustColorBrightness(primaryColor, 20),
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      borderRadius: 'lg' as const,
      spacing: 'normal' as const,
      fontFamily: 'Inter, system-ui, sans-serif'
    }
  };
};

export const generateOnboardingFlow = (
  appName: string,
  logoUrl: string | undefined,
  primaryColor: string,
  category: string,
  features: string[]
) => {
  const screens = [];
  
  // Splash screen
  screens.push({
    ...createSplashScreen(appName, logoUrl, primaryColor, '#FFFFFF'),
    bgType: 'gradient' as const,
    bgValue: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColorBrightness(primaryColor, -20)} 100%)`
  });

  // Determine onboarding content based on category
  const onboardingContent = getOnboardingContentByCategory(category, appName, features);
  
  // Create 3 onboarding screens
  onboardingContent.forEach((content, index) => {
    screens.push({
      ...createOnboardingScreen(
        content.title,
        content.subtitle,
        content.illustration,
        index + 1,
        3,
        primaryColor,
        index === 2 ? 'Get Started' : 'Continue'
      ),
      bgType: 'color' as const,
      bgValue: '#FFFFFF'
    });
  });

  return screens;
};

function getOnboardingContentByCategory(
  category: string, 
  appName: string,
  features: string[]
): { title: string; subtitle: string; illustration: 'welcome' | 'features' | 'success' | 'team' | 'analytics' | 'security' | 'customize' | 'rocket' }[] {
  const categoryContent: Record<string, typeof standardOnboardingFlow> = {
    'Productivity': [
      {
        title: `Welcome to ${appName}`,
        subtitle: 'Boost your productivity and achieve more',
        illustration: 'rocket'
      },
      {
        title: 'Smart Organization',
        subtitle: 'Keep everything in one place, beautifully organized',
        illustration: 'analytics'
      },
      {
        title: 'Work Smarter',
        subtitle: 'Advanced features to streamline your workflow',
        illustration: 'customize'
      }
    ],
    'Social': [
      {
        title: `Welcome to ${appName}`,
        subtitle: 'Connect with people who matter',
        illustration: 'team'
      },
      {
        title: 'Share Your Story',
        subtitle: 'Express yourself in new and creative ways',
        illustration: 'features'
      },
      {
        title: 'Build Community',
        subtitle: 'Find your tribe and grow together',
        illustration: 'success'
      }
    ],
    'E-commerce': [
      {
        title: `Welcome to ${appName}`,
        subtitle: 'Discover amazing products at great prices',
        illustration: 'welcome'
      },
      {
        title: 'Shop with Confidence',
        subtitle: 'Secure payments and buyer protection',
        illustration: 'security'
      },
      {
        title: 'Exclusive Deals',
        subtitle: 'Save more with personalized offers',
        illustration: 'success'
      }
    ],
    'Health & Fitness': [
      {
        title: `Welcome to ${appName}`,
        subtitle: 'Your journey to a healthier you starts now',
        illustration: 'rocket'
      },
      {
        title: 'Track Progress',
        subtitle: 'Monitor your fitness journey with detailed insights',
        illustration: 'analytics'
      },
      {
        title: 'Achieve Goals',
        subtitle: 'Personalized plans to reach your targets',
        illustration: 'success'
      }
    ],
    'Education': [
      {
        title: `Welcome to ${appName}`,
        subtitle: 'Unlock your learning potential',
        illustration: 'welcome'
      },
      {
        title: 'Learn Anywhere',
        subtitle: 'Access courses on any device, anytime',
        illustration: 'features'
      },
      {
        title: 'Track Progress',
        subtitle: 'See your growth with detailed analytics',
        illustration: 'analytics'
      }
    ],
    'Entertainment': [
      {
        title: `Welcome to ${appName}`,
        subtitle: 'Entertainment that moves with you',
        illustration: 'welcome'
      },
      {
        title: 'Discover Content',
        subtitle: 'Personalized recommendations just for you',
        illustration: 'features'
      },
      {
        title: 'Share the Fun',
        subtitle: 'Connect with friends and share favorites',
        illustration: 'team'
      }
    ]
  };

  // Default content if category not found
  const defaultContent = [
    {
      title: `Welcome to ${appName}`,
      subtitle: features[0] || 'Experience something amazing',
      illustration: 'welcome' as const
    },
    {
      title: 'Powerful Features',
      subtitle: features[1] || 'Everything you need in one place',
      illustration: 'features' as const
    },
    {
      title: 'Join Us Today',
      subtitle: features[2] || 'Start your journey with us',
      illustration: 'success' as const
    }
  ];

  return categoryContent[category] || defaultContent;
}

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