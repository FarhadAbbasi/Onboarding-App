// Onboarding Screen Templates - 30-40 Different Screen Types
// Each template has placeholder variables for GPT-generated content

import type { UIScreen } from './ui-schema';

export type OnboardingScreenTemplate = {
  id: string;
  name: string;
  category: 'welcome' | 'feature' | 'social' | 'auth' | 'profile' | 'preferences' | 'completion' | 'tutorial' | 'benefits' | 'permissions';
  description: string;
  textVariables: string[]; // Variables that GPT will fill
  screenFactory: (textContent: Record<string, string>, colors: any, projectData: any) => UIScreen;
};

export const ONBOARDING_SCREEN_TEMPLATES: OnboardingScreenTemplate[] = [
  // WELCOME CATEGORY (5 templates)
  {
    id: 'welcome-splash',
    name: 'Welcome Splash',
    category: 'welcome',
    description: 'Simple welcome screen with app icon and title',
    textVariables: ['title', 'subtitle', 'subheading', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'welcome-splash',
      name: 'Welcome',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Spacer', props: { height: 'xl' } },
        { type: 'Spacer', props: { height: 'xl' } },
        { type: 'Title', props: { text: content.icon || '🚀', variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Title', props: { text: content.subtitle, variant: 'h2', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'sm' } },
        { type: 'Title', props: { text: content.subheading || '', variant: 'body', alignment: 'center', color: '#D1D5DB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'xl' } },
        { type: 'Spacer', props: { height: 'xl' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } },
        { type: 'Spacer', props: { height: 'lg' } }
      ]
    })
  },
  
  {
    id: 'welcome-hero',
    name: 'Hero Welcome',
    category: 'welcome',
    description: 'Welcome screen with full-length hero image and value proposition',
    textVariables: ['headline', 'description', 'cta'],
    screenFactory: (content, colors, projectData) => {
      // Generate hero image URL based on project category
      const getHeroImageUrl = (category: string, projectName: string) => {
        const categoryKeywords = {
          'fitness': 'fitness,exercise,health,workout',
          'business': 'business,office,professional,success',
          'education': 'education,learning,study,knowledge',
          'food': 'food,restaurant,cooking,cuisine',
          'travel': 'travel,adventure,vacation,explore',
          'health': 'health,medical,wellness,care',
          'finance': 'finance,money,investment,banking',
          'social': 'social,community,people,connection',
          'entertainment': 'entertainment,music,movie,fun',
          'technology': 'technology,innovation,digital,modern'
        };
        
        const keywords = categoryKeywords[category as keyof typeof categoryKeywords] || 'mobile,app,modern,clean';
        // Use Unsplash API for high-quality images
        return `https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80`;
      };

      return {
        id: 'welcome-hero',
        name: 'Welcome',
        bgType: 'color',
        bgValue: '#000000',
        components: [
          { 
            type: 'Image', 
            props: { 
              src: getHeroImageUrl(projectData?.category || 'technology', projectData?.name || 'App'),
              alt: 'Welcome Hero Image', 
              size: 'xl',
              alignment: 'center',
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingLeft: 0
            } 
          },
          { 
            type: 'Spacer', 
            props: { 
              height: 'md',
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingLeft: 0
            } 
          },
          { 
            type: 'Title', 
            props: { 
              text: content.headline, 
              variant: 'h1', 
              alignment: 'center', 
              color: '#FFFFFF', 
              fontWeight: 'bold',
              paddingTop: 16,
              paddingRight: 24,
              paddingBottom: 8,
              paddingLeft: 24
            } 
          },
          { 
            type: 'Title', 
            props: { 
              text: content.description, 
              variant: 'body', 
              alignment: 'center', 
              color: '#E5E7EB', 
              fontWeight: 'normal',
              paddingTop: 0,
              paddingRight: 32,
              paddingBottom: 24,
              paddingLeft: 32
            } 
          },
          { 
            type: 'Spacer', 
            props: { 
              height: 'lg',
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 0,
              paddingLeft: 0
            } 
          },
          { 
            type: 'Button', 
            props: { 
              text: content.cta, 
              variant: 'primary', 
              size: 'lg',
              paddingTop: 0,
              paddingRight: 24,
              paddingBottom: 32,
              paddingLeft: 24
            } 
          }
        ]
      }
    }
  },

  {
    id: 'welcome-stats',
    name: 'Welcome with Stats',
    category: 'welcome',
    description: 'Welcome screen showcasing user statistics or achievements',
    textVariables: ['welcome_message', 'stat1_label', 'stat1_value', 'stat2_label', 'stat2_value', 'stat3_label', 'stat3_value', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'welcome-stats',
      name: 'Welcome',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.welcome_message, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: content.stat1_label, subtitle: content.stat1_value, color: colors.accent } },
        { type: 'Card', props: { title: content.stat2_label, subtitle: content.stat2_value, color: colors.accent } },
        { type: 'Card', props: { title: content.stat3_label, subtitle: content.stat3_value, color: colors.accent } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'welcome-video',
    name: 'Video Welcome',
    category: 'welcome',
    description: 'Welcome screen with video introduction',
    textVariables: ['title', 'video_description', 'skip_text', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'welcome-video',
      name: 'Welcome',
      bgType: 'color',
      bgValue: '#000000',
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Image', props: { src: 'video-placeholder', alt: 'Video', width: '100%', height: '250px' } },
        { type: 'Title', props: { text: content.video_description, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'next' } },
        { type: 'Button', props: { text: content.skip_text, variant: 'secondary', size: 'md', action: 'next' } }
      ]
    })
  },

  {
    id: 'welcome-testimonial',
    name: 'Welcome with Testimonial',
    category: 'welcome',
    description: 'Welcome screen featuring user testimonial',
    textVariables: ['welcome_text', 'testimonial_text', 'testimonial_author', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'welcome-testimonial',
      name: 'Welcome',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.welcome_text, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: `"${content.testimonial_text}"`, subtitle: `- ${content.testimonial_author}`, color: colors.accent } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'welcome-interactive',
    name: 'Interactive Welcome',
    category: 'welcome',
    description: 'Modern welcome screen with interactive bottom sheet',
    textVariables: ['title', 'subtitle', 'cta', 'sheet_title', 'sheet_content', 'sheet_action'],
    screenFactory: (content, colors, projectData) => ({
      id: 'welcome-interactive',
      name: 'Welcome',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { 
          type: 'Spacer', 
          props: { 
            height: 'xl',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: '🚀', 
            variant: 'h1', 
            alignment: 'center', 
            color: '#FFFFFF', 
            fontWeight: 'bold',
            paddingTop: 16,
            paddingRight: 24,
            paddingBottom: 8,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.title, 
            variant: 'h1', 
            alignment: 'center', 
            color: '#FFFFFF', 
            fontWeight: 'bold',
            paddingTop: 8,
            paddingRight: 24,
            paddingBottom: 8,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.subtitle, 
            variant: 'body', 
            alignment: 'center', 
            color: '#E5E7EB', 
            fontWeight: 'normal',
            paddingTop: 0,
            paddingRight: 32,
            paddingBottom: 24,
            paddingLeft: 32
          } 
        },
        { 
          type: 'Spacer', 
          props: { 
            height: 'xl',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
          } 
        },
        { 
          type: 'Button', 
          props: { 
            text: content.cta, 
            variant: 'primary', 
            size: 'lg',
            paddingTop: 0,
            paddingRight: 24,
            paddingBottom: 16,
            paddingLeft: 24
          } 
        },
        { 
          type: 'BottomSheet', 
          props: { 
            title: content.sheet_title || "Welcome to the Future!",
            content: content.sheet_content || "Discover amazing features that will transform how you work and play. Tap to explore more details about what makes our app special.",
            trigger_text: "Learn More",
            action_text: content.sheet_action || "Let's Go!",
            variant: "info",
            paddingTop: 8,
            paddingRight: 24,
            paddingBottom: 32,
            paddingLeft: 24
          } 
        }
      ]
    })
  },

  {
    id: 'welcome-minimal',
    name: 'Minimal Welcome',
    category: 'welcome',
    description: 'Clean minimal design with focus on typography',
    textVariables: ['title', 'subtitle', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'welcome-minimal',
      name: 'Welcome',
      bgType: 'color',
      bgValue: '#FFFFFF',
      components: [
        { 
          type: 'Spacer', 
          props: { 
            height: 'xl',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
          } 
        },
        { 
          type: 'Spacer', 
          props: { 
            height: 'xl',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.title, 
            variant: 'h1', 
            alignment: 'center', 
            color: colors.primary, 
            fontWeight: 'bold',
            paddingTop: 24,
            paddingRight: 32,
            paddingBottom: 16,
            paddingLeft: 32
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.subtitle, 
            variant: 'body', 
            alignment: 'center', 
            color: '#6B7280', 
            fontWeight: 'normal',
            paddingTop: 0,
            paddingRight: 40,
            paddingBottom: 48,
            paddingLeft: 40
          } 
        },
        { 
          type: 'Spacer', 
          props: { 
            height: 'xl',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
          } 
        },
        { 
          type: 'Button', 
          props: { 
            text: content.cta, 
            variant: 'primary', 
            size: 'lg',
            paddingTop: 0,
            paddingRight: 32,
            paddingBottom: 32,
            paddingLeft: 32
          } 
        }
      ]
    })
  },

  {
    id: 'welcome-card-based',
    name: 'Card-Based Welcome',
    category: 'welcome',
    description: 'Modern card-based layout with visual hierarchy',
    textVariables: ['title', 'subtitle', 'benefit1', 'benefit2', 'benefit3', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'welcome-card-based',
      name: 'Welcome',
      bgType: 'color',
      bgValue: '#F1F5F9',
      components: [
        { 
          type: 'Spacer', 
          props: { 
            height: 'lg',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.title, 
            variant: 'h1', 
            alignment: 'center', 
            color: colors.primary, 
            fontWeight: 'bold',
            paddingTop: 16,
            paddingRight: 24,
            paddingBottom: 8,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.subtitle, 
            variant: 'body', 
            alignment: 'center', 
            color: '#64748B', 
            fontWeight: 'normal',
            paddingTop: 0,
            paddingRight: 32,
            paddingBottom: 24,
            paddingLeft: 32
          } 
        },
        { 
          type: 'Card', 
          props: { 
            title: '🎯 ' + (content.benefit1 || 'Smart Features'),
            content: 'Experience intelligent automation',
            highlighted: false,
            paddingTop: 8,
            paddingRight: 20,
            paddingBottom: 8,
            paddingLeft: 20
          } 
        },
        { 
          type: 'Card', 
          props: { 
            title: '⚡ ' + (content.benefit2 || 'Lightning Fast'),
            content: 'Optimized for speed and performance',
            highlighted: false,
            paddingTop: 8,
            paddingRight: 20,
            paddingBottom: 8,
            paddingLeft: 20
          } 
        },
        { 
          type: 'Card', 
          props: { 
            title: '🔒 ' + (content.benefit3 || 'Secure & Private'),
            content: 'Your data is always protected',
            highlighted: false,
            paddingTop: 8,
            paddingRight: 20,
            paddingBottom: 16,
            paddingLeft: 20
          } 
        },
        { 
          type: 'Button', 
          props: { 
            text: content.cta, 
            variant: 'primary', 
            size: 'lg',
            paddingTop: 0,
            paddingRight: 24,
            paddingBottom: 24,
            paddingLeft: 24
          } 
        }
      ]
    })
  },

  // FEATURE CATEGORY (10 templates)
  {
    id: 'feature-showcase',
    name: 'Feature Showcase All-in-One',
    category: 'feature',
    description: 'All key features showcased elegantly in one screen with icons',
    textVariables: ['title', 'subtitle', 'feature1_title', 'feature1_desc', 'feature1_icon', 'feature2_title', 'feature2_desc', 'feature2_icon', 'feature3_title', 'feature3_desc', 'feature3_icon', 'feature4_title', 'feature4_desc', 'feature4_icon', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-showcase',
      name: 'Key Features',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { 
          type: 'Spacer', 
          props: { 
            height: 'lg',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.title, 
            variant: 'h1', 
            alignment: 'center', 
            color: '#FFFFFF', 
            fontWeight: 'bold',
            paddingTop: 8,
            paddingRight: 24,
            paddingBottom: 4,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.subtitle, 
            variant: 'body', 
            alignment: 'center', 
            color: '#E5E7EB', 
            fontWeight: 'normal',
            paddingTop: 0,
            paddingRight: 32,
            paddingBottom: 16,
            paddingLeft: 32
          } 
        },
        { 
          type: 'Card', 
          props: { 
            title: `${content.feature1_icon} ${content.feature1_title}`, 
            content: content.feature1_desc, 
            highlighted: false,
            paddingTop: 8,
            paddingRight: 20,
            paddingBottom: 8,
            paddingLeft: 20
          } 
        },
        { 
          type: 'Card', 
          props: { 
            title: `${content.feature2_icon} ${content.feature2_title}`, 
            content: content.feature2_desc, 
            highlighted: false,
            paddingTop: 8,
            paddingRight: 20,
            paddingBottom: 8,
            paddingLeft: 20
          } 
        },
        { 
          type: 'Card', 
          props: { 
            title: `${content.feature3_icon} ${content.feature3_title}`, 
            content: content.feature3_desc, 
            highlighted: false,
            paddingTop: 8,
            paddingRight: 20,
            paddingBottom: 8,
            paddingLeft: 20
          } 
        },
        { 
          type: 'Card', 
          props: { 
            title: `${content.feature4_icon} ${content.feature4_title}`, 
            content: content.feature4_desc, 
            highlighted: false,
            paddingTop: 8,
            paddingRight: 20,
            paddingBottom: 16,
            paddingLeft: 20
          } 
        },
        { 
          type: 'Spacer', 
          props: { 
            height: 'md',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
          } 
        },
        { 
          type: 'Button', 
          props: { 
            text: content.cta, 
            variant: 'primary', 
            size: 'lg',
            paddingTop: 0,
            paddingRight: 24,
            paddingBottom: 24,
            paddingLeft: 24
          } 
        }
      ]
    })
  },

  {
    id: 'feature-interactive-demo',
    name: 'Interactive Feature Demo',
    category: 'feature',
    description: 'Interactive feature demonstration with bottom sheet',
    textVariables: ['title', 'subtitle', 'feature_name', 'feature_desc', 'demo_title', 'demo_content', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-interactive-demo',
      name: 'Interactive Demo',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { 
          type: 'Spacer', 
          props: { 
            height: 'lg',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.title, 
            variant: 'h1', 
            alignment: 'center', 
            color: '#FFFFFF', 
            fontWeight: 'bold',
            paddingTop: 16,
            paddingRight: 24,
            paddingBottom: 8,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.subtitle, 
            variant: 'body', 
            alignment: 'center', 
            color: '#E5E7EB', 
            fontWeight: 'normal',
            paddingTop: 0,
            paddingRight: 32,
            paddingBottom: 24,
            paddingLeft: 32
          } 
        },
        { 
          type: 'Card', 
          props: { 
            title: content.feature_name || 'Amazing Feature',
            content: content.feature_desc || 'This feature will revolutionize your workflow',
            highlighted: true,
            paddingTop: 8,
            paddingRight: 20,
            paddingBottom: 16,
            paddingLeft: 20
          } 
        },
        { 
          type: 'BottomSheet', 
          props: { 
            title: content.demo_title || 'Try It Now!',
            content: content.demo_content || 'Experience the power of this feature with our interactive demo. See how it can transform your daily workflow.',
            trigger_text: 'Interactive Demo',
            action_text: 'Let\'s Continue',
            variant: 'success',
            paddingTop: 8,
            paddingRight: 24,
            paddingBottom: 16,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Button', 
          props: { 
            text: content.cta, 
            variant: 'primary', 
            size: 'lg',
            paddingTop: 0,
            paddingRight: 24,
            paddingBottom: 24,
            paddingLeft: 24
          } 
        }
      ]
    })
  },

  {
    id: 'feature-visual-showcase',
    name: 'Visual Feature Showcase',
    category: 'feature',
    description: 'Image-heavy showcase with visual elements',
    textVariables: ['title', 'subtitle', 'feature_title', 'feature_description', 'cta'],
    screenFactory: (content, colors, projectData) => {
      const getFeatureImageUrl = (category: string) => {
        const images = {
          'fitness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'business': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'education': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        };
        return images[category as keyof typeof images] || images.technology;
      };

      return {
        id: 'feature-visual-showcase',
        name: 'Visual Features',
        bgType: 'color',
        bgValue: '#FFFFFF',
        components: [
          { 
            type: 'Image', 
            props: { 
              src: getFeatureImageUrl(projectData?.category || 'technology'),
              alt: 'Feature Showcase', 
              size: 'lg',
              alignment: 'center',
              paddingTop: 0,
              paddingRight: 0,
              paddingBottom: 16,
              paddingLeft: 0
            } 
          },
          { 
            type: 'Title', 
            props: { 
              text: content.title, 
              variant: 'h1', 
              alignment: 'center', 
              color: colors.primary, 
              fontWeight: 'bold',
              paddingTop: 8,
              paddingRight: 24,
              paddingBottom: 8,
              paddingLeft: 24
            } 
          },
          { 
            type: 'Title', 
            props: { 
              text: content.subtitle, 
              variant: 'body', 
              alignment: 'center', 
              color: '#6B7280', 
              fontWeight: 'normal',
              paddingTop: 0,
              paddingRight: 32,
              paddingBottom: 16,
              paddingLeft: 32
            } 
          },
          { 
            type: 'Card', 
            props: { 
              title: '✨ ' + (content.feature_title || 'Game-Changing Feature'),
              content: content.feature_description || 'Revolutionary technology that adapts to your needs',
              highlighted: true,
              paddingTop: 8,
              paddingRight: 20,
              paddingBottom: 24,
              paddingLeft: 20
            } 
          },
          { 
            type: 'Button', 
            props: { 
              text: content.cta, 
              variant: 'primary', 
              size: 'lg',
              paddingTop: 0,
              paddingRight: 24,
              paddingBottom: 24,
              paddingLeft: 24
            } 
          }
        ]
      }
    }
  },

  {
    id: 'feature-comparison',
    name: 'Before vs After',
    category: 'feature',
    description: 'Shows before and after comparison of using the feature',
    textVariables: ['title', 'before_text', 'after_text', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-comparison',
      name: 'Feature',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: 'Before', subtitle: content.before_text, color: '#EF4444' } },
        { type: 'Card', props: { title: 'After', subtitle: content.after_text, color: '#10B981' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'feature-steps',
    name: 'How It Works',
    category: 'feature',
    description: 'Step-by-step breakdown of how a feature works',
    textVariables: ['title', 'step1_title', 'step1_desc', 'step2_title', 'step2_desc', 'step3_title', 'step3_desc', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-steps',
      name: 'Feature',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: `1. ${content.step1_title}`, subtitle: content.step1_desc, color: colors.accent } },
        { type: 'Card', props: { title: `2. ${content.step2_title}`, subtitle: content.step2_desc, color: colors.accent } },
        { type: 'Card', props: { title: `3. ${content.step3_title}`, subtitle: content.step3_desc, color: colors.accent } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'feature-benefits',
    name: 'Feature Benefits',
    category: 'feature',
    description: 'List of key benefits from using the feature',
    textVariables: ['title', 'benefit1', 'benefit2', 'benefit3', 'benefit4', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-benefits',
      name: 'Feature',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Title', props: { text: `✓ ${content.benefit1}`, variant: 'body', alignment: 'left', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Title', props: { text: `✓ ${content.benefit2}`, variant: 'body', alignment: 'left', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Title', props: { text: `✓ ${content.benefit3}`, variant: 'body', alignment: 'left', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Title', props: { text: `✓ ${content.benefit4}`, variant: 'body', alignment: 'left', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'feature-demo',
    name: 'Interactive Demo',
    category: 'feature',
    description: 'Interactive demonstration of the feature',
    textVariables: ['title', 'demo_instruction', 'try_text', 'next_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-demo',
      name: 'Feature',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.demo_instruction, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Button', props: { text: content.try_text, variant: 'secondary', action: 'custom' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.next_text, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'feature-timeline',
    name: 'Feature Timeline',
    category: 'feature',
    description: 'Shows timeline of feature usage or progress',
    textVariables: ['title', 'timeline_desc', 'time1', 'event1', 'time2', 'event2', 'time3', 'event3', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-timeline',
      name: 'Feature',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.timeline_desc, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: content.time1, subtitle: content.event1, color: colors.accent } },
        { type: 'Card', props: { title: content.time2, subtitle: content.event2, color: colors.accent } },
        { type: 'Card', props: { title: content.time3, subtitle: content.event3, color: colors.accent } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'feature-social-proof',
    name: 'Social Proof',
    category: 'feature',
    description: 'Shows user testimonials and social proof for feature',
    textVariables: ['title', 'social_stat', 'testimonial1', 'author1', 'testimonial2', 'author2', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-social-proof',
      name: 'Feature',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.social_stat, variant: 'h2', alignment: 'center', color: '#E5E7EB', fontWeight: 'medium' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: `"${content.testimonial1}"`, subtitle: `- ${content.author1}`, color: colors.accent } },
        { type: 'Card', props: { title: `"${content.testimonial2}"`, subtitle: `- ${content.author2}`, color: colors.accent } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'feature-problem-solution',
    name: 'Problem & Solution',
    category: 'feature',
    description: 'Identifies a problem and presents the feature as solution',
    textVariables: ['problem_title', 'problem_desc', 'solution_title', 'solution_desc', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-problem-solution',
      name: 'Feature',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.problem_title, variant: 'h1', alignment: 'center', color: '#EF4444', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.problem_desc, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Title', props: { text: content.solution_title, variant: 'h1', alignment: 'center', color: '#10B981', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.solution_desc, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'feature-analytics',
    name: 'Analytics Preview',
    category: 'feature',
    description: 'Shows analytics and insights feature preview',
    textVariables: ['title', 'description', 'metric1_label', 'metric1_value', 'metric2_label', 'metric2_value', 'insight', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-analytics',
      name: 'Feature',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.description, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: content.metric1_label, subtitle: content.metric1_value, color: colors.accent } },
        { type: 'Card', props: { title: content.metric2_label, subtitle: content.metric2_value, color: colors.accent } },
        { type: 'Title', props: { text: `💡 ${content.insight}`, variant: 'body', alignment: 'center', color: '#FCD34D', fontWeight: 'medium' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'feature-integration',
    name: 'Integration Showcase',
    category: 'feature',
    description: 'Shows how feature integrates with other tools',
    textVariables: ['title', 'integration_desc', 'tool1', 'tool2', 'tool3', 'benefit', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'feature-integration',
      name: 'Feature',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.integration_desc, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: content.tool1, subtitle: 'Connected', color: '#10B981' } },
        { type: 'Card', props: { title: content.tool2, subtitle: 'Connected', color: '#10B981' } },
        { type: 'Card', props: { title: content.tool3, subtitle: 'Connected', color: '#10B981' } },
        { type: 'Title', props: { text: content.benefit, variant: 'body', alignment: 'center', color: colors.accent, fontWeight: 'medium' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  // SOCIAL CATEGORY (3 templates)
  {
    id: 'social-connect',
    name: 'Connect with Friends',
    category: 'social',
    description: 'Encourages users to connect with friends',
    textVariables: ['title', 'description', 'connect_text', 'skip_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'social-connect',
      name: 'Social',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.description, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.connect_text, variant: 'primary', action: 'custom' } },
        { type: 'Button', props: { text: content.skip_text, variant: 'secondary', action: 'next' } }
      ]
    })
  },

  {
    id: 'social-community',
    name: 'Join Community',
    category: 'social',
    description: 'Invites users to join app community',
    textVariables: ['title', 'community_desc', 'member_count', 'join_text', 'later_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'social-community',
      name: 'Social',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.community_desc, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Title', props: { text: content.member_count, variant: 'h2', alignment: 'center', color: colors.accent, fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.join_text, variant: 'primary', size: 'lg', action: 'community' } },
        { type: 'Button', props: { text: content.later_text, variant: 'secondary', size: 'md', action: 'next' } }
      ]
    })
  },

  {
    id: 'social-sharing',
    name: 'Share & Invite',
    category: 'social',
    description: 'Encourages users to share and invite others',
    textVariables: ['title', 'sharing_benefit', 'reward_text', 'share_text', 'skip_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'social-sharing',
      name: 'Social',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.sharing_benefit, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Title', props: { text: content.reward_text, variant: 'h2', alignment: 'center', color: '#FCD34D', fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.share_text, variant: 'primary', size: 'lg', action: 'share' } },
        { type: 'Button', props: { text: content.skip_text, variant: 'secondary', size: 'md', action: 'next' } }
      ]
    })
  },

  // AUTH CATEGORY (4 templates)
  {
    id: 'auth-signup',
    name: 'Create Account',
    category: 'auth',
    description: 'Elegant account creation form with consistent theming',
    textVariables: ['title', 'subtitle', 'email_label', 'email_placeholder', 'password_label', 'password_placeholder', 'signup_text', 'login_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'auth-signup',
      name: 'Sign Up',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { 
          type: 'Spacer', 
          props: { 
            height: 'xl',
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: '✨', 
            variant: 'h1', 
            alignment: 'center', 
            color: '#FFFFFF', 
            fontWeight: 'bold',
            paddingTop: 16,
            paddingRight: 24,
            paddingBottom: 8,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.title, 
            variant: 'h1', 
            alignment: 'center', 
            color: '#FFFFFF', 
            fontWeight: 'bold',
            paddingTop: 8,
            paddingRight: 24,
            paddingBottom: 8,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Title', 
          props: { 
            text: content.subtitle, 
            variant: 'body', 
            alignment: 'center', 
            color: '#E5E7EB', 
            fontWeight: 'normal',
            paddingTop: 0,
            paddingRight: 32,
            paddingBottom: 24,
            paddingLeft: 32
          } 
        },
        { 
          type: 'Input', 
          props: { 
            label: content.email_label, 
            placeholder: content.email_placeholder, 
            type: 'email', 
            required: true,
            paddingTop: 8,
            paddingRight: 24,
            paddingBottom: 8,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Input', 
          props: { 
            label: content.password_label, 
            placeholder: content.password_placeholder, 
            type: 'password', 
            required: true,
            paddingTop: 8,
            paddingRight: 24,
            paddingBottom: 16,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Button', 
          props: { 
            text: content.signup_text, 
            variant: 'primary', 
            size: 'lg',
            paddingTop: 8,
            paddingRight: 24,
            paddingBottom: 8,
            paddingLeft: 24
          } 
        },
        { 
          type: 'Button', 
          props: { 
            text: content.login_text, 
            variant: 'secondary', 
            size: 'md',
            paddingTop: 8,
            paddingRight: 24,
            paddingBottom: 32,
            paddingLeft: 24
          } 
        }
      ]
    })
  },

  {
    id: 'auth-login',
    name: 'Sign In',
    category: 'auth',
    description: 'Standard login form',
    textVariables: ['title', 'subtitle', 'email_label', 'email_placeholder', 'password_label', 'password_placeholder', 'login_text', 'forgot_text', 'signup_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'auth-login',
      name: 'Sign In',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.subtitle, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Input', props: { label: content.email_label, placeholder: content.email_placeholder, type: 'email', required: true } },
        { type: 'Input', props: { label: content.password_label, placeholder: content.password_placeholder, type: 'password', required: true } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.login_text, variant: 'primary', size: 'lg', action: 'login' } },
        { type: 'Button', props: { text: content.forgot_text, variant: 'secondary', size: 'sm', action: 'forgot' } },
        { type: 'Button', props: { text: content.signup_text, variant: 'secondary', size: 'md', action: 'signup' } }
      ]
    })
  },

  {
    id: 'auth-social',
    name: 'Social Login',
    category: 'auth',
    description: 'Login with social media accounts',
    textVariables: ['title', 'subtitle', 'google_text', 'facebook_text', 'apple_text', 'email_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'auth-social',
      name: 'Sign In',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.subtitle, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.google_text, variant: 'primary', size: 'lg', action: 'google' } },
        { type: 'Button', props: { text: content.facebook_text, variant: 'primary', size: 'lg', action: 'facebook' } },
        { type: 'Button', props: { text: content.apple_text, variant: 'primary', size: 'lg', action: 'apple' } },
        { type: 'Button', props: { text: content.email_text, variant: 'secondary', size: 'md', action: 'email' } }
      ]
    })
  },

  {
    id: 'auth-verification',
    name: 'Email Verification',
    category: 'auth',
    description: 'Email verification screen',
    textVariables: ['title', 'instruction', 'resend_text', 'change_email_text', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'auth-verification',
      name: 'Verification',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: '📧', variant: 'h1', alignment: 'center', color: colors.accent, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'verify' } },
        { type: 'Button', props: { text: content.resend_text, variant: 'secondary', size: 'md', action: 'resend' } },
        { type: 'Button', props: { text: content.change_email_text, variant: 'secondary', size: 'sm', action: 'change' } }
      ]
    })
  },

  // PROFILE CATEGORY (4 templates)
  {
    id: 'profile-basic',
    name: 'Basic Profile Setup',
    category: 'profile',
    description: 'Basic profile information collection',
    textVariables: ['title', 'subtitle', 'name_label', 'name_placeholder', 'bio_label', 'bio_placeholder', 'continue_text', 'skip_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'profile-basic',
      name: 'Profile',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.subtitle, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Input', props: { label: content.name_label, placeholder: content.name_placeholder, type: 'text', required: true } },
        { type: 'Input', props: { label: content.bio_label, placeholder: content.bio_placeholder, type: 'text', required: false } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'next' } },
        { type: 'Button', props: { text: content.skip_text, variant: 'secondary', size: 'md', action: 'next' } }
      ]
    })
  },

  {
    id: 'profile-avatar',
    name: 'Profile Photo',
    category: 'profile',
    description: 'Profile photo upload',
    textVariables: ['title', 'instruction', 'upload_text', 'camera_text', 'skip_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'profile-avatar',
      name: 'Profile',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Image', props: { src: 'avatar-placeholder', alt: 'Avatar', width: '150px', height: '150px' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.upload_text, variant: 'primary', size: 'lg', action: 'upload' } },
        { type: 'Button', props: { text: content.camera_text, variant: 'secondary', size: 'md', action: 'camera' } },
        { type: 'Button', props: { text: content.skip_text, variant: 'secondary', size: 'sm', action: 'next' } }
      ]
    })
  },

  {
    id: 'profile-interests',
    name: 'Select Interests',
    category: 'profile',
    description: 'User interest selection',
    textVariables: ['title', 'instruction', 'interest1', 'interest2', 'interest3', 'interest4', 'interest5', 'interest6', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'profile-interests',
      name: 'Profile',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'OptionGroup', props: { 
          options: [
            { id: '1', label: content.interest1, selected: false },
            { id: '2', label: content.interest2, selected: false },
            { id: '3', label: content.interest3, selected: false },
            { id: '4', label: content.interest4, selected: false },
            { id: '5', label: content.interest5, selected: false },
            { id: '6', label: content.interest6, selected: false }
          ], 
          allowMultiple: true 
        }},
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'profile-experience',
    name: 'Experience Level',
    category: 'profile',
    description: 'User experience level selection',
    textVariables: ['title', 'instruction', 'beginner_text', 'intermediate_text', 'advanced_text', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'profile-experience',
      name: 'Profile',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'OptionGroup', props: { 
          options: [
            { id: 'beginner', label: content.beginner_text, selected: false },
            { id: 'intermediate', label: content.intermediate_text, selected: false },
            { id: 'advanced', label: content.advanced_text, selected: false }
          ], 
          allowMultiple: false 
        }},
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  // PREFERENCES CATEGORY (4 templates)
  {
    id: 'preferences-notifications',
    name: 'Notification Settings',
    category: 'preferences',
    description: 'Configure notification preferences',
    textVariables: ['title', 'instruction', 'push_label', 'email_label', 'sms_label', 'marketing_label', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'preferences-notifications',
      name: 'Preferences',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Toggle', props: { label: content.push_label, checked: true } },
        { type: 'Toggle', props: { label: content.email_label, checked: true } },
        { type: 'Toggle', props: { label: content.sms_label, checked: false } },
        { type: 'Toggle', props: { label: content.marketing_label, checked: false } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'preferences-theme',
    name: 'Theme Selection',
    category: 'preferences',
    description: 'Choose app theme/appearance',
    textVariables: ['title', 'instruction', 'light_text', 'dark_text', 'auto_text', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'preferences-theme',
      name: 'Preferences',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'OptionGroup', props: { 
          options: [
            { id: 'light', label: content.light_text, selected: true },
            { id: 'dark', label: content.dark_text, selected: false },
            { id: 'auto', label: content.auto_text, selected: false }
          ], 
          allowMultiple: false 
        }},
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'preferences-frequency',
    name: 'Usage Frequency',
    category: 'preferences',
    description: 'Set usage frequency preferences',
    textVariables: ['title', 'instruction', 'daily_text', 'weekly_text', 'monthly_text', 'custom_text', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'preferences-frequency',
      name: 'Preferences',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'OptionGroup', props: { 
          options: [
            { id: 'daily', label: content.daily_text, selected: false },
            { id: 'weekly', label: content.weekly_text, selected: true },
            { id: 'monthly', label: content.monthly_text, selected: false },
            { id: 'custom', label: content.custom_text, selected: false }
          ], 
          allowMultiple: false 
        }},
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'preferences-privacy',
    name: 'Privacy Settings',
    category: 'preferences',
    description: 'Configure privacy preferences',
    textVariables: ['title', 'instruction', 'public_profile_label', 'data_sharing_label', 'analytics_label', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'preferences-privacy',
      name: 'Preferences',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Toggle', props: { label: content.public_profile_label, checked: false } },
        { type: 'Toggle', props: { label: content.data_sharing_label, checked: false } },
        { type: 'Toggle', props: { label: content.analytics_label, checked: true } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  // COMPLETION CATEGORY (2 templates)
  {
    id: 'completion-success',
    name: 'Welcome Complete',
    category: 'completion',
    description: 'Standard completion screen',
    textVariables: ['title', 'message', 'next_step', 'get_started_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'completion-success',
      name: 'Complete',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: '🎉', variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.message, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Title', props: { text: content.next_step, variant: 'body', alignment: 'center', color: '#FCD34D', fontWeight: 'medium' } },
        { type: 'Spacer', props: { height: 'xl' } },
        { type: 'Button', props: { text: content.get_started_text, variant: 'primary', size: 'lg', action: 'complete' } }
      ]
    })
  },

  {
    id: 'completion-tour',
    name: 'Take a Tour',
    category: 'completion',
    description: 'Completion with optional tour',
    textVariables: ['title', 'message', 'tour_description', 'take_tour_text', 'skip_tour_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'completion-tour',
      name: 'Complete',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: '✨', variant: 'h1', alignment: 'center', color: colors.accent, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.message, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Title', props: { text: content.tour_description, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.take_tour_text, variant: 'primary', size: 'lg', action: 'tour' } },
        { type: 'Button', props: { text: content.skip_tour_text, variant: 'secondary', size: 'md', action: 'complete' } }
      ]
    })
  },

  // TUTORIAL CATEGORY (3 templates)
  {
    id: 'tutorial-swipe',
    name: 'Swipe Tutorial',
    category: 'tutorial',
    description: 'Teaches swipe gestures',
    textVariables: ['title', 'instruction', 'swipe_left_text', 'swipe_right_text', 'try_it_text', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'tutorial-swipe',
      name: 'Tutorial',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: '👈', subtitle: content.swipe_left_text, color: colors.accent } },
        { type: 'Card', props: { title: '👉', subtitle: content.swipe_right_text, color: colors.accent } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.try_it_text, variant: 'secondary', action: 'custom' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', action: 'next' } }
      ]
    })
  },

  {
    id: 'tutorial-navigation',
    name: 'Navigation Tutorial',
    category: 'tutorial',
    description: 'Explains app navigation',
    textVariables: ['title', 'instruction', 'tab1_desc', 'tab2_desc', 'tab3_desc', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'tutorial-navigation',
      name: 'Tutorial',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: '🏠', subtitle: content.tab1_desc, color: colors.accent } },
        { type: 'Card', props: { title: '🔍', subtitle: content.tab2_desc, color: colors.accent } },
        { type: 'Card', props: { title: '👤', subtitle: content.tab3_desc, color: colors.accent } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'tutorial-shortcuts',
    name: 'Shortcuts Tutorial',
    category: 'tutorial',
    description: 'Shows keyboard shortcuts or gestures',
    textVariables: ['title', 'instruction', 'shortcut1_key', 'shortcut1_desc', 'shortcut2_key', 'shortcut2_desc', 'shortcut3_key', 'shortcut3_desc', 'continue_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'tutorial-shortcuts',
      name: 'Tutorial',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.instruction, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: content.shortcut1_key, subtitle: content.shortcut1_desc, color: colors.accent } },
        { type: 'Card', props: { title: content.shortcut2_key, subtitle: content.shortcut2_desc, color: colors.accent } },
        { type: 'Card', props: { title: content.shortcut3_key, subtitle: content.shortcut3_desc, color: colors.accent } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.continue_text, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  // BENEFITS CATEGORY (3 templates)
  {
    id: 'benefits-time-saving',
    name: 'Time Saving Benefits',
    category: 'benefits',
    description: 'Highlights time-saving features',
    textVariables: ['title', 'description', 'time_saved', 'feature1', 'feature2', 'feature3', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'benefits-time-saving',
      name: 'Benefits',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: '⏰', variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.description, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Title', props: { text: content.time_saved, variant: 'h2', alignment: 'center', color: '#FCD34D', fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Title', props: { text: `✓ ${content.feature1}`, variant: 'body', alignment: 'left', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Title', props: { text: `✓ ${content.feature2}`, variant: 'body', alignment: 'left', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Title', props: { text: `✓ ${content.feature3}`, variant: 'body', alignment: 'left', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'benefits-productivity',
    name: 'Productivity Benefits',
    category: 'benefits',
    description: 'Shows productivity improvements',
    textVariables: ['title', 'description', 'productivity_stat', 'benefit1', 'benefit2', 'benefit3', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'benefits-productivity',
      name: 'Benefits',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Title', props: { text: '📈', variant: 'h1', alignment: 'center', color: colors.accent, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.description, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Title', props: { text: content.productivity_stat, variant: 'h2', alignment: 'center', color: colors.accent, fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: content.benefit1, subtitle: 'Improved', color: '#10B981' } },
        { type: 'Card', props: { title: content.benefit2, subtitle: 'Enhanced', color: '#10B981' } },
        { type: 'Card', props: { title: content.benefit3, subtitle: 'Optimized', color: '#10B981' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  {
    id: 'benefits-cost-savings',
    name: 'Cost Savings',
    category: 'benefits',
    description: 'Highlights cost-saving benefits',
    textVariables: ['title', 'description', 'savings_amount', 'comparison_text', 'roi_text', 'cta'],
    screenFactory: (content, colors, projectData) => ({
      id: 'benefits-cost-savings',
      name: 'Benefits',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: '💰', variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.description, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Title', props: { text: content.savings_amount, variant: 'h2', alignment: 'center', color: '#FCD34D', fontWeight: 'bold' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Title', props: { text: content.comparison_text, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Title', props: { text: content.roi_text, variant: 'body', alignment: 'center', color: '#10B981', fontWeight: 'medium' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.cta, variant: 'primary', size: 'lg', action: 'next' } }
      ]
    })
  },

  // PERMISSIONS CATEGORY (2 templates)
  {
    id: 'permissions-essential',
    name: 'Essential Permissions',
    category: 'permissions',
    description: 'Requests essential app permissions',
    textVariables: ['title', 'description', 'permission1_name', 'permission1_desc', 'permission2_name', 'permission2_desc', 'allow_text', 'later_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'permissions-essential',
      name: 'Permissions',
      bgType: 'color',
      bgValue: colors.background,
      components: [
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Title', props: { text: '🔐', variant: 'h1', alignment: 'center', color: colors.accent, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: colors.text, fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.description, variant: 'body', alignment: 'center', color: colors.textSecondary, fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'ProgressBar', props: { value: 60, max: 100, label: 'Setup Progress', color: colors.primary, showPercentage: true } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: content.permission1_name, content: content.permission1_desc, highlighted: true } },
        { type: 'Card', props: { title: content.permission2_name, content: content.permission2_desc, highlighted: false } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.allow_text, variant: 'primary', fullWidth: true } },
        { type: 'Spacer', props: { height: 'sm' } },
        { type: 'Button', props: { text: content.later_text, variant: 'outline', fullWidth: true } }
      ]
    })
  },

  {
    id: 'permissions-optional',
    name: 'Optional Permissions',
    category: 'permissions',
    description: 'Requests optional app permissions',
    textVariables: ['title', 'description', 'permission_name', 'permission_desc', 'benefit', 'enable_text', 'skip_text'],
    screenFactory: (content, colors, projectData) => ({
      id: 'permissions-optional',
      name: 'Permissions',
      bgType: 'gradient',
      bgValue: colors.gradient,
      components: [
        { type: 'Title', props: { text: '🔔', variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.title, variant: 'h1', alignment: 'center', color: '#FFFFFF', fontWeight: 'bold' } },
        { type: 'Title', props: { text: content.description, variant: 'body', alignment: 'center', color: '#E5E7EB', fontWeight: 'normal' } },
        { type: 'Spacer', props: { height: 'md' } },
        { type: 'Card', props: { title: content.permission_name, subtitle: content.permission_desc, color: colors.accent } },
        { type: 'Title', props: { text: content.benefit, variant: 'body', alignment: 'center', color: '#FCD34D', fontWeight: 'medium' } },
        { type: 'Spacer', props: { height: 'lg' } },
        { type: 'Button', props: { text: content.enable_text, variant: 'primary', size: 'lg', action: 'permissions' } },
        { type: 'Button', props: { text: content.skip_text, variant: 'secondary', size: 'md', action: 'next' } }
      ]
    })
  }
];

// Helper function to get templates by category
export function getTemplatesByCategory(category: OnboardingScreenTemplate['category']): OnboardingScreenTemplate[] {
  return ONBOARDING_SCREEN_TEMPLATES.filter(template => template.category === category);
}

// Helper function to get template by ID
export function getTemplateById(id: string): OnboardingScreenTemplate | undefined {
  return ONBOARDING_SCREEN_TEMPLATES.find(template => template.id === id);
}

// Helper function to get all template IDs
export function getAllTemplateIds(): string[] {
  return ONBOARDING_SCREEN_TEMPLATES.map(template => template.id);
}

// Helper function to get all categories
export function getAllCategories(): OnboardingScreenTemplate['category'][] {
  return [...new Set(ONBOARDING_SCREEN_TEMPLATES.map(template => template.category))];
}