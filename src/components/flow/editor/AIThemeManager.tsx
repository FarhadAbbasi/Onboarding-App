import React, { useState, useEffect } from 'react';
import { Wand2, Palette, Save, RefreshCw, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  generateProjectTheme, 
  generateComponentCustomizations,
  applyThemeToDocument,
  type AIGeneratedTheme,
  type ComponentCustomization 
} from '../../../lib/aiThemeGenerator';
import { supabase } from '../../../lib/supabase';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { ThemeTransitionWrapper } from '../../ui/ThemeTransitionWrapper';

interface AIThemeManagerProps {
  projectId: string;
  projectName: string;
  projectCategory: string;
  projectDescription?: string;
  targetAudience?: string;
  brandPersonality?: string;
  openaiKey: string;
  onThemeGenerated?: (theme: AIGeneratedTheme) => void;
  onCustomizationsReady?: (customizations: ComponentCustomization[]) => void;
}

export const AIThemeManager: React.FC<AIThemeManagerProps> = ({
  projectId,
  projectName,
  projectCategory,
  projectDescription = '',
  targetAudience = 'general users',
  brandPersonality = 'modern and friendly',
  openaiKey,
  onThemeGenerated,
  onCustomizationsReady
}) => {
  const [currentTheme, setCurrentTheme] = useState<AIGeneratedTheme | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customInputs, setCustomInputs] = useState({
    description: projectDescription,
    audience: targetAudience,
    personality: brandPersonality,
    preferredColors: [] as string[]
  });

  // Load existing theme on mount
  useEffect(() => {
    loadExistingTheme();
  }, [projectId]);

  const loadExistingTheme = async () => {
    try {
      const { data, error } = await supabase
        .from('project_themes')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (data && !error) {
        const theme = JSON.parse(data.theme_data) as AIGeneratedTheme;
        setCurrentTheme(theme);
        applyThemeToDocument(theme);
      }
    } catch (error) {
      console.log('No existing theme found, will generate new one');
    }
  };

  const generateNewTheme = async () => {
    if (!openaiKey.trim()) {
      toast.error('Please provide your OpenAI API key');
      return;
    }

    setIsGenerating(true);
    try {
      const theme = await generateProjectTheme(
        openaiKey,
        projectName,
        projectCategory,
        customInputs.description || `A ${projectCategory} app called ${projectName}`,
        customInputs.audience,
        customInputs.personality,
        customInputs.preferredColors.length > 0 ? customInputs.preferredColors : undefined
      );

      setCurrentTheme(theme);
      await saveTheme(theme);
      
      if (onThemeGenerated) {
        onThemeGenerated(theme);
      }
      
      toast.success(`✨ Generated "${theme.name}" theme!`);
    } catch (error) {
      console.error('Theme generation error:', error);
      toast.error('Failed to generate theme. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyTheme = async () => {
    if (!currentTheme) return;

    setIsApplying(true);
    try {
      applyThemeToDocument(currentTheme);
      
      // Generate component customizations based on the theme
      if (openaiKey.trim()) {
        const mockComponents = [
          { type: 'headline', content: {}, context: 'main page title' },
          { type: 'cta', content: {}, context: 'primary action button' },
          { type: 'feature-list', content: {}, context: 'key features showcase' },
          { type: 'testimonial', content: {}, context: 'customer testimonial' }
        ];

        const customizations = await generateComponentCustomizations(
          openaiKey,
          currentTheme,
          mockComponents,
          `${projectName} onboarding page`,
          customInputs.personality
        );

        if (onCustomizationsReady) {
          onCustomizationsReady(customizations);
        }
      }

      toast.success('🎨 Theme applied successfully!');
    } catch (error) {
      console.error('Theme application error:', error);
      toast.error('Failed to apply theme');
    } finally {
      setIsApplying(false);
    }
  };

  const saveTheme = async (theme: AIGeneratedTheme) => {
    try {
      await supabase
        .from('project_themes')
        .upsert({
          project_id: projectId,
          theme_name: theme.name,
          theme_data: JSON.stringify(theme),
          mood: theme.mood,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'project_id'
        });
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const exportTheme = () => {
    if (!currentTheme) return;
    
    const themeExport = {
      ...currentTheme,
      exportedAt: new Date().toISOString(),
      projectName,
      projectId
    };
    
    const blob = new Blob([JSON.stringify(themeExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Theme exported successfully!');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Theme Generator</h3>
            <p className="text-sm text-gray-500">Create custom themes with AI</p>
          </div>
        </div>
        {currentTheme && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
              {currentTheme.mood} theme
            </span>
          </div>
        )}
      </div>

      {/* Current Theme Preview */}
      {currentTheme && (
        <ThemeTransitionWrapper isChanging={isApplying}>
          <div className="p-4 rounded-lg border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900">{currentTheme.name}</h4>
                <p className="text-sm text-gray-500 capitalize">{currentTheme.mood} style</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={applyTheme}
                  disabled={isApplying}
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  {isApplying ? <LoadingSpinner size="sm" /> : <Wand2 className="w-3 h-3" />}
                  Apply
                </button>
                <button
                  onClick={exportTheme}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>
            
            {/* Color Palette Preview */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              <div 
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: currentTheme.primaryColors.main }}
                title="Primary"
              />
              <div 
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: currentTheme.primaryColors.light }}
                title="Primary Light"
              />
              <div 
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: currentTheme.secondaryColors.main }}
                title="Secondary"
              />
              <div 
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: currentTheme.secondaryColors.light }}
                title="Secondary Light"
              />
              <div 
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: currentTheme.neutralColors.background }}
                title="Background"
              />
              <div 
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: currentTheme.neutralColors.surface }}
                title="Surface"
              />
              <div 
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: currentTheme.neutralColors.text.primary }}
                title="Text Primary"
              />
              <div 
                className="w-8 h-8 rounded border-2 border-white shadow-sm"
                style={{ backgroundColor: currentTheme.neutralColors.border }}
                title="Border"
              />
            </div>
          </div>
        </ThemeTransitionWrapper>
      )}

      {/* Advanced Options */}
      <div className="space-y-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </button>

        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Description
              </label>
              <textarea
                value={customInputs.description}
                onChange={(e) => setCustomInputs(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={2}
                placeholder="Describe your app and its purpose..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={customInputs.audience}
                  onChange={(e) => setCustomInputs(prev => ({ ...prev, audience: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g., young professionals"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Personality
                </label>
                <input
                  type="text"
                  value={customInputs.personality}
                  onChange={(e) => setCustomInputs(prev => ({ ...prev, personality: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="e.g., modern, playful, professional"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <button
        onClick={generateNewTheme}
        disabled={isGenerating || !openaiKey.trim()}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
      >
        {isGenerating ? (
          <>
            <LoadingSpinner size="sm" />
            Generating Custom Theme...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            {currentTheme ? 'Generate New Theme' : 'Generate AI Theme'}
          </>
        )}
      </button>
    </div>
  );
}; 