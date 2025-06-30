import React, { useState } from "react";
import { Button } from "./UIElements";
import { CustomizationPanel, useCustomization } from "./CustomizationPanel";

export default function TestCustomization() {
    const { customization, showCustomization, hideCustomization, updateCustomization } = useCustomization();
    const [buttonState, setButtonState] = useState({
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
        showCustomization('Button', position, buttonState);
    };

    const handleUpdate = (updates: any) => {
        console.log('Updating button with:', updates);
        setButtonState(prev => ({ ...prev, ...updates }));
        updateCustomization(updates);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-8">Customization Test</h1>
                <p className="mb-8">Current state: {JSON.stringify(buttonState)}</p>
                
                <Button
                    {...buttonState}
                    onClick={handleButtonClick}
                    onContextMenu={handleButtonClick}
                    className="transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                    🎨 Click to Customize
                </Button>
            </div>

            <CustomizationPanel
                customization={customization}
                onUpdate={handleUpdate}
                onClose={hideCustomization}
            />
        </div>
    );
} 