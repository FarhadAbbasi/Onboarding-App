import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { BlockTree, BlockNode } from '../../lib/schemas'

interface DesktopPreviewProps {
  blockTree: BlockTree
  selectedBlockId?: string | null
  onSelectBlock?: (blockId: string) => void
  onDeleteBlock?: (blockId: string) => void
  onBlockUpdate?: (blockId: string, updates: Partial<BlockNode>) => void
  onAddBlock?: (type: string, content: string, parentId?: string) => void
}

export function DesktopPreview({ blockTree, selectedBlockId, onSelectBlock, onDeleteBlock }: DesktopPreviewProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'preview-drop-area' })

  const parseTestimonial = (content: string) => {
    try {
      return JSON.parse(content)
    } catch {
      return { text: content, author: '', role: '', company: '' }
    }
  }

  // Only render root-level blocks (flat)
  const rootChildren = blockTree.nodes[blockTree.rootId]?.children || [];

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden" style={{ width: '800px', height: '600px' }}>
      {/* Browser Chrome */}
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="flex-1 mx-4">
          <div className="bg-white rounded px-3 py-1 text-sm text-gray-600 border">
            {/* Optionally show project URL or name here */}
          </div>
        </div>
      </div>
      {/* Content Area */}
      <div ref={setNodeRef} className={`h-full overflow-y-auto min-h-[600px] bg-gradient-to-br from-gray-50 to-white p-8 ${isOver ? 'border-2 border-blue-400 bg-blue-50' : ''}`}> 
        {rootChildren.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-6">
              <svg className="w-24 h-24 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Add content blocks to see your onboarding page come to life
            </h1>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg">
              Get Started
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {rootChildren.map((blockId) => {
              const block = blockTree.nodes[blockId];
    if (!block) return null;
    const isSelected = selectedBlockId === block.id;
    const style = {
      color: block.styles?.color,
      fontSize: block.styles?.fontSize,
    };
    return (
        <div
                  key={block.id}
                  className={`relative group rounded-lg transition-all mb-4 bg-white p-6 shadow ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
          style={{ cursor: 'pointer' }}
                  onClick={() => onSelectBlock && onSelectBlock(block.id)}
                >
          {/* Delete (cross) icon */}
          {isSelected && onDeleteBlock && block.id !== 'root' && (
            <div className="pointer-events-none">
              <button
                className="absolute -top-3 -right-3 bg-white border border-gray-200 rounded-full shadow p-1 z-10 hover:bg-red-50 hover:text-red-600 transition pointer-events-auto"
                onClick={e => { e.stopPropagation(); onDeleteBlock(block.id); }}
                title="Delete block"
              >
                <span className="text-lg font-bold">&times;</span>
              </button>
            </div>
          )}
          {/* Block content */}
          {(() => {
            switch (block.type) {
              case 'headline':
                return (
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-6" style={style}>
                    {block.content || 'Your Headline'}
                  </h1>
                )
              case 'subheadline':
                return (
                  <p className="text-xl text-gray-600 text-center mb-8 max-w-2xl mx-auto" style={style}>
                    {block.content || 'Your subheadline goes here'}
                  </p>
                )
              case 'feature':
                return (
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                              <p className="text-gray-700 text-lg" style={style}>
                        {block.content || 'Feature description'}
                      </p>
                    </div>
                  </div>
                )
              case 'cta':
                return (
                  <div className="text-center mb-8">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg hover:shadow-xl transform hover:scale-105" style={style}>
                      {block.content || 'Get Started'}
                    </button>
                  </div>
                )
              case 'testimonial':
                const testimonial = parseTestimonial(block.content)
                return (
                  <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
                    <div className="mb-6">
                              <p className="text-gray-700 text-lg italic leading-relaxed" style={style}>
                        "{testimonial.text || 'This is an amazing app!'}"
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-lg font-medium text-gray-600">
                          {(testimonial.author || 'JD').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {testimonial.author || 'John Doe'}
                        </p>
                        <p className="text-gray-500">
                          {testimonial.role || 'CEO'} at {testimonial.company || 'TechCorp'}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              default:
                return null
            }
          })()}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
} 