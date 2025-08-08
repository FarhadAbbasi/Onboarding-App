import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIUIGenerator } from '../../lib/aiUIGenerator';
import type { UIScreen, UIFlow, AIGenerationContext } from '../../types/ui-schema';
import { MobileFrame } from '../ui/MobileFrame';

interface AIFlowGeneratorProps {
  context: AIGenerationContext;
  screenCount: number;
  onFlowComplete?: (flow: UIFlow) => void;
  onCancel?: () => void;
}

interface GenerationState {
  isGenerating: boolean;
  currentScreenIndex: number;
  totalScreens: number;
  generatedScreens: UIScreen[];
  currentScreen?: UIScreen;
  error?: string;
  completedFlow?: UIFlow;
}

const screenTypeNames = [
  'Welcome Screen',
  'App Introduction', 
  'Profile Setup',
  'Personal Information',
  'Preferences & Settings',
  'Feature Overview',
  'Customization',
  'Progress Summary',
  'Completion'
];

export const AIFlowGenerator: React.FC<AIFlowGeneratorProps> = ({
  context,
  screenCount,
  onFlowComplete,
  onCancel
}) => {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    currentScreenIndex: 0,
    totalScreens: screenCount,
    generatedScreens: []
  });

  const handleScreenGenerated = useCallback((screen: UIScreen, index: number, total: number) => {
    console.log(`📱 Screen generated: ${screen.name} (${index + 1}/${total})`);
    
    setState(prev => ({
      ...prev,
      currentScreenIndex: index + 1,
      generatedScreens: [...prev.generatedScreens, screen],
      currentScreen: screen
    }));
  }, []);

  const startGeneration = async () => {
    setState(prev => ({
      ...prev,
      isGenerating: true,
      currentScreenIndex: 0,
      generatedScreens: [],
      error: undefined,
      completedFlow: undefined
    }));

    try {
      const generator = new AIUIGenerator();
      const flow = await generator.generateFlow(
        'onboarding',
        screenCount,
        context,
        handleScreenGenerated
      );

      setState(prev => ({
        ...prev,
        isGenerating: false,
        completedFlow: flow
      }));

      onFlowComplete?.(flow);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Generation failed'
      }));
    }
  };

  const getProgressPercentage = () => {
    if (state.totalScreens === 0) return 0;
    return Math.round((state.currentScreenIndex / state.totalScreens) * 100);
  };

  const getCurrentScreenName = () => {
    if (!state.isGenerating) return 'Ready to generate';
    if (state.currentScreenIndex === 0) return 'Initializing AI generation...';
    if (state.currentScreenIndex <= state.generatedScreens.length) {
      return `Generating: ${screenTypeNames[state.currentScreenIndex] || `Screen ${state.currentScreenIndex + 1}`}`;
    }
    return `Creating screen ${state.currentScreenIndex + 1}...`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              AI Flow Generator
            </h2>
            <p className="text-gray-600 mt-1">
              Generating {screenCount} screens for {context.appName}
            </p>
          </div>
          {!state.isGenerating && !state.completedFlow && (
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={startGeneration}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Flow
              </button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {state.isGenerating && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {getCurrentScreenName()}
              </span>
              <span className="text-sm text-gray-500">
                {state.currentScreenIndex}/{state.totalScreens} screens
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getProgressPercentage()}% complete
            </p>
          </div>
        )}

        {/* Error State */}
        {state.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">Generation Error</p>
            </div>
            <p className="text-red-700 text-sm mt-1">{state.error}</p>
            <button
              onClick={startGeneration}
              className="mt-3 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Completion State */}
        {state.completedFlow && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">Generation Complete!</p>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Successfully generated {state.generatedScreens.length} AI-powered screens
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Generated Screens List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Generated Screens</h3>
            <div className="space-y-2">
              {Array.from({ length: state.totalScreens }, (_, index) => {
                const isGenerated = index < state.generatedScreens.length;
                const isCurrentlyGenerating = index === state.generatedScreens.length && state.isGenerating;
                const screenName = screenTypeNames[index] || `Screen ${index + 1}`;
                
                return (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      isGenerated 
                        ? 'bg-green-50 border-green-200' 
                        : isCurrentlyGenerating
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                    initial={{ opacity: 0.5 }}
                    animate={{ 
                      opacity: isGenerated ? 1 : isCurrentlyGenerating ? 0.9 : 0.5,
                      scale: isCurrentlyGenerating ? 1.02 : 1
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {isGenerated ? (
                        <motion.svg 
                          className="w-5 h-5 text-green-500" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </motion.svg>
                      ) : isCurrentlyGenerating ? (
                        <div className="w-5 h-5 animate-spin">
                          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gray-300" />
                      )}
                      <div>
                        <p className={`text-sm font-medium ${
                          isGenerated ? 'text-green-800' : isCurrentlyGenerating ? 'text-blue-800' : 'text-gray-500'
                        }`}>
                          {screenName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {isGenerated ? '✅ Generated' : isCurrentlyGenerating ? '🎨 Creating complex UI...' : '⏳ Waiting'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-8 overflow-y-auto bg-gray-50">
          {/* Waiting State */}
          {!state.isGenerating && state.generatedScreens.length === 0 && !state.error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Generate
                </h3>
                <p className="text-gray-600">
                  Click "Generate Flow" to start creating your AI-powered onboarding screens
                </p>
              </div>
            </motion.div>
          )}

          {/* Generated Screens Grid */}
          {state.generatedScreens.length > 0 && (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Generated Screens ({state.generatedScreens.length}/{state.totalScreens})
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {state.isGenerating ? 'Generating more screens...' : 'All screens generated successfully'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.generatedScreens.map((screen, index) => (
                  <motion.div
                    key={screen.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur"></div>
                    <div className="relative bg-white rounded-xl shadow-lg p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{screen.name}</h4>
                          <p className="text-xs text-gray-500">Screen {index + 1}</p>
                        </div>
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="transform scale-[0.6] origin-top">
                        <MobileFrame screen={screen} />
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {/* Placeholder for screens being generated */}
                {state.isGenerating && state.generatedScreens.length < state.totalScreens && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative"
                  >
                    <div className="bg-white rounded-xl shadow-lg p-4 h-full flex items-center justify-center min-h-[400px]">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 animate-pulse">
                          <div className="w-full h-full bg-blue-200 rounded-2xl flex items-center justify-center">
                            <div className="w-8 h-8 animate-spin">
                              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          Generating Screen {state.generatedScreens.length + 1}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {screenTypeNames[state.generatedScreens.length] || 'Next Screen'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIFlowGenerator;