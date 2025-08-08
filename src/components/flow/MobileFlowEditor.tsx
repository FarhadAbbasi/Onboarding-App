import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Smartphone, Eye, EyeOff, Palette, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { MobileFrame } from '../ui/MobileFrame';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { UIFlow, UIScreen } from '../../types/ui-schema';

interface MobileFlowEditorProps {
  projectId: string;
  projectName: string;
  projectUrl: string;
  onBack: () => void;
  onSave: () => void;
}

export function MobileFlowEditor({ 
  projectId, 
  projectName, 
  projectUrl, 
  onBack, 
  onSave 
}: MobileFlowEditorProps) {
  const [flow, setFlow] = useState<UIFlow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadFlow();
  }, [projectId]);

  const loadFlow = async () => {
    try {
      setLoading(true);
      
      // Load onboarding pages from database
      const { data: pages, error } = await supabase
        .from('onboarding_pages')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index');

      if (error) throw error;

      if (pages && pages.length > 0) {
        // Convert pages to UIFlow format
        const screens: UIScreen[] = pages.map(page => {
          try {
            // Parse the stored JSON screen data
            const screenData = JSON.parse(page.html_content || '{}');
            return {
              id: page.page_id,
              name: page.title,
              bgType: screenData.bgType || 'color',
              bgValue: screenData.bgValue || '#FFFFFF',
              components: screenData.components || []
            };
          } catch (error) {
            console.error(`Error parsing screen data for page ${page.page_id}:`, error);
            // Return a default screen if parsing fails
            return {
              id: page.page_id,
              name: page.title,
              bgType: 'color' as const,
              bgValue: '#FFFFFF',
              components: []
            };
          }
        });

        // Parse theme data if available
        const themeData = pages[0]?.theme ? JSON.parse(pages[0].theme) : null;

        const uiFlow: UIFlow = {
          id: `flow-${projectId}`,
          name: `${projectName} Mobile Flow`,
          description: `Mobile onboarding flow for ${projectName}`,
          screens,
          theme: themeData
        };

        setFlow(uiFlow);
      } else {
        toast.error('No mobile flow found for this project');
      }
    } catch (error) {
      console.error('Error loading flow:', error);
      toast.error('Failed to load mobile flow');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!flow) return;

    setSaving(true);
    try {
      // Update all pages in the database
      const updates = flow.screens.map((screen, index) => ({
        page_id: screen.id,
        project_id: projectId,
        title: screen.name,
        purpose: screen.name,
        order_index: index,
        html_content: JSON.stringify(screen),
        theme: JSON.stringify(flow.theme || {}),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('onboarding_pages')
          .update({
            title: update.title,
            purpose: update.purpose,
            order_index: update.order_index,
            html_content: update.html_content,
            theme: update.theme
          })
          .eq('page_id', update.page_id)
          .eq('project_id', projectId);

        if (error) throw error;
      }

      setHasUnsavedChanges(false);
      toast.success('Mobile flow saved successfully!');
      onSave();
    } catch (error) {
      console.error('Error saving flow:', error);
      toast.error('Failed to save mobile flow');
    } finally {
      setSaving(false);
    }
  };

  const handleScreenChange = (index: number) => {
    setCurrentScreenIndex(index);
  };

  const handleScreenUpdate = (updatedScreen: UIScreen) => {
    if (!flow) return;

    const updatedScreens = flow.screens.map((screen, index) => 
      index === currentScreenIndex ? updatedScreen : screen
    );

    setFlow({
      ...flow,
      screens: updatedScreens
    });
    setHasUnsavedChanges(true);
  };

  const exportFlowData = () => {
    if (!flow) return;

    const dataStr = JSON.stringify(flow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${projectName.toLowerCase().replace(/\s+/g, '-')}-mobile-flow.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Flow data exported successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading mobile flow...</p>
        </div>
      </div>
    );
  }

  if (!flow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Mobile Flow Found</h2>
          <p className="text-gray-600 mb-4">This project doesn't have a mobile flow yet.</p>
          <button onClick={onBack} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                Back
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{projectName}</h1>
                <p className="text-sm text-gray-600">Mobile Flow Editor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
              
              <button
                onClick={exportFlowData}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download size={16} />
                Export
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <LoadingSpinner size="sm" /> : <Save size={16} />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Screen Editor</h2>
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Screen {currentScreenIndex + 1} of {flow.screens.length}
                  </span>
                </div>
              </div>

              {/* Screen Navigation */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-700">
                    {flow.screens[currentScreenIndex]?.name || 'Unnamed Screen'}
                  </h3>
                  <div className="flex gap-1">
                    {flow.screens.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentScreenIndex(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentScreenIndex ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {flow.screens.map((screen, index) => (
                    <button
                      key={screen.id}
                      onClick={() => setCurrentScreenIndex(index)}
                      className={`p-3 text-left rounded-lg border transition-colors ${
                        index === currentScreenIndex
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-medium truncate">{screen.name}</div>
                      <div className="text-xs text-gray-500">{screen.components.length} components</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Screen Editor Interface */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="text-center py-8">
                  <Palette size={32} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Editor Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Full drag-and-drop editing capabilities for mobile UI components are being developed.
                  </p>
                  <p className="text-sm text-gray-500">
                    For now, you can preview your generated mobile flow and export the data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Live Preview</h2>
                
                <div className="flex justify-center">
                  <MobileFrame
                    flow={flow}
                    currentScreenIndex={currentScreenIndex}
                    onScreenChange={handleScreenChange}
                    showNavigation={true}
                    className="transform scale-75 origin-top"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-sm text-yellow-800">You have unsaved changes</span>
          </div>
        </div>
      )}
    </div>
  );
}