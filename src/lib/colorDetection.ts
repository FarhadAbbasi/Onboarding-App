interface ColorInfo {
  hex: string;
  rgb: [number, number, number];
  luminance: number;
}

interface ColorPalette {
  dominant: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export class ColorDetector {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;

  private static getCanvas(): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    if (!this.canvas || !this.ctx) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    }
    return { canvas: this.canvas, ctx: this.ctx };
  }

  static async detectColorPalette(logoUrl: string, screenshots: string[] = []): Promise<ColorPalette> {
    try {
      console.log('🎨 Starting color detection for:', logoUrl, 'Screenshots:', screenshots.length);
      
      // Extract colors from logo (higher weight for brand colors)
      const logoColors = await this.extractColorsFromImage(logoUrl);
      console.log('🎨 Logo colors extracted:', logoColors.map(c => c.hex));
      
      // Extract colors from multiple screenshots for better diversity
      let screenshotColors: ColorInfo[] = [];
      for (let i = 0; i < Math.min(screenshots.length, 3); i++) {
        try {
          const colors = await this.extractColorsFromImage(screenshots[i]);
          screenshotColors.push(...colors);
          console.log(`🎨 Screenshot ${i + 1} colors:`, colors.map(c => c.hex));
        } catch (error) {
          console.warn(`Failed to extract colors from screenshot ${i + 1}:`, error);
        }
      }

      // Give more weight to logo colors (duplicate them for higher frequency in analysis)
      const weightedColors = [
        ...logoColors,
        ...logoColors, // Double weight for logo
        ...screenshotColors
      ];
      
      // Generate palette
      const palette = this.generatePalette(weightedColors);
      console.log('🎨 Generated palette:', palette);
      
      return palette;
    } catch (error) {
      console.error('Color detection failed:', error);
      // Return default palette
      return {
        dominant: '#3B82F6',
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        background: '#FFFFFF',
        text: '#1F2937'
      };
    }
  }

  private static async extractColorsFromImage(imageUrl: string): Promise<ColorInfo[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const { canvas, ctx } = this.getCanvas();
          
          // Set canvas size (sample at lower resolution for performance)
          const maxSize = 100;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          
          // Draw image
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = imageData.data;
          
          // Extract colors using k-means clustering
          const colors = this.kMeansClustering(pixels, 5);
          
          resolve(colors);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      // Use proxy for CORS
      img.src = `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`;
    });
  }

  private static kMeansClustering(pixels: Uint8ClampedArray, k: number): ColorInfo[] {
    const colors: ColorInfo[] = [];
    const colorCounts = new Map<string, number>();
    
    // Sample pixels (every 10th pixel for performance)
    for (let i = 0; i < pixels.length; i += 40) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      
      // Skip transparent pixels
      if (a < 128) continue;
      
      const key = `${r},${g},${b}`;
      colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
    }
    
    // Sort by frequency and get top colors
    const sortedColors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, k * 2);
    
    // Convert to ColorInfo objects
    for (const [colorStr] of sortedColors) {
      const [r, g, b] = colorStr.split(',').map(Number);
      const hex = this.rgbToHex(r, g, b);
      const luminance = this.calculateLuminance(r, g, b);
      
      // Filter out very light, very dark, or gray colors for main palette
      const saturation = this.calculateSaturation([r, g, b]);
      if (luminance > 0.15 && luminance < 0.85 && saturation > 0.2) {
        colors.push({ hex, rgb: [r, g, b], luminance });
      }
    }
    
    return colors.slice(0, k);
  }

  private static generatePalette(colors: ColorInfo[]): ColorPalette {
    console.log('🎨 generatePalette called with colors:', colors.length, colors.map(c => c.hex));
    
    if (colors.length === 0) {
      console.warn('🎨 No colors extracted, using fallback');
      throw new Error('No colors extracted');
    }
    
    // Sort by saturation first, then by luminance for better color selection
    colors.sort((a, b) => {
      const aSaturation = this.calculateSaturation(a.rgb);
      const bSaturation = this.calculateSaturation(b.rgb);
      if (Math.abs(aSaturation - bSaturation) > 0.1) {
        return bSaturation - aSaturation; // Higher saturation first
      }
      return b.luminance - a.luminance; // Then by luminance
    });
    
    console.log('🎨 Colors after sorting:', colors.map(c => `${c.hex} (sat: ${this.calculateSaturation(c.rgb).toFixed(2)})`));
    
    // Find the most vibrant color for primary
    const vibrantColor = colors[0]; // Most saturated color after sorting
    
    // Find secondary color - different hue from primary
    const vibrantHSL = this.hexToHSL(vibrantColor.hex);
    let secondaryColor = colors.find(c => {
      if (c.hex === vibrantColor.hex) return false;
      const cHSL = this.hexToHSL(c.hex);
      if (!vibrantHSL || !cHSL) return false;
      // Look for colors with different hue (at least 30 degrees apart)
      const hueDiff = Math.abs(vibrantHSL.h - cHSL.h);
      return Math.min(hueDiff, 360 - hueDiff) > 30;
    });
    
    if (!secondaryColor) {
      secondaryColor = colors[Math.min(1, colors.length - 1)];
    }
    
    // Find accent color
    let accentColor = colors.find(c => c.hex !== vibrantColor.hex && c.hex !== secondaryColor?.hex);
    if (!accentColor) {
      accentColor = { hex: this.adjustColor(vibrantColor.hex, 30), rgb: [0, 0, 0], luminance: 0.5 };
    }
    
    // Find contrasting colors for background/text
    const darkColor = colors.find(c => c.luminance < 0.3) || colors[colors.length - 1];
    const lightColor = colors.find(c => c.luminance > 0.7) || colors[0];
    
    const palette = {
      dominant: vibrantColor.hex,
      primary: vibrantColor.hex,
      secondary: secondaryColor?.hex || this.adjustColor(vibrantColor.hex, -20),
      accent: accentColor.hex,
      background: lightColor.luminance > 0.9 ? '#FFFFFF' : lightColor.hex,
      text: darkColor.luminance < 0.2 ? '#1F2937' : darkColor.hex
    };
    
    console.log('🎨 Generated palette:', palette);
    return palette;
  }

  private static rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  private static calculateLuminance(r: number, g: number, b: number): number {
    // Relative luminance formula
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  private static calculateSaturation(rgb: [number, number, number]): number {
    const [r, g, b] = rgb.map(c => c / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    if (max === 0) return 0;
    return delta / max;
  }

  private static adjustColor(hex: string, amount: number): string {
    const num = parseInt(hex.slice(1), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return this.rgbToHex(r, g, b);
  }

  static matchToColorScheme(palette: ColorPalette): string {
    // Complete list of available color schemes with their primary colors
    const schemes = [
      { id: 'ocean-blue', primary: '#3B82F6', hue: 217, saturation: 91, lightness: 60 },
      { id: 'forest-green', primary: '#10B981', hue: 158, saturation: 84, lightness: 39 },
      { id: 'sunset-orange', primary: '#F59E0B', hue: 38, saturation: 92, lightness: 50 },
      { id: 'royal-purple', primary: '#8B5CF6', hue: 250, saturation: 89, lightness: 66 },
      { id: 'cherry-red', primary: '#EF4444', hue: 0, saturation: 84, lightness: 60 },
      { id: 'midnight-black', primary: '#1F2937', hue: 220, saturation: 26, lightness: 18 },
      { id: 'rose-gold', primary: '#EC4899', hue: 322, saturation: 83, lightness: 61 },
      { id: 'electric-teal', primary: '#14B8A6', hue: 172, saturation: 76, lightness: 41 }
    ];

    const detectedHSL = this.hexToHSL(palette.primary);
    if (!detectedHSL) return 'ocean-blue'; // fallback

    // Find the best match using weighted HSL distance
    let closestScheme = schemes[0];
    let minDistance = Infinity;

    for (const scheme of schemes) {
      // Calculate weighted distance in HSL space (hue is most important for color matching)
      const hueDistance = Math.min(
        Math.abs(detectedHSL.h - scheme.hue),
        360 - Math.abs(detectedHSL.h - scheme.hue)
      ); // Handle hue wraparound
      
      const satDistance = Math.abs(detectedHSL.s - scheme.saturation);
      const lightDistance = Math.abs(detectedHSL.l - scheme.lightness);
      
      // Weighted distance (hue matters most, then saturation, then lightness)
      const distance = (hueDistance * 3) + (satDistance * 1.5) + (lightDistance * 1);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestScheme = scheme;
      }
    }

    console.log(`🎨 Color matching: Detected ${palette.primary} (HSL: ${detectedHSL.h}, ${detectedHSL.s}, ${detectedHSL.l}) → Best match: ${closestScheme.id}`);
    
    return closestScheme.id;
  }

  private static colorDistance(hex1: string, hex2: string): number {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);
    
    if (!rgb1 || !rgb2) return Infinity;
    
    // Euclidean distance in RGB space
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
  }

  private static hexToRgb(hex: string): [number, number, number] | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : null;
  }

  private static hexToHSL(hex: string): { h: number; s: number; l: number } | null {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;

    const [r, g, b] = rgb.map(c => c / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (diff !== 0) {
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
      
      switch (max) {
        case r:
          h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / diff + 2) / 6;
          break;
        case b:
          h = ((r - g) / diff + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }
}