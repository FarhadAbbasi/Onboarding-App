import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Save, Smartphone, Share, Copy, ExternalLink, X, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { supabase } from '../../lib/supabase';
import { MobileFrame } from '../ui/MobileFrame';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ComponentLibrary } from '../flow/editor/ComponentLibrary';
import { BackgroundEditor } from './BackgroundEditor';
import type { UIScreen, UIFlow, UIComponent } from '../../types/ui-schema';
import type { Database } from '../../lib/supabase';

type Project = Database['public']['Tables']['projects']['Row'];
// type OnboardingPage = Database['public']['Tables']['onboarding_pages']['Row'];

interface MobileScreenEditorProps {
  project: Project;
  onBack: () => void;
}

interface EditingComponent {
  screenIndex: number;
  componentIndex: number;
  component: UIComponent;
}

export function MobileScreenEditor({ project, onBack }: MobileScreenEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [screens, setScreens] = useState<UIScreen[]>([]);
  const [flow, setFlow] = useState<UIFlow | null>(null);
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  
  // Setup global HTML component editing function
  useEffect(() => {
    (window as any).editHTMLComponent = (componentId: string) => {
      console.log('📝 Editing HTML component:', componentId);
      const currentScreen = screens[currentScreenIndex];
      if (currentScreen && currentScreen.components[0]?.type === 'HTML') {
        const htmlContent = (currentScreen.components[0] as any).props.html;
        setHtmlComponentEditor({
          componentId,
          content: htmlContent
        });
      }
    };
    
    return () => {
      delete (window as any).editHTMLComponent;
    };
  }, [screens, currentScreenIndex]);

  // Debug current screen changes
  useEffect(() => {
    console.log('📱 Current screen index changed to:', currentScreenIndex, 'Screen:', screens[currentScreenIndex]?.name);
  }, [currentScreenIndex, screens]);
  const [editingComponent, setEditingComponent] = useState<EditingComponent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // HTML component editing state
  const [htmlComponentEditor, setHtmlComponentEditor] = useState<{
    componentId: string;
    content: string;
  } | null>(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Color palette for quick editing
  const colorPalette = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#6366F1', '#F97316', '#84CC16',
        // Premium Colors
    '#2563EB', // Sapphire Blue
    '#059669', // Emerald Green
    '#EC4899', // Rose Gold
    '#0369A1', // Ocean Blue
    '#B45309', // Amber Gold
    
    // Neutral Colors
    '#1F2937', // Charcoal
    '#64748B', // Platinum
    '#94A3B8', // Silver
    '#E2E8F0', // Pearl
    '#F8FAFC'  // White
  ];

  // Font style options
  const fontStyles = [
    // Modern Sans-Serifs
    { value: 'Clash Display', label: 'Clash Display (Premium Modern)' },
    { value: 'Tenor Sans', label: 'Tenor Sans (Architectural)' },
    
    // Elegant Serifs
    { value: 'Cormorant Garamond', label: 'Cormorant (Luxury Serif)' },
    { value: 'Cardo', label: 'Cardo (Sophisticated)' },
    { value: 'Gilda Display', label: 'Gilda Display (Editorial)' },
    { value: 'Spectral', label: 'Spectral (Modern Classic)' },
    { value: 'Marcellus', label: 'Marcellus (Roman Elegance)' },
    
    // Previous Fonts
    { value: 'Playfair Display', label: 'Playfair Display (Classic)' },
    { value: 'Inter', label: 'Inter (Clean Modern)' },
    { value: 'DM Sans', label: 'DM Sans (Contemporary)' }
  ];

  // Font weight options
  const fontWeights = [
    { value: 'normal', label: 'Normal' },
    { value: 'medium', label: 'Medium' },
    { value: 'semibold', label: 'Semi Bold' },
    { value: 'bold', label: 'Bold' }
  ];

  // State for custom hex color
  const [customColor, setCustomColor] = useState('#000000');
  const [hexInput, setHexInput] = useState('#000000');
  
  // State for background editing
  const [bgHexInput, setBgHexInput] = useState('#FFFFFF');
  const [showBackgroundEditor, setShowBackgroundEditor] = useState(false);
  const [showAdvancedBackgroundEditor, setShowAdvancedBackgroundEditor] = useState(false);
  
  // Deploy states
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    loadScreensFromDatabase();
  }, [project.id]);

  // Update background hex input when screen changes
  useEffect(() => {
    const screen = getCurrentScreen();
    if (screen && screen.bgType === 'color' && screen.bgValue) {
      setBgHexInput(screen.bgValue);
    }
  }, [currentScreenIndex, screens]);

  const loadScreensFromDatabase = async () => {
    setLoading(true);
    console.log('🔍 Loading screens for project:', project.id, project.name);
    
    try {
      const { data: pages, error } = await supabase
        .from('onboarding_pages')
        .select('*')
        .eq('project_id', project.id)
        .order('order_index');

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('📄 Found pages:', pages?.length || 0, pages);

      if (pages && pages.length > 0) {
        const loadedScreens: UIScreen[] = [];
        let theme: any = {};
        
        for (const page of pages) {
          try {
            console.log('🔧 Parsing page:', page.page_id, 'Content length:', page.html_content?.length);
            const screenData = JSON.parse(page.html_content);
            loadedScreens.push(screenData);
            
            // Extract theme from the first page that has it
            if (page.theme && !theme.primaryColor) {
              theme = JSON.parse(page.theme);
            }
          } catch (e) {
            console.error('❌ Error parsing screen data for page:', page.page_id, e);
          }
        }

        console.log('✅ Loaded screens:', loadedScreens.length, loadedScreens);

        if (loadedScreens.length > 0) {
          setScreens(loadedScreens);
          setFlow({
            id: `flow-${project.id}`,
            name: `${project.name} Onboarding`,
            screens: loadedScreens,
            theme: theme
          });
          toast.success(`Loaded ${loadedScreens.length} screens successfully!`);
        } else {
          console.warn('⚠️ No valid screens found');
          toast('No screens found for this project', { icon: '⚠️' });
        }
      } else {
        console.warn('⚠️ No pages found in database');
        toast('No mobile screens found for this project. Please create some screens first.', { icon: '⚠️' });
      }
    } catch (error) {
      console.error('❌ Error loading screens:', error);
      toast.error('Failed to load screens');
    } finally {
      setLoading(false);
    }
  };

  const saveScreensToDatabase = async () => {
    if (!flow || screens.length === 0) return;

    setSaving(true);
    try {
      // Delete existing pages
      const { error: deleteError } = await supabase
        .from('onboarding_pages')
        .delete()
        .eq('project_id', project.id);

      if (deleteError) throw deleteError;

      // Insert updated pages
      const pagesToInsert = screens.map((screen, index) => ({
        project_id: project.id,
        page_id: `${project.id}-${screen.id}`,
        title: screen.name,
        purpose: screen.name,
        order_index: index,
        html_content: JSON.stringify(screen),
        theme: JSON.stringify(flow.theme || {}),
      }));

      const { error: insertError } = await supabase
        .from('onboarding_pages')
        .insert(pagesToInsert);

      if (insertError) throw insertError;

      toast.success('Screens saved successfully!');
    } catch (error) {
      console.error('Error saving screens:', error);
      toast.error('Failed to save screens');
    } finally {
      setSaving(false);
    }
  };

  const handleComponentEdit = (screenIndex: number, componentIndex: number) => {
    const component = screens[screenIndex].components[componentIndex];
    setEditingComponent({ screenIndex, componentIndex, component });
    setIsEditing(true);
  };

  const handleComponentDelete = (screenIndex: number, componentIndex: number) => {
    const updatedScreens = [...screens];
    updatedScreens[screenIndex].components.splice(componentIndex, 1);
    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
    toast.success('Component deleted');
  };

  const handleTextChange = (newText: string) => {
    if (!editingComponent) return;

    const updatedScreens = [...screens];
    const component = updatedScreens[editingComponent.screenIndex].components[editingComponent.componentIndex];
    
    // Update text property based on component type
    if (component.type === 'Title') {
      component.props.text = newText;
    } else if (component.type === 'Button') {
      component.props.text = newText;
    } else if (component.type === 'Input') {
      component.props.placeholder = newText;
    } else if (component.type === 'Card') {
      component.props.title = newText;
    } else if (component.type === 'CardGrid') {
      component.props.title = newText;
    }

    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
    setEditingComponent({ ...editingComponent, component });
  };

  const handleInputLabelChange = (newLabel: string) => {
    if (!editingComponent) return;

    const updatedScreens = [...screens];
    const component = updatedScreens[editingComponent.screenIndex].components[editingComponent.componentIndex];
    
    if (component.type === 'Input') {
      component.props.label = newLabel;
    }

    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
    setEditingComponent({ ...editingComponent, component });
  };

  const handleColorChange = (newColor: string) => {
    if (!editingComponent) return;

    const updatedScreens = [...screens];
    const component = updatedScreens[editingComponent.screenIndex].components[editingComponent.componentIndex];
    
    // Update color property based on component type
    if (component.type === 'Title') {
      component.props.color = newColor;
    } else if (component.type === 'Button') {
      if (!component.props.style) component.props.style = {};
      const buttonVariant = component.props.variant || 'primary';
      
      // Apply color based on button variant
      if (buttonVariant === 'secondary') {
        // For secondary: light background, colored text
        component.props.style.backgroundColor = `${newColor}20`; // 20% opacity of color
        component.props.style.color = newColor;
        component.props.style.border = `2px solid ${newColor}40`; // 40% opacity border
      } else if (buttonVariant === 'ghost') {
        // For ghost: transparent background, colored text and border
        component.props.style.backgroundColor = 'transparent';
        component.props.style.color = newColor;
        component.props.style.border = `2px solid ${newColor}`;
      } else {
        // For primary: colored background, white text
        component.props.style.backgroundColor = newColor;
        component.props.style.color = '#FFFFFF';
      }
      // Keep current variant - don't force primary
    } else if (component.type === 'Input') {
      component.props.color = newColor;
    } else if (component.type === 'Card') {
      // For cards, we might want to update the highlight color or border
      component.props.highlighted = true;
    } else if (component.type === 'OptionGroup') {
      (component.props as any).color = newColor;
    } else if (component.type === 'ProgressBar') {
      component.props.color = newColor;
    } else if (component.type === 'Slider') {
      component.props.color = newColor;
    } else if (component.type === 'ToggleSwitch') {
      component.props.color = newColor;
    }

    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
    setEditingComponent({ ...editingComponent, component });
  };

  const handleFontChange = (newFont: string) => {
    if (!editingComponent) return;

    const updatedScreens = [...screens];
    const component = updatedScreens[editingComponent.screenIndex].components[editingComponent.componentIndex];
    
    // Get the font stack based on the selected font
    let fontStack = newFont;
    switch (newFont) {
      // Modern Sans-Serifs
      case 'Clash Display':
        fontStack = "'Clash Display', 'Helvetica Neue', Arial, sans-serif";
        break;
      case 'Tenor Sans':
        fontStack = "'Tenor Sans', 'Century Gothic', Futura, sans-serif";
        break;
      
      // Elegant Serifs
      case 'Cormorant Garamond':
        fontStack = "'Cormorant Garamond', Garamond, 'Times New Roman', serif";
        break;
      case 'Cardo':
        fontStack = "'Cardo', 'Palatino Linotype', 'Book Antiqua', serif";
        break;
      case 'Gilda Display':
        fontStack = "'Gilda Display', Didot, 'Bodoni MT', serif";
        break;
      case 'Spectral':
        fontStack = "'Spectral', Georgia, 'Times New Roman', serif";
        break;
      case 'Marcellus':
        fontStack = "'Marcellus', 'Trajan Pro', Trajan, serif";
        break;
      
      // Previous Fonts
      case 'Playfair Display':
        fontStack = "'Playfair Display', 'Times New Roman', serif";
        break;
      case 'Inter':
        fontStack = "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        break;
      case 'DM Sans':
        fontStack = "'DM Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        break;
    }

    // Update customStyles to override theme font
    if (!component.customStyles) {
      component.customStyles = {};
    }
    component.customStyles.fontFamily = fontStack;

    // Also update styles for backward compatibility
    if (!component.styles) {
      component.styles = {};
    }
    component.styles.fontFamily = fontStack;

    // Update props style for immediate preview
    if (!component.props) {
      component.props = {};
    }
    if (!component.props.style) {
      component.props.style = {};
    }
    component.props.style.fontFamily = fontStack;

    // Update theme if this is a Title component
    if (component.type === 'Title' && flow?.theme) {
      const updatedTheme = {
        ...flow.theme,
        fontFamily: fontStack
      };
      setFlow(prev => prev ? { ...prev, theme: updatedTheme } : null);
    }

    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
    setEditingComponent({ ...editingComponent, component });
  };

  const handleFontWeightChange = (newWeight: string) => {
    if (!editingComponent) return;

    const updatedScreens = [...screens];
    const component = updatedScreens[editingComponent.screenIndex].components[editingComponent.componentIndex];
    
    // Update font weight for text components
    if (component.type === 'Title') {
      component.props.fontWeight = newWeight as any;
    }

    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
    setEditingComponent({ ...editingComponent, component });
  };

  const getCurrentScreen = () => {
    return screens[currentScreenIndex] || null;
  };

  const handleDeploy = async () => {
    if (!flow || screens.length === 0) {
      toast('No screens to deploy', { icon: '⚠️' });
      return;
    }

    setIsDeploying(true);
    try {
      // Save current changes first
      await saveScreensToDatabase();
      
      // Generate the public URL
      const baseUrl = window.location.origin;
      const publicUrl = `${baseUrl}?preview=${project.id}`;
      
      setDeployedUrl(publicUrl);
      setShowDeployModal(true);
      
      toast('🚀 Project deployed successfully!');
    } catch (error) {
      console.error('❌ Deploy error:', error);
      toast('Failed to deploy project', { icon: '❌' });
    } finally {
      setIsDeploying(false);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast('📋 Link copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      toast('Failed to copy link', { icon: '❌' });
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const regenerateAIScreen = async () => {
    const currentScreen = getCurrentScreen();
    if (!currentScreen) return;
    
    toast('🎨 Regenerating AI content...', { icon: '⏳' });
    
    // Here you could call the AI generator again to create new content
    // For now, we'll show a placeholder
    setTimeout(() => {
      toast('AI regeneration feature coming soon!', { icon: '🚧' });
    }, 1000);
  };

  const convertToComponentScreen = () => {
    const currentScreen = getCurrentScreen();
    if (!currentScreen || currentScreen.components[0].type !== 'HTML') return;
    
    toast('🔄 Converting to component-based screen...', { icon: '⏳' });
    
    // For now, this is a placeholder - in the future you could parse HTML and convert to components
    setTimeout(() => {
      toast('Component conversion feature coming soon!', { icon: '🚧' });
    }, 1000);
  };

    const renderEditingPanel = () => {
    const currentScreen = getCurrentScreen();
    const isAIHTMLScreen = currentScreen && currentScreen.components.length === 1 && currentScreen.components[0].type === 'HTML';
    
    // Show HTML component editor when editing HTML components
    if (htmlComponentEditor) {
      return (
        <div className="bg-white border-l border-gray-200 w-80 flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Edit HTML Component</h3>
              <button
                onClick={() => setHtmlComponentEditor(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-gray-500">Component ID: {htmlComponentEditor.componentId}</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HTML Content
                </label>
                <textarea
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  value={htmlComponentEditor.content}
                  onChange={(e) => setHtmlComponentEditor({
                    ...htmlComponentEditor,
                    content: e.target.value
                  })}
                  placeholder="Edit the HTML content..."
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Update the screen with new HTML content
                    const updatedScreens = [...screens];
                    if (updatedScreens[currentScreenIndex]?.components[0]?.type === 'HTML') {
                      (updatedScreens[currentScreenIndex].components[0] as any).props.html = htmlComponentEditor.content;
                      setScreens(updatedScreens);
                      setHtmlComponentEditor(null);
                      toast.success('HTML component updated');
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setHtmlComponentEditor(null)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Show component library when not editing any specific component
    if (!isEditing || !editingComponent) {
      return (
        <div className="bg-white border-l border-gray-200 w-80 flex-shrink-0 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                {isAIHTMLScreen ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isAIHTMLScreen ? 'AI-Generated Screen' : 'Components'}
                </h3>
                <p className="text-sm text-gray-500">
                  {isAIHTMLScreen ? 'Add components below' : 'Drag & drop to build'}
                </p>
              </div>
            </div>
            
            {isAIHTMLScreen ? (
              <div className="bg-purple-100/50 rounded-lg p-3 text-sm text-purple-700">
                🎨 <strong>AI Screen:</strong> This screen was generated by AI. You can add additional components below the AI content.
              </div>
            ) : (
              <div className="bg-blue-100/50 rounded-lg p-3 text-sm text-blue-700">
                💡 <strong>Tip:</strong> Drag components to the mobile preview to add them to your screen
              </div>
            )}
          </div>
          
          {isAIHTMLScreen && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-2">AI Content Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => regenerateAIScreen()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Regenerate AI Content
                </button>
                <button
                  onClick={() => convertToComponentScreen()}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Convert to Components
                </button>
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            <ComponentLibrary />
          </div>
        </div>
      );
    }

    const { component } = editingComponent;
    
    return (
      <div className="bg-white border-l border-gray-200 p-6 w-80 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit {component.type}</h3>
          <button
            onClick={() => setIsEditing(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Text Editing */}
          {(component.type === 'Title' || component.type === 'Button' || component.type === 'Input' || component.type === 'Card' || component.type === 'CardGrid') && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {component.type === 'Input' ? 'Placeholder' : 
                   component.type === 'CardGrid' ? 'Title' : 'Text'}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={
                    component.type === 'Title' ? component.props.text :
                    component.type === 'Button' ? component.props.text :
                    component.type === 'Input' ? component.props.placeholder :
                    component.type === 'Card' ? component.props.title :
                    component.type === 'CardGrid' ? component.props.title : ''
                  }
                  onChange={(e) => handleTextChange(e.target.value)}
                />
              </div>
              
              {/* Input Label Editing */}
              {component.type === 'Input' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Label
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={component.props.label || ''}
                    onChange={(e) => handleInputLabelChange(e.target.value)}
                    placeholder="Enter label text"
                  />
                </div>
              )}
            </div>
          )}

          {/* Color Controls */}
          {(component.type === 'Title' || component.type === 'Button' || component.type === 'Input' || component.type === 'OptionGroup' || component.type === 'ProgressBar' || component.type === 'Slider' || component.type === 'ToggleSwitch') && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Color</h4>
              
              {/* Current Color Display */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div 
                  className="w-4 h-4 rounded border border-gray-300"
                                      style={{ backgroundColor: (
                      component.type === 'Title' ? component.props.color : 
                      component.type === 'Button' ? component.props.style?.backgroundColor :
                      component.type === 'OptionGroup' ? (component.props as any).color :
                      component.type === 'ProgressBar' ? component.props.color :
                      component.type === 'Slider' ? component.props.color :
                      component.type === 'ToggleSwitch' ? component.props.color :
                      '#000000'
                    ) || '#000000' }}
                />
                                  <span>Current: {(
                    component.type === 'Title' ? component.props.color : 
                    component.type === 'Button' ? (component.props as any).color :
                    component.type === 'OptionGroup' ? (component.props as any).color :
                    component.type === 'ProgressBar' ? component.props.color :
                    component.type === 'Slider' ? component.props.color :
                    component.type === 'ToggleSwitch' ? component.props.color :
                    '#000000'
                  ) || '#000000'}</span>
              </div>
              
              {/* Color Palette */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Quick Colors
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-colors ${
                                                  (
                            component.type === 'Title' ? component.props.color : 
                            component.type === 'Button' ? component.props.style?.backgroundColor :
                            component.type === 'OptionGroup' ? (component.props as any).color :
                            component.type === 'ProgressBar' ? component.props.color :
                            component.type === 'Slider' ? component.props.color :
                            component.type === 'ToggleSwitch' ? component.props.color :
                            '#000000'
                          ) === color 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        setHexInput(color);
                        setCustomColor(color);
                        handleColorChange(color);
                      }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
              
              {/* Custom Color Picker */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Custom Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                                          value={(
                        component.type === 'Title' ? component.props.color : 
                        component.type === 'Button' ? component.props.style?.backgroundColor :
                        component.type === 'OptionGroup' ? (component.props as any).color :
                        component.type === 'ProgressBar' ? component.props.color :
                        component.type === 'Slider' ? component.props.color :
                        component.type === 'ToggleSwitch' ? component.props.color :
                        '#000000'
                      ) || customColor}
                    onChange={(e) => {
                      const color = e.target.value;
                      setCustomColor(color);
                      setHexInput(color);
                      handleColorChange(color);
                    }}
                    className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                    title="Pick custom color"
                  />
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => {
                      const color = e.target.value;
                      setHexInput(color);
                      
                      // Validate hex color format and update component if valid
                      if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
                        setCustomColor(color);
                        handleColorChange(color);
                      }
                    }}
                    onBlur={(e) => {
                      // On blur, try to fix common hex color issues
                      let color = e.target.value;
                      if (!color.startsWith('#')) {
                        color = '#' + color;
                      }
                      if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
                        setHexInput(color);
                        setCustomColor(color);
                        handleColorChange(color);
                      } else {
                        // Reset to current component color if invalid
                        const currentColor = (
                          component.type === 'Title' ? component.props.color : 
                          component.type === 'Button' ? component.props.style?.backgroundColor :
                          component.type === 'OptionGroup' ? (component.props as any).color :
                          component.type === 'ProgressBar' ? component.props.color :
                          component.type === 'Slider' ? component.props.color :
                          component.type === 'ToggleSwitch' ? component.props.color :
                          '#000000'
                        ) || '#000000';
                        setHexInput(currentColor);
                      }
                    }}
                    placeholder="#000000"
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Typography Controls */}
          {(component.type === 'Title' || component.type === 'Button') && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 border-b pb-1">Typography</h4>
              
              {/* Font Family */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Font Family
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={(() => {
                    // Check all font sources in precedence order
                    const propsFont = (component.props as any).style?.fontFamily;
                    const customFont = component.customStyles?.fontFamily;
                    const baseFont = component.styles?.fontFamily;
                    
                    const currentFont = propsFont || customFont || baseFont || 'Inter';
                    
                    // Extract just the font name (first part before comma) and remove quotes
                    return currentFont.split(',')[0].replace(/['"]/g, '').trim();
                  })()}
                  onChange={(e) => handleFontChange(e.target.value)}
                >
                  {fontStyles.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Weight */}
              {component.type === 'Title' && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Font Weight
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={component.props.fontWeight || 'normal'}
                    onChange={(e) => handleFontWeightChange(e.target.value)}
                  >
                    {fontWeights.map((weight) => (
                      <option key={weight.value} value={weight.value}>
                        {weight.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Component-specific properties */}
          {component.type === 'Title' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variant
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={(component.props as any).variant || 'h2'}
                onChange={(e) => {
                  const updatedScreens = [...screens];
                  const titleComponent = updatedScreens[editingComponent.screenIndex].components[editingComponent.componentIndex];
                  if (titleComponent.type === 'Title') {
                    (titleComponent.props as any).variant = e.target.value;
                  }
                  setScreens(updatedScreens);
                  setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
                }}
              >
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="body">Body Text</option>
                <option value="caption">Caption</option>
              </select>
            </div>
          )}

          {/* Additional properties based on component type */}
          {component.type === 'Card' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={component.props.content || ''}
                onChange={(e) => {
                  const updatedScreens = [...screens];
                  const cardComponent = updatedScreens[editingComponent.screenIndex].components[editingComponent.componentIndex];
                  if (cardComponent.type === 'Card') {
                    cardComponent.props.content = e.target.value;
                  }
                  setScreens(updatedScreens);
                  setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
                }}
              />
            </div>
          )}

          {/* Button properties */}
          {component.type === 'Button' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={component.props.variant || 'primary'}
                onChange={(e) => {
                  const updatedScreens = [...screens];
                  const buttonComponent = updatedScreens[editingComponent.screenIndex].components[editingComponent.componentIndex];
                  if (buttonComponent.type === 'Button') {
                    buttonComponent.props.variant = e.target.value as any;
                  }
                  setScreens(updatedScreens);
                  setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
                }}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
          )}

          {/* Padding Controls */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
              </svg>
              Padding
            </h4>
            <div className="grid grid-cols-3 gap-2 items-center">
              {/* Top */}
              <div></div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 text-center">Top</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                  value={component.props.paddingTop || 0}
                  onChange={(e) => handlePaddingChange('paddingTop', parseInt(e.target.value) || 0)}
                />
              </div>
              <div></div>
              
              {/* Left and Right */}
              <div>
                <label className="block text-xs text-gray-500 mb-1 text-center">Left</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                  value={component.props.paddingLeft || 0}
                  onChange={(e) => handlePaddingChange('paddingLeft', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 rounded bg-gray-50 flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 text-center">Right</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                  value={component.props.paddingRight || 0}
                  onChange={(e) => handlePaddingChange('paddingRight', parseInt(e.target.value) || 0)}
                />
              </div>
              
              {/* Bottom */}
              <div></div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 text-center">Bottom</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
                  value={component.props.paddingBottom || 0}
                  onChange={(e) => handlePaddingChange('paddingBottom', parseInt(e.target.value) || 0)}
                />
              </div>
              <div></div>
            </div>
            
            {/* Padding Presets */}
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-2">Quick Presets</label>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePaddingPreset(0)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  None
                </button>
                <button
                  onClick={() => handlePaddingPreset(8)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Small
                </button>
                <button
                  onClick={() => handlePaddingPreset(16)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Medium
                </button>
                <button
                  onClick={() => handlePaddingPreset(24)}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                >
                  Large
                </button>
              </div>
            </div>
          </div>

          {/* Component Ordering */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Position
            </h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleMoveComponent('up')}
                disabled={editingComponent.componentIndex === 0}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Move Up
              </button>
              <button
                onClick={() => handleMoveComponent('down')}
                disabled={editingComponent.componentIndex === screens[editingComponent.screenIndex].components.length - 1}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Move Down
              </button>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500">
                Position {editingComponent.componentIndex + 1} of {screens[editingComponent.screenIndex].components.length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Done
          </button>
        </div>
      </div>
    );
  };

  const handleEditFromMobileFrame = (componentIndex: number) => {
    handleComponentEdit(currentScreenIndex, componentIndex);
    
    // Initialize hex input with current color
    const component = screens[currentScreenIndex].components[componentIndex];
    if (component.type === 'Title' && component.props.color) {
      setHexInput(component.props.color);
      setCustomColor(component.props.color);
    }
  };

  const handleDeleteFromMobileFrame = (componentIndex: number) => {
    handleComponentDelete(currentScreenIndex, componentIndex);
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Check if dropping on the mobile screen
    const currentScreen = getCurrentScreen();
    if (!currentScreen) return;

    const expectedDropZoneId = `mobile-screen-${currentScreen.id}`;
    
    // Check if dragging a new component from library and dropping on the mobile screen
    if (active.data.current?.type && active.data.current?.content && 
        over.id === expectedDropZoneId) {
      const componentType = active.data.current.type;
      const componentContent = active.data.current.content;
      
      // Add new component to current screen using template data
      handleAddComponentToScreen(componentType, componentContent);
      
      toast.success(`Added ${componentType.replace(/-/g, ' ')} to your screen`);
    }
  };

  const handleAddComponentToScreen = (type: string, templateContent: any) => {
    const currentScreen = getCurrentScreen();
    if (!currentScreen) return;

    // Map component library types to UI schema component types
    const typeMapping: Record<string, string> = {
      'headline': 'Title',
      'subheadline': 'Title', 
      'paragraph': 'Card',
      'cta': 'Button',
      'text-input': 'Input',
      'link': 'Button',
      'feature-list': 'Card',
      'testimonial': 'Card',
      'alert': 'Card',
      'permission-request': 'Card',
      'spacer': 'Card',
      'icon': 'Card',
      'footer': 'Card',
      'bottom-sheet': 'BottomSheet'
    };

    const mappedType = typeMapping[type] || 'Card';
    
    // Create new component based on template
    const newComponent: UIComponent = {
      id: `comp_${Date.now()}`,
      type: mappedType as any,
      props: convertTemplateToProps(type, templateContent, mappedType)
    };

    // Add to current screen - even if it's an AI HTML screen
    const updatedScreens = [...screens];
    updatedScreens[currentScreenIndex].components.push(newComponent);
    
    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
    
    // Show appropriate message based on screen type
    const isAIScreen = currentScreen.components.length === 1 && currentScreen.components[0].type === 'HTML';
    const componentName = mappedType.replace(/([A-Z])/g, ' $1').toLowerCase();
    
    if (isAIScreen) {
      toast.success(`Added ${componentName} below AI content`);
    } else {
      toast.success(`Added ${componentName} to your screen`);
    }
  };

  const convertTemplateToProps = (originalType: string, templateContent: any, _mappedType: string) => {
    // Base props that all components should have
    const baseProps = {
      paddingTop: 8,
      paddingRight: 16,
      paddingBottom: 8,
      paddingLeft: 16
    };

    // Convert component library content to UI schema props
    switch (originalType) {
      case 'headline':
      case 'subheadline':
        return {
          ...baseProps,
          text: templateContent.headline || templateContent.subheadline || 'New Title',
          fontSize: originalType === 'headline' ? 28 : 20,
          fontWeight: originalType === 'headline' ? 'bold' : 'medium',
          color: '#1F2937',
          textAlign: 'center'
        };
      
      case 'cta':
      case 'link':
        return {
          ...baseProps,
          text: templateContent.button_text || templateContent.text || 'Button',
          backgroundColor: '#3B82F6',
          textColor: '#FFFFFF',
          borderRadius: 8,
          padding: 16
        };
      
      case 'text-input':
        return {
          ...baseProps,
          placeholder: templateContent.placeholder || 'Enter text...',
          label: templateContent.label || 'Input',
          required: templateContent.required || false
        };
      
      case 'bottom-sheet':
        return {
          ...baseProps,
          title: templateContent.title || 'More Information',
          content: templateContent.content || 'Additional details and information.',
          trigger_text: templateContent.trigger_text || 'Show Details',
          action_text: templateContent.action_text || 'Got it!',
          variant: templateContent.variant || 'default'
        };
      
      case 'paragraph':
      case 'feature-list':
      case 'testimonial':
      case 'alert':
      case 'permission-request':
      case 'spacer':
      case 'icon':
      case 'footer':
        return {
          ...baseProps,
          title: templateContent.title || templateContent.headline || getDefaultTitle(originalType),
          description: templateContent.description || templateContent.text || templateContent.message || getDefaultDescription(originalType),
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          padding: 16
        };
      
      default:
        return {
          ...baseProps,
          text: 'New Component',
          color: '#1F2937'
        };
    }
  };

  const getDefaultTitle = (type: string): string => {
    const titles: Record<string, string> = {
      'paragraph': 'Text Content',
      'feature-list': 'Amazing Features',
      'testimonial': 'Customer Review',
      'alert': 'Important Notice',
      'permission-request': 'Permission Required',
      'spacer': '',
      'icon': '',
      'footer': 'Footer'
    };
    return titles[type] || 'New Component';
  };

  const getDefaultDescription = (type: string): string => {
    const descriptions: Record<string, string> = {
      'paragraph': 'Add your compelling text content here.',
      'feature-list': '• Amazing Feature 1\n• Incredible Feature 2\n• Fantastic Feature 3',
      'testimonial': '"This product changed my life!" - Happy Customer',
      'alert': 'This is an important message for users.',
      'permission-request': 'We need your permission to provide the best experience.',
      'spacer': '',
      'icon': '⭐',
      'footer': 'Copyright © 2024'
    };
    return descriptions[type] || 'Component description';
  };

  // Padding change handler
  const handlePaddingChange = (side: 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft', value: number) => {
    if (!editingComponent) return;
    
    const updatedScreens = [...screens];
    const component = updatedScreens[editingComponent.screenIndex].components[editingComponent.componentIndex];
    
    // Initialize padding props if they don't exist
    if (!component.props.paddingTop) component.props.paddingTop = 0;
    if (!component.props.paddingRight) component.props.paddingRight = 0;
    if (!component.props.paddingBottom) component.props.paddingBottom = 0;
    if (!component.props.paddingLeft) component.props.paddingLeft = 0;
    
    component.props[side] = value;
    
    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
  };

  // Padding preset handler
  const handlePaddingPreset = (value: number) => {
    if (!editingComponent) return;
    
    const updatedScreens = [...screens];
    const component = updatedScreens[editingComponent.screenIndex].components[editingComponent.componentIndex];
    
    component.props.paddingTop = value;
    component.props.paddingRight = value;
    component.props.paddingBottom = value;
    component.props.paddingLeft = value;
    
    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
  };

  // Component movement handler
  const handleMoveComponent = (direction: 'up' | 'down') => {
    if (!editingComponent) return;
    
    const updatedScreens = [...screens];
    const components = updatedScreens[editingComponent.screenIndex].components;
    const currentIndex = editingComponent.componentIndex;
    
    if (direction === 'up' && currentIndex > 0) {
      // Swap with previous component
      [components[currentIndex], components[currentIndex - 1]] = [components[currentIndex - 1], components[currentIndex]];
      
      // Update editing component index
      setEditingComponent({
        ...editingComponent,
        componentIndex: currentIndex - 1
      });
    } else if (direction === 'down' && currentIndex < components.length - 1) {
      // Swap with next component  
      [components[currentIndex], components[currentIndex + 1]] = [components[currentIndex + 1], components[currentIndex]];
      
      // Update editing component index
      setEditingComponent({
        ...editingComponent,
        componentIndex: currentIndex + 1
      });
    }
    
    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
  };

  const handleBackgroundChange = (property: 'bgType' | 'bgValue', value: string) => {
    const updatedScreens = [...screens];
    const screen = updatedScreens[currentScreenIndex];
    
    if (property === 'bgType') {
      screen.bgType = value as any;
      // Set default values for different background types
      if (value === 'color') {
        screen.bgValue = '#FFFFFF';
        setBgHexInput('#FFFFFF');
      } else if (value === 'gradient') {
        screen.bgValue = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        setBgHexInput('#667eea');
      }
    } else if (property === 'bgValue') {
      screen.bgValue = value;
    }
    
    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
  };

  const handleAdvancedBackgroundChange = (bgType: 'color' | 'gradient' | 'image', bgValue: string, overlayColor?: string) => {
    const updatedScreens = [...screens];
    const screen = updatedScreens[currentScreenIndex];
    
    screen.bgType = bgType;
    screen.bgValue = bgValue;
    screen.overlayColor = overlayColor;
    
    // Update hex input for consistency
    if (bgType === 'color') {
      setBgHexInput(bgValue);
    }
    
    setScreens(updatedScreens);
    setFlow(prev => prev ? { ...prev, screens: updatedScreens } : null);
  };

  const handleBackgroundColorChange = (newColor: string) => {
    const screen = getCurrentScreen();
    if (!screen) return;

    if (screen.bgType === 'color') {
      handleBackgroundChange('bgValue', newColor);
    } else if (screen.bgType === 'gradient') {
      // For gradients, replace the first color in the gradient
      const newGradient = `linear-gradient(135deg, ${newColor} 0%, #764ba2 100%)`;
      handleBackgroundChange('bgValue', newGradient);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!flow || screens.length === 0) {
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
                  <p className="text-sm text-gray-500">Mobile Screen Editor</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Smartphone size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Mobile Screens Found</h2>
            <p className="text-gray-600 mb-6">
              This project doesn't have any mobile screens yet. You can create screens by running the 
              project wizard again or check if the project was created properly.
            </p>
            <div className="space-y-3">
              <button onClick={onBack} className="btn-primary w-full">
                Go Back to Dashboard
              </button>
              <p className="text-sm text-gray-500">
                Tip: Try creating a new project to generate mobile screens automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
                <p className="text-sm text-gray-500">Mobile Screen Editor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeploy}
                disabled={isDeploying || saving}
                className="btn-secondary flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
              >
                {isDeploying ? <LoadingSpinner size="sm" /> : <Share size={16} />}
                Deploy
              </button>
              
              <button
                onClick={saveScreensToDatabase}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? <LoadingSpinner size="sm" /> : <Save size={16} />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Screen Navigation */}
          <div className="w-80 flex-shrink-0 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Screens ({screens.length})
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {screens.map((screen, index) => (
                  <button
                    key={screen.id}
                    onClick={() => {
                      console.log('🔄 Switching to screen:', index, screen.name);
                      setCurrentScreenIndex(index);
                    }}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      index === currentScreenIndex
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{screen.name}</div>
                    <div className="text-sm text-gray-500">
                      {screen.components.length} components
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Navigation Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
              <button
                onClick={() => setCurrentScreenIndex(Math.max(0, currentScreenIndex - 1))}
                disabled={currentScreenIndex === 0}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Previous
              </button>
              
              <span className="text-sm text-gray-600">
                {currentScreenIndex + 1} of {screens.length}
              </span>
              
              <button
                onClick={() => setCurrentScreenIndex(Math.min(screens.length - 1, currentScreenIndex + 1))}
                disabled={currentScreenIndex === screens.length - 1}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50"
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>

            {/* Background Editor */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Screen Background</h4>
                {getCurrentScreen() && getCurrentScreen()?.components.length === 1 && getCurrentScreen()?.components[0].type === 'HTML' ? (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    AI-Controlled
                  </span>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowBackgroundEditor(!showBackgroundEditor)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      {showBackgroundEditor ? 'Hide' : 'Quick Edit'}
                    </button>
                    <button
                      onClick={() => setShowAdvancedBackgroundEditor(true)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <ImageIcon size={14} />
                      Edit Background
                    </button>
                  </div>
                )}
              </div>
              
              {/* Quick Background Editor */}
              {showBackgroundEditor && !(getCurrentScreen()?.components.length === 1 && getCurrentScreen()?.components[0].type === 'HTML') && (
                <div className="space-y-3">
                  {/* Background Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Background Type
                    </label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={getCurrentScreen()?.bgType || 'color'}
                      onChange={(e) => handleBackgroundChange('bgType', e.target.value)}
                    >
                      <option value="color">Solid Color</option>
                      <option value="gradient">Gradient</option>
                      <option value="image">Custom Image</option>
                    </select>
                  </div>

                  {/* Background Color */}
                  {getCurrentScreen()?.bgType === 'color' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Background Color
                      </label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={getCurrentScreen()?.bgValue || '#FFFFFF'}
                          onChange={(e) => {
                            setBgHexInput(e.target.value);
                            handleBackgroundColorChange(e.target.value);
                          }}
                          className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={bgHexInput}
                          onChange={(e) => {
                            const color = e.target.value;
                            setBgHexInput(color);
                            if (/^#[0-9A-F]{6}$/i.test(color) || /^#[0-9A-F]{3}$/i.test(color)) {
                              handleBackgroundColorChange(color);
                            }
                          }}
                          placeholder="#FFFFFF"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Quick Gradient Presets */}
                  {getCurrentScreen()?.bgType === 'gradient' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Quick Gradients
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                        ].map((gradient, index) => (
                          <button
                            key={index}
                            onClick={() => handleBackgroundChange('bgValue', gradient)}
                            className="h-8 rounded border border-gray-300 hover:border-gray-400"
                            style={{ background: gradient }}
                            title={`Gradient ${index + 1}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Use "Edit Background" for more options
                      </p>
                    </div>
                  )}

                  {/* Image URL Input */}
                  {getCurrentScreen()?.bgType === 'image' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        Image URL
                      </label>
                      <input
                        type="url"
                        value={getCurrentScreen()?.bgValue || ''}
                        onChange={(e) => handleBackgroundChange('bgValue', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use "Edit Background" for validation & overlay options
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Current Background Preview */}
              {getCurrentScreen() && (
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-2">Current Background</label>
                  <div 
                    className="h-12 w-full rounded-lg border border-gray-200 relative overflow-hidden"
                    style={{
                      backgroundColor: getCurrentScreen()?.bgType === 'color' ? getCurrentScreen()?.bgValue : undefined,
                      background: getCurrentScreen()?.bgType === 'gradient' ? getCurrentScreen()?.bgValue : 
                                getCurrentScreen()?.bgType === 'image' ? `url(${getCurrentScreen()?.bgValue})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {getCurrentScreen()?.overlayColor && (
                      <div 
                        className="absolute inset-0"
                        style={{ backgroundColor: getCurrentScreen()?.overlayColor }}
                      />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                        {getCurrentScreen()?.bgType === 'color' ? 'Color' :
                         getCurrentScreen()?.bgType === 'gradient' ? 'Gradient' : 'Image'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {getCurrentScreen()?.components.length === 1 && getCurrentScreen()?.components[0].type === 'HTML' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="text-purple-600 mt-0.5">🎨</div>
                    <div>
                      <p className="text-sm text-purple-800 font-medium">AI-Generated Background</p>
                      <p className="text-sm text-purple-700">
                        This screen's background is generated and controlled by AI. Use "Regenerate AI Content" to create a new design.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How to Edit</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Hover over components in the preview to see edit options</li>
                <li>• Click the edit icon to modify text and colors</li>
                <li>• Click the trash icon to remove components</li>
                <li>• Changes are applied in real-time</li>
              </ul>
            </div>
          </div>

          {/* Screen Preview */}
          <div className="flex justify-center flex-1">
            <div className="relative">
              <MobileFrame
                flow={flow}
                currentScreenIndex={currentScreenIndex}
                onScreenChange={setCurrentScreenIndex}
                showNavigation={false}
                editMode={true}
                onEditComponent={handleEditFromMobileFrame}
                onDeleteComponent={handleDeleteFromMobileFrame}
              />
            </div>
          </div>

          {/* Editing Panel */}
          {renderEditingPanel()}
        </div>
      </div>

      {/* Deploy Modal */}
      {showDeployModal && deployedUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Share size={20} className="text-green-600" />
                  Project Deployed!
                </h3>
                <button
                  onClick={() => setShowDeployModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <p className="text-gray-600 mb-4">
                Your mobile app preview is now live! Share this link to let others view your design.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Preview URL:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={deployedUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(deployedUrl)}
                    className="btn-secondary p-2"
                    title="Copy to clipboard"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => openInNewTab(deployedUrl)}
                    className="btn-secondary p-2"
                    title="Open in new tab"
                  >
                    <ExternalLink size={16} />
                  </button>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-0.5">ℹ️</div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Note:</p>
                    <p className="text-sm text-blue-700">
                      This link provides public access to your mobile app preview. 
                      No login is required - anyone with this link can view your design.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowDeployModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => openInNewTab(deployedUrl)}
                className="btn-primary flex items-center gap-2"
              >
                <ExternalLink size={16} />
                View Preview
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Drag Overlay */}
      <DragOverlay>
        {activeId && (
          <div className="bg-white border-2 border-blue-300 rounded-lg p-4 shadow-2xl opacity-95 transform rotate-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {activeId.toString().replace(/-/g, ' ')}
              </p>
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
              </svg>
              Drop on the mobile preview to add
            </div>
          </div>
        )}
      </DragOverlay>

      {/* Advanced Background Editor Modal */}
      {showAdvancedBackgroundEditor && getCurrentScreen() && (
        <BackgroundEditor
          screen={getCurrentScreen()!}
          onBackgroundChange={handleAdvancedBackgroundChange}
          onClose={() => setShowAdvancedBackgroundEditor(false)}
        />
      )}
      </div>
    </DndContext>
  );
} 