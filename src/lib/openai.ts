import OpenAI from 'openai'
import { 
  AIFlowPlanResponseSchema, 
  AIPageContentResponseSchema, 
  type AIFlowPlanResponse, 
  type AIPageContentResponse,
  type Page 
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
  apiKey: string,
  appName: string,
  appUrl: string,
  category: string,
  featureFocus: string,
  tone: 'professional' | 'friendly' | 'casual' | 'modern' | 'playful',
  notes?: string
): Promise<AIFlowPlanResponse> {
  console.log('[generateFlowPlan] Starting with params:', { appName, category, tone })
  
  // Validate API key format
  if (!apiKey || !apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format. API key should start with "sk-"')
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
  apiKey: string,
  page: Page,
  appName: string,
  category: string,
  tone: string,
  appUrl: string,
  colorScheme?: { primary: string; secondary: string; accent: string; background: string; text: string }
): Promise<AIPageContentResponse> {
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  })

  const prompt = `
You are an expert onboarding designer creating beautiful mobile app pages using a component library.

IMPORTANT: Generate ONLY structured component data with separate content and styles. DO NOT generate HTML.

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
- spacer: Spacing elements (content: {} | styles: height)
- icon: Icons/emojis (content: icon | styles: size, colorScheme, centered, marginTop, marginBottom)
- footer: Page footer (content: text | styles: colorScheme, size, textAlign, padding)

IMPORTANT LAYOUT GUIDELINES:
- Use spacer components between sections for proper spacing
- Add icons to make pages more visually appealing
- For signup/login pages, use individual text-input and cta components
- Use appropriate colorSchemes that complement each other
- Vary component sizes for visual hierarchy

Available colorSchemes: indigo, blue, green, red, yellow, purple, pink, gray, emerald, cyan, orange, slate
Available sizes: xs, sm, md, lg, xl, 2xl
Available variants: solid, outline, ghost
Available spacing: xs, sm, md, lg, xl
Available alignments: left, center, right
Available fontWeights: normal, medium, semibold, bold
Available textAligns: left, center, right, justify
Available borderRadius: sm, md, lg, xl, 2xl, full
Available shadows: sm, md, lg, xl, 2xl

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
1. Create 3-5 components that tell a compelling story for this onboarding page
2. Use engaging, ${tone} tone content
3. Make content specific to ${category} apps
4. Choose appropriate colorSchemes that complement each other
5. Vary component sizes for visual hierarchy
6. IMPORTANT: Separate content data from styling data

Return ONLY this JSON structure:
{
  "page_id": "${page.id}",
  "blocks": [
    {
      "type": "headline",
      "content": {
        "text": "Welcome to ${appName}"
      },
      "styles": {
        "colorScheme": "indigo",
        "size": "xl",
        "fontWeight": "bold",
        "textAlign": "center"
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
        "textAlign": "center",
        "marginTop": "sm"
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
      "type": "feature-list",
      "content": {
        "features": ["Amazing Feature 1", "Incredible Feature 2", "Fantastic Feature 3"]
      },
      "styles": {
        "colorScheme": "blue",
        "size": "md",
        "spacing": "comfortable",
        "alignment": "left"
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
        "shadow": "md",
        "padding": "lg"
      }
    }
  ],
  "theme": {
    "backgroundClass": "bg-gradient-to-br from-indigo-50 to-blue-50",
    "textClass": "text-gray-900",
    "accentColor": "indigo"
  }
}

Create compelling, engaging content that fits the page purpose: ${page.purpose}
`;

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
    
    return AIPageContentResponseSchema.parse(response)
  } catch (error) {
    // Fallback with manual retry
    try {
      const fallbackCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'Generate component data as JSON only. No markdown.'
          },
          {
            role: 'user',
            content: `Create onboarding components for "${page.title}" page. Return JSON with blocks array containing headline, subheadline, feature-list, and cta components.`
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      })

      const fallbackContent = fallbackCompletion.choices[0]?.message?.content
      if (!fallbackContent) {
        throw new Error('No fallback content generated')
      }

      const cleanedContent = fallbackContent.replace(/```json\s*|```\s*/g, '').trim()
      const fallbackParsed = JSON.parse(cleanedContent)
      
      // Ensure proper structure
      const fallbackResponse = {
        page_id: page.id,
        html_content: '',
        blocks: fallbackParsed.blocks || [
          {
            type: 'headline',
            content: { text: `Welcome to ${appName}` },
            styles: { colorScheme: 'indigo', size: 'xl', fontWeight: 'bold', textAlign: 'center' }
          },
          {
            type: 'subheadline', 
            content: { text: 'Get started with your new experience' },
            styles: { colorScheme: 'gray', size: 'lg', textAlign: 'center', marginTop: 'sm' }
          },
          {
            type: 'cta',
            content: { button_text: 'Get Started', headline: 'Ready to begin?' },
            styles: { colorScheme: 'indigo', size: 'lg', variant: 'solid' }
          }
        ],
        theme: {
          backgroundClass: 'bg-gradient-to-br from-indigo-50 to-blue-50',
          textClass: 'text-gray-900',
          accentColor: 'indigo'
        },
        suggestions: []
      };
      
      return AIPageContentResponseSchema.parse(fallbackResponse)
    } catch (fallbackError) {
    throw new Error('Failed to generate page content. Please try again.')
    }
  }
}

export async function generateOnboardingContent(
  apiKey: string,
  appName: string,
  appUrl: string,
  category: string,
  notes?: string
): Promise<GeneratedContent> {
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