import React, { useState } from "react";
import { Button, FeatureCard, TextInput, AlertMessage, Headline, Subheadline } from "./UIElements";
import { CustomizationPanel, useCustomization } from "./CustomizationPanel";

const StarIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.563.563 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);

export default function QuickCustomizationDemo() {
    const { customization, showCustomization, hideCustomization, updateCustomization } = useCustomization();
    const [elementStates, setElementStates] = useState<Record<string, any>>({
        button1: { colorScheme: 'blue', size: 'lg', variant: 'solid' },
        button2: { colorScheme: 'green', size: 'md', variant: 'outline' },
        card1: { colorScheme: 'purple', variant: 'shadow' },
        input1: { colorScheme: 'indigo', size: 'lg', variant: 'default' },
        alert1: { colorScheme: 'orange', variant: 'warning' }
    });

    const handleElementClick = (elementId: string, elementType: string, e: React.MouseEvent) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const position = {
            x: rect.left + rect.width / 2,
            y: rect.top
        };
        showCustomization(elementType, position, elementStates[elementId]);
    };

    const handleUpdate = (elementId: string, updates: any) => {
        setElementStates(prev => ({
            ...prev,
            [elementId]: { ...prev[elementId], ...updates }
        }));
        updateCustomization(updates);
    };

    const [activeElement, setActiveElement] = useState<string>('');

    const showElementCustomization = (elementId: string, elementType: string, e: React.MouseEvent) => {
        setActiveElement(elementId);
        handleElementClick(elementId, elementType, e);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <Headline className="mb-4">🎨 Interactive UI Customization</Headline>
                    <Subheadline className="mb-6">
                        Click any element below to open the customization panel and modify its appearance!
                    </Subheadline>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 inline-block">
                        <p className="text-sm text-gray-600">
                            ✨ <strong>Pro Tip:</strong> Right-click any element or click directly to customize colors, sizes, and variants
                        </p>
                    </div>
                </div>

                {/* Demo Elements */}
                <div className="space-y-12">
                    {/* Buttons Section */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Customizable Buttons</h3>
                        <div className="flex justify-center gap-6">
                            <div className="relative group">
                                <Button
                                    {...elementStates.button1}
                                    onClick={(e) => showElementCustomization('button1', 'Button', e)}
                                    onContextMenu={(e) => showElementCustomization('button1', 'Button', e)}
                                    className="transition-all duration-200 hover:scale-105 cursor-pointer"
                                >
                                    🎨 Customize Me!
                                </Button>
                                <div className="absolute -inset-2 border-2 border-dashed border-blue-300 rounded-lg opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity" />
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Click to customize
                                </div>
                            </div>

                            <div className="relative group">
                                <Button
                                    {...elementStates.button2}
                                    onClick={(e) => showElementCustomization('button2', 'Button', e)}
                                    onContextMenu={(e) => showElementCustomization('button2', 'Button', e)}
                                    className="transition-all duration-200 hover:scale-105 cursor-pointer"
                                >
                                    ⚡ Edit Styles
                                </Button>
                                <div className="absolute -inset-2 border-2 border-dashed border-green-300 rounded-lg opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity" />
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Right-click to edit
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Feature Card Section */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Customizable Feature Card</h3>
                        <div className="flex justify-center">
                            <div className="relative group">
                                <div
                                    onClick={(e) => showElementCustomization('card1', 'FeatureCard', e)}
                                    onContextMenu={(e) => showElementCustomization('card1', 'FeatureCard', e)}
                                    className="cursor-pointer transition-all duration-200 hover:scale-105"
                                >
                                    <FeatureCard
                                        icon={StarIcon}
                                        title="Awesome Feature"
                                        description="Click this card to customize its colors, variants, and styling options."
                                        {...elementStates.card1}
                                        className="w-80"
                                    />
                                </div>
                                <div className="absolute -inset-2 border-2 border-dashed border-purple-300 rounded-lg opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity" />
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Click to customize card
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Input Section */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Customizable Text Input</h3>
                        <div className="max-w-md mx-auto">
                            <div className="relative group">
                                <div
                                    onClick={(e) => showElementCustomization('input1', 'TextInput', e)}
                                    onContextMenu={(e) => showElementCustomization('input1', 'TextInput', e)}
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
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Click to customize input
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Alert Section */}
                    <section className="bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-semibold mb-6 text-center">Customizable Alert</h3>
                        <div className="max-w-lg mx-auto">
                            <div className="relative group">
                                <div
                                    onClick={(e) => showElementCustomization('alert1', 'AlertMessage', e)}
                                    onContextMenu={(e) => showElementCustomization('alert1', 'AlertMessage', e)}
                                    className="cursor-pointer"
                                >
                                    <AlertMessage
                                        title="Customizable Alert"
                                        {...elementStates.alert1}
                                        icon={<span>🎨</span>}
                                    >
                                        This alert can be fully customized! Click to change colors and variants.
                                    </AlertMessage>
                                </div>
                                <div className="absolute -inset-2 border-2 border-dashed border-orange-300 rounded-lg opacity-0 group-hover:opacity-60 pointer-events-none transition-opacity" />
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Click to customize alert
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Instructions */}
                <div className="mt-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8 text-center">
                    <h3 className="text-xl font-semibold mb-4">How It Works</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-sm">
                        <div>
                            <div className="text-3xl mb-3">👆</div>
                            <h4 className="font-semibold mb-2">Click or Right-Click</h4>
                            <p className="text-gray-600">Click any element above to open the customization panel</p>
                        </div>
                        <div>
                            <div className="text-3xl mb-3">🎨</div>
                            <h4 className="font-semibold mb-2">Customize</h4>
                            <p className="text-gray-600">Choose colors, sizes, variants, and add custom CSS classes</p>
                        </div>
                        <div>
                            <div className="text-3xl mb-3">⚡</div>
                            <h4 className="font-semibold mb-2">Live Updates</h4>
                            <p className="text-gray-600">See changes applied instantly as you customize</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customization Panel */}
            <CustomizationPanel
                customization={customization}
                onUpdate={(updates) => handleUpdate(activeElement, updates)}
                onClose={hideCustomization}
            />
        </div>
    );
} 