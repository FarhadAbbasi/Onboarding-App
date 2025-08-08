// =============================================================================
// Layer C: Page Assembler
// Maps AI JSON → React components + tokens with automation and quality gates
// =============================================================================

import React from 'react';
import { 
  patternRegistry, 
  type PatternName, 
  type PatternSlots,
  type BaseSlots
} from './patternLibrary';
import { 
  toneVariations, 
  generateCSSVariables,
  type DesignTone
} from './designTokens';

// =============================================================================
// Core Types
// =============================================================================

type Tone = DesignTone; // Alias for consistency
const generateTokens = generateCSSVariables; // Alias for consistency

interface PatternData {
  pattern: PatternName;
  props: Record<string, any>;
}

// AI JSON Structure (what GPT returns)
export interface AIPageSpec {
  tone: DesignTone;
  patterns: Array<{
    pattern: PatternName;
    props: any; // Will be validated against pattern slots
  }>;
}

// Design Linter Rules
interface LintRule {
  name: string;
  check: (spec: AIPageSpec) => boolean;
  fix?: (spec: AIPageSpec) => AIPageSpec;
  message: string;
}

const designLintRules: LintRule[] = [
  {
    name: 'single-hero',
    check: (spec) => {
      const heroPatterns = spec.patterns.filter(p => 
        p.pattern === 'HeroSplit' || p.pattern === 'HeroCentered'
      );
      return heroPatterns.length <= 1;
    },
    fix: (spec) => {
      const heroPatterns = spec.patterns.filter(p => 
        p.pattern === 'HeroSplit' || p.pattern === 'HeroCentered'
      );
      if (heroPatterns.length > 1) {
        // Keep only the first hero pattern
        const firstHero = heroPatterns[0];
        return {
          ...spec,
          patterns: [
            firstHero,
            ...spec.patterns.filter(p => 
              p.pattern !== 'HeroSplit' && p.pattern !== 'HeroCentered'
            )
          ]
        };
      }
      return spec;
    },
    message: 'Only one hero section allowed per page'
  },
  {
    name: 'hero-first',
    check: (spec) => {
      if (spec.patterns.length === 0) return true;
      const firstPattern = spec.patterns[0];
      return firstPattern.pattern === 'HeroSplit' || firstPattern.pattern === 'HeroCentered';
    },
    fix: (spec) => {
      const heroPatterns = spec.patterns.filter(p => 
        p.pattern === 'HeroSplit' || p.pattern === 'HeroCentered'
      );
      const nonHeroPatterns = spec.patterns.filter(p => 
        p.pattern !== 'HeroSplit' && p.pattern !== 'HeroCentered'
      );
      
      if (heroPatterns.length > 0) {
        return {
          ...spec,
          patterns: [...heroPatterns.slice(0, 1), ...nonHeroPatterns]
        };
      }
      return spec;
    },
    message: 'Hero section should be first on the page'
  },
  {
    name: 'reasonable-length',
    check: (spec) => spec.patterns.length <= 6,
    fix: (spec) => ({
      ...spec,
      patterns: spec.patterns.slice(0, 6)
    }),
    message: 'Page should not exceed 6 sections for optimal user experience'
  },
  {
    name: 'required-cta',
    check: (spec) => {
      return spec.patterns.some(pattern => {
        const props = pattern.props;
        return props.cta || (props.features && props.features.some((f: any) => f.cta));
      });
    },
    message: 'Page should include at least one call-to-action'
  }
];

