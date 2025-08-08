// Screen Selection Logic
// Intelligently selects 9 screens from the 36 available templates based on onboarding type and app category

import { 
  ONBOARDING_SCREEN_TEMPLATES, 
  getTemplatesByCategory, 
  getTemplateById,
  type OnboardingScreenTemplate 
} from '../types/onboarding-templates';

export type OnboardingType = 'comprehensive' | 'welcome-focused' | 'feature-focused' | 'social-focused' | 'auth-focused' | 'custom';

export interface ScreenSelectionRequest {
  onboardingType: OnboardingType;
  appCategory: string;
  appName: string;
  targetAudience?: string;
  flowPurpose?: string;
}

export interface ScreenSelectionResult {
  selectedScreenIds: string[];
  totalScreens: number;
  screensByCategory: Record<string, string[]>;
  rationale?: string;
}

/**
 * Select 9 optimal screens based on onboarding type and app characteristics
 */
export function selectOptimalScreens(request: ScreenSelectionRequest): ScreenSelectionResult {
  const { onboardingType, appCategory, appName, targetAudience, flowPurpose } = request;
  
  let selectedScreenIds: string[] = [];
  let rationale = '';

  switch (onboardingType) {
    case 'comprehensive':
      selectedScreenIds = getComprehensiveFlow(appCategory);
      rationale = 'Full onboarding experience covering all key aspects: welcome, features, authentication, profile setup, and completion.';
      break;
      
    case 'welcome-focused':
      selectedScreenIds = getWelcomeFocusedFlow(appCategory);
      rationale = 'Emphasizes multiple welcome screens and first impressions to create strong initial engagement.';
      break;
      
    case 'feature-focused':
      selectedScreenIds = getFeatureFocusedFlow(appCategory);
      rationale = 'Highlights key features and benefits extensively to demonstrate app value proposition.';
      break;
      
    case 'social-focused':
      selectedScreenIds = getSocialFocusedFlow(appCategory);
      rationale = 'Emphasizes social features, community building, and user connections.';
      break;
      
    case 'auth-focused':
      selectedScreenIds = getAuthFocusedFlow(appCategory);
      rationale = 'Streamlined flow focusing on quick authentication and essential setup.';
      break;
      
    case 'custom':
      selectedScreenIds = getCustomFlow(appCategory, targetAudience, flowPurpose);
      rationale = 'AI-optimized screen selection based on app category, target audience, and specific flow purpose.';
      break;
      
    default:
      selectedScreenIds = getComprehensiveFlow(appCategory);
      rationale = 'Default comprehensive flow selected.';
  }

  // Ensure exactly 9 screens
  selectedScreenIds = selectedScreenIds.slice(0, 9);

  // Categorize selected screens
  const screensByCategory: Record<string, string[]> = {};
  selectedScreenIds.forEach(screenId => {
    const template = getTemplateById(screenId);
    if (template) {
      if (!screensByCategory[template.category]) {
        screensByCategory[template.category] = [];
      }
      screensByCategory[template.category].push(screenId);
    }
  });

  return {
    selectedScreenIds,
    totalScreens: selectedScreenIds.length,
    screensByCategory,
    rationale
  };
}

/**
 * Comprehensive Flow - Full onboarding experience (9 screens)
 */
function getComprehensiveFlow(appCategory: string): string[] {
  return [
    'welcome-splash',           // Welcome with app intro
    'feature-showcase',         // First key feature
    'feature-benefits',         // Feature benefits
    'feature-steps',           // How it works
    'auth-signup',             // Create account
    'profile-basic',           // Basic profile setup
    'preferences-notifications', // Notification preferences
    'tutorial-navigation',     // App navigation tutorial
    'completion-success'       // Welcome complete
  ];
}

/**
 * Welcome-Focused Flow - Emphasizes first impressions (8 screens)
 */
function getWelcomeFocusedFlow(appCategory: string): string[] {
  return [
    'welcome-splash',           // Main welcome
    'welcome-hero',            // Hero welcome with value prop
    'welcome-stats',           // Welcome with impressive stats
    'feature-showcase',        // Single key feature
    'social-community',        // Join community
    'auth-social',            // Social authentication
    'profile-avatar',         // Profile photo setup
    'preferences-theme',      // Theme selection
    'completion-success'      // Welcome complete
  ];
}

