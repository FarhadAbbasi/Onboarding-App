import OpenAI from 'openai'
import { 
  AIFlowPlanResponseSchema, 
  AIPageContentResponseSchema, 
  AIPatternResponseSchema,
  type AIFlowPlanResponse, 
  type AIPageContentResponse,
  type AIPatternResponse,
  type Page,
  type FlowPlan
} from './schemas'

export interface GeneratedContent {
  headline: string
  subheadline: string
  features: string[]
  cta: string
  testimonial: {
    text: string
    author: string
    role: string
    company: string
  }
}

// Step 1: Generate complete onboarding flow plan
export async function generateFlowPlan(
  appName: string,
  appUrl: string,
  category: string,
  featureFocus: string,
  tone: 'professional' | 'friendly' | 'casual' | 'modern' | 'playful',
  notes?: string
): Promise<AIFlowPlanResponse> {
  console.log('[generateFlowPlan] Starting with params:', { appName, category, tone })
  
  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_KEY in your environment variables.')
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  })

  const prompt = `
You are an expert UX designer creating onboarding flows for mobile apps. Generate a complete onboarding flow plan for:

App Name: "${appName}"
URL: ${appUrl}
Category: ${category}
Feature Focus: ${featureFocus}
Tone: ${tone}
${notes ? `Additional Notes: ${notes}` : ''}

Create a comprehensive onboarding flow that includes the essential screens users need to get started effectively. Consider the app category and include relevant pages like:
- Welcome/Hero screens
- Authentication (signup/login)
- Permissions requests (if needed for the category)
- Profile setup
- Feature introductions
- Goal setting (if relevant)
- Tutorial/walkthrough screens

For each page, include a "blocks" array with the types of content sections it should have.
Available block types: "hero", "feature-list", "form", "cta", "testimonial", "permissions", "profile-setup"

Return ONLY valid JSON matching this exact structure:
{
  "flow_plan": {
    "flow_name": "string",
    "category": "${category}",
    "tone": "${tone}",
    "total_pages": number,
    "estimated_completion_time": "string (e.g., '2-3 minutes')",
    "pages": [
      {
        "id": "unique_page_id",
        "title": "Page Title",
        "purpose": "Brief description of what this page accomplishes",
        "blocks": ["hero", "feature-list", "cta"],
        "order_index": number
      }
    ]
  },
  "reasoning": "Brief explanation of why this flow structure was chosen"
}

Make sure each page has a clear purpose and the flow feels natural for a ${category} app.
`

  try {
    console.log('[generateFlowPlan] Making OpenAI API call...')
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX designer specializing in mobile app onboarding flows. Always respond with valid JSON only. Do not include markdown code blocks or any other formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    console.log('[generateFlowPlan] Got OpenAI response:', completion)

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated from OpenAI')
    }

    console.log('[generateFlowPlan] Raw content:', content)

    // Clean the response by removing markdown code blocks
    const cleanedContent = content.replace(/```json\s*|```\s*/g, '').trim()
    console.log('[generateFlowPlan] Cleaned content:', cleanedContent)
    
    const parsed = JSON.parse(cleanedContent)
    console.log('[generateFlowPlan] Parsed JSON:', parsed)
    
    const validated = AIFlowPlanResponseSchema.parse(parsed)
    console.log('[generateFlowPlan] Successfully validated response')
    
    return validated
  } catch (error) {
    console.error('[generateFlowPlan] Detailed error:', error)
    
    // Convert unknown error to Error type
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    
    // Log specific error types
    if (errorName === 'ZodError' && error instanceof Error && 'issues' in error) {
      console.error('[generateFlowPlan] Schema validation error:', (error as any).issues)
      throw new Error(`Invalid response format from AI: ${(error as any).issues.map((i: any) => i.message).join(', ')}`)
    }
    
    if (errorMessage?.includes('API key')) {
      throw new Error('Invalid OpenAI API key. Please check your API key is correct and has the necessary permissions.')
    }
    
    if (errorMessage?.includes('model')) {
      console.log('[generateFlowPlan] Trying fallback model gpt-4...')
      try {
        const fallbackCompletion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert UX designer specializing in mobile app onboarding flows. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
        
        const fallbackContent = fallbackCompletion.choices[0]?.message?.content
        if (!fallbackContent) {
          throw new Error('No content generated from fallback model')
        }
        
        const cleanedFallbackContent = fallbackContent.replace(/```json\s*|```\s*/g, '').trim()
        const fallbackParsed = JSON.parse(cleanedFallbackContent)
        return AIFlowPlanResponseSchema.parse(fallbackParsed)
      } catch (fallbackError) {
        console.error('[generateFlowPlan] Fallback model also failed:', fallbackError)
        throw new Error(`Model access error. You may not have access to GPT-4 models. Original error: ${errorMessage}`)
      }
    }
    
    if (errorMessage?.includes('JSON')) {
      console.log('[generateFlowPlan] JSON parsing error, trying retry with stricter instruction...')
      try {
      const retryCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Respond in valid JSON only. No explanations, no markdown, just pure JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        max_tokens: 2000
      })

      const retryContent = retryCompletion.choices[0]?.message?.content
      if (!retryContent) {
        throw new Error('No content generated on retry')
      }

      const cleanedRetryContent = retryContent.replace(/```json\s*|```\s*/g, '').trim()
      const retryParsed = JSON.parse(cleanedRetryContent)
      return AIFlowPlanResponseSchema.parse(retryParsed)
      } catch (retryError) {
        console.error('[generateFlowPlan] Retry also failed:', retryError)
        throw new Error(`JSON parsing failed even after retry. The AI might be having issues generating valid JSON. Try again in a few minutes.`)
      }
    }
    
    // Handle rate limiting
    if (errorMessage?.includes('rate limit') || errorMessage?.includes('429')) {
      throw new Error('OpenAI rate limit exceeded. Please wait a moment and try again.')
    }
    
    // Handle network errors
    if (errorMessage?.includes('network') || errorMessage?.includes('fetch')) {
      throw new Error('Network error connecting to OpenAI. Please check your internet connection and try again.')
    }
    
    // Generic error with more detail
    throw new Error(`OpenAI API error: ${errorMessage || 'Unknown error occurred'}. Please check your API key and try again.`)
  }
}

