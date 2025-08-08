// GPT Text Generation Service
// Handles generating contextual text content for onboarding screens using OpenAI

import OpenAI from 'openai';
import { 
  generateGPTPrompt, 
  validateGPTResponse, 
  type GPTOnboardingResponse,
  type GPTOnboardingPrompt
} from '../types/gpt-schemas';
import { getTemplateById } from '../types/onboarding-templates';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_KEY || '',
  dangerouslyAllowBrowser: true
});

export interface TextGenerationRequest {
  projectData: {
    name: string;
    category: string;
    onboardingType: string;
    notes?: string;
  };
  aiConfig: {
    targetAudience: string;
    brandPersonality: string;
    contentTone: string;
    flowPurpose: string;
  };
  selectedScreenIds: string[];
}

export interface TextGenerationResponse {
  success: boolean;
  data?: GPTOnboardingResponse;
  error?: string;
}

/**
 * Generate text content for onboarding screens using GPT
 */
export async function generateOnboardingTextContent(
  request: TextGenerationRequest
): Promise<TextGenerationResponse> {
  try {
    // Check if OpenAI API is configured
    if (!isGPTConfigured()) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_KEY environment variable.');
    }

    // Prepare text variables for each screen
    const textVariables: Record<string, string[]> = {};
    
    for (const screenId of request.selectedScreenIds) {
      const template = getTemplateById(screenId);
      if (template) {
        textVariables[screenId] = template.textVariables;
      }
    }

    // Generate the GPT prompt
    const prompt = generateGPTPrompt(
      request.projectData,
      request.aiConfig,
      request.selectedScreenIds,
      textVariables
    );

    // Call OpenAI API with structured output
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX copywriter specializing in mobile app onboarding flows. You always respond with valid JSON that matches the requested schema.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    // Parse and validate the response
    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response content from OpenAI');
    }

    const parsedResponse = JSON.parse(responseText);
    const validatedResponse = validateGPTResponse(parsedResponse);

    return {
      success: true,
      data: validatedResponse
    };

  } catch (error) {
    console.error('Error generating onboarding text content:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate text content for a single screen
 */
export async function generateSingleScreenTextContent(
  screenId: string,
  projectData: {
    name: string;
    category: string;
    onboardingType: string;
    notes?: string;
  },
  aiConfig: {
    targetAudience: string;
    brandPersonality: string;
    contentTone: string;
    flowPurpose: string;
  }
): Promise<TextGenerationResponse> {
  return generateOnboardingTextContent({
    projectData,
    aiConfig,
    selectedScreenIds: [screenId]
  });
}

/**
 * Regenerate text content for specific text variables
 */
export async function regenerateTextVariables(
  screenId: string,
  textVariables: string[],
  projectData: {
    name: string;
    category: string;
    onboardingType: string;
    notes?: string;
  },
  aiConfig: {
    targetAudience: string;
    brandPersonality: string;
    contentTone: string;
    flowPurpose: string;
  }
): Promise<TextGenerationResponse> {
  try {
    const template = getTemplateById(screenId);
    if (!template) {
      throw new Error(`Template not found for screen ID: ${screenId}`);
    }

    // Generate a focused prompt for specific text variables
    const prompt = `
You are an expert UX copywriter. Generate new text content for specific variables in a mobile app onboarding screen.

**Project Details:**
- App Name: ${projectData.name}
- Category: ${projectData.category}
- Onboarding Type: ${projectData.onboardingType}
- Notes: ${projectData.notes || 'None'}

**Brand & Tone:**
- Target Audience: ${aiConfig.targetAudience}
- Brand Personality: ${aiConfig.brandPersonality}
- Content Tone: ${aiConfig.contentTone}
- Flow Purpose: ${aiConfig.flowPurpose}

**Screen:** ${template.name} (${screenId})
**Regenerate these text variables:** ${textVariables.join(', ')}

**Guidelines:**
1. Keep text concise and scannable for mobile screens
2. Use active voice and clear, benefit-focused language
3. Match the specified brand personality and content tone
4. Keep titles under 40 characters, descriptions under 120 characters
5. Make button text under 20 characters

**Response Format:**
Return a JSON object with this exact structure:
{
  "screenId": "${screenId}",
  "content": {
    ${textVariables.map(variable => `"${variable}": "Generated text content here"`).join(',\n    ')}
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert UX copywriter. You always respond with valid JSON that matches the requested schema.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response content from OpenAI');
    }

    const parsedResponse = JSON.parse(responseText);
    
    // Convert single screen response to full response format
    const fullResponse: GPTOnboardingResponse = {
      projectName: projectData.name,
      appCategory: projectData.category,
      onboardingType: projectData.onboardingType,
      screens: [parsedResponse]
    };

    return {
      success: true,
      data: fullResponse
    };

  } catch (error) {
    console.error('Error regenerating text variables:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get sample text content for preview (without API call)
 */
export function getSampleTextContent(
  screenId: string,
  projectData: {
    name: string;
    category: string;
    onboardingType: string;
  }
): Record<string, string> {
  const template = getTemplateById(screenId);
  if (!template) {
    return {};
  }

  // Generate sample content based on screen type and app category
  const sampleContent: Record<string, string> = {};
  
  for (const variable of template.textVariables) {
    switch (variable) {
      case 'title':
        sampleContent[variable] = `Welcome to ${projectData.name}`;
        break;
      case 'subtitle':
        sampleContent[variable] = `Your new favorite ${projectData.category.toLowerCase()} app`;
        break;
      case 'subheading':
        sampleContent[variable] = `Discover powerful features designed to enhance your ${projectData.category.toLowerCase()} experience`;
        break;
      case 'cta':
        sampleContent[variable] = 'Get Started';
        break;
      case 'feature_title':
        sampleContent[variable] = 'Amazing Features';
        break;
      case 'feature_description':
        sampleContent[variable] = 'Discover what makes our app special';
        break;
      case 'benefit':
        sampleContent[variable] = 'Save time and boost productivity';
        break;
      case 'continue_text':
        sampleContent[variable] = 'Continue';
        break;
      case 'skip_text':
        sampleContent[variable] = 'Skip for now';
        break;
      case 'email_label':
        sampleContent[variable] = 'Email Address';
        break;
      case 'email_placeholder':
        sampleContent[variable] = 'Enter your email';
        break;
      case 'password_label':
        sampleContent[variable] = 'Password';
        break;
      case 'password_placeholder':
        sampleContent[variable] = 'Enter your password';
        break;
      case 'name_label':
        sampleContent[variable] = 'Full Name';
        break;
      case 'name_placeholder':
        sampleContent[variable] = 'Enter your name';
        break;
      case 'bio_label':
        sampleContent[variable] = 'Bio (Optional)';
        break;
      case 'bio_placeholder':
        sampleContent[variable] = 'Tell us about yourself';
        break;
      case 'get_started_text':
        sampleContent[variable] = 'Get Started';
        break;
      case 'message':
        sampleContent[variable] = `You're all set! Welcome to ${projectData.name}.`;
        break;
      case 'description':
        sampleContent[variable] = 'Let us show you around and help you get the most out of our app.';
        break;
      case 'instruction':
        sampleContent[variable] = 'Follow these simple steps to get started.';
        break;
      default:
        sampleContent[variable] = `Sample ${variable.replace(/_/g, ' ')}`;
    }
  }

  return sampleContent;
}

/**
 * Check if OpenAI API is properly configured
 */
export function isGPTConfigured(): boolean {
  return Boolean(import.meta.env.VITE_OPENAI_KEY);
}

/**
 * Get estimated token count for text generation
 */
export function estimateTokenCount(request: TextGenerationRequest): number {
  const basePromptTokens = 500; // Base prompt overhead
  const screenTokens = request.selectedScreenIds.length * 100; // ~100 tokens per screen
  const contextTokens = 200; // Project and AI config context
  
  return basePromptTokens + screenTokens + contextTokens;
}