/**
 * Feature-Focused Flow - Highlights key features extensively (9 screens)
 */
function getFeatureFocusedFlow(appCategory: string): string[] {
  return [
    'welcome-splash',           // Welcome
    'feature-showcase',         // Feature 1
    'feature-benefits',         // Feature benefits
    'feature-steps',           // How it works
    'feature-demo',            // Interactive demo
    'feature-social-proof',    // Social proof
    'auth-signup',             // Create account
    'profile-interests',       // Select interests
    'completion-success'       // Welcome complete
  ];
}

/**
 * Social-Focused Flow - Emphasizes social features (7 screens)
 */
function getSocialFocusedFlow(appCategory: string): string[] {
  return [
    'welcome-splash',           // Welcome
    'feature-showcase',         // Key social feature
    'social-connect',          // Connect with friends
    'social-community',        // Join community
    'social-sharing',          // Share & invite
    'auth-social',            // Social authentication
    'profile-interests',       // Select interests
    'preferences-privacy',     // Privacy settings
    'completion-success'       // Welcome complete
  ];
}

/**
 * Auth-Focused Flow - Streamlined authentication (6 screens)
 */
function getAuthFocusedFlow(appCategory: string): string[] {
  return [
    'welcome-splash',           // Welcome
    'feature-showcase',         // Single key feature
    'auth-social',             // Social authentication
    'auth-signup',             // Create account
    'auth-verification',       // Email verification
    'profile-basic',           // Basic profile
    'preferences-notifications', // Quick preferences
    'tutorial-navigation',     // Quick tutorial
    'completion-success'       // Welcome complete
  ];
}

/**
 * Custom Flow - AI-optimized based on app characteristics
 */
function getCustomFlow(appCategory: string, targetAudience?: string, flowPurpose?: string): string[] {
  const categoryLower = appCategory.toLowerCase();
  
  // Base screens that are almost always needed
  const baseScreens = ['welcome-splash', 'completion-success'];
  
  // Category-specific screen selection
  let categoryScreens: string[] = [];
  
  switch (categoryLower) {
    case 'productivity':
      categoryScreens = [
        'feature-showcase',
        'feature-benefits',
        'benefits-time-saving',
        'auth-signup',
        'profile-basic',
        'preferences-notifications',
        'tutorial-shortcuts'
      ];
      break;
      
    case 'social':
      categoryScreens = [
        'feature-showcase',
        'social-connect',
        'social-community',
        'auth-social',
        'profile-avatar',
        'profile-interests',
        'preferences-privacy'
      ];
      break;
      
    case 'e-commerce':
      categoryScreens = [
        'feature-showcase',
        'feature-benefits',
        'benefits-cost-savings',
        'auth-signup',
        'profile-interests',
        'preferences-notifications',
        'tutorial-navigation'
      ];
      break;
      
    case 'education':
      categoryScreens = [
        'feature-showcase',
        'feature-steps',
        'benefits-productivity',
        'auth-signup',
        'profile-experience',
        'preferences-frequency',
        'tutorial-navigation'
      ];
      break;
      
    case 'health & fitness':
      categoryScreens = [
        'feature-showcase',
        'feature-benefits',
        'benefits-productivity',
        'auth-signup',
        'profile-interests',
        'preferences-notifications',
        'tutorial-navigation'
      ];
      break;
      
    case 'entertainment':
      categoryScreens = [
        'feature-showcase',
        'feature-demo',
        'social-sharing',
        'auth-social',
        'profile-interests',
        'preferences-theme',
        'tutorial-swipe'
      ];
      break;
      
    case 'business':
      categoryScreens = [
        'feature-showcase',
        'feature-analytics',
        'feature-integration',
        'auth-signup',
        'profile-basic',
        'preferences-notifications',
        'tutorial-navigation'
      ];
      break;
      
    case 'travel':
      categoryScreens = [
        'feature-showcase',
        'feature-timeline',
        'social-sharing',
        'auth-signup',
        'profile-interests',
        'preferences-notifications',
        'tutorial-navigation'
      ];
      break;
      
    case 'finance':
      categoryScreens = [
        'feature-showcase',
        'feature-benefits',
        'benefits-cost-savings',
        'auth-signup',
        'profile-basic',
        'preferences-privacy',
        'permissions-essential'
      ];
      break;
      
    default:
      categoryScreens = [
        'feature-showcase',
        'feature-benefits',
        'feature-steps',
        'auth-signup',
        'profile-basic',
        'preferences-notifications',
        'tutorial-navigation'
      ];
  }
  
  // Combine base screens with category-specific screens
  const allScreens = [...baseScreens, ...categoryScreens];
  
  // Return exactly 9 screens
  return allScreens.slice(0, 9);
}