// Content Validation & Enhancement
function validateAndEnhanceContent(pattern: PatternName, props: any): any {
  const enhanced = { ...props };
  
  // Ensure required fields exist with sensible defaults
  switch (pattern) {
    case 'HeroSplit':
    case 'HeroCentered':
      if (!enhanced.headline) enhanced.headline = 'Welcome to Our App';
      if (!enhanced.body) enhanced.body = 'Discover amazing features that will transform your workflow.';
      if (!enhanced.cta) enhanced.cta = { label: 'Get Started', variant: 'primary' };
      break;
      
    case 'FeatureGrid3x2':
      if (!enhanced.headline) enhanced.headline = 'Key Features';
      if (!enhanced.features || enhanced.features.length === 0) {
        enhanced.features = [
          { icon: '⚡', title: 'Fast', description: 'Lightning-fast performance' },
          { icon: '🔒', title: 'Secure', description: 'Bank-grade security' },
          { icon: '📱', title: 'Mobile', description: 'Works on all devices' }
        ];
      }
      // Ensure features have required fields
      enhanced.features = enhanced.features.map((f: any) => ({
        icon: f.icon || '✓',
        title: f.title || 'Feature',
        description: f.description || 'Feature description'
      }));
      break;
      
    case 'TestimonialCarousel':
      if (!enhanced.testimonials || enhanced.testimonials.length === 0) {
        enhanced.testimonials = [
          {
            content: 'This app has completely transformed how I work!',
            author: 'Sarah Johnson',
            title: 'Product Manager',
            company: 'TechCorp',
            rating: 5
          }
        ];
      }
      // Ensure testimonials have required fields
      enhanced.testimonials = enhanced.testimonials.map((t: any) => ({
        content: t.content || 'Great product!',
        author: t.author || 'Anonymous',
        title: t.title || 'User',
        company: t.company || 'Company',
        rating: t.rating || 5
      }));
      break;
  }
  
  return enhanced;
}

// Accessibility Enhancements
function addA11yEnhancements(pattern: PatternName, props: any): any {
  const enhanced = { ...props };
  
  // Add ARIA labels and semantic improvements
  if (pattern === 'HeroSplit' || pattern === 'HeroCentered') {
    if (enhanced.cta && !enhanced.cta.ariaLabel) {
      enhanced.cta.ariaLabel = `${enhanced.cta.label} - ${enhanced.headline}`;
    }
  }
  
  return enhanced;
}

