import { useState, useEffect } from 'react';
import { Palette, ImageIcon, X, Check, Layers, Beaker } from 'lucide-react';
import toast from 'react-hot-toast';
import type { UIScreen } from '../../types/ui-schema';

interface BackgroundEditorProps {
  screen: UIScreen;
  onBackgroundChange: (bgType: 'color' | 'gradient' | 'image', bgValue: string, overlayColor?: string) => void;
  onClose: () => void;
}

interface GradientPreset {
  name: string;
  value: string;
  preview: string;
}

interface ColorPreset {
  name: string;
  value: string;
}

const gradientPresets: GradientPreset[] = [
  {
    name: 'Ocean Blue',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: 'from-blue-400 to-purple-500'
  },
  {
    name: 'Sunset',
    value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    preview: 'from-pink-400 to-red-500'
  },
  {
    name: 'Ocean Breeze',
    value: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    preview: 'from-blue-400 to-cyan-400'
  },
  {
    name: 'Forest Fresh',
    value: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    preview: 'from-green-400 to-teal-400'
  },
  {
    name: 'Golden Hour',
    value: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    preview: 'from-pink-400 to-yellow-400'
  },
  {
    name: 'Cotton Candy',
    value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    preview: 'from-teal-200 to-pink-200'
  },
  {
    name: 'Royal Purple',
    value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    preview: 'from-indigo-400 to-purple-600'
  },
  {
    name: 'Emerald Dream',
    value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    preview: 'from-teal-800 to-green-400'
  },
  {
    name: 'Fire Burst',
    value: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%)',
    preview: 'from-red-400 to-orange-400'
  },
  {
    name: 'Midnight Blues',
    value: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
    preview: 'from-slate-700 to-blue-500'
  },
  {
    name: 'Peachy Keen',
    value: 'linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)',
    preview: 'from-orange-300 to-yellow-400'
  },
  {
    name: 'Mystic Purple',
    value: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)',
    preview: 'from-purple-500 to-teal-400'
  }
];

const colorPresets: ColorPreset[] = [
  { name: 'Pure White', value: '#FFFFFF' },
  { name: 'Soft Gray', value: '#F8F9FA' },
  { name: 'Light Blue', value: '#E3F2FD' },
  { name: 'Mint Green', value: '#E8F5E8' },
  { name: 'Soft Pink', value: '#FCE4EC' },
  { name: 'Warm Beige', value: '#FFF8E1' },
  { name: 'Lavender', value: '#F3E5F5' },
  { name: 'Sky Blue', value: '#E1F5FE' },
  { name: 'Charcoal', value: '#2D3748' },
  { name: 'Deep Navy', value: '#1A202C' },
  { name: 'Rich Black', value: '#000000' },
  { name: 'Slate Gray', value: '#4A5568' }
];