/**
 * Get screen templates for selected screen IDs
 */
export function getSelectedScreenTemplates(screenIds: string[]): OnboardingScreenTemplate[] {
  return screenIds
    .map(id => getTemplateById(id))
    .filter((template): template is OnboardingScreenTemplate => template !== undefined);
}

/**
 * Validate screen selection
 */
export function validateScreenSelection(screenIds: string[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check screen count
  if (screenIds.length !== 9) {
    errors.push(`Expected exactly 9 screens, got ${screenIds.length}`);
  }
  
  // Check for duplicate screens
  const uniqueScreens = new Set(screenIds);
  if (uniqueScreens.size !== screenIds.length) {
    errors.push('Duplicate screens found in selection');
  }
  
  // Check that all screens exist
  const invalidScreens = screenIds.filter(id => !getTemplateById(id));
  if (invalidScreens.length > 0) {
    errors.push(`Invalid screen IDs: ${invalidScreens.join(', ')}`);
  }
  
  // Check for essential screens
  const hasWelcome = screenIds.some(id => getTemplateById(id)?.category === 'welcome');
  const hasCompletion = screenIds.some(id => getTemplateById(id)?.category === 'completion');
  
  if (!hasWelcome) {
    warnings.push('No welcome screen found - consider adding one for better user experience');
  }
  
  if (!hasCompletion) {
    warnings.push('No completion screen found - consider adding one to provide closure');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get screen selection statistics
 */
export function getSelectionStats(screenIds: string[]): {
  totalScreens: number;
  categoryCounts: Record<string, number>;
  averageTextVariables: number;
  totalTextVariables: number;
} {
  const templates = getSelectedScreenTemplates(screenIds);
  const categoryCounts: Record<string, number> = {};
  let totalTextVariables = 0;
  
  templates.forEach(template => {
    categoryCounts[template.category] = (categoryCounts[template.category] || 0) + 1;
    totalTextVariables += template.textVariables.length;
  });
  
  return {
    totalScreens: templates.length,
    categoryCounts,
    averageTextVariables: totalTextVariables / templates.length,
    totalTextVariables
  };
}

/**
 * Get recommended screen modifications based on app characteristics
 */
export function getRecommendedModifications(
  currentScreenIds: string[],
  appCategory: string,
  targetAudience: string
): {
  addRecommendations: string[];
  removeRecommendations: string[];
  replaceRecommendations: Array<{ remove: string; add: string; reason: string }>;
} {
  const addRecommendations: string[] = [];
  const removeRecommendations: string[] = [];
  const replaceRecommendations: Array<{ remove: string; add: string; reason: string }> = [];
  
  // Category-specific recommendations
  const categoryLower = appCategory.toLowerCase();
  
  if (categoryLower === 'social' && !currentScreenIds.includes('social-connect')) {
    addRecommendations.push('social-connect');
  }
  
  if (categoryLower === 'business' && !currentScreenIds.includes('feature-analytics')) {
    addRecommendations.push('feature-analytics');
  }
  
  if (categoryLower === 'finance' && !currentScreenIds.includes('permissions-essential')) {
    addRecommendations.push('permissions-essential');
  }
  
  // Target audience recommendations
  if (targetAudience?.toLowerCase().includes('professional')) {
    if (currentScreenIds.includes('welcome-hero')) {
      replaceRecommendations.push({
        remove: 'welcome-hero',
        add: 'welcome-stats',
        reason: 'Professional audiences prefer data-driven welcome screens'
      });
    }
  }
  
  if (targetAudience?.toLowerCase().includes('young') || targetAudience?.toLowerCase().includes('student')) {
    if (currentScreenIds.includes('tutorial-navigation')) {
      replaceRecommendations.push({
        remove: 'tutorial-navigation',
        add: 'tutorial-swipe',
        reason: 'Younger audiences are more familiar with swipe gestures'
      });
    }
  }
  
  return {
    addRecommendations,
    removeRecommendations,
    replaceRecommendations
  };
}