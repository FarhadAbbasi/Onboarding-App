import React, { useState, useEffect } from 'react'
import { ArrowLeft, Monitor, Smartphone, Globe, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { BlockEditor } from '../editor/BlockEditor'
import { MobilePreview } from '../preview/MobilePreview'
import { DesktopPreview } from '../preview/DesktopPreview'
import { PublishModal } from '../publish/PublishModal'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import type { Database } from '../../lib/supabase'
import { DndContext } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import ContentEditorProperties from '../editor/ContentEditorProperties'
import type { BlockTree, BlockNode } from '../../lib/schemas'

type Project = Database['public']['Tables']['projects']['Row']
type ContentBlock = Database['public']['Tables']['content_blocks']['Row']

interface ProjectEditorProps {
  project: Project
  onBack: () => void
  onProjectUpdate: (project: Project) => void
}

export function ProjectEditor({ project, onBack, onProjectUpdate }: ProjectEditorProps) {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile')
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  // Convert flat contentBlocks to a BlockTree
  const [blockTree, setBlockTree] = useState<BlockTree>(() => ({
    rootId: 'root',
    nodes: { root: { id: 'root', type: 'root', content: '', children: [], parentId: null } },
  }));

  // Sync block tree with Supabase contentBlocks
  useEffect(() => {
    const nodes: Record<string, BlockNode> = {};
    contentBlocks.forEach(block => {
      nodes[block.id] = {
        id: block.id,
        type: block.type,
        content: block.content,
        children: [],
        parentId: 'root',
      };
    });
    setBlockTree({
      rootId: 'root',
      nodes: {
        root: { id: 'root', type: 'root', content: '', children: contentBlocks.map(b => b.id), parentId: null },
        ...nodes,
      },
    });
  }, [contentBlocks]);

  useEffect(() => {
    fetchContentBlocks()
  }, [project.id])

  const fetchContentBlocks = async () => {
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .eq('project_id', project.id)
        .order('order_index', { ascending: true })

      if (error) throw error
      setContentBlocks(data || [])
    } catch (error) {
      console.error('Error fetching content blocks:', error)
      toast.error('Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  // Handler to update a block's content or type
  const handleBlockUpdateTree = async (blockId: string, updates: Partial<BlockNode>) => {
    // Ensure all relevant properties are passed to the update
    const block = contentBlocks.find(b => b.id === blockId);
    if (!block) return;
    // Merge styles if present
    let updateObj: any = { ...updates };
    if (updates.styles) {
      updateObj.styles = { ...block.styles, ...updates.styles };
    } else if (block.styles) {
      updateObj.styles = { ...block.styles };
    }
    await handleBlockUpdate(blockId, updateObj);
    await fetchContentBlocks();
  };

  // Handler to delete a block and its children
  const handleDeleteBlockTree = async (blockId: string) => {
    // Find all descendant IDs to delete
    const collectIds = (id: string, nodes: Record<string, BlockNode>, acc: string[]) => {
      acc.push(id);
      nodes[id]?.children.forEach(childId => collectIds(childId, nodes, acc));
    };
    const idsToDelete: string[] = [];
    collectIds(blockId, blockTree.nodes, idsToDelete);
    for (const id of idsToDelete) {
      await handleDeleteBlock(id);
    }
    if (selectedBlockId && idsToDelete.includes(selectedBlockId)) setSelectedBlockId(null);
    await fetchContentBlocks();
  };

  // Handler to add a new block as a child of a parent
  const handleAddBlockTree = async (type: string, content: string, parentId: string = 'root') => {
    // Always add to the bottom, use max order_index + 1
    const maxOrder = contentBlocks.length > 0 ? Math.max(...contentBlocks.map(b => b.order_index)) : -1;
    const newBlock = await handleAddBlock(type as any, content, maxOrder + 1);
    if (!newBlock) return;
    await fetchContentBlocks();
    await reindexBlocks();
  };

  // Helper to reindex all blocks after delete or reorder
  const reindexBlocks = async () => {
    const sorted = [...contentBlocks].sort((a, b) => a.order_index - b.order_index);
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].order_index !== i) {
        await supabase.from('content_blocks').update({ order_index: i }).eq('id', sorted[i].id);
      }
    }
    await fetchContentBlocks();
  };

  const handleBlockUpdate = async (blockId: string, updates: Partial<ContentBlock>) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('content_blocks')
        .update(updates)
        .eq('id', blockId)

      if (error) throw error

      setContentBlocks(prev => 
        prev.map(block => 
          block.id === blockId ? { ...block, ...updates } : block
        )
      )

      // Update project timestamp
      const { data: updatedProject } = await supabase
        .from('projects')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', project.id)
        .select()
        .single()

      if (updatedProject) {
        onProjectUpdate(updatedProject)
      }
    } catch (error) {
      console.error('Error updating block:', error)
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleBlockReorder = async (newBlocks: ContentBlock[]) => {
    setSaving(true)
    try {
      const updates = newBlocks.map((block, index) => ({
        id: block.id,
        order_index: index
      }))

      for (const update of updates) {
        const { error } = await supabase
          .from('content_blocks')
          .update({ order_index: update.order_index })
          .eq('id', update.id)

        if (error) throw error
      }

      setContentBlocks(newBlocks)
      await reindexBlocks();
    } catch (error) {
      console.error('Error reordering blocks:', error)
      toast.error('Failed to reorder blocks')
    } finally {
      setSaving(false)
    }
  }

  const handleAddBlock = async (type: ContentBlock['type'], content: string, order_index?: number) => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('content_blocks')
        .insert({
          project_id: project.id,
          type,
          content,
          order_index: typeof order_index === 'number' ? order_index : contentBlocks.length
        })
        .select()
        .single()

      if (error) throw error

      setContentBlocks(prev => [...prev, data])
      toast.success('Block added successfully')
      return data
    } catch (error) {
      console.error('Error adding block:', error)
      toast.error('Failed to add block')
      return null
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('id', blockId)

      if (error) throw error

      setContentBlocks(prev => prev.filter(block => block.id !== blockId))
      toast.success('Block deleted successfully')
      await reindexBlocks();
    } catch (error) {
      console.error('Error deleting block:', error)
      toast.error('Failed to delete block')
    } finally {
      setSaving(false)
    }
  }

  // Drag-and-drop handler for adding blocks from sidebar to preview and for block reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!active || !over) return;
    // If dragging from sidebar (new block)
    const activeType = (active.data && active.data.current && active.data.current.type) || null;
    const isSidebarDrag = activeType && !blockTree.nodes[active.id as string];
    if (isSidebarDrag) {
      // Drop as last child of over block, or root if dropped on preview-drop-area
      const parentId = over.id === 'preview-drop-area' ? blockTree.rootId : (over.id as string);
      let defaultContent = '';
      switch (activeType) {
        case 'headline': defaultContent = 'Welcome to Your App!'; break;
        case 'subheadline': defaultContent = 'Start building your onboarding experience.'; break;
        case 'feature': defaultContent = ''; break;
        case 'cta': defaultContent = 'Ready to get started?'; break;
        case 'testimonial': defaultContent = '“This app made onboarding a breeze!”'; break;
        default: defaultContent = '';
      }
      handleAddBlockTree(activeType, defaultContent, parentId);
      return;
    }
    // Otherwise, reorder/move existing block
    if (active.id !== over.id) {
      handleBlockMove(active.id as string, over.id as string, blockTree.nodes[over.id].children.length);
    }
  };

  // Helper to move a block in the tree
  function moveBlockInTree(tree: BlockTree, blockId: string, newParentId: string, newIndex: number): BlockTree {
    if (blockId === 'root' || newParentId === blockId) return tree;
    // Prevent moving a block into itself or its descendants
    let current: string | null = newParentId;
    while (current && current !== 'root') {
      if (current === blockId) return tree;
      current = tree.nodes[current]?.parentId ?? null;
    }
    const block = tree.nodes[blockId];
    const oldParentId = block.parentId;
    if (!block || !tree.nodes[newParentId]) return tree;
    // Remove from old parent
    let newNodes = { ...tree.nodes };
    if (oldParentId && newNodes[oldParentId]) {
      newNodes[oldParentId] = {
        ...newNodes[oldParentId],
        children: newNodes[oldParentId].children.filter(cid => cid !== blockId),
      };
    }
    // Add to new parent
    const newChildren = [...newNodes[newParentId].children];
    newChildren.splice(newIndex, 0, blockId);
    newNodes[newParentId] = {
      ...newNodes[newParentId],
      children: newChildren,
    };
    // Update block's parentId
    newNodes[blockId] = { ...block, parentId: newParentId };
    return { ...tree, nodes: newNodes };
  }

  // Handler to move a block in the tree
  const handleBlockMove = (blockId: string, newParentId: string, newIndex: number) => {
    setBlockTree(prev => moveBlockInTree(prev, blockId, newParentId, newIndex));
    // Optionally, sync to Supabase here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="btn-secondary flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-500">{project.url}</p>
              </div>
              
              {saving && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {/* Preview Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    previewMode === 'mobile'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Smartphone size={16} className="inline mr-1" />
                  Mobile
                </button>
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    previewMode === 'desktop'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Monitor size={16} className="inline mr-1" />
                  Desktop
                </button>
              </div>
              
              <button
                onClick={() => setShowPublishModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Globe size={16} />
                Publish
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Editor Panel */}
            <div className="lg:col-span-3 col-span-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-0 h-full flex flex-col">
                <BlockEditor />
              </div>
            </div>
            {/* Preview Panel */}
            <div className="lg:col-span-6 col-span-12 flex flex-col items-center">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 w-full flex flex-col items-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {previewMode === 'mobile' ? 'Mobile Preview' : 'Desktop Preview'}
                </h2>
                <div className="flex justify-center w-full">
                  {previewMode === 'mobile' ? (
                    <MobilePreview
                      blockTree={blockTree}
                      selectedBlockId={selectedBlockId}
                      onSelectBlock={setSelectedBlockId}
                      onDeleteBlock={handleDeleteBlockTree}
                    />
                  ) : (
                    <DesktopPreview
                      blockTree={blockTree}
                      selectedBlockId={selectedBlockId}
                      onSelectBlock={setSelectedBlockId}
                      onDeleteBlock={handleDeleteBlockTree}
                    />
                  )}
                </div>
              </div>
            </div>
            {/* Properties Panel */}
            <div className="lg:col-span-3 col-span-12">
              <ContentEditorProperties
                blockTree={blockTree}
                selectedBlockId={selectedBlockId}
                onBlockUpdate={handleBlockUpdateTree}
              />
            </div>
          </div>
        </DndContext>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <PublishModal
          project={project}
          blocks={contentBlocks}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </div>
  )
} 