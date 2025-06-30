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
You are an expert mobile onboarding designer. Create a beautiful, modern onboarding page using ONLY our predefined customizable UI elements.

CRITICAL STRUCTURE REQUIREMENTS:
- The <body> must contain a single <main> wrapper for theme/background/layout
- Inside <main>, use ONLY these allowed elements as DIRECT CHILDREN:
  * <h1> for headlines (add data-element="headline")
  * <h2> for subheadlines (add data-element="subheadline") 
  * <p> for paragraphs (add data-element="paragraph")
  * <button> for CTAs (add data-element="cta")
  * <ul> for feature lists (add data-element="feature")
  * <blockquote> for testimonials (add data-element="testimonial")
  * <a> for links (add data-element="link")
  * <footer> for footers (add data-element="footer")

Page Details:
- Page ID: ${page.id}
- Title: ${page.title}
- Purpose: ${page.purpose}
- App Name: ${appName}
- Category: ${category}
- Tone: ${tone}
- App URL: ${appUrl}

Color Scheme: ${colorScheme ? `primary:${colorScheme.primary}, secondary:${colorScheme.secondary}, accent:${colorScheme.accent}` : 'modern pastel palette (indigo, blue, emerald)'}

DESIGN REQUIREMENTS:
1. Mobile-first design (320-414px viewport)
2. Use Tailwind CSS classes for all styling
3. Include smooth animations with CSS @keyframes
4. Modern gradients and beautiful spacing
5. Each element must have data-element attribute for editing
6. WCAG accessibility compliance
7. Beautiful color schemes using indigo, blue, green, purple color families
8. Engaging content that matches the ${tone} tone

CONTENT STRUCTURE:
- Start with an engaging headline that captures the app's value
- Include a supportive subheadline explaining the benefit
- Add 2-3 feature highlights as a list
- Include a compelling CTA button
- Consider adding a testimonial if it fits the page purpose

Return ONLY this JSON structure:
{
  "page_id": "${page.id}",
  "html_content": "<!DOCTYPE html>...",
  "suggestions": ["optional improvement suggestions"]
}`;
  
  

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert copywriter creating engaging onboarding content. Always respond with valid JSON only. Do not include markdown code blocks or any other formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1500
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    // Clean the response by removing markdown code blocks
    const cleanedContent = content.replace(/```json\s*|```\s*/g, '').trim()
    const parsed = JSON.parse(cleanedContent)
    return AIPageContentResponseSchema.parse(parsed)
  } catch (error) {
    console.error('Page content generation error:', error)
    throw new Error('Failed to generate page content. Please try again.')
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