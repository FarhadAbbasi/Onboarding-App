// GPT Structured Output Schemas for Onboarding Screen Text Generation
// This defines the schemas for GPT to generate contextual text content for onboarding screens

import { z } from 'zod';

// Base schema for a single screen's text content
export const ScreenTextContentSchema = z.object({
  screenId: z.string().describe('The ID of the screen template'),
  content: z.record(z.string(), z.string()).describe('Key-value pairs of text variables and their generated content')
});

// Schema for generating multiple screens' text content
export const OnboardingTextContentSchema = z.object({
  projectName: z.string().describe('The name of the project/app'),
  appCategory: z.string().describe('The category of the app'),
  onboardingType: z.string().describe('The type of onboarding flow selected'),
  screens: z.array(ScreenTextContentSchema).describe('Array of screen text content')
});

// Schema for individual screen types with their specific text requirements

// Welcome Screen Text Schema
export const WelcomeScreenTextSchema = z.object({
  title: z.string().describe('Main welcome title'),
  subtitle: z.string().describe('Supporting subtitle or tagline'),
  cta: z.string().describe('Call-to-action button text'),
  welcome_message: z.string().optional().describe('Welcome message text'),
  testimonial_text: z.string().optional().describe('User testimonial quote'),
  testimonial_author: z.string().optional().describe('Testimonial author name'),
  stat1_label: z.string().optional().describe('First statistic label'),
  stat1_value: z.string().optional().describe('First statistic value'),
  stat2_label: z.string().optional().describe('Second statistic label'),
  stat2_value: z.string().optional().describe('Second statistic value'),
  stat3_label: z.string().optional().describe('Third statistic label'),
  stat3_value: z.string().optional().describe('Third statistic value'),
  video_description: z.string().optional().describe('Video description text'),
  skip_text: z.string().optional().describe('Skip button text'),
  continue_text: z.string().optional().describe('Continue button text')
});

// Feature Screen Text Schema
export const FeatureScreenTextSchema = z.object({
  feature_title: z.string().describe('Feature title'),
  feature_description: z.string().describe('Feature description'),
  benefit: z.string().describe('Key benefit text'),
  cta: z.string().describe('Call-to-action button text'),
  title: z.string().optional().describe('Screen title'),
  description: z.string().optional().describe('Screen description'),
  before_text: z.string().optional().describe('Before comparison text'),
  after_text: z.string().optional().describe('After comparison text'),
  step1_title: z.string().optional().describe('First step title'),
  step1_desc: z.string().optional().describe('First step description'),
  step2_title: z.string().optional().describe('Second step title'),
  step2_desc: z.string().optional().describe('Second step description'),
  step3_title: z.string().optional().describe('Third step title'),
  step3_desc: z.string().optional().describe('Third step description'),
  benefit1: z.string().optional().describe('First benefit'),
  benefit2: z.string().optional().describe('Second benefit'),
  benefit3: z.string().optional().describe('Third benefit'),
  benefit4: z.string().optional().describe('Fourth benefit'),
  demo_instruction: z.string().optional().describe('Demo instruction text'),
  try_text: z.string().optional().describe('Try it button text'),
  next_text: z.string().optional().describe('Next button text'),
  timeline_desc: z.string().optional().describe('Timeline description'),
  time1: z.string().optional().describe('First timeline point'),
  event1: z.string().optional().describe('First timeline event'),
  time2: z.string().optional().describe('Second timeline point'),
  event2: z.string().optional().describe('Second timeline event'),
  time3: z.string().optional().describe('Third timeline point'),
  event3: z.string().optional().describe('Third timeline event'),
  social_stat: z.string().optional().describe('Social proof statistic'),
  testimonial1: z.string().optional().describe('First testimonial'),
  author1: z.string().optional().describe('First testimonial author'),
  testimonial2: z.string().optional().describe('Second testimonial'),
  author2: z.string().optional().describe('Second testimonial author'),
  problem_title: z.string().optional().describe('Problem statement title'),
  problem_desc: z.string().optional().describe('Problem description'),
  solution_title: z.string().optional().describe('Solution title'),
  solution_desc: z.string().optional().describe('Solution description'),
  metric1_label: z.string().optional().describe('First metric label'),
  metric1_value: z.string().optional().describe('First metric value'),
  metric2_label: z.string().optional().describe('Second metric label'),
  metric2_value: z.string().optional().describe('Second metric value'),
  insight: z.string().optional().describe('Key insight text'),
  integration_desc: z.string().optional().describe('Integration description'),
  tool1: z.string().optional().describe('First integrated tool'),
  tool2: z.string().optional().describe('Second integrated tool'),
  tool3: z.string().optional().describe('Third integrated tool')
});

