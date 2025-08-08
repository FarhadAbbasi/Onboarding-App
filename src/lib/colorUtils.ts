// Color utility functions for theme-aware text colors

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate luminance of a color (0-1, where 0 is black and 1 is white)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5; // Default to middle luminance if invalid color

  // Convert RGB to linear RGB
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(color => {
    color = color / 255;
    return color <= 0.03928 ? color / 12.92 : Math.pow((color + 0.055) / 1.055, 2.4);
  });

  // Calculate luminance
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Check if a color is considered light (luminance > 0.5)
 */
export function isLightColor(hex: string): boolean {
  return getLuminance(hex) > 0.5;
}

/**
 * Check if a color is considered dark (luminance <= 0.5)
 */
export function isDarkColor(hex: string): boolean {
  return getLuminance(hex) <= 0.5;
}

/**
 * Get appropriate text color (dark or light) for a given background color
 */
export function getContrastTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#1F2937' : '#FFFFFF';
}

/**
 * Get appropriate secondary text color for a given background color
 */
export function getContrastSecondaryTextColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? '#6B7280' : '#D1D5DB';
}

/**
 * Get theme-aware colors based on background
 */
export function getThemeAwareColors(backgroundColor: string, primaryColor: string) {
  const isLight = isLightColor(backgroundColor);
  
  return {
    text: isLight ? '#1F2937' : '#FFFFFF',
    textSecondary: isLight ? '#6B7280' : '#D1D5DB',
    textMuted: isLight ? '#9CA3AF' : '#9CA3AF',
    onPrimary: getContrastTextColor(primaryColor),
    onPrimarySecondary: getContrastSecondaryTextColor(primaryColor)
  };
}

/**
 * Extract color from CSS background property (handles gradients)
 */
export function extractPrimaryColorFromBackground(background: string): string {
  // If it's a solid color
  if (background.startsWith('#')) {
    return background;
  }
  
  // If it's a gradient, extract the first color
  const colorMatch = background.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}/);
  if (colorMatch) {
    return colorMatch[0];
  }
  
  // If it's a named color or rgba, try to extract
  const rgbMatch = background.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
  }
  
  // Default fallback
  return '#3B82F6';
}

/**
 * Auto-adjust colors for screens based on background
 */
export function getSmartColors(screen: { bgType?: string; bgValue?: string }, selectedColorScheme: any) {
  const backgroundColor = screen.bgValue || selectedColorScheme.primary;
  const backgroundIsDark = isDarkColor(backgroundColor);
  
  // Extract primary color for contrast calculations
  let primaryColor = selectedColorScheme.primary;
  if (screen.bgType === 'gradient') {
    primaryColor = extractPrimaryColorFromBackground(backgroundColor);
  }
  
  return {
    primary: selectedColorScheme.primary,
    secondary: selectedColorScheme.secondary,
    accent: selectedColorScheme.accent,
    background: backgroundColor,
    
    // Smart text colors based on background
    text: backgroundIsDark ? '#FFFFFF' : '#1F2937',
    textSecondary: backgroundIsDark ? '#E5E7EB' : '#6B7280',
    textMuted: backgroundIsDark ? '#D1D5DB' : '#9CA3AF',
    
    // Colors for use on primary color backgrounds
    onPrimary: getContrastTextColor(selectedColorScheme.primary),
    onPrimarySecondary: getContrastSecondaryTextColor(selectedColorScheme.primary),
    
    // Colors for gradient backgrounds
    onGradient: backgroundIsDark ? '#FFFFFF' : '#1F2937',
    onGradientSecondary: backgroundIsDark ? '#E5E7EB' : '#6B7280',
    
    // Original values for compatibility
    gradient: selectedColorScheme.gradient,
    cardGradient: selectedColorScheme.gradient
  };
}