// Step 2: Generate content for a specific page
export async function generatePageContent(
  page: Page,
  appName: string,
  category: string,
  tone: string,
  appUrl: string,
  colorScheme?: { primary: string; secondary: string; accent: string; background: string; text: string }
): Promise<AIPageContentResponse> {
  console.log('[generatePageContent] Starting with params:', { page: page.title, appName, category, tone });
  
  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_KEY in your environment variables.');
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  });

  const prompt = `
You are an expert onboarding designer creating beautiful mobile app pages using a component library.

CRITICAL: Generate ONLY structured component data for MODERN MOBILE DESIGN. DO NOT generate HTML.

MOBILE-FIRST DESIGN REQUIREMENTS:
- GENEROUS SPACING: Use spacer components liberally for visual breathing room
- MOBILE-OPTIMIZED LAYOUT: Perfect for phone screens with proper touch targets
- VISUAL HIERARCHY: Clear progression from headline to action
- MODERN AESTHETICS: Contemporary colors and typography that feel premium
- ACCESSIBILITY: High contrast and readable text sizes

Available Components:
- headline: Main titles (content: text | styles: colorScheme, size, fontWeight, textAlign, marginTop, marginBottom)
- subheadline: Supporting text (content: text | styles: colorScheme, size, textAlign, marginTop, marginBottom)
- paragraph: Body text (content: text | styles: colorScheme, size, textAlign, lineHeight)
- cta: Call-to-action buttons (content: button_text, headline | styles: colorScheme, size, variant, borderRadius, shadow, padding)
- feature-list: Feature lists (content: features array | styles: colorScheme, size, spacing, alignment, iconColor)
- testimonial: Customer testimonials (content: quote, author, role, company | styles: colorScheme, size, borderRadius, shadow)
- text-input: Input fields (content: label, placeholder, required | styles: colorScheme, size, borderRadius, focusColor)
- alert: Notifications (content: variant, title, message | styles: colorScheme, borderRadius, shadow)
- link: Clickable links (content: text, href | styles: colorScheme, variant, underline, fontSize, fontWeight)
- permission-request: Permission prompts (content: title, description, button_text | styles: colorScheme, borderRadius, padding)
- spacer: Spacing elements (content: {} | styles: height) - USE FREQUENTLY for mobile spacing
- icon: Professional SVG icons from Lucide (content: icon | styles: size, colorScheme, centered, marginTop, marginBottom)
- footer: Page footer (content: text | styles: colorScheme, size, textAlign, padding)

MODERN MOBILE LAYOUT GUIDELINES:
- Start with generous top spacer (height: "xl")
- Use larger, bolder headline sizes (xl, 2xl) for impact
- Add spacers between every major section (height: "lg" or "xl")
- Use modern color schemes: indigo, purple, blue, emerald (avoid gray)
- Make CTAs prominent with size "lg" or "xl"
- Use spacer components generously - mobile needs breathing room
- Center-align content for mobile consumption
- Use descriptive icon names (e.g., 'lightning', 'lock', 'mobile') that will be mapped to professional SVG icons

MOBILE-OPTIMIZED SPACING PATTERN:
1. Top spacer (height: "xl")
2. Headline (size: "xl" or "2xl", center-aligned)
3. Spacer (height: "md") 
4. Subheadline (size: "lg", center-aligned)
5. Spacer (height: "xl")
6. Icon (large, centered)
7. Spacer (height: "lg")
8. Main content (features/testimonial/form)
9. Spacer (height: "xl")
10. CTA (size: "lg", prominent)
11. Bottom spacer (height: "2xl")

Available colorSchemes: indigo, blue, green, red, yellow, purple, pink, gray, emerald, cyan, orange, slate
Available sizes: xs, sm, md, lg, xl, 2xl
Available heights for spacers: xs, sm, md, lg, xl, 2xl
Available variants: solid, outline, ghost

Page Details:
- Page ID: ${page.id}
- Title: ${page.title}
- Purpose: ${page.purpose}
- App Name: ${appName}
- Category: ${category}
- Tone: ${tone}
- App URL: ${appUrl}

Color Preference: ${colorScheme ? `primary:${colorScheme.primary}, secondary:${colorScheme.secondary}` : 'indigo and blue'}

REQUIREMENTS:
1. Create 8-12 components with generous spacing for mobile
2. Use modern, engaging ${tone} tone content
3. Make content specific to ${category} apps
4. Use vibrant, modern colorSchemes (indigo, purple, emerald, blue)
5. Include multiple spacer components for proper mobile spacing
6. Make headlines large and impactful
7. Use professional Lucide icons to enhance visual appeal
8. Ensure touch-friendly sizes and spacing

Return ONLY this JSON structure with GENEROUS mobile spacing:
{
  "page_id": "${page.id}",
  "blocks": [
    {
      "type": "spacer",
      "content": {},
      "styles": {
        "height": "xl"
      }
    },
    {
      "type": "headline",
      "content": {
        "text": "Welcome to ${appName}"
      },
      "styles": {
        "colorScheme": "indigo",
        "size": "2xl",
        "fontWeight": "bold",
        "textAlign": "center"
      }
    },
    {
      "type": "spacer",
      "content": {},
      "styles": {
        "height": "md"
      }
    },
    {
      "type": "subheadline", 
      "content": {
        "text": "Your journey starts here"
      },
      "styles": {
        "colorScheme": "gray",
        "size": "lg",
        "textAlign": "center"
      }
    },
    {
      "type": "spacer",
      "content": {},
      "styles": {
        "height": "xl"
      }
    },
    {
      "type": "icon",
      "content": {
        "icon": "sparkles"
      },
      "styles": {
        "size": "xl",
        "colorScheme": "indigo",
        "centered": true
      }
    },
    {
      "type": "spacer",
      "content": {},
      "styles": {
        "height": "lg"
      }
    },
    {
      "type": "feature-list",
      "content": {
        "features": ["Amazing Feature 1", "Incredible Feature 2", "Fantastic Feature 3"]
      },
      "styles": {
        "colorScheme": "blue",
        "size": "md",
        "spacing": "comfortable",
        "alignment": "center"
      }
    },
    {
      "type": "spacer",
      "content": {},
      "styles": {
        "height": "xl"
      }
    },
    {
      "type": "cta",
      "content": {
        "button_text": "Get Started",
        "headline": "Ready to begin?"
      },
      "styles": {
        "colorScheme": "indigo",
        "size": "lg",
        "variant": "solid",
        "borderRadius": "lg",
        "shadow": "lg"
      }
    },
    {
      "type": "spacer",
      "content": {},
      "styles": {
        "height": "2xl"
      }
    }
  ],
  "theme": {
    "backgroundClass": "bg-gradient-to-br from-indigo-50 via-white to-purple-50",
    "textClass": "text-gray-900",
    "accentColor": "indigo"
  }
}

Create compelling, mobile-optimized content with generous spacing that fits: ${page.purpose}
Use modern colors, large text, and plenty of breathing room for an excellent mobile experience.
`;

  try {
    console.log('[generatePageContent] Making OpenAI API call...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert onboarding designer. Generate structured component data ONLY. Return valid JSON without markdown blocks or explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    console.log('[generatePageContent] Got OpenAI response:', completion);

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('[generatePageContent] Raw content:', content);

    // Clean the response by removing markdown code blocks
    const cleanedContent = content.replace(/```json\s*|```\s*/g, '').trim();
    console.log('[generatePageContent] Cleaned content:', cleanedContent);
    
    const parsed = JSON.parse(cleanedContent);
    console.log('[generatePageContent] Parsed JSON:', parsed);
    
    // Create response in expected format
    const response = {
      page_id: parsed.page_id || page.id,
      html_content: '', // Not needed for component-based approach
      blocks: parsed.blocks || [],
      theme: parsed.theme || {
        backgroundClass: 'bg-gradient-to-br from-indigo-50 to-blue-50',
        textClass: 'text-gray-900',
        accentColor: 'indigo'
      },
      suggestions: []
    };
    
    console.log('[generatePageContent] Final response:', response);
    return AIPageContentResponseSchema.parse(response);
  } catch (error) {
    console.error('[generatePageContent] Detailed error:', error);
    
    // Convert unknown error to Error type
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    // Log specific error types
    if (errorName === 'ZodError' && error instanceof Error && 'issues' in error) {
      console.error('[generatePageContent] Schema validation error:', (error as any).issues);
      throw new Error(`Invalid response format from AI: ${(error as any).issues.map((i: any) => i.message).join(', ')}`);
    }
    
    if (errorMessage?.includes('API key')) {
      throw new Error('Invalid OpenAI API key. Please check your API key is correct and has the necessary permissions.');
    }
    
    if (errorMessage?.includes('model')) {
      console.log('[generatePageContent] Trying fallback model gpt-4...');
      try {
        const fallbackCompletion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert onboarding designer. Generate structured component data ONLY. Return valid JSON without markdown blocks or explanations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        });
        
        const fallbackContent = fallbackCompletion.choices[0]?.message?.content;
        if (!fallbackContent) {
          throw new Error('No content generated from fallback model');
        }
        
        const cleanedFallbackContent = fallbackContent.replace(/```json\s*|```\s*/g, '').trim();
        const fallbackParsed = JSON.parse(cleanedFallbackContent);
        
        const fallbackResponse = {
          page_id: fallbackParsed.page_id || page.id,
          html_content: '',
          blocks: fallbackParsed.blocks || [],
          theme: fallbackParsed.theme || {
            backgroundClass: 'bg-gradient-to-br from-indigo-50 to-blue-50',
            textClass: 'text-gray-900',
            accentColor: 'indigo'
          },
          suggestions: []
        };
        
        return AIPageContentResponseSchema.parse(fallbackResponse);
      } catch (fallbackError) {
        console.error('[generatePageContent] Fallback model also failed:', fallbackError);
        throw new Error(`Model access error. You may not have access to GPT-4 models. Original error: ${errorMessage}`);
      }
    }
    
    if (errorMessage?.includes('JSON')) {
      console.log('[generatePageContent] JSON parsing error, trying retry with stricter instruction...');
      try {
        const retryCompletion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Respond in valid JSON only. No explanations, no markdown, just pure JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.5,
          max_tokens: 1500
        });

        const retryContent = retryCompletion.choices[0]?.message?.content;
        if (!retryContent) {
          throw new Error('No content generated on retry');
        }

        const cleanedRetryContent = retryContent.replace(/```json\s*|```\s*/g, '').trim();
        const retryParsed = JSON.parse(cleanedRetryContent);
        
        const retryResponse = {
          page_id: retryParsed.page_id || page.id,
          html_content: '',
          blocks: retryParsed.blocks || [],
          theme: retryParsed.theme || {
            backgroundClass: 'bg-gradient-to-br from-indigo-50 to-blue-50',
            textClass: 'text-gray-900',
            accentColor: 'indigo'
          },
          suggestions: []
        };
        
        return AIPageContentResponseSchema.parse(retryResponse);
      } catch (retryError) {
        console.error('[generatePageContent] Retry also failed:', retryError);
        throw new Error(`JSON parsing failed even after retry. The AI might be having issues generating valid JSON. Try again in a few minutes.`);
      }
    }
    
    // Handle rate limiting
    if (errorMessage?.includes('rate limit') || errorMessage?.includes('429')) {
      throw new Error('OpenAI rate limit exceeded. Please wait a moment and try again.');
    }
    
    // Handle network errors
    if (errorMessage?.includes('network') || errorMessage?.includes('fetch')) {
      throw new Error('Network error connecting to OpenAI. Please check your internet connection and try again.');
    }
    
    // Generic error with more detail
    throw new Error(`OpenAI API error: ${errorMessage || 'Unknown error occurred'}. Please check your API key and try again.`);
  }
}