export function BackgroundEditor({ screen, onBackgroundChange, onClose }: BackgroundEditorProps) {
  const [activeTab, setActiveTab] = useState<'image' | 'gradient' | 'color'>('image');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [overlayIntensity, setOverlayIntensity] = useState(40);
  const [overlayColor, setOverlayColor] = useState('#000000');
  const [gradientAngle, setGradientAngle] = useState(135);
  const [gradientColor1, setGradientColor1] = useState('#667eea');
  const [gradientColor2, setGradientColor2] = useState('#764ba2');
  const [customColor, setCustomColor] = useState('#FFFFFF');

  // Initialize state based on current screen background
  useEffect(() => {
    if (screen.bgType === 'image') {
      setActiveTab('image');
      setCustomImageUrl(screen.bgValue || '');
    } else if (screen.bgType === 'gradient') {
      setActiveTab('gradient');
      // Try to extract gradient colors if it's a linear gradient
      const gradientMatch = screen.bgValue?.match(/linear-gradient\((\d+)deg,\s*([^,]+)\s*\d+%,\s*([^)]+)\s*\d+%\)/);
      if (gradientMatch) {
        setGradientAngle(parseInt(gradientMatch[1]));
        setGradientColor1(gradientMatch[2].trim());
        setGradientColor2(gradientMatch[3].trim());
      }
    } else {
      setActiveTab('color');
      setCustomColor(screen.bgValue || '#FFFFFF');
    }

    // Set overlay if present
    if (screen.overlayColor) {
      const match = screen.overlayColor.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/);
      if (match) {
        setOverlayIntensity(Math.round(parseFloat(match[1]) * 100));
      }
    }
  }, [screen]);

  const validateImageUrl = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        resolve(false);
      }, 5000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };

      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      img.src = url;
    });
  };

  const handleImageUrlSubmit = async () => {
    if (!customImageUrl.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    setImageLoading(true);
    try {
      const isValid = await validateImageUrl(customImageUrl);
      
      if (isValid) {
        const overlay = overlayIntensity > 0 ? 
          `rgba(${parseInt(overlayColor.slice(1, 3), 16)}, ${parseInt(overlayColor.slice(3, 5), 16)}, ${parseInt(overlayColor.slice(5, 7), 16)}, ${overlayIntensity / 100})` 
          : undefined;
        onBackgroundChange('image', customImageUrl, overlay);
        toast.success('Background image updated successfully!');
      } else {
        toast.error('Unable to load the image. Please check the URL.');
      }
    } catch (error) {
      toast.error('Failed to validate image URL');
    } finally {
      setImageLoading(false);
    }
  };

  const handleOverlayChange = () => {
    if (customImageUrl.trim()) {
      const overlay = overlayIntensity > 0 ? 
        `rgba(${parseInt(overlayColor.slice(1, 3), 16)}, ${parseInt(overlayColor.slice(3, 5), 16)}, ${parseInt(overlayColor.slice(5, 7), 16)}, ${overlayIntensity / 100})` 
        : undefined;
      onBackgroundChange('image', customImageUrl, overlay);
    }
  };

  const handleGradientChange = (preset?: GradientPreset) => {
    let gradientValue: string;
    
    if (preset) {
      gradientValue = preset.value;
      // Update state to reflect the selected preset for bottom preview
      const match = preset.value.match(/linear-gradient\((\d+)deg,\s*([^,\s]+)\s*\d+%,\s*([^,\s)]+)\s*\d+%\)/);
      if (match) {
        setGradientAngle(parseInt(match[1]));
        // Clean up color values by removing any extra spaces and quotes
        const color1 = match[2].trim().replace(/['"]/g, '');
        const color2 = match[3].trim().replace(/['"]/g, '');
        setGradientColor1(color1);
        setGradientColor2(color2);
        console.log('🎨 Gradient preset selected:', { angle: match[1], color1, color2 });
      }
    } else {
      gradientValue = `linear-gradient(${gradientAngle}deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`;
    }
    
    onBackgroundChange('gradient', gradientValue);
    toast.success('Gradient background applied!');
  };

  const handleColorChange = (color: string) => {
    setCustomColor(color);
    onBackgroundChange('color', color);
    toast.success('Background color updated!');
  };

  const tabs = [
    { id: 'image' as const, name: 'Custom Image', icon: ImageIcon },
    { id: 'gradient' as const, name: 'Gradients', icon: Layers },
    { id: 'color' as const, name: 'Solid Colors', icon: Palette }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Background Editor</h2>
              <p className="text-gray-600 mt-1">Customize your screen background with professional options</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={20} />
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Image Tab */}
          {activeTab === 'image' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Image URL</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-example..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Enter a direct image URL. Works best with high-quality images (Unsplash, etc.)
                    </p>
                  </div>

                  {/* Overlay Controls */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Layers size={16} />
                      Image Overlay
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-700">Overlay Intensity</label>
                          <span className="text-sm text-gray-600">{overlayIntensity}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          value={overlayIntensity}
                          onChange={(e) => {
                            setOverlayIntensity(parseInt(e.target.value));
                            setTimeout(() => handleOverlayChange(), 100);
                          }}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>No overlay</span>
                          <span>Strong overlay</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Overlay Color</label>
                        <div className="flex gap-2 items-center">
                                                  <input
                          type="color"
                          value={overlayColor}
                          onChange={(e) => {
                            setOverlayColor(e.target.value);
                            setTimeout(() => handleOverlayChange(), 100);
                          }}
                          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={overlayColor}
                          onChange={(e) => setOverlayColor(e.target.value)}
                          onBlur={() => handleOverlayChange()}
                          placeholder="#000000"
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Preview */}
                  {customImageUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Preview</h4>
                      <div 
                        className="w-full h-32 rounded-lg bg-cover bg-center relative overflow-hidden border border-gray-200"
                        style={{ 
                          backgroundImage: `url(${customImageUrl})`,
                        }}
                      >
                        {overlayIntensity > 0 && (
                          <div 
                            className="absolute inset-0"
                            style={{ 
                              backgroundColor: overlayColor,
                              opacity: overlayIntensity / 100
                            }}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-medium bg-black bg-opacity-30 px-3 py-1 rounded">
                            Preview
                          </span>
                        </div>
                      </div>
                      
                      {/* Save Button for Image */}
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={handleImageUrlSubmit}
                          disabled={imageLoading || !customImageUrl.trim()}
                          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                          {imageLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Applying...
                            </>
                          ) : (
                            <>
                              <Check size={16} />
                              Save Background
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Gradient Tab */}
          {activeTab === 'gradient' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gradient Presets</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gradientPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handleGradientChange(preset)}
                      style={{ 
                        background: preset.value,
                        minHeight: '96px',
                        height: '96px',
                        width: '100%',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          padding: '8px'
                        }}
                      >
                        <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: 0 }}>{preset.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Gradient Builder */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Beaker size={16} />
                  Custom Gradient
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Angle: {gradientAngle}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={gradientAngle}
                      onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={gradientColor1}
                          onChange={(e) => setGradientColor1(e.target.value)}
                          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={gradientColor1}
                          onChange={(e) => setGradientColor1(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={gradientColor2}
                          onChange={(e) => setGradientColor2(e.target.value)}
                          className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={gradientColor2}
                          onChange={(e) => setGradientColor2(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Custom Gradient Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <div 
                      className="h-16 w-full rounded-lg border border-gray-200"
                      style={{ 
                        background: `linear-gradient(${gradientAngle}deg, ${gradientColor1} 0%, ${gradientColor2} 100%)`
                      }}
                    />
                    <button
                      onClick={() => handleGradientChange()}
                      className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Apply Custom Gradient
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Color Tab */}
          {activeTab === 'color' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Presets</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {colorPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => handleColorChange(preset.value)}
                      style={{ 
                        backgroundColor: preset.value,
                        background: preset.value,
                        aspectRatio: '1',
                        minHeight: '80px',
                        width: '100%',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          padding: '8px',
                          zIndex: 10
                        }}
                      >
                        <p style={{ fontSize: '12px', fontWeight: '500', color: '#1f2937', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preset.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Picker */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Palette size={16} />
                  Custom Color
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Choose Color</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-16 h-12 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        onBlur={(e) => {
                          if (/^#[0-9A-F]{6}$/i.test(e.target.value) || /^#[0-9A-F]{3}$/i.test(e.target.value)) {
                            handleColorChange(e.target.value);
                          }
                        }}
                        placeholder="#FFFFFF"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Color Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                    <div 
                      className="h-16 w-full rounded-lg border border-gray-200"
                      style={{ backgroundColor: customColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
