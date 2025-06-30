import React, { useState } from "react";
import { Button } from "./UIElements";
import { CustomizationPanel, useCustomization } from "./CustomizationPanel";

export default function QuickDemo() {
    const { customization, showCustomization, hideCustomization, updateCustomization } = useCustomization();
    const [buttonProps, setButtonProps] = useState({
        colorScheme: 'blue' as const,
        size: 'lg' as const,
        variant: 'solid' as const
    });

    const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const position = {
            x: rect.left + rect.width / 2,
            y: rect.top
        };
        showCustomization('Button', position, buttonProps);
    };

    const handleUpdate = (updates: any) => {
        setButtonProps(prev => ({ ...prev, ...updates }));
        updateCustomization(updates);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-8 text-gray-900">
                    🎨 UI Customization Demo
                </h1>
                <p className="text-lg text-gray-600 mb-12 max-w-md">
                    Click the button below to open the customization panel and see live changes!
                </p>
                
                <div className="relative inline-block">
                    <Button
                        {...buttonProps}
                        onClick={handleButtonClick}
                        onContextMenu={handleButtonClick}
                        className="transition-all duration-300 hover:scale-105 cursor-pointer relative"
                    >
                        🎨 Customize This Button!
                    </Button>
                    
                    <div className="absolute -inset-4 border-2 border-dashed border-blue-300 rounded-lg animate-pulse pointer-events-none opacity-60" />
                </div>
                
                <div className="mt-8 text-sm text-gray-500">
                    <p>✨ Try changing colors, sizes, and variants</p>
                    <p>🖱️ Right-click or left-click to customize</p>
                </div>
            </div>

            <CustomizationPanel
                customization={customization}
                onUpdate={handleUpdate}
                onClose={hideCustomization}
            />
        </div>
    );
} 