import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { BlockTree } from '../../lib/schemas'

interface MobilePreviewProps {
  blockTree: BlockTree
  selectedBlockId?: string | null
  onSelectBlock?: (blockId: string) => void
  onDeleteBlock?: (blockId: string) => void
}

export function MobilePreview({ blockTree, selectedBlockId, onSelectBlock, onDeleteBlock }: MobilePreviewProps) {
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
    <div ref={setNodeRef} className={`relative ${isOver ? 'ring-4 ring-blue-300' : ''}`}>
      {/* Phone Frame */}
      <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-xl">
        <div className="bg-black rounded-[2rem] p-1">
          <div className="bg-white rounded-[1.5rem] overflow-hidden" style={{ width: '320px', height: '640px' }}>
            {/* Status Bar */}
            <div className="bg-gray-900 h-6 flex items-center justify-between px-4">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
              <div className="text-white text-xs font-medium">9:41</div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-white rounded-sm"></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
            {/* Content Area */}
            <div className="h-full overflow-y-auto p-6 pb-20">
              {rootChildren.length > 0 ? (
                rootChildren.map((blockId) => {
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
                      className={`relative group rounded-lg transition-all mb-4 bg-white p-4 shadow ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
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
                              <h1 className="text-2xl font-bold text-gray-900 text-center mb-4" style={style}>
                                {block.content || 'Your Headline'}
                              </h1>
                            )
                          case 'subheadline':
                            return (
                              <p className="text-base text-gray-600 text-center mb-6 max-w-xs mx-auto" style={style}>
                                {block.content || 'Your subheadline goes here'}
                              </p>
                            )
                          case 'feature':
                            return (
                              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-3">
                                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <p className="text-gray-700 text-sm" style={style}>
                                    {block.content || 'Feature description'}
                                  </p>
                                </div>
                              </div>
                            )
                          case 'cta':
                            return (
                              <div className="text-center mb-6">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg text-base transition-colors shadow-md hover:shadow-lg transform hover:scale-105" style={style}>
                                  {block.content || 'Get Started'}
                                </button>
                              </div>
                            )
                          case 'testimonial':
                            const testimonial = parseTestimonial(block.content)
                            return (
                              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                                <div className="mb-3">
                                  <p className="text-gray-700 italic" style={style}>
                                    "{testimonial.text || 'This is an amazing app!'}"
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                      {(testimonial.author || 'JD').charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-medium text-gray-900 text-sm">
                                      {testimonial.author || 'John Doe'}
                                    </p>
                                    <p className="text-xs text-gray-500">
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
                })
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Add content blocks to see your onboarding page come to life
                  </h3>
                  <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
                    Get Started
                  </div>
                </div>
              )}
            </div>
            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-1 bg-gray-900 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 