// Social Screen Text Schema
export const SocialScreenTextSchema = z.object({
  title: z.string().describe('Screen title'),
  description: z.string().describe('Screen description'),
  connect_text: z.string().optional().describe('Connect button text'),
  skip_text: z.string().optional().describe('Skip button text'),
  community_desc: z.string().optional().describe('Community description'),
  member_count: z.string().optional().describe('Member count display'),
  join_text: z.string().optional().describe('Join button text'),
  later_text: z.string().optional().describe('Later button text'),
  sharing_benefit: z.string().optional().describe('Sharing benefit text'),
  reward_text: z.string().optional().describe('Reward text'),
  share_text: z.string().optional().describe('Share button text')
});

// Auth Screen Text Schema
export const AuthScreenTextSchema = z.object({
  title: z.string().describe('Screen title'),
  subtitle: z.string().describe('Screen subtitle'),
  email_placeholder: z.string().describe('Email input placeholder'),
  password_placeholder: z.string().describe('Password input placeholder'),
  signup_text: z.string().optional().describe('Sign up button text'),
  login_text: z.string().optional().describe('Login button text'),
  forgot_text: z.string().optional().describe('Forgot password text'),
  google_text: z.string().optional().describe('Google login button text'),
  facebook_text: z.string().optional().describe('Facebook login button text'),
  apple_text: z.string().optional().describe('Apple login button text'),
  email_text: z.string().optional().describe('Email login button text'),
  instruction: z.string().optional().describe('Instruction text'),
  resend_text: z.string().optional().describe('Resend button text'),
  change_email_text: z.string().optional().describe('Change email button text'),
  continue_text: z.string().optional().describe('Continue button text')
});

// Profile Screen Text Schema
export const ProfileScreenTextSchema = z.object({
  title: z.string().describe('Screen title'),
  subtitle: z.string().optional().describe('Screen subtitle'),
  name_placeholder: z.string().optional().describe('Name input placeholder'),
  bio_placeholder: z.string().optional().describe('Bio input placeholder'),
  continue_text: z.string().describe('Continue button text'),
  skip_text: z.string().optional().describe('Skip button text'),
  instruction: z.string().optional().describe('Instruction text'),
  upload_text: z.string().optional().describe('Upload button text'),
  camera_text: z.string().optional().describe('Camera button text'),
  interest1: z.string().optional().describe('First interest option'),
  interest2: z.string().optional().describe('Second interest option'),
  interest3: z.string().optional().describe('Third interest option'),
  interest4: z.string().optional().describe('Fourth interest option'),
  interest5: z.string().optional().describe('Fifth interest option'),
  interest6: z.string().optional().describe('Sixth interest option'),
  beginner_text: z.string().optional().describe('Beginner level text'),
  intermediate_text: z.string().optional().describe('Intermediate level text'),
  advanced_text: z.string().optional().describe('Advanced level text')
});

