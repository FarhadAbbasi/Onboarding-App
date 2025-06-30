// Utility to extract color schemes from websites
export interface ColorScheme {
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export async function extractColorsFromWebsite(url: string): Promise<ColorScheme> {
  try {
    // Use a CORS proxy to fetch the website content
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    
    const response = await fetch(proxyUrl)
    const data = await response.json()
    const html = data.contents
    
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // Extract colors from various sources
    const colors = new Set<string>()
    
    // 1. Extract from CSS variables
    const styles = doc.querySelectorAll('style')
    styles.forEach(style => {
      const cssText = style.textContent || ''
      const colorMatches = cssText.match(/(?:color|background|border).*?:\s*(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\([^)]+\)|rgba\([^)]+\))/g)
      if (colorMatches) {
        colorMatches.forEach(match => {
          const color = match.split(':')[1]?.trim()
          if (color) colors.add(color)
        })
      }
    })
    
    // 2. Extract from inline styles
    const elementsWithStyle = doc.querySelectorAll('[style]')
    elementsWithStyle.forEach(el => {
      const style = el.getAttribute('style') || ''
      const colorMatches = style.match(/(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\([^)]+\)|rgba\([^)]+\))/g)
      if (colorMatches) {
        colorMatches.forEach(color => colors.add(color))
      }
    })
    
    // 3. Extract from meta theme-color
    const themeColor = doc.querySelector('meta[name="theme-color"]')?.getAttribute('content')
    if (themeColor) colors.add(themeColor)
    
    // 4. Look for common brand colors in class names and IDs
    const brandElements = doc.querySelectorAll('[class*="brand"], [class*="primary"], [class*="accent"], [id*="brand"], [id*="primary"]')
    brandElements.forEach(el => {
      const computedStyle = getComputedStyle(el)
      if (computedStyle.color) colors.add(computedStyle.color)
      if (computedStyle.backgroundColor) colors.add(computedStyle.backgroundColor)
    })
    
    // Convert Set to Array and filter valid colors
    const colorArray = Array.from(colors)
      .filter(color => color && color !== 'transparent' && color !== 'inherit')
      .slice(0, 10) // Limit to prevent too many colors
    
    // If we have colors, analyze and categorize them
    if (colorArray.length > 0) {
      return categorizeColors(colorArray)
    }
    
    // Fallback to default colors if extraction fails
    return getDefaultColorScheme()
    
  } catch (error) {
    console.warn('Failed to extract colors from website:', error)
    return getDefaultColorScheme()
  }
}

function categorizeColors(colors: string[]): ColorScheme {
  // Simple color categorization logic
  // This is a basic implementation - could be enhanced with color theory
  
  const hexColors = colors.map(color => {
    if (color.startsWith('#')) return color
    if (color.startsWith('rgb')) return rgbToHex(color)
    return color
  }).filter(color => color.startsWith('#'))
  
  // Sort colors by saturation/brightness to identify primary colors
  const sortedColors = hexColors.sort((a, b) => {
    const aSat = getColorSaturation(a)
    const bSat = getColorSaturation(b)
    return bSat - aSat
  })
  
  return {
    primary: sortedColors[0] || '#3b82f6',
    secondary: sortedColors[1] || '#6b7280',
    accent: sortedColors[2] || '#10b981',
    background: '#ffffff',
    text: '#1f2937'
  }
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) return '#000000'
  
  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])
  
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

function getColorSaturation(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  
  return max === 0 ? 0 : (max - min) / max
}

function getDefaultColorScheme(): ColorScheme {
  return {
    primary: '#3b82f6',    // Blue
    secondary: '#6b7280',  // Gray
    accent: '#10b981',     // Green
    background: '#ffffff', // White
    text: '#1f2937'       // Dark gray
  }
}

// Alternative method using screenshot API (requires API key)
export async function extractColorsFromScreenshot(url: string, apiKey?: string): Promise<ColorScheme> {
  if (!apiKey) {
    return extractColorsFromWebsite(url)
  }
  
  try {
    // Using a screenshot service to get visual colors
    // This would require a service like Screenshots API, Browserless, etc.
    const screenshotUrl = `https://api.screenshotone.com/take?access_key=${apiKey}&url=${encodeURIComponent(url)}&format=png&full_page=false&viewport_width=1280&viewport_height=800`
    
    // This would need additional image processing to extract dominant colors
    // For now, fallback to website extraction
    return extractColorsFromWebsite(url)
    
  } catch (error) {
    console.warn('Screenshot color extraction failed:', error)
    return extractColorsFromWebsite(url)
  }
} 