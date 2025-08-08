// Template Selector - Uses GPT to select the best template based on app description
export interface AppTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  targetAudience: string[];
  features: string[];
  keywords: string[];
  screens: TemplateScreen[];
}

export interface TemplateScreen {
  id: string;
  name: string;
  purpose: string;
  components: string[];
  userInfoFields?: UserInfoField[];
}

export interface UserInfoField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
  placeholder?: string;
  description?: string;
}

// Hardcoded app templates
export const APP_TEMPLATES: AppTemplate[] = [
  {
    id: 'fitness-tracker',
    name: 'Fitness & Health Tracker',
    description: 'Comprehensive fitness tracking with personalized workouts and nutrition',
    category: 'Health & Fitness',
    targetAudience: ['fitness enthusiasts', 'health-conscious users', 'athletes'],
    features: ['workout tracking', 'nutrition logging', 'progress analytics', 'goal setting'],
    keywords: ['fitness', 'workout', 'health', 'exercise', 'nutrition', 'training', 'gym'],
    screens: [
      {
        id: 'welcome',
        name: 'Welcome Screen',
        purpose: 'Welcome users and showcase app benefits',
        components: ['hero_image', 'title', 'subtitle', 'cta_button']
      },
      {
        id: 'goals',
        name: 'Fitness Goals',
        purpose: 'Collect user fitness objectives',
        components: ['title', 'option_group', 'progress_bar'],
        userInfoFields: [
          { id: 'goals', label: 'What are your fitness goals?', type: 'checkbox', required: true, options: ['Lose Weight', 'Build Muscle', 'Improve Endurance', 'Stay Healthy'] },
          { id: 'experience', label: 'Your fitness experience level', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced'] }
        ]
      },
      {
        id: 'profile',
        name: 'Profile Setup',
        purpose: 'Collect basic user information',
        components: ['title', 'input_fields', 'image_picker'],
        userInfoFields: [
          { id: 'age', label: 'Age', type: 'number', required: true },
          { id: 'weight', label: 'Current Weight (lbs)', type: 'number', required: false },
          { id: 'height', label: 'Height (inches)', type: 'number', required: false }
        ]
      }
    ]
  },
  {
    id: 'ecommerce-shop',
    name: 'E-commerce Shopping',
    description: 'Online shopping platform with personalized recommendations',
    category: 'E-commerce',
    targetAudience: ['online shoppers', 'retail customers', 'deal hunters'],
    features: ['product browsing', 'personalized recommendations', 'secure checkout', 'order tracking'],
    keywords: ['shopping', 'ecommerce', 'store', 'products', 'buy', 'purchase', 'retail'],
    screens: [
      {
        id: 'welcome',
        name: 'Shop Welcome',
        purpose: 'Welcome shoppers and highlight deals',
        components: ['hero_banner', 'featured_products', 'search_bar']
      },
      {
        id: 'preferences',
        name: 'Shopping Preferences',
        purpose: 'Personalize shopping experience',
        components: ['category_grid', 'preference_toggles'],
        userInfoFields: [
          { id: 'categories', label: 'What do you like to shop for?', type: 'checkbox', required: true, options: ['Clothing', 'Electronics', 'Home & Garden', 'Sports', 'Books', 'Beauty'] },
          { id: 'budget', label: 'Typical budget range', type: 'select', required: false, options: ['Under $50', '$50-$200', '$200-$500', '$500+'] }
        ]
      },
      {
        id: 'account',
        name: 'Create Account',
        purpose: 'User registration for personalized experience',
        components: ['signup_form', 'social_login'],
        userInfoFields: [
          { id: 'email', label: 'Email Address', type: 'email', required: true },
          { id: 'name', label: 'Full Name', type: 'text', required: true },
          { id: 'phone', label: 'Phone Number', type: 'text', required: false }
        ]
      }
    ]
  },
  {
    id: 'productivity-app',
    name: 'Productivity & Task Management',
    description: 'Smart task management with AI-powered productivity insights',
    category: 'Productivity',
    targetAudience: ['professionals', 'students', 'project managers', 'entrepreneurs'],
    features: ['task management', 'project tracking', 'time blocking', 'productivity analytics'],
    keywords: ['tasks', 'productivity', 'management', 'planning', 'work', 'organization', 'todo'],
    screens: [
      {
        id: 'welcome',
        name: 'Productivity Welcome',
        purpose: 'Introduce productivity features',
        components: ['hero_graphic', 'feature_highlights', 'get_started_button']
      },
      {
        id: 'work_style',
        name: 'Work Style Setup',
        purpose: 'Understand user work preferences',
        components: ['style_selector', 'time_preferences'],
        userInfoFields: [
          { id: 'work_style', label: 'How do you prefer to work?', type: 'select', required: true, options: ['Deep focus blocks', 'Short bursts', 'Flexible schedule', 'Team collaboration'] },
          { id: 'peak_hours', label: 'When are you most productive?', type: 'select', required: true, options: ['Early morning', 'Mid-morning', 'Afternoon', 'Evening', 'Late night'] }
        ]
      },
      {
        id: 'integration',
        name: 'Tool Integration',
        purpose: 'Connect with existing tools',
        components: ['integration_grid', 'calendar_sync'],
        userInfoFields: [
          { id: 'tools', label: 'Which tools do you currently use?', type: 'checkbox', required: false, options: ['Google Calendar', 'Slack', 'Trello', 'Notion', 'Microsoft Office', 'Zoom'] }
        ]
      }
    ]
  },
  {
    id: 'social-network',
    name: 'Social Networking',
    description: 'Connect with friends and share moments with privacy-first approach',
    category: 'Social',
    targetAudience: ['social media users', 'community builders', 'content creators'],
    features: ['social sharing', 'community building', 'content creation', 'privacy controls'],
    keywords: ['social', 'friends', 'sharing', 'community', 'network', 'connect', 'chat'],
    screens: [
      {
        id: 'welcome',
        name: 'Social Welcome',
        purpose: 'Welcome to the community',
        components: ['community_showcase', 'join_button']
      },
      {
        id: 'interests',
        name: 'Your Interests',
        purpose: 'Discover communities and content',
        components: ['interest_tags', 'community_suggestions'],
        userInfoFields: [
          { id: 'interests', label: 'What are you interested in?', type: 'checkbox', required: true, options: ['Technology', 'Art & Design', 'Music', 'Sports', 'Travel', 'Food', 'Books', 'Movies'] },
          { id: 'content_type', label: 'What type of content do you enjoy?', type: 'checkbox', required: false, options: ['Photos', 'Videos', 'Articles', 'Discussions', 'Live streams'] }
        ]
      },
      {
        id: 'profile_setup',
        name: 'Create Profile',
        purpose: 'Build your social profile',
        components: ['profile_photo', 'bio_input', 'privacy_settings'],
        userInfoFields: [
          { id: 'username', label: 'Choose a username', type: 'text', required: true },
          { id: 'bio', label: 'Tell us about yourself', type: 'textarea', required: false, placeholder: 'Write a short bio...' },
          { id: 'location', label: 'Location (optional)', type: 'text', required: false }
        ]
      }
    ]
  },
  {
    id: 'learning-platform',
    name: 'Online Learning Platform',
    description: 'Personalized learning with adaptive courses and skill tracking',
    category: 'Education',
    targetAudience: ['students', 'professionals', 'lifelong learners', 'educators'],
    features: ['course library', 'progress tracking', 'skill assessments', 'certificates'],
    keywords: ['learning', 'education', 'courses', 'skills', 'training', 'knowledge', 'study'],
    screens: [
      {
        id: 'welcome',
        name: 'Learning Welcome',
        purpose: 'Inspire learning journey',
        components: ['learning_hero', 'course_preview', 'start_learning_button']
      },
      {
        id: 'learning_goals',
        name: 'Learning Goals',
        purpose: 'Set personalized learning objectives',
        components: ['goal_selector', 'skill_assessment'],
        userInfoFields: [
          { id: 'goals', label: 'What do you want to learn?', type: 'checkbox', required: true, options: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Languages'] },
          { id: 'level', label: 'Current skill level', type: 'select', required: true, options: ['Complete Beginner', 'Some Experience', 'Intermediate', 'Advanced'] },
          { id: 'time_commitment', label: 'How much time can you dedicate per week?', type: 'select', required: true, options: ['1-2 hours', '3-5 hours', '6-10 hours', '10+ hours'] }
        ]
      },
      {
        id: 'learning_style',
        name: 'Learning Preferences',
        purpose: 'Customize learning experience',
        components: ['style_quiz', 'format_preferences'],
        userInfoFields: [
          { id: 'learning_style', label: 'How do you learn best?', type: 'select', required: true, options: ['Visual (videos, diagrams)', 'Auditory (podcasts, lectures)', 'Reading/Writing', 'Hands-on practice'] },
          { id: 'pace', label: 'Preferred learning pace', type: 'select', required: true, options: ['Self-paced', 'Structured schedule', 'Intensive bootcamp'] }
        ]
      }
    ]
  },
  {
    id: 'finance-manager',
    name: 'Personal Finance Manager',
    description: 'Comprehensive financial tracking with investment insights and budgeting',
    category: 'Finance',
    targetAudience: ['budget conscious users', 'investors', 'financial planners'],
    features: ['expense tracking', 'investment monitoring', 'budget planning', 'financial goals'],
    keywords: ['finance', 'money', 'budget', 'investment', 'savings', 'expenses', 'financial'],
    screens: [
      {
        id: 'welcome',
        name: 'Financial Welcome',
        purpose: 'Introduce financial management benefits',
        components: ['financial_dashboard_preview', 'security_badges', 'get_started_button']
      },
      {
        id: 'financial_goals',
        name: 'Financial Goals',
        purpose: 'Set and track financial objectives',
        components: ['goal_cards', 'timeline_selector'],
        userInfoFields: [
          { id: 'goals', label: 'What are your financial goals?', type: 'checkbox', required: true, options: ['Build Emergency Fund', 'Save for Retirement', 'Buy a Home', 'Pay Off Debt', 'Invest for Growth'] },
          { id: 'timeline', label: 'What\'s your primary timeline?', type: 'select', required: true, options: ['Short-term (1 year)', 'Medium-term (2-5 years)', 'Long-term (5+ years)'] }
        ]
      },
      {
        id: 'financial_profile',
        name: 'Financial Profile',
        purpose: 'Understand financial situation',
        components: ['income_input', 'expense_categories', 'risk_assessment'],
        userInfoFields: [
          { id: 'income_range', label: 'Monthly Income Range', type: 'select', required: false, options: ['Under $3,000', '$3,000-$5,000', '$5,000-$8,000', '$8,000-$15,000', 'Over $15,000'] },
          { id: 'experience', label: 'Investment Experience', type: 'select', required: true, options: ['No experience', 'Beginner', 'Some experience', 'Experienced investor'] }
        ]
      }
    ]
  }
];

// GPT-powered template selection
export class TemplateSelector {
  private apiKey: string;

  constructor(apiKey?: string) {
    const envApiKey = import.meta.env.VITE_OPENAI_KEY || '';
    this.apiKey = apiKey || envApiKey;
  }

  async selectBestTemplate(prompt: string, category?: string): Promise<{
    template: AppTemplate;
    confidence: number;
    reasoning: string;
    additionalUserFields: UserInfoField[];
  }> {
    if (!this.apiKey) {
      // Fallback to rule-based selection
      return this.fallbackTemplateSelection(prompt, category);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert app template selector. Given an app description, select the best matching template from the available options and suggest additional user information fields that would be valuable for this specific app.

Available templates: ${JSON.stringify(APP_TEMPLATES.map(t => ({
                id: t.id,
                name: t.name,
                description: t.description,
                category: t.category,
                keywords: t.keywords
              })), null, 2)}

IMPORTANT: Return ONLY a valid JSON object, no markdown formatting or code blocks.

Respond with a JSON object containing:
- templateId: the ID of the best matching template
- confidence: confidence score 0-100
- reasoning: brief explanation of why this template fits
- additionalFields: array of additional user info fields specific to this app (max 5)

Additional fields should follow this format:
{
  "id": "field_id",
  "label": "Field Label",
  "type": "text|email|number|select|textarea|checkbox",
  "required": true|false,
  "options": ["option1", "option2"] (only for select/checkbox),
  "placeholder": "placeholder text",
  "description": "helpful description"
}`
            },
            {
              role: 'user',
              content: `App description: ${prompt}${category ? `\nSelected category: ${category}` : ''}`
            }
          ],
          temperature: 0.3,
          max_tokens: 800
        })
      });

      if (!response.ok) {
        throw new Error('GPT API call failed');
      }

      const data = await response.json();
      let content = data.choices[0].message.content;
      
      // Remove markdown code blocks if present
      if (content.includes('```json')) {
        content = content.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.includes('```')) {
        content = content.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Clean up any extra whitespace
      content = content.trim();
      
      console.log('Cleaned GPT content:', content);
      
      const result = JSON.parse(content);
      
      const selectedTemplate = APP_TEMPLATES.find(t => t.id === result.templateId);
      if (!selectedTemplate) {
        throw new Error('Template not found');
      }

      return {
        template: selectedTemplate,
        confidence: result.confidence,
        reasoning: result.reasoning,
        additionalUserFields: result.additionalFields || []
      };

    } catch (error) {
      console.warn('GPT template selection failed, using fallback:', error);
      return this.fallbackTemplateSelection(prompt, category);
    }
  }

  private fallbackTemplateSelection(prompt: string, category?: string): {
    template: AppTemplate;
    confidence: number;
    reasoning: string;
    additionalUserFields: UserInfoField[];
  } {
    const promptLower = prompt.toLowerCase();
    let bestMatch = APP_TEMPLATES[0];
    let bestScore = 0;

    // Score each template based on keyword matches
    for (const template of APP_TEMPLATES) {
      let score = 0;
      
      // Category match bonus
      if (category && template.category.toLowerCase().includes(category.toLowerCase())) {
        score += 30;
      }
      
      // Keyword matches
      for (const keyword of template.keywords) {
        if (promptLower.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }
      
      // Feature matches
      for (const feature of template.features) {
        if (promptLower.includes(feature.toLowerCase())) {
          score += 15;
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = template;
      }
    }

    return {
      template: bestMatch,
      confidence: Math.min(bestScore, 85),
      reasoning: `Selected based on keyword and feature matching. Found ${bestScore} relevance points.`,
      additionalUserFields: []
    };
  }

  // Get additional user info fields that GPT determines are needed for this specific app
  async generateAdditionalUserFields(prompt: string, templateId: string): Promise<UserInfoField[]> {
    if (!this.apiKey) return [];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Based on an app description, generate 3-7 additional user information fields that would be valuable for personalizing the onboarding experience. 

These fields should be:
1. Specific to the app's functionality
2. Useful for customization/personalization
3. Not already covered by basic demographics

IMPORTANT: Return ONLY a valid JSON array, no markdown formatting or code blocks.

Respond with a JSON array of field objects:
[
  {
    "id": "unique_field_id",
    "label": "User-friendly label",
    "type": "text|email|number|select|textarea|checkbox",
    "required": true|false,
    "options": ["option1", "option2"] (only for select/checkbox types),
    "placeholder": "helpful placeholder text",
    "description": "why this field is useful"
  }
]`
            },
            {
              role: 'user',
              content: `App description: ${prompt}\nTemplate: ${templateId}`
            }
          ],
          temperature: 0.4,
          max_tokens: 600
        })
      });

      if (!response.ok) {
        throw new Error('GPT API call failed');
      }

      const data = await response.json();
      let content = data.choices[0].message.content;
      
      // Remove markdown code blocks if present
      if (content.includes('```json')) {
        content = content.replace(/```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.includes('```')) {
        content = content.replace(/```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Clean up any extra whitespace
      content = content.trim();
      
      return JSON.parse(content);

    } catch (error) {
      console.warn('Failed to generate additional user fields:', error);
      return [];
    }
  }
}