// Preferences Screen Text Schema
export const PreferencesScreenTextSchema = z.object({
  title: z.string().describe('Screen title'),
  instruction: z.string().describe('Instruction text'),
  continue_text: z.string().describe('Continue button text'),
  push_label: z.string().optional().describe('Push notification label'),
  email_label: z.string().optional().describe('Email notification label'),
  sms_label: z.string().optional().describe('SMS notification label'),
  marketing_label: z.string().optional().describe('Marketing notification label'),
  light_text: z.string().optional().describe('Light theme text'),
  dark_text: z.string().optional().describe('Dark theme text'),
  auto_text: z.string().optional().describe('Auto theme text'),
  daily_text: z.string().optional().describe('Daily frequency text'),
  weekly_text: z.string().optional().describe('Weekly frequency text'),
  monthly_text: z.string().optional().describe('Monthly frequency text'),
  custom_text: z.string().optional().describe('Custom frequency text'),
  public_profile_label: z.string().optional().describe('Public profile label'),
  data_sharing_label: z.string().optional().describe('Data sharing label'),
  analytics_label: z.string().optional().describe('Analytics label')
});

// Completion Screen Text Schema
export const CompletionScreenTextSchema = z.object({
  title: z.string().describe('Completion title'),
  message: z.string().describe('Completion message'),
  next_step: z.string().optional().describe('Next step text'),
  get_started_text: z.string().describe('Get started button text'),
  tour_description: z.string().optional().describe('Tour description'),
  take_tour_text: z.string().optional().describe('Take tour button text'),
  skip_tour_text: z.string().optional().describe('Skip tour button text')
});

// Tutorial Screen Text Schema
export const TutorialScreenTextSchema = z.object({
  title: z.string().describe('Tutorial title'),
  instruction: z.string().describe('Instruction text'),
  continue_text: z.string().describe('Continue button text'),
  swipe_left_text: z.string().optional().describe('Swipe left instruction'),
  swipe_right_text: z.string().optional().describe('Swipe right instruction'),
  try_it_text: z.string().optional().describe('Try it button text'),
  tab1_desc: z.string().optional().describe('First tab description'),
  tab2_desc: z.string().optional().describe('Second tab description'),
  tab3_desc: z.string().optional().describe('Third tab description'),
  shortcut1_key: z.string().optional().describe('First shortcut key'),
  shortcut1_desc: z.string().optional().describe('First shortcut description'),
  shortcut2_key: z.string().optional().describe('Second shortcut key'),
  shortcut2_desc: z.string().optional().describe('Second shortcut description'),
  shortcut3_key: z.string().optional().describe('Third shortcut key'),
  shortcut3_desc: z.string().optional().describe('Third shortcut description')
});

// Benefits Screen Text Schema
export const BenefitsScreenTextSchema = z.object({
  title: z.string().describe('Benefits title'),
  description: z.string().describe('Benefits description'),
  cta: z.string().describe('Call-to-action button text'),
  time_saved: z.string().optional().describe('Time saved statistic'),
  feature1: z.string().optional().describe('First feature benefit'),
  feature2: z.string().optional().describe('Second feature benefit'),
  feature3: z.string().optional().describe('Third feature benefit'),
  productivity_stat: z.string().optional().describe('Productivity statistic'),
  benefit1: z.string().optional().describe('First benefit'),
  benefit2: z.string().optional().describe('Second benefit'),
  benefit3: z.string().optional().describe('Third benefit'),
  savings_amount: z.string().optional().describe('Savings amount'),
  comparison_text: z.string().optional().describe('Comparison text'),
  roi_text: z.string().optional().describe('ROI text')
});

// Permissions Screen Text Schema
export const PermissionsScreenTextSchema = z.object({
  title: z.string().describe('Permissions title'),
  description: z.string().describe('Permissions description'),
  permission1_name: z.string().optional().describe('First permission name'),
  permission1_desc: z.string().optional().describe('First permission description'),
  permission2_name: z.string().optional().describe('Second permission name'),
  permission2_desc: z.string().optional().describe('Second permission description'),
  allow_text: z.string().optional().describe('Allow button text'),
  later_text: z.string().optional().describe('Later button text'),
  permission_name: z.string().optional().describe('Permission name'),
  permission_desc: z.string().optional().describe('Permission description'),
  benefit: z.string().optional().describe('Permission benefit'),
  enable_text: z.string().optional().describe('Enable button text'),
  skip_text: z.string().optional().describe('Skip button text')
});

