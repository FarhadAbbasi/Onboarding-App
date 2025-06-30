import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          url: string
          category: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          url: string
          category: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          url?: string
          category?: string
          notes?: string | null
          updated_at?: string
        }
      }
      content_blocks: {
        Row: {
          id: string
          project_id: string
          type: 'headline' | 'subheadline' | 'feature' | 'cta' | 'testimonial'
          content: string
          order_index: number
          styles: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          type: 'headline' | 'subheadline' | 'feature' | 'cta' | 'testimonial'
          content: string
          order_index: number
          styles?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          type?: 'headline' | 'subheadline' | 'feature' | 'cta' | 'testimonial'
          content?: string
          order_index?: number
          styles?: Record<string, any> | null
          updated_at?: string
        }
      }
      published_pages: {
        Row: {
          id: string
          project_id: string
          slug: string
          file_url: string
          is_active: boolean
          analytics_data: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          slug: string
          file_url: string
          is_active?: boolean
          analytics_data?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          slug?: string
          file_url?: string
          is_active?: boolean
          analytics_data?: Record<string, any> | null
          updated_at?: string
        }
      }
    }
  }
} 