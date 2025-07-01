import { z } from 'zod'

// Block content schema for structured responses
export const BlockContentSchema = z.object({
  text: z.string().optional(),
  headline: z.string().optional(),
  subheadline: z.string().optional(),
  button_text: z.string().optional(),
  features: z.array(z.string()).optional(),
  quote: z.string().optional(),
  author: z.string().optional(),
  role: z.string().optional(),
  company: z.string().optional(),
  colorScheme: z.enum(['indigo', 'blue', 'green', 'red', 'yellow', 'purple', 'pink', 'gray', 'emerald', 'cyan', 'orange', 'slate']).optional(),
  size: z.enum(['xs', 'sm', 'md', 'lg', 'xl', '2xl']).optional(),
  variant: z.string().optional()
})

// Structured block schema
export const StructuredBlockSchema = z.object({
  type: z.string(),
  content: BlockContentSchema
})

// Theme schema for structured responses
export const ThemeSchema = z.object({
  background: z.string().optional(),
  text_color: z.string().optional(),
  accent_color: z.string().optional(),
  custom_css: z.string().optional()
})

// Block types for individual content pieces
export const BlockSchema = z.object({
  id: z.string(),
  type: z.enum(['hero', 'feature-list', 'form', 'cta', 'testimonial', 'permissions', 'profile-setup']),
  content: z.record(z.string(), z.any()), // Flexible content object
  order_index: z.number(),
  styles: z.record(z.string(), z.any()).optional()
})

// Individual page in the onboarding flow
export const PageSchema = z.object({
  id: z.string(),
  title: z.string(),
  purpose: z.string(), // Brief description of what this page does
  html_content: z.string().optional(), // Complete HTML content for the page - generated later
  blocks: z.array(z.string()).optional(), // Array of block type names for planning
  order_index: z.number()
})

// Complete onboarding flow plan
export const FlowPlanSchema = z.object({
  flow_name: z.string(),
  category: z.string(),
  tone: z.enum(['professional', 'friendly', 'casual', 'modern', 'playful']),
  total_pages: z.number(),
  estimated_completion_time: z.string(), // e.g., "2-3 minutes"
  pages: z.array(PageSchema)
})

// AI response for flow planning
export const AIFlowPlanResponseSchema = z.object({
  flow_plan: FlowPlanSchema,
  reasoning: z.string().optional() // Why this flow structure was chosen
})

// AI response for individual page content (updated for structured format)
export const AIPageContentResponseSchema = z.object({
  page_id: z.string(),
  html_content: z.string(), // Complete HTML for the page
  blocks: z.array(StructuredBlockSchema).optional(), // Structured blocks
  theme: ThemeSchema.optional(), // Theme information
  suggestions: z.array(z.string()).optional() // Optional improvement suggestions
})

// Export types
export type BlockContent = z.infer<typeof BlockContentSchema>
export type StructuredBlock = z.infer<typeof StructuredBlockSchema>
export type Theme = z.infer<typeof ThemeSchema>
export type Block = z.infer<typeof BlockSchema>
export type Page = z.infer<typeof PageSchema>
export type FlowPlan = z.infer<typeof FlowPlanSchema>
export type AIFlowPlanResponse = z.infer<typeof AIFlowPlanResponseSchema>
export type AIPageContentResponse = z.infer<typeof AIPageContentResponseSchema>

// Common block content templates for type safety
export const HeroBlockContent = z.object({
  headline: z.string(),
  subheadline: z.string(),
  cta_text: z.string(),
  background_style: z.string().optional()
})

export const FeatureListBlockContent = z.object({
  title: z.string(),
  features: z.array(z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string().optional()
  }))
})

export const FormBlockContent = z.object({
  title: z.string(),
  fields: z.array(z.object({
    label: z.string(),
    type: z.enum(['text', 'email', 'password', 'select', 'checkbox', 'textarea']),
    placeholder: z.string().optional(),
    required: z.boolean(),
    options: z.array(z.string()).optional() // For select fields
  })),
  submit_text: z.string()
})

export const CTABlockContent = z.object({
  headline: z.string(),
  description: z.string(),
  button_text: z.string(),
  button_style: z.string().optional()
})

export const TestimonialBlockContent = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string(),
  company: z.string(),
  avatar_url: z.string().optional()
})

export const PermissionsBlockContent = z.object({
  title: z.string(),
  description: z.string(),
  permissions: z.array(z.object({
    name: z.string(),
    description: z.string(),
    required: z.boolean(),
    icon: z.string().optional()
  })),
  allow_text: z.string(),
  skip_text: z.string().optional()
})

export const ProfileSetupBlockContent = z.object({
  title: z.string(),
  description: z.string(),
  fields: z.array(z.object({
    label: z.string(),
    type: z.enum(['text', 'select', 'file', 'textarea']),
    placeholder: z.string().optional(),
    options: z.array(z.string()).optional()
  })),
  save_text: z.string(),
  skip_text: z.string().optional()
})

// Nested block tree for flexible layouts
export type BlockNode = {
  id: string;
  type: string;
  content: string;
  children: string[];
  parentId: string | null;
  styles?: Record<string, any>;
};

export type BlockTree = {
  rootId: string;
  nodes: Record<string, BlockNode>;
}; 