import React, { useState } from 'react'
import { Globe, ArrowLeft, CheckCircle, ExternalLink, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { FlowPlan, Page } from '../../lib/schemas'

interface FlowPublisherProps {
  projectId: string
  flowPlan: FlowPlan
  pages: Page[]
  projectName: string
  onComplete: () => void
  onBack: () => void
}

export function FlowPublisher({ 
  projectId, 
  flowPlan, 
  pages, 
  projectName, 
  onComplete, 
  onBack 
}: FlowPublisherProps) {
  const [publishing, setPublishing] = useState(false)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  const [customSlug, setCustomSlug] = useState(
    projectName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  )

  const handlePublish = async () => {
    setPublishing(true)

    try {
      // Simple HTML generation for each page
      const files: Array<{ name: string; content: string }> = []

      // Create basic HTML for each page
      pages.forEach((page, index) => {
        const isFirst = index === 0
        const fileName = isFirst ? 'index.html' : `${page.id}.html`
        
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title} - ${projectName}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-md mx-auto bg-white min-h-screen shadow-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-4">${page.title}</h1>
        <p class="text-gray-600 mb-6">${page.purpose}</p>
        
        <div class="space-y-4">
            ${page.blocks.map(block => `
                <div class="p-4 bg-gray-50 rounded-lg">
                    <div class="text-sm font-medium text-gray-700 mb-2">${block.type}</div>
                    <div class="text-sm text-gray-600">${JSON.stringify(block.content, null, 2)}</div>
                </div>
            `).join('')}
        </div>
        
        <div class="mt-8 flex justify-between">
            ${index > 0 ? `<a href="${index === 1 ? 'index.html' : pages[index - 1].id + '.html'}" class="text-blue-600">← Previous</a>` : '<div></div>'}
            ${index < pages.length - 1 ? `<a href="${pages[index + 1].id}.html" class="bg-blue-600 text-white px-4 py-2 rounded">Next →</a>` : '<div class="text-green-600 font-medium">Complete ✓</div>'}
        </div>
    </div>
</body>
</html>`

        files.push({ name: fileName, content: html })
      })

      // Upload files to Supabase Storage
      const uploadPromises = files.map(async (file) => {
        const { error } = await supabase.storage
          .from('published-pages')
          .upload(`${customSlug}/${file.name}`, file.content, {
            contentType: 'text/html',
            upsert: true
          })

        if (error) throw error
      })

      await Promise.all(uploadPromises)

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('published-pages')
        .getPublicUrl(`${customSlug}/index.html`)

      // Save publication record
      const { error: insertError } = await supabase
        .from('published_pages')
        .upsert({
          project_id: projectId,
          slug: customSlug,
          url: publicUrl,
          page_count: pages.length,
          flow_data: { flowPlan, pages }
        })

      if (insertError) throw insertError

      setPublishedUrl(publicUrl)
      toast.success('Flow published successfully!')
    } catch (error) {
      console.error('Publishing error:', error)
      toast.error('Failed to publish flow. Please try again.')
    } finally {
      setPublishing(false)
    }
  }

  const copyUrl = () => {
    if (publishedUrl) {
      navigator.clipboard.writeText(publishedUrl)
      toast.success('URL copied to clipboard!')
    }
  }

  if (publishedUrl) {
    return (
      <div className="card max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={24} className="text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Flow Published Successfully!</h2>
        <p className="text-gray-600 mb-6">
          Your {pages.length}-page onboarding flow is now live and ready for users.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Published URL:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={publishedUrl}
              readOnly
              className="flex-1 p-2 bg-white border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={copyUrl}
              className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <a
            href={publishedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
          >
            <ExternalLink size={16} />
            <span>Preview Flow</span>
          </a>
          <button
            onClick={onComplete}
            className="btn-primary"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Globe size={24} className="text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Publish Your Flow</h2>
        <p className="text-gray-600">
          Generate and deploy your {pages.length}-page onboarding experience
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="customSlug" className="block text-sm font-medium text-gray-700 mb-2">
            Custom URL Slug
          </label>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md px-3 py-2">
              yourapp.appramps.site/
            </span>
            <input
              type="text"
              id="customSlug"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1 border border-gray-300 rounded-r-md px-3 py-2"
              placeholder="my-app-onboarding"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Only lowercase letters, numbers, and hyphens are allowed
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">What will be published:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• {pages.length} responsive HTML pages with Tailwind CSS</li>
            <li>• Mobile-optimized design with navigation</li>
            <li>• All your content blocks rendered as interactive elements</li>
            <li>• Instantly accessible at your custom URL</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onBack}
            className="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Editor</span>
          </button>
          
          <button
            onClick={handlePublish}
            disabled={publishing || !customSlug.trim()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {publishing && <LoadingSpinner size="sm" />}
            <Globe size={16} />
            <span>Publish Flow</span>
          </button>
        </div>
      </div>
    </div>
  )
} 