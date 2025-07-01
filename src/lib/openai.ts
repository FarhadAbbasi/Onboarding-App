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

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    // Clean the response by removing markdown code blocks
    const cleanedContent = content.replace(/```json\s*|```\s*/g, '').trim()
    const parsed = JSON.parse(cleanedContent)
    return AIFlowPlanResponseSchema.parse(parsed)
  } catch (error) {
    if (error instanceof Error && error.message.includes('JSON')) {
      // Retry with stricter instruction
      const retryCompletion = await openai.chat.completions.create({
        model: 'gpt-4o',
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
    }
    
    console.error('Flow plan generation error:', error)
    throw new Error('Failed to generate flow plan. Please check your API key and try again.')
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

IMPORTANT: Generate ONLY structured component data. DO NOT generate HTML.

Available Components:
- headline: Main titles (properties: text, colorScheme, size)
- subheadline: Supporting text (properties: text, colorScheme, size)
- paragraph: Body text (properties: text, colorScheme, size)
- cta: Call-to-action buttons (properties: button_text, headline, colorScheme, size, variant)
- feature-list: Feature lists (properties: features array, colorScheme, size)
- testimonial: Customer testimonials (properties: quote, author, role, company, colorScheme)
- text-input: Input fields (properties: label, placeholder, required, colorScheme, size)
- alert: Notifications (properties: variant, title, message, colorScheme)
- link: Clickable links (properties: text, href, colorScheme, variant, underline)
- permission-request: Permission prompts (properties: title, description, button_text, colorScheme)
- spacer: Spacing elements (properties: height, colorScheme)
- icon: Icons/emojis (properties: icon, size, colorScheme, centered)
- footer: Page footer (properties: text, colorScheme, size)

IMPORTANT LAYOUT GUIDELINES:
- Use spacer components between sections for proper spacing
- Add icons to make pages more visually appealing
- For signup/login pages, use individual text-input and cta components
- Use appropriate colorSchemes that complement each other
- Vary component sizes for visual hierarchy

Available colorSchemes: indigo, blue, green, red, yellow, purple, pink, gray, emerald, cyan, orange, slate
Available sizes: xs, sm, md, lg, xl, 2xl
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
1. Create 3-5 components that tell a compelling story for this onboarding page
2. Use engaging, ${tone} tone content
3. Make content specific to ${category} apps
4. Choose appropriate colorSchemes that complement each other
5. Vary component sizes for visual hierarchy

Return ONLY this JSON structure:
{
  "page_id": "${page.id}",
  "blocks": [
    {
      "type": "headline",
      "content": {
        "text": "Welcome to ${appName}",
        "colorScheme": "indigo",
        "size": "xl"
      }
    },
    {
      "type": "subheadline", 
      "content": {
        "text": "Your journey starts here",
        "colorScheme": "gray",
        "size": "lg"
      }
    },
    {
      "type": "spacer",
      "content": {
        "height": "md"
      }
    },
    {
      "type": "feature-list",
      "content": {
        "features": ["Amazing Feature 1", "Incredible Feature 2", "Fantastic Feature 3"],
        "colorScheme": "blue",
        "size": "md"
      }
    },
    {
      "type": "spacer",
      "content": {
        "height": "lg"
      }
    },
    {
      "type": "cta",
      "content": {
        "button_text": "Get Started",
        "headline": "Ready to begin?",
        "colorScheme": "indigo",
        "size": "lg",
        "variant": "solid"
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
            content: { text: `Welcome to ${appName}`, colorScheme: 'indigo', size: 'xl' }
          },
          {
            type: 'subheadline', 
            content: { text: 'Get started with your new experience', colorScheme: 'gray', size: 'lg' }
          },
          {
            type: 'cta',
            content: { button_text: 'Get Started', colorScheme: 'indigo', size: 'lg', variant: 'solid' }
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

Please generate:
1. A catchy headline (max 60 characters)
2. A supporting subheadline (max 120 characters)
3. 3-4 key features (each max 50 characters)
4. A call-to-action button text (max 25 characters)
5. A testimonial with author name, role, and company

Make it modern, engaging, and focused on the value proposition. Return the response as valid JSON matching this structure:
{
  "headline": "string",
  "subheadline": "string", 
  "features": ["string", "string", "string"],
  "cta": "string",
  "testimonial": {
    "text": "string",
    "author": "string",
    "role": "string",
    "company": "string"
  }
}
`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a expert copywriter specializing in app onboarding pages. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    const parsed = JSON.parse(content) as GeneratedContent
    
    // Validate required fields
    if (!parsed.headline || !parsed.subheadline || !parsed.features || !parsed.cta || !parsed.testimonial) {
      throw new Error('Invalid response format from OpenAI')
    }

    return parsed
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error('Failed to generate content. Please check your API key and try again.')
  }
} 