// Design Linter
export function lintPageSpec(spec: AIPageSpec): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fixed?: AIPageSpec;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  let fixedSpec = { ...spec };
  let hasChanges = false;
  
  for (const rule of designLintRules) {
    if (!rule.check(spec)) {
      if (rule.fix) {
        fixedSpec = rule.fix(fixedSpec);
        hasChanges = true;
        warnings.push(`Auto-fixed: ${rule.message}`);
      } else {
        errors.push(rule.message);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fixed: hasChanges ? fixedSpec : undefined
  };
}

// Core Page Assembler
export function assemblePage(spec: AIPageSpec): {
  component: React.ReactNode;
  cssVariables: string;
  metadata: {
    tone: DesignTone;
    patternCount: number;
    lintResults: ReturnType<typeof lintPageSpec>;
  };
} {
  // 1. Lint and fix the spec
  const lintResults = lintPageSpec(spec);
  const finalSpec = lintResults.fixed || spec;
  
  // 2. Generate CSS variables for the tone
  const cssVariables = generateTokens(finalSpec.tone);
  
  // 3. Validate and enhance each pattern's content
  const enhancedPatterns = finalSpec.patterns.map(({ pattern, props }) => {
    const validatedProps = validateAndEnhanceContent(pattern, props);
    const a11yProps = addA11yEnhancements(pattern, validatedProps);
    return {
      pattern,
      props: { ...a11yProps, tone: finalSpec.tone }
    };
  });
  
  // 4. Render the patterns
  const PatternComponents = enhancedPatterns.map(({ pattern, props }, index) => {
    const PatternComponent = patternRegistry[pattern];
    return (
      <PatternComponent
        key={`${pattern}-${index}`}
        {...props}
      />
    );
  });
  
  // 5. Run enhanced design linter for additional quality checks
  const enhancedLintResults = runEnhancedDesignLinter(enhancedPatterns, finalSpec.tone);
  
  // 6. Wrap in page container with CSS variables
  const PageComponent = (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      <div className="min-h-screen">
        {PatternComponents}
      </div>
    </>
  );
  
  return {
    component: PageComponent,
    cssVariables,
    metadata: {
      tone: finalSpec.tone,
      patternCount: enhancedPatterns.length,
      lintResults
    }
  };
}

// Higher-level assembler with error handling
export function safeAssemblePage(spec: AIPageSpec): {
  success: boolean;
  component?: React.ReactNode;
  cssVariables?: string;
  metadata?: any;
  error?: string;
} {
  try {
    const result = assemblePage(spec);
    return {
      success: true,
      ...result
    };
  } catch (error) {
    console.error('Page assembly failed:', error);
    
    // Fallback to a simple hero pattern
    const fallbackSpec: AIPageSpec = {
      tone: 'professional',
      patterns: [
        {
          pattern: 'HeroCentered',
          props: {
            headline: 'Welcome to Our App',
            body: 'Something went wrong, but we\'re still here for you.',
            cta: { label: 'Continue', variant: 'primary' }
          }
        }
      ]
    };
    
    try {
      const fallbackResult = assemblePage(fallbackSpec);
      return {
        success: false,
        error: 'Failed to assemble page, showing fallback',
        ...fallbackResult
      };
    } catch (fallbackError) {
      return {
        success: false,
        error: `Critical error: ${error}`
      };
    }
  }
}

// Enhanced AI Prompt Generator (for the new pattern-based system)
export function generatePatternPrompt(
  projectName: string,
  projectCategory: string,
  projectDescription: string,
  targetAudience: string,
  brandPersonality: string
): string {
  return `
You are an expert UX designer creating onboarding pages using a pattern-based design system.

Project Context:
- Name: "${projectName}"
- Category: ${projectCategory}
- Description: ${projectDescription}
- Target Audience: ${targetAudience}
- Brand Personality: ${brandPersonality}

CRITICAL: You must respond with ONLY a valid JSON object using this exact structure:

{
  "tone": "professional" | "playful" | "modern" | "minimal",
  "patterns": [
    {
      "pattern": "HeroSplit" | "HeroCentered" | "FeatureGrid3x2" | "FeatureAlternating" | "TestimonialCarousel",
      "props": {
        // Pattern-specific properties (see available patterns below)
      }
    }
  ]
}

Available Patterns:

1. HeroSplit - Two-column hero with content + illustration
   Props: { headline: string, body: string, illustration?: string, cta: { label: string, variant: "primary"|"secondary" } }

2. HeroCentered - Centered hero with optional feature badges  
   Props: { headline: string, body: string, cta: { label: string, variant: "primary"|"secondary" }, features?: string[] }

3. FeatureGrid3x2 - 3-column feature grid
   Props: { headline: string, body?: string, features: [{ icon: string, title: string, description: string }] }

4. FeatureAlternating - Alternating feature sections
   Props: { features: [{ headline: string, body: string, illustration?: string, cta?: { label: string, variant: "primary"|"secondary" } }] }

5. TestimonialCarousel - 3-column testimonial grid
   Props: { headline?: string, testimonials: [{ content: string, author: string, title: string, company: string, rating?: number }] }

Tone Selection Guide:
- professional: Business, enterprise, finance (indigo/slate colors, clean fonts)
- playful: Creative, social, gaming (pink/orange colors, rounded elements)
- modern: Tech, startup, innovation (violet/cyan colors, contemporary feel)  
- minimal: Productivity, tools, focus (gray/slate colors, clean design)

Design Guidelines:
- Always start with a hero pattern (HeroSplit or HeroCentered)
- Include 2-4 patterns total for optimal experience
- Ensure content is specific to the project context
- Use descriptive icon names (e.g., 'lightning', 'lock', 'mobile') that will be mapped to professional SVG icons
- Make CTAs action-oriented and specific

Generate a cohesive onboarding page that tells the story of ${projectName} effectively.
`;
}

// Type exports for external use
export { type PatternName } from './patternLibrary';

// =============================================================================
// Enhanced Design Linter Rules
// =============================================================================

interface LintResult {
  passed: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  fix?: string;
}

// Color contrast checker - WCAG AA compliance
function checkColorContrast(color1: string, color2: string): number {
  // Simplified contrast calculation - in production, use a proper library
  // This is a basic implementation for demonstration
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1; // Default to low contrast if parsing fails
  
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function relativeLuminance(r: number, g: number, b: number): number {
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function getTokenColorValue(tone: Tone, colorKey: string): string {
  const tokens = generateTokens(tone);
  // Extract hex value from CSS variable - this is a simplified approach
  // In production, you'd parse the CSS properly
  const colorMap: Record<string, string> = {
    primary: '#6366f1', // indigo-500
    secondary: '#64748b', // slate-500
    accent: '#f59e0b', // amber-500
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    muted: '#64748b'
  };
  
  return colorMap[colorKey] || '#000000';
}

export function runEnhancedDesignLinter(patterns: PatternData[], tone: Tone): LintResult[] {
  const results: LintResult[] = [];
  
  // =============================================================================
  // 1. Pattern Composition Rules
  // =============================================================================
  
  // Rule: Must start with a hero pattern
  const heroPatterns = ['HeroSplit', 'HeroCentered'];
  const hasHeroFirst = patterns.length > 0 && heroPatterns.includes(patterns[0].pattern);
  
  results.push({
    passed: hasHeroFirst,
    message: hasHeroFirst 
      ? '✅ Page starts with hero pattern' 
      : '❌ Page must start with a hero pattern (HeroSplit or HeroCentered)',
    severity: hasHeroFirst ? 'info' : 'error',
    fix: hasHeroFirst ? undefined : 'Add HeroCentered or HeroSplit as the first pattern'
  });
  
  // Rule: Maximum 4 patterns for optimal UX
  const patternCount = patterns.length;
  const optimalCount = patternCount <= 4;
  
  results.push({
    passed: optimalCount,
    message: optimalCount 
      ? `✅ Good pattern count (${patternCount}/4)` 
      : `⚠️ Too many patterns (${patternCount}/4) - consider consolidating`,
    severity: optimalCount ? 'info' : 'warning',
    fix: optimalCount ? undefined : 'Combine related content into fewer patterns'
  });
  
  // Rule: No duplicate pattern types (except for specific cases)
  const patternTypes = patterns.map(p => p.pattern);
  const duplicates = patternTypes.filter((type, index) => patternTypes.indexOf(type) !== index);
  const noDuplicates = duplicates.length === 0;
  
  results.push({
    passed: noDuplicates,
    message: noDuplicates 
      ? '✅ No duplicate patterns' 
      : `⚠️ Duplicate patterns found: ${duplicates.join(', ')}`,
    severity: noDuplicates ? 'info' : 'warning',
    fix: noDuplicates ? undefined : 'Use varied pattern types for better visual hierarchy'
  });
  
  // =============================================================================
  // 2. Typography Hierarchy Rules
  // =============================================================================
  
  // Rule: Check headline length for readability
  const headlines = patterns.flatMap(p => {
    if (p.pattern === 'HeroSplit' || p.pattern === 'HeroCentered') {
      return [p.props.headline as string];
    }
    if (p.pattern === 'FeatureGrid3x2' || p.pattern === 'FAQ' || p.pattern === 'PricingTiers' || p.pattern === 'ContactForm') {
      return [p.props.headline as string];
    }
    return [];
  });
  
  const longHeadlines = headlines.filter(h => h && h.length > 60);
  const reasonableHeadlines = longHeadlines.length === 0;
  
  results.push({
    passed: reasonableHeadlines,
    message: reasonableHeadlines 
      ? '✅ Headlines are concise and scannable' 
      : `⚠️ Long headlines detected (${longHeadlines.length}) - should be under 60 characters`,
    severity: reasonableHeadlines ? 'info' : 'warning',
    fix: reasonableHeadlines ? undefined : 'Shorten headlines to improve scannability'
  });
  
  // Rule: Check for proper content hierarchy
  const hasVariedContent = patterns.some(p => 
    ['FeatureGrid3x2', 'FeatureAlternating', 'TestimonialCarousel'].includes(p.pattern)
  );
  
  results.push({
    passed: hasVariedContent,
    message: hasVariedContent 
      ? '✅ Good content variety with features/testimonials' 
      : '💡 Consider adding features or testimonials for richer content',
    severity: 'info',
    fix: hasVariedContent ? undefined : 'Add FeatureGrid3x2 or TestimonialCarousel pattern'
  });
  
  // =============================================================================
  // 3. Color Contrast & Accessibility Rules
  // =============================================================================
  
  // Rule: Check text contrast ratios
  const primaryColor = getTokenColorValue(tone, 'primary');
  const backgroundColor = getTokenColorValue(tone, 'background');
  const textColor = getTokenColorValue(tone, 'text');
  
  const primaryBgContrast = checkColorContrast(primaryColor, backgroundColor);
  const textBgContrast = checkColorContrast(textColor, backgroundColor);
  
  const goodPrimaryContrast = primaryBgContrast >= 3.0; // AA standard for large text
  const goodTextContrast = textBgContrast >= 4.5; // AA standard for normal text
  
  results.push({
    passed: goodPrimaryContrast,
    message: goodPrimaryContrast 
      ? `✅ Primary color contrast is accessible (${primaryBgContrast.toFixed(1)}:1)` 
      : `❌ Primary color contrast too low (${primaryBgContrast.toFixed(1)}:1) - needs 3:1 minimum`,
    severity: goodPrimaryContrast ? 'info' : 'error',
    fix: goodPrimaryContrast ? undefined : 'Choose a darker primary color or lighter background'
  });
  
  results.push({
    passed: goodTextContrast,
    message: goodTextContrast 
      ? `✅ Text contrast is accessible (${textBgContrast.toFixed(1)}:1)` 
      : `❌ Text contrast too low (${textBgContrast.toFixed(1)}:1) - needs 4.5:1 minimum`,
    severity: goodTextContrast ? 'info' : 'error',
    fix: goodTextContrast ? undefined : 'Use darker text color for better accessibility'
  });
  
  // =============================================================================
  // 4. Content Quality Rules
  // =============================================================================
  
  // Rule: Check for strong CTAs
  const ctas = patterns.flatMap(p => {
    if ('cta' in p.props && p.props.cta) {
      return [p.props.cta as { label: string; variant: string }];
    }
    if (p.pattern === 'PricingTiers') {
      return (p.props.tiers as any[]).map(tier => tier.cta);
    }
    if (p.pattern === 'ContactForm') {
      return [p.props.cta];
    }
    return [];
  });
  
  const hasCTA = ctas.length > 0;
  const strongCTAs = ctas.filter(cta => 
    cta.label.length > 3 && 
    !['Click here', 'Submit', 'Button'].includes(cta.label)
  );
  
  results.push({
    passed: hasCTA,
    message: hasCTA 
      ? `✅ Page has ${ctas.length} call-to-action${ctas.length > 1 ? 's' : ''}` 
      : '❌ Page needs at least one call-to-action',
    severity: hasCTA ? 'info' : 'error',
    fix: hasCTA ? undefined : 'Add a clear call-to-action button'
  });
  
  results.push({
    passed: strongCTAs.length === ctas.length,
    message: strongCTAs.length === ctas.length 
      ? '✅ All CTAs use action-oriented language' 
      : `⚠️ ${ctas.length - strongCTAs.length} CTA(s) could be more specific`,
    severity: strongCTAs.length === ctas.length ? 'info' : 'warning',
    fix: strongCTAs.length === ctas.length ? undefined : 'Use specific action words like "Start Free Trial" instead of generic "Submit"'
  });
  
  // =============================================================================
  // 5. Mobile Optimization Rules
  // =============================================================================
  
  // Rule: Check for mobile-friendly content length
  const bodyTexts = patterns.flatMap(p => {
    if ('body' in p.props && p.props.body) {
      return [p.props.body as string];
    }
    return [];
  });
  
  const longBodyTexts = bodyTexts.filter(text => text.length > 150);
  const mobileFriendly = longBodyTexts.length === 0;
  
  results.push({
    passed: mobileFriendly,
    message: mobileFriendly 
      ? '✅ Body text is mobile-friendly length' 
      : `📱 ${longBodyTexts.length} body text(s) may be too long for mobile`,
    severity: mobileFriendly ? 'info' : 'warning',
    fix: mobileFriendly ? undefined : 'Keep body text under 150 characters for mobile readability'
  });
  
  // =============================================================================
  // 6. Tone Consistency Rules
  // =============================================================================
  
  // Rule: Check tone-appropriate pattern usage
  const tonePatternRules: Record<Tone, string[]> = {
    professional: ['PricingTiers', 'FAQ', 'ContactForm', 'FeatureGrid3x2'],
    playful: ['TestimonialCarousel', 'FeatureAlternating', 'HeroCentered'],
    modern: ['HeroSplit', 'FeatureGrid3x2', 'TestimonialCarousel'],
    minimal: ['HeroCentered', 'FAQ', 'ContactForm']
  };
  
  const recommendedPatterns = tonePatternRules[tone] || [];
  const usedRecommended = patterns.filter(p => recommendedPatterns.includes(p.pattern));
  const goodToneMatch = usedRecommended.length > 0;
  
  results.push({
    passed: goodToneMatch,
    message: goodToneMatch 
      ? `✅ Pattern selection matches ${tone} tone` 
      : `💡 Consider using ${tone}-appropriate patterns: ${recommendedPatterns.join(', ')}`,
    severity: 'info',
    fix: goodToneMatch ? undefined : `Add patterns that fit ${tone} tone for better consistency`
  });
  
  return results;
} 