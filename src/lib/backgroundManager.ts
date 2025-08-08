// Enhanced Background Management System
// Handles category-based backgrounds with Unsplash validation and gradient fallbacks

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image';
  value: string;
  overlayColor?: string;
}

// Test if an Unsplash image is accessible
export async function validateUnsplashImage(url: string): Promise<boolean> {
  console.log(`🖼️ Validating image: ${url}`);
  
  return new Promise((resolve) => {
    const img = new Image();
    
    // Timeout after 3 seconds
    const timeout = setTimeout(() => {
      console.warn('⏱️ Image validation timeout for:', url);
      resolve(false);
    }, 3000);
    
    img.onload = () => {
      clearTimeout(timeout);
      console.log('✅ Image loaded successfully:', url);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      console.warn('❌ Image failed to load:', url);
      resolve(false);
    };
    
    img.src = url;
  });
}

// Enhanced category-based background images with validation
export const getCategoryBackgroundConfig = async (
  category: string, 
  index: number,
  primaryColor?: string
): Promise<BackgroundConfig> => {
  console.log(`🎨 Getting background config for category: ${category}, index: ${index}, primaryColor: ${primaryColor}`);
  
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
      'https://images.unsplash.com/photo-1506629905607-24f69bb95fe6?w=400&h=800&fit=crop&crop=center'
    ],
    'Education': [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=800&fit=crop&crop=center'
    ],
    'Entertainment': [
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=800&fit=crop&crop=center&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&h=800&fit=crop&crop=center&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=800&fit=crop&crop=center&ixlib=rb-4.0.3'
    ],
    'Finance': [
      'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=800&fit=crop&crop=center'
    ],
    'Travel': [
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73c1e?w=400&h=800&fit=crop&crop=center'
    ],
    'Food': [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=800&fit=crop&crop=center',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=800&fit=crop&crop=center'
    ]
  };

  const defaultImages = [
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=800&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=800&fit=crop&crop=center'
  ];

  // Get category images or fallback to default
  const images = categoryImages[category] || defaultImages;
  const imageUrl = images[index % images.length];

  // Test if image is accessible
  const isImageValid = await validateUnsplashImage(imageUrl);
  console.log(`🖼️ Image validation result for ${imageUrl}: ${isImageValid}`);
  
  if (isImageValid) {
    console.log(`✅ Using image background: ${imageUrl}`);
    return {
      type: 'image',
      value: imageUrl,
      overlayColor: 'rgba(0, 0, 0, 0.4)' // Dark overlay for text readability
    };
  }

  // Fallback to category-specific gradients
  console.log(`⚠️ Image validation failed, falling back to gradient for category: ${category}`);
  return getCategoryGradientFallback(category, index, primaryColor);
};

// Category-specific gradient fallbacks
export const getCategoryGradientFallback = (
  category: string, 
  index: number,
  primaryColor?: string
): BackgroundConfig => {
  
  const categoryGradients: Record<string, string[]> = {
    'Productivity': [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ],
    'Social': [
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)'
    ],
    'E-commerce': [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    ],
    'Health & Fitness': [
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    ],
    'Education': [
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    ],
    'Entertainment': [
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ],
    'Finance': [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    ],
    'Travel': [
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    ],
    'Food': [
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    ]
  };

  const defaultGradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ];

  // If primary color is provided, create a vibrant custom gradient
  if (primaryColor) {
    const vibrantColor1 = adjustColorBrightness(primaryColor, 40);
    const vibrantColor2 = adjustColorBrightness(primaryColor, -40);
    
    // Create multi-stop gradient for more visual interest
    return {
      type: 'gradient',
      value: `linear-gradient(135deg, ${vibrantColor1} 0%, ${primaryColor} 30%, ${vibrantColor2} 70%, ${adjustColorBrightness(primaryColor, -60)} 100%)`
    };
  }

  // Use category-specific gradients
  const gradients = categoryGradients[category] || defaultGradients;
  return {
    type: 'gradient',
    value: gradients[index % gradients.length]
  };
};

// Background type strategy based on screen type
export const getBackgroundByScreenType = async (
  screenType: 'splash' | 'onboarding' | 'auth' | 'content',
  category: string,
  index: number = 0,
  primaryColor?: string
): Promise<BackgroundConfig> => {
  console.log(`🎯 Getting background for screenType: ${screenType}, category: ${category}, index: ${index}`);
  
  switch (screenType) {
    case 'splash':
      // Always use gradient for splash screens
      console.log(`🎨 Creating splash gradient for category: ${category}`);
      const splashResult = getCategoryGradientFallback(category, 0, primaryColor);
      console.log(`✅ Splash background result:`, splashResult);
      return splashResult;
    
    case 'onboarding':
      // Try category images, fallback to gradients
      console.log(`🖼️ Trying category images for onboarding screen ${index}`);
      const onboardingResult = await getCategoryBackgroundConfig(category, index, primaryColor);
      console.log(`✅ Onboarding background result:`, onboardingResult);
      return onboardingResult;
    
    case 'auth':
      // Subtle gradients for auth screens (less distracting)
      console.log(`🔐 Creating auth gradient`);
      const authResult = {
        type: 'gradient' as const,
        value: primaryColor 
          ? `linear-gradient(135deg, ${adjustColorBrightness(primaryColor, 40)} 0%, ${adjustColorBrightness(primaryColor, 20)} 100%)`
          : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      };
      console.log(`✅ Auth background result:`, authResult);
      return authResult;
    
    case 'content':
      // Light gradients that don't compete with content
      console.log(`📄 Creating content gradient`);
      const contentResult = {
        type: 'gradient' as const,
        value: primaryColor
          ? `linear-gradient(135deg, ${adjustColorBrightness(primaryColor, 50)} 0%, #ffffff 100%)`
          : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)'
      };
      console.log(`✅ Content background result:`, contentResult);
      return contentResult;
    
    default:
      console.log(`🔄 Using default category background for unknown screen type`);
      return await getCategoryBackgroundConfig(category, index, primaryColor);
  }
};

// Utility to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  const num = parseInt(hex, 16);
  const r = (num >> 16) + percent;
  const g = (num >> 8 & 0x00FF) + percent;
  const b = (num & 0x0000FF) + percent;
  
  // Clamp values
  const newR = Math.min(255, Math.max(0, r));
  const newG = Math.min(255, Math.max(0, g));
  const newB = Math.min(255, Math.max(0, b));
  
  return `#${((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0')}`;
}