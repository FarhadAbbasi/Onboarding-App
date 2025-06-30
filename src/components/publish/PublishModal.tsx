import React, { useState } from 'react'
import { X, Globe, Copy, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { Database } from '../../lib/supabase'

type Project = Database['public']['Tables']['projects']['Row']
type ContentBlock = Database['public']['Tables']['content_blocks']['Row']

interface PublishModalProps {
  project: Project
  blocks: ContentBlock[]
  onClose: () => void
}

export function PublishModal({ project, blocks, onClose }: PublishModalProps) {
  const [loading, setLoading] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  const [slug, setSlug] = useState(generateSlug(project.name))

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const generateHTML = () => {
    const sortedBlocks = [...blocks].sort((a, b) => a.order_index - b.order_index)

    const parseTestimonial = (content: string) => {
      try {
        return JSON.parse(content)
      } catch {
        return { text: content, author: '', role: '', company: '' }
      }
    }

    const renderBlock = (block: ContentBlock) => {
      switch (block.type) {
        case 'headline':
          return `<h1 class="text-4xl md:text-6xl font-bold text-gray-900 text-center mb-6">${block.content || 'Your Headline'}</h1>`
        
        case 'subheadline':
          return `<p class="text-xl md:text-2xl text-gray-600 text-center mb-8 max-w-3xl mx-auto">${block.content || 'Your subheadline goes here'}</p>`
        
        case 'feature':
          return `
            <div class="bg-gray-50 rounded-xl p-6 mb-6">
              <div class="flex items-start gap-4">
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
                <p class="text-gray-700 text-lg">${block.content || 'Feature description'}</p>
              </div>
            </div>
          `
        
        case 'cta':
          return `
            <div class="text-center mb-8">
              <a href="${project.url}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                ${block.content || 'Get Started'}
              </a>
            </div>
          `
        
        case 'testimonial':
          const testimonial = parseTestimonial(block.content)
          return `
            <div class="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm max-w-2xl mx-auto">
              <div class="mb-6">
                <p class="text-gray-700 text-lg italic leading-relaxed">
                  "${testimonial.text || 'This is an amazing app!'}"
                </p>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-lg font-medium text-gray-600">
                    ${(testimonial.author || 'JD').charAt(0)}
                  </span>
                </div>
                <div>
                  <p class="font-semibold text-gray-900">${testimonial.author || 'John Doe'}</p>
                  <p class="text-gray-500">${testimonial.role || 'CEO'} at ${testimonial.company || 'TechCorp'}</p>
                </div>
              </div>
            </div>
          `
        
        default:
          return ''
      }
    }

    const groupedBlocks = sortedBlocks.reduce((acc, block) => {
      if (block.type === 'feature') {
        acc.features.push(block)
      } else {
        acc.other.push(block)
      }
      return acc
    }, { features: [] as ContentBlock[], other: [] as ContentBlock[] })

    const featuresHTML = groupedBlocks.features.length > 0 ? `
      <div class="grid gap-6 mb-8 ${
        groupedBlocks.features.length === 1 
          ? 'grid-cols-1' 
          : groupedBlocks.features.length === 2 
          ? 'grid-cols-1 md:grid-cols-2' 
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }">
        ${groupedBlocks.features.map(renderBlock).join('')}
      </div>
    ` : ''

    const otherBlocksHTML = groupedBlocks.other.map(renderBlock).join('')

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - Onboarding</title>
    <meta name="description" content="Welcome to ${project.name}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
    <!-- Analytics tracking -->
    <script>
        // Simple analytics tracking
        function trackPageView() {
            fetch('/api/analytics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: '${slug}',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                    referrer: document.referrer
                })
            }).catch(() => {});
        }
        
        // Track page view on load
        window.addEventListener('load', trackPageView);
        
        // Track button clicks
        document.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                fetch('/api/analytics', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        slug: '${slug}',
                        event: 'click',
                        timestamp: new Date().toISOString()
                    })
                }).catch(() => {});
            }
        });
    </script>
</head>
<body class="bg-gradient-to-br from-gray-50 to-white min-h-screen">
    <div class="container mx-auto px-6 py-12">
        <div class="max-w-4xl mx-auto">
            ${otherBlocksHTML}
            ${featuresHTML}
        </div>
    </div>
</body>
</html>
    `.trim()
  }

  const handlePublish = async () => {
    if (!slug.trim()) {
      toast.error('Please enter a valid slug')
      return
    }

    setLoading(true)

    try {
      // Generate HTML
      const html = generateHTML()
      
      // Create a blob and upload to Supabase storage
      const blob = new Blob([html], { type: 'text/html' })
      const fileName = `${slug}.html`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('public_pages')
        .upload(fileName, blob, {
          contentType: 'text/html',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public_pages')
        .getPublicUrl(fileName)

      // Save to published_pages table
      const { error: dbError } = await supabase
        .from('published_pages')
        .upsert({
          project_id: project.id,
          slug,
          file_url: publicUrl,
          is_active: true
        })

      if (dbError) throw dbError

      // Deactivate other published versions
      await supabase
        .from('published_pages')
        .update({ is_active: false })
        .eq('project_id', project.id)
        .neq('slug', slug)

      const domain = import.meta.env.VITE_APP_DOMAIN || 'appramps.site'
      const fullUrl = `https://${slug}.${domain}`
      
      setPublishedUrl(fullUrl)
      toast.success('Page published successfully!')
    } catch (error) {
      console.error('Error publishing:', error)
      toast.error('Failed to publish page')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl)
      toast.success('URL copied to clipboard!')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Globe size={20} />
              Publish Page
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {!publishedUrl ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                  Page Slug
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    https://
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="my-app"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    .appramps.site
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Choose a unique identifier for your page URL
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">What happens when you publish:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your page will be generated as static HTML</li>
                  <li>• It will be uploaded to our CDN for fast loading</li>
                  <li>• Analytics tracking will be automatically added</li>
                  <li>• Your page will be accessible worldwide</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublish}
                  disabled={loading || !slug.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {loading && <LoadingSpinner size="sm" />}
                  Publish
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe size={24} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Page Published Successfully!
                </h3>
                <p className="text-gray-600">
                  Your onboarding page is now live and accessible to everyone.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={publishedUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="btn-secondary flex items-center gap-1 px-3"
                  >
                    <Copy size={16} />
                  </button>
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-1 px-3"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              <button
                onClick={onClose}
                className="btn-primary w-full"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 