// NEW: Pattern-based page generation for our 3-layer architecture
export async function generatePatternBasedContent(
  apiKey: string,
  page: Page,
  appName: string,
  category: string,
  tone: string,
  appUrl: string,
  colorScheme?: { primary: string; secondary: string; accent: string; background: string; text: string }
): Promise<AIPatternResponse> {
  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  })

  const prompt = `
You are an expert UX designer creating onboarding pages using a pattern-based design system.

Project Context:
- App Name: "${appName}"
- Category: ${category}
- Page Purpose: ${page.purpose}
- Target Tone: ${tone}
- App URL: ${appUrl}

CRITICAL: You must respond with ONLY a valid JSON object using this exact structure:

{
  "tone": "professional" | "playful" | "modern" | "minimal",
  "patterns": [
    {
      "pattern": "HeroSplit" | "HeroCentered" | "FeatureGrid3x2" | "FeatureAlternating" | "TestimonialCarousel" | "PricingTiers" | "FAQ" | "ContactForm",
      "props": {
        // Pattern-specific properties
      }
    }
  ]
}

Available Patterns:

1. **HeroSplit** - Two-column hero with content + illustration
   Props: { headline: string, body: string, illustration?: string, cta: { label: string, variant: "primary"|"secondary" } }

2. **HeroCentered** - Centered hero with optional feature badges  
   Props: { headline: string, body: string, cta: { label: string, variant: "primary"|"secondary" }, features?: string[] }

3. **FeatureGrid3x2** - 3-column feature grid
   Props: { headline: string, body?: string, features: [{ icon: string, title: string, description: string }] }

4. **FeatureAlternating** - Alternating feature sections
   Props: { features: [{ headline: string, body: string, illustration?: string, cta?: { label: string, variant: "primary"|"secondary" } }] }

5. **TestimonialCarousel** - 3-column testimonial grid
   Props: { headline?: string, testimonials: [{ content: string, author: string, title: string, company: string, rating?: number }] }

6. **PricingTiers** - Pricing comparison table
   Props: { headline: string, body?: string, tiers: [{ name: string, price: string, features: string[], cta: { label: string, variant: "primary"|"secondary" }, popular?: boolean }] }

7. **FAQ** - Frequently asked questions
   Props: { headline: string, body?: string, questions: [{ question: string, answer: string }] }

8. **ContactForm** - Contact/signup form
   Props: { headline: string, body?: string, fields: [{ label: string, type: "text"|"email"|"textarea", required?: boolean }], cta: { label: string, variant: "primary"|"secondary" } }

Tone Selection Guide:
- **professional**: Business, enterprise, finance (indigo/slate colors, clean fonts)
- **playful**: Creative, social, gaming (pink/orange colors, rounded elements)
- **modern**: Tech, startup, innovation (violet/cyan colors, contemporary feel)  
- **minimal**: Productivity, tools, focus (gray/slate colors, clean design)

Design Guidelines:
- Always start with a hero pattern (HeroSplit or HeroCentered)
- Include 2-4 patterns total for optimal experience
- Ensure content is specific to the app context: ${appName} (${category})
- Use descriptive icon names (e.g., 'lightning', 'lock', 'mobile', 'card', 'target', 'chart') that will be mapped to SVG icons
- Make CTAs action-oriented and specific to ${category} apps
- Content should match the page purpose: "${page.purpose}"

Color Preference: ${colorScheme ? `Use colors inspired by ${colorScheme.primary} and ${colorScheme.secondary}` : 'Use appropriate colors for the selected tone'}

Generate a cohesive onboarding page that tells the story of ${appName} effectively and serves the purpose: "${page.purpose}"
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    // Parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate the response has the required structure
    if (!parsedContent.tone || !parsedContent.patterns || !Array.isArray(parsedContent.patterns)) {
      throw new Error('Invalid response structure from OpenAI');
    }

    return {
      success: true,
      content: parsedContent,
      tokensUsed: completion.usage?.total_tokens || 0
    };
  } catch (error) {
    console.error('Error generating pattern-based content:', error);
    return {
      success: false,
      tokensUsed: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function generateOnboardingContent(
  appName: string,
  appUrl: string,
  category: string,
  notes?: string
): Promise<GeneratedContent> {
  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_OPENAI_KEY
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_KEY in your environment variables.');
  }

  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true // Required for client-side usage
  })

  const prompt = `
Generate compelling onboarding page content for a ${category} app called "${appName}" (${appUrl}).

${notes ? `Additional context: ${notes}` : ''}
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert onboarding designer. Generate structured component data ONLY. Return valid JSON without markdown blocks or explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    const parsed = JSON.parse(content)
    
    // Create response in expected format
    const response = {
      headline: parsed.headline || '',
      subheadline: parsed.subheadline || '',
      features: parsed.features || [],
      cta: parsed.cta || '',
      testimonial: parsed.testimonial || { text: '', author: '', role: '', company: '' }
    };
    
    return response
  } catch (error) {
    throw new Error('Failed to generate onboarding content. Please try again.')
  }
} 