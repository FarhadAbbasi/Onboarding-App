import React, { useState } from "react";
import { Button, FeatureCard, TextInput, AlertMessage } from "./UIElements";
import { CustomizationPanel, useCustomization } from "./CustomizationPanel";

const StarIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

export default function WorkingCustomDemo() {
    const { customization, showCustomization, hideCustomization, updateCustomization } = useCustomization();
    
    // Individual state for each customizable element
    const [elementStates, setElementStates] = useState({
        button1: { colorScheme: 'blue' as const, size: 'lg' as const, variant: 'solid' as const },
        button2: { colorScheme: 'green' as const, size: 'md' as const, variant: 'outline' as const },
        card1: { colorScheme: 'purple' as const, variant: 'shadow' as const, iconSize: 'lg' as const },
        input1: { colorScheme: 'indigo' as const, size: 'lg' as const, variant: 'default' as const },
        alert1: { colorScheme: 'orange' as const, variant: 'warning' as const }
    });

    const [activeElement, setActiveElement] = useState<string>('');

    // Handle customization for specific elements
    const handleElementCustomization = (elementId: string, elementType: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = e.currentTarget.getBoundingClientRect();
        const position = {
            x: rect.left + rect.width / 2,
            y: rect.top
        };
        
        setActiveElement(elementId);
        showCustomization(elementType, position, elementStates[elementId as keyof typeof elementStates]);
    };

    // Update element state when customization changes
    const handleUpdate = (updates: any) => {
        if (!activeElement) return;
        
        setElementStates(prev => ({
            ...prev,
            [activeElement]: { ...prev[activeElement as keyof typeof prev], ...updates }
        }));
        updateCustomization(updates);
    };

    const handleClose = () => {
        setActiveElement('');
        hideCustomization();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 text-gray-900">
                        🎨 Working Customization Demo
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                        Right-click or left-click any element below to customize it in real-time!
                    </p>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 inline-block">
                        <p className="text-sm text-gray-600">
                            ✨ <strong>Instructions:</strong> Click any element to customize colors, sizes, and variants
                        </p>
                    </div>
                </div>

                {/* Customizable Elements */}
                <div className="space-y-12">
                    {/* Buttons */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Click Buttons to Customize</h3>
                        <div className="flex justify-center gap-6">
                            <div className="relative group">
                                <Button
                                    {...elementStates.button1}
                                    onClick={(e) => handleElementCustomization('button1', 'Button', e)}
                                    onContextMenu={(e) => handleElementCustomization('button1', 'Button', e)}
                                    className="transition-all duration-200 hover:scale-105 cursor-pointer"
                                >
                                    🎨 Customize Me!
                                </Button>
                                <div className="absolute -inset-2 border-2 border-dashed border-blue-300 rounded-lg opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity" />
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    Click to edit
                                </div>
                            </div>

                            <div className="relative group">
                                <Button
                                    {...elementStates.button2}
                                    onClick={(e) => handleElementCustomization('button2', 'Button', e)}
                                    onContextMenu={(e) => handleElementCustomization('button2', 'Button', e)}
                                    className="transition-all duration-200 hover:scale-105 cursor-pointer"
                                >
                                    ⚡ Edit Styles
                                </Button>
                                <div className="absolute -inset-2 border-2 border-dashed border-green-300 rounded-lg opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity" />
                            </div>
                        </div>
                    </section>

                    {/* Feature Card */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Click Card to Customize</h3>
                        <div className="flex justify-center">
                            <div className="relative group">
                                <div
                                    onClick={(e) => handleElementCustomization('card1', 'FeatureCard', e)}
                                    onContextMenu={(e) => handleElementCustomization('card1', 'FeatureCard', e)}
                                    className="cursor-pointer transition-all duration-200 hover:scale-105"
                                >
                                    <FeatureCard
                                        icon={StarIcon}
                                        title="Awesome Feature"
                                        description="Click this card to customize its colors, variants, and styling options in real-time."
                                        {...elementStates.card1}
                                        className="w-80"
                                    />
                                </div>
                                <div className="absolute -inset-2 border-2 border-dashed border-purple-300 rounded-lg opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity" />
                            </div>
                        </div>
                    </section>

                    {/* Input */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Click Input to Customize</h3>
                        <div className="max-w-md mx-auto">
                            <div className="relative group">
                                <div
                                    onClick={(e) => handleElementCustomization('input1', 'TextInput', e)}
                                    onContextMenu={(e) => handleElementCustomization('input1', 'TextInput', e)}
                                    className="cursor-pointer"
                                >
                                    <TextInput
                                        label="Sample Input"
                                        placeholder="Click to customize this input..."
                                        {...elementStates.input1}
                                        leftIcon={<span>🔧</span>}
                                    />
                                </div>
                                <div className="absolute -inset-2 border-2 border-dashed border-indigo-300 rounded-lg opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity" />
                            </div>
                        </div>
                    </section>

                    {/* Alert */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Click Alert to Customize</h3>
                        <div className="max-w-lg mx-auto">
                            <div className="relative group">
                                <div
                                    onClick={(e) => handleElementCustomization('alert1', 'AlertMessage', e)}
                                    onContextMenu={(e) => handleElementCustomization('alert1', 'AlertMessage', e)}
                                    className="cursor-pointer"
                                >
                                    <AlertMessage
                                        title="Customizable Alert"
                                        {...elementStates.alert1}
                                        icon={<span>🎨</span>}
                                    >
                                        This alert changes color and style when you customize it! Try clicking to see live updates.
                                    </AlertMessage>
                                </div>
                                <div className="absolute -inset-2 border-2 border-dashed border-orange-300 rounded-lg opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity" />
                            </div>
                        </div>
                    </section>
                </div>

                {/* Current State Display */}
                <div className="mt-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4 text-center">Current Element States</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                        {Object.entries(elementStates).map(([id, state]) => (
                            <div key={id} className="bg-white rounded-lg p-3">
                                <h4 className="font-semibold text-gray-700 mb-2">{id}</h4>
                                <pre className="text-gray-600">{JSON.stringify(state, null, 2)}</pre>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Customization Panel */}
            <CustomizationPanel
                customization={customization}
                onUpdate={handleUpdate}
                onClose={handleClose}
            />
        </div>
    );
} 