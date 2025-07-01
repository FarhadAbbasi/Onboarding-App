import React from "react";
import {
    Headline,
    Subheadline,
    CTA,
    FeatureCard,
    TextInput,
    AlertMessage,
    Button,
} from "./UIElements";
import { CustomizableWrapper } from "./CustomizableWrapper";

const LightningIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M13.178 2.252a.75.75 0 01.822.274l6.75 9a.75.75 0 01-.598 1.2H14.25l1.572 9.43a.75.75 0 01-1.295.635l-10.5-12a.75.75 0 01.57-1.247H9.75l-1.696-7.29a.75.75 0 01.415-.83z" clipRule="evenodd" />
    </svg>
);

export default function LiveCustomizationDemo() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">🎨 Live UI Customization</h1>
                    <p className="text-xl opacity-90 mb-6">
                        Right-click any element below to customize its appearance in real-time!
                    </p>
                    <div className="flex justify-center gap-4 text-sm">
                        <span className="bg-white/20 px-4 py-2 rounded-full">
                            🖱️ Right-click elements
                        </span>
                        <span className="bg-white/20 px-4 py-2 rounded-full">
                            🎨 Change colors & sizes
                        </span>
                        <span className="bg-white/20 px-4 py-2 rounded-full">
                            ⚡ See changes instantly
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
                {/* Customizable Buttons */}
                <section>
                    <div className="text-center mb-8">
                        <Headline className="mb-4">Interactive Button Showcase</Headline>
                        <Subheadline>Right-click any button to customize it</Subheadline>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-6">
                        <CustomizableWrapper 
                            elementType="Button"
                            defaultProps={{ colorScheme: 'blue', size: 'lg', variant: 'solid' }}
                        >
                            <Button colorScheme="blue" size="lg">
                                Primary Button
                            </Button>
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="Button"
                            defaultProps={{ colorScheme: 'green', size: 'md', variant: 'outline' }}
                        >
                            <Button colorScheme="green" variant="outline">
                                Outline Button
                            </Button>
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="Button"
                            defaultProps={{ colorScheme: 'purple', size: 'xl', variant: 'ghost' }}
                        >
                            <Button colorScheme="purple" variant="ghost" size="xl">
                                Ghost Button
                            </Button>
                        </CustomizableWrapper>
                    </div>
                </section>

                {/* Customizable Feature Cards */}
                <section>
                    <div className="text-center mb-8">
                        <Headline className="mb-4">Dynamic Feature Cards</Headline>
                        <Subheadline>Customize colors, variants, and icon sizes</Subheadline>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <CustomizableWrapper 
                            elementType="FeatureCard"
                            defaultProps={{ colorScheme: 'blue', variant: 'shadow', iconSize: 'lg' }}
                        >
                            <FeatureCard
                                icon={LightningIcon}
                                title="Fast Performance"
                                description="Lightning-fast loading and smooth interactions for the best user experience."
                                colorScheme="blue"
                                variant="shadow"
                            />
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="FeatureCard"
                            defaultProps={{ colorScheme: 'emerald', variant: 'elevated', iconSize: 'xl' }}
                        >
                            <FeatureCard
                                icon={<span className="text-2xl">🔒</span>}
                                title="Secure by Design"
                                description="Built-in security features to protect your data and ensure privacy."
                                colorScheme="emerald"
                                variant="elevated"
                                iconSize="xl"
                            />
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="FeatureCard"
                            defaultProps={{ colorScheme: 'purple', variant: 'bordered', iconSize: 'lg' }}
                        >
                            <FeatureCard
                                icon={<span className="text-2xl">✨</span>}
                                title="Beautiful UI"
                                description="Stunning designs that adapt to your brand and user preferences."
                                colorScheme="purple"
                                variant="bordered"
                            />
                        </CustomizableWrapper>
                    </div>
                </section>

                {/* Customizable Form Elements */}
                <section>
                    <div className="text-center mb-8">
                        <Headline className="mb-4">Interactive Form Elements</Headline>
                        <Subheadline>Customize input styles and colors</Subheadline>
                    </div>
                    
                    <div className="max-w-2xl mx-auto space-y-6">
                        <CustomizableWrapper 
                            elementType="TextInput"
                            defaultProps={{ colorScheme: 'indigo', size: 'lg', variant: 'default' }}
                        >
                            <TextInput
                                label="Email Address"
                                placeholder="Enter your email"
                                colorScheme="indigo"
                                size="lg"
                                leftIcon={<span>📧</span>}
                            />
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="TextInput"
                            defaultProps={{ colorScheme: 'pink', size: 'md', variant: 'filled' }}
                        >
                            <TextInput
                                label="Full Name"
                                placeholder="Enter your name"
                                colorScheme="pink"
                                variant="filled"
                                leftIcon={<span>👤</span>}
                            />
                        </CustomizableWrapper>
                    </div>
                </section>

                {/* Customizable Alerts */}
                <section>
                    <div className="text-center mb-8">
                        <Headline className="mb-4">Dynamic Alert Messages</Headline>
                        <Subheadline>Change alert colors and styles</Subheadline>
                    </div>
                    
                    <div className="max-w-3xl mx-auto space-y-4">
                        <CustomizableWrapper 
                            elementType="AlertMessage"
                            defaultProps={{ colorScheme: 'blue', variant: 'info' }}
                        >
                            <AlertMessage
                                variant="info"
                                title="Customizable Alert"
                                colorScheme="blue"
                                icon={<span>💡</span>}
                            >
                                Right-click this alert to change its color scheme and styling!
                            </AlertMessage>
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="AlertMessage"
                            defaultProps={{ colorScheme: 'green', variant: 'success' }}
                        >
                            <AlertMessage
                                variant="success"
                                title="Success Message"
                                colorScheme="green"
                                icon={<span>🎉</span>}
                            >
                                You can customize every aspect of this alert message.
                            </AlertMessage>
                        </CustomizableWrapper>
                    </div>
                </section>

                {/* Instructions */}
                <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            🎨 How to Use the Customization Panel
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="text-4xl mb-4">🖱️</div>
                                <h3 className="text-xl font-semibold mb-3">Right-Click</h3>
                                <p className="text-gray-600">
                                    Right-click any customizable element to open the style panel
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="text-4xl mb-4">🎨</div>
                                <h3 className="text-xl font-semibold mb-3">Customize</h3>
                                <p className="text-gray-600">
                                    Change colors, sizes, variants, and add custom CSS classes
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <div className="text-4xl mb-4">⚡</div>
                                <h3 className="text-xl font-semibold mb-3">Live Preview</h3>
                                <p className="text-gray-600">
                                    See your changes applied instantly without refreshing
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
} 