// Complete GPT prompt schema for generating all screen text content
export const GPTOnboardingPromptSchema = z.object({
  projectName: z.string().describe('The name of the app/project'),
  appCategory: z.string().describe('The category of the app (e.g., productivity, social, e-commerce)'),
  onboardingType: z.string().describe('The type of onboarding flow selected'),
  targetAudience: z.string().describe('The target audience for the app'),
  brandPersonality: z.string().describe('The brand personality (modern, playful, professional, etc.)'),
  contentTone: z.string().describe('The content tone (professional, friendly, casual, formal)'),
  flowPurpose: z.string().describe('The purpose of the onboarding flow'),
  notes: z.string().optional().describe('Additional notes about the app'),
  selectedScreenIds: z.array(z.string()).describe('Array of selected screen template IDs'),
  textVariables: z.record(z.string(), z.array(z.string())).describe('Text variables needed for each screen ID')
});

// GPT Response Schema - what we expect back from GPT
export const GPTOnboardingResponseSchema = z.object({
  projectName: z.string(),
  appCategory: z.string(),
  onboardingType: z.string(),
  screens: z.array(z.object({
    screenId: z.string(),
    content: z.record(z.string(), z.string())
  }))
});

// Type exports
export type ScreenTextContent = z.infer<typeof ScreenTextContentSchema>;
export type OnboardingTextContent = z.infer<typeof OnboardingTextContentSchema>;
export type WelcomeScreenText = z.infer<typeof WelcomeScreenTextSchema>;
export type FeatureScreenText = z.infer<typeof FeatureScreenTextSchema>;
export type SocialScreenText = z.infer<typeof SocialScreenTextSchema>;
export type AuthScreenText = z.infer<typeof AuthScreenTextSchema>;
export type ProfileScreenText = z.infer<typeof ProfileScreenTextSchema>;
export type PreferencesScreenText = z.infer<typeof PreferencesScreenTextSchema>;
export type CompletionScreenText = z.infer<typeof CompletionScreenTextSchema>;
export type TutorialScreenText = z.infer<typeof TutorialScreenTextSchema>;
export type BenefitsScreenText = z.infer<typeof BenefitsScreenTextSchema>;
export type PermissionsScreenText = z.infer<typeof PermissionsScreenTextSchema>;
export type GPTOnboardingPrompt = z.infer<typeof GPTOnboardingPromptSchema>;
export type GPTOnboardingResponse = z.infer<typeof GPTOnboardingResponseSchema>;

// Helper function to generate GPT prompt for onboarding text content
export function generateGPTPrompt(
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
  },
  selectedScreenIds: string[],
  textVariables: Record<string, string[]>
): string {
  const prompt = `
You are an expert UX copywriter specializing in mobile app onboarding flows. Generate engaging, contextual text content for onboarding screens.

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

**Screen Requirements:**
Generate text content for these ${selectedScreenIds.length} screens:
${selectedScreenIds.map(screenId => `
- Screen ID: ${screenId}
- Required text variables: ${textVariables[screenId]?.join(', ') || 'None'}
`).join('')}

**Guidelines:**
1. Keep text concise and scannable for mobile screens
2. Use active voice and clear, benefit-focused language
3. Match the specified brand personality and content tone
4. Ensure consistency across all screens
5. Make CTAs compelling and action-oriented
6. Personalize content for the target audience
7. Align with the app category and purpose
8. Keep titles under 40 characters, descriptions under 120 characters
9. Make button text under 20 characters
10. Use inclusive, accessible language

**Response Format:**
Return a JSON object with this exact structure:
{
  "projectName": "${projectData.name}",
  "appCategory": "${projectData.category}",
  "onboardingType": "${projectData.onboardingType}",
  "screens": [
    {
      "screenId": "screen-id-here",
      "content": {
        "textVariable1": "Generated text content here",
        "textVariable2": "Generated text content here"
      }
    }
  ]
}

Generate compelling, on-brand text that will create an excellent first impression and guide users through the onboarding experience effectively.
`;

  return prompt;
}

// Helper function to validate GPT response
export function validateGPTResponse(response: unknown): GPTOnboardingResponse {
  return GPTOnboardingResponseSchema.parse(response);
}