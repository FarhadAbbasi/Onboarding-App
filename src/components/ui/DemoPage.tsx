import React, { useState } from "react";
import {
    UiElements as Light,
    Headline,
    Subheadline,
    CTAButton,
    FeatureCard,
    TextInput,
    AlertMessage,
    Testimonial,
    Footer,
    Button,
} from "./UIElements";
import { CustomizationPanel, useCustomization } from "./CustomizationPanel";

// Icons for the feature cards (Heroicons SVG snippets)
const Lightning = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
    >
        <path
            fillRule="evenodd"
            d="M13.178 2.252a.75.75 0 01.822.274l6.75 9a.75.75 0 01-.598 1.2H14.25l1.572 9.43a.75.75 0 01-1.295.635l-10.5-12a.75.75 0 01.57-1.247H9.75l-1.696-7.29a.75.75 0 01.415-.83z"
            clipRule="evenodd"
        />
    </svg>
);

const Shield = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-6 w-6"
    >
        <path
            fillRule="evenodd"
            d="M11.484 1.648a.75.75 0 011.032 0l7.5 6.75a.75.75 0 01.034 1.06l-7.5 8.25a.75.75 0 01-1.12 0l-7.5-8.25a.75.75 0 01.034-1.06l7.5-6.75z"
            clipRule="evenodd"
        />
    </svg>
);

const Sparkles = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.75L13.352 10.202L17.031 10.469L14.516 12.781L15.867 16.234L12 14.156L8.133 16.234L9.484 12.781L6.969 10.469L10.648 10.202L12 6.75Z"
        />
        <path d="M21 12h.01" />
        <path d="M3 12h.01" />
    </svg>
);

const features = [
    { icon: Lightning, title: "Fast Setup", description: "Deploy onboarding flows in minutes with our drag‑and‑drop builder." },
    { icon: Shield, title: "Secure", description: "Built‑in XSS protection and instant CSRF shields." },
    { icon: Sparkles, title: "Delightful", description: "Smooth micro‑animations keep users engaged from step 1." },
];

export default function DemoPage() {
    const [demoMode, setDemoMode] = useState(false);
    const { customization, showCustomization, hideCustomization, updateCustomization } = useCustomization();
    const [demoButtonProps, setDemoButtonProps] = useState({
        colorScheme: 'indigo' as const,
        size: 'lg' as const,
        variant: 'solid' as const
    });

    // State for each customizable element
    const [elementStates, setElementStates] = useState({
        featureCards: features.map((_, index) => ({
            colorScheme: index === 0 ? "blue" : index === 1 ? "green" : "purple" as any,
            variant: "shadow" as const,
            iconSize: "xl" as const
        })),
        ctaButton1: { colorScheme: 'indigo' as const, size: 'lg' as const, variant: 'solid' as const },
        ctaButton2: { colorScheme: 'gray' as const, size: 'lg' as const, variant: 'outline' as const },
        textInput1: { colorScheme: 'indigo' as const, size: 'lg' as const, variant: 'default' as const }
    });

    const [activeElement, setActiveElement] = useState<string>('');

    const handleDemoButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const position = {
            x: rect.left + rect.width / 2,
            y: rect.top
        };
        setActiveElement('demoButton');
        showCustomization('Button', position, demoButtonProps);
    };

    const handleDemoUpdate = (updates: any) => {
        setDemoButtonProps(prev => ({ ...prev, ...updates }));
        updateCustomization(updates);
    };

    // Generic handler for updating any element
    const handleElementUpdate = (elementId: string, updates: any) => {
        if (!elementId) return;
        
        if (elementId === 'demoButton') {
            setDemoButtonProps(prev => ({ ...prev, ...updates }));
        } else if (elementId.startsWith('featureCard-')) {
            const index = parseInt(elementId.split('-')[1]);
            setElementStates(prev => ({
                ...prev,
                featureCards: prev.featureCards.map((card, i) => 
                    i === index ? { ...card, ...updates } : card
                )
            }));
        } else if (elementId in elementStates) {
            setElementStates(prev => ({
                ...prev,
                [elementId]: { ...prev[elementId as keyof typeof prev], ...updates }
            }));
        }
        updateCustomization(updates);
    };

    // Show customization for specific elements
    const showElementCustomization = (elementId: string, elementType: string, position: {x: number, y: number}, currentProps: any) => {
        setActiveElement(elementId);
        showCustomization(elementType, position, currentProps);
    };

    return (
        <div className="flex flex-col gap-32">
            {/* Customization Demo Section */}
            <section className="mx-auto w-full max-w-4xl px-4 py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl">
                <div className="text-center">
                    <Headline className="mb-4 text-purple-800">🎨 Live Customization Demo</Headline>
                    <Subheadline className="mb-8 text-purple-600">
                        Click the button below to open the customization panel and change its appearance in real-time!
                    </Subheadline>
                    
                    <div className="relative inline-block">
                        <Button
                            {...demoButtonProps}
                            onClick={handleDemoButtonClick}
                            className="relative transition-all duration-300 hover:scale-105"
                        >
                            🎨 Customize Me!
                        </Button>
                        
                        <div className="absolute -inset-4 border-2 border-dashed border-purple-300 rounded-lg animate-pulse pointer-events-none opacity-60" />
                    </div>
                    
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white/80 rounded-lg p-4">
                            <div className="text-2xl mb-2">🎨</div>
                            <h3 className="font-semibold">12 Color Schemes</h3>
                            <p className="text-gray-600">Choose from indigo, blue, green, red, and more</p>
                        </div>
                        <div className="bg-white/80 rounded-lg p-4">
                            <div className="text-2xl mb-2">📏</div>
                            <h3 className="font-semibold">6 Size Options</h3>
                            <p className="text-gray-600">From xs to 2xl for perfect scaling</p>
                        </div>
                        <div className="bg-white/80 rounded-lg p-4">
                            <div className="text-2xl mb-2">✨</div>
                            <h3 className="font-semibold">Multiple Variants</h3>
                            <p className="text-gray-600">Solid, outline, ghost, and more styles</p>
                        </div>
                    </div>
                </div>

                <CustomizationPanel
                    customization={customization}
                    onUpdate={(updates) => handleElementUpdate(activeElement, updates)}
                    onClose={() => {
                        setActiveElement('');
                        hideCustomization();
                    }}
                />
            </section>

            {/* Enhanced Light Theme */}
            <section className="mx-auto w-full max-w-4xl px-4 py-16">
                {/* Toggle for demo mode */}
                <div className="text-center mb-8">
                    <button
                        onClick={() => setDemoMode(!demoMode)}
                        className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                        {demoMode ? '🎨 Exit Demo Mode' : '🎨 Enable Demo Mode'}
                    </button>
                    
                    {demoMode && (
                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 text-sm">
                                ✨ Demo Mode Active: Right-click any element below to customize it!
                            </p>
                        </div>
                    )}
                </div>

                <Headline>Enhanced UI Components</Headline>
                <Subheadline>
                    {demoMode 
                        ? "Right-click any element to customize colors, sizes, and variants!" 
                        : "Powerful, customizable components with dynamic theming"
                    }
                </Subheadline>
                
                <div className="mt-6 flex flex-wrap justify-center gap-6">
                    {features.map((f, index) => {
                        const cardState = elementStates.featureCards[index];
                        const elementId = `featureCard-${index}`;
                        
                        return (
                            <div
                                key={f.title}
                                onContextMenu={demoMode ? (e: React.MouseEvent) => {
                                    e.preventDefault();
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    showElementCustomization(elementId, 'FeatureCard', { 
                                        x: rect.left + rect.width / 2, 
                                        y: rect.top 
                                    }, cardState);
                                } : undefined}
                                className={demoMode ? 'cursor-pointer' : ''}
                            >
                                <FeatureCard 
                                    {...f} 
                                    className={`w-64 ${demoMode ? 'border-2 border-dashed border-blue-300 hover:border-blue-500' : ''}`}
                                    colorScheme={cardState.colorScheme}
                                    variant={cardState.variant}
                                    iconSize={cardState.iconSize}
                                />
                            </div>
                        );
                    })}
                </div>
                
                <div className="mt-10 flex justify-center gap-4">
                    <div
                        onContextMenu={demoMode ? (e: React.MouseEvent) => {
                            e.preventDefault();
                            const rect = e.currentTarget.getBoundingClientRect();
                            showElementCustomization('ctaButton1', 'CTAButton', { 
                                x: rect.left + rect.width / 2, 
                                y: rect.top 
                            }, elementStates.ctaButton1);
                        } : undefined}
                        className={demoMode ? 'cursor-pointer' : ''}
                    >
                        <CTAButton 
                            {...elementStates.ctaButton1}
                            className={demoMode ? 'border-2 border-dashed border-blue-300 hover:border-blue-500' : ''}
                        >
                            Primary CTA
                        </CTAButton>
                    </div>
                    <div
                        onContextMenu={demoMode ? (e: React.MouseEvent) => {
                            e.preventDefault();
                            const rect = e.currentTarget.getBoundingClientRect();
                            showElementCustomization('ctaButton2', 'CTAButton', { 
                                x: rect.left + rect.width / 2, 
                                y: rect.top 
                            }, elementStates.ctaButton2);
                        } : undefined}
                        className={demoMode ? 'cursor-pointer' : ''}
                    >
                        <CTAButton 
                            {...elementStates.ctaButton2}
                            className={`hover:bg-gray-50 ${demoMode ? 'border-2 border-dashed border-blue-300 hover:border-blue-500' : ''}`}
                        >
                            Secondary CTA
                        </CTAButton>
                    </div>
                </div>
                
                <div className="mx-auto mt-10 max-w-sm">
                    <div
                        onContextMenu={demoMode ? (e: React.MouseEvent) => {
                            e.preventDefault();
                            const rect = e.currentTarget.getBoundingClientRect();
                            showElementCustomization('textInput1', 'TextInput', { 
                                x: rect.left + rect.width / 2, 
                                y: rect.top 
                            }, elementStates.textInput1);
                        } : undefined}
                        className={demoMode ? 'cursor-pointer' : ''}
                    >
                        <TextInput 
                            label="Email" 
                            placeholder="you@example.com"
                            {...elementStates.textInput1}
                            leftIcon={<span>📧</span>}
                            className={demoMode ? 'border-2 border-dashed border-blue-300 hover:border-blue-500' : ''}
                        />
                    </div>
                </div>

                <div className="mx-auto mt-6 max-w-md">
                    <AlertMessage 
                        variant="info" 
                        title="Enhanced Customization!"
                        colorScheme="blue"
                        icon={<span>💡</span>}
                    >
                        Every element now supports dynamic theming with 12 color schemes, 6 sizes, multiple variants, and custom styling options!
                    </AlertMessage>
                </div>
                <div className="mx-auto mt-12 max-w-md">
                    <Testimonial
                        quote="The customization system is incredible! I can theme every component exactly how I want."
                        avatarUrl="https://i.pravatar.cc/80?img=12"
                        name="Sofia Ali"
                        role="UI Designer @ Creative Co"
                        colorScheme="indigo"
                        variant="shadow"
                    />
                </div>
            </section>

            {/* Light Theme */}
            <section className="mx-auto w-full max-w-4xl px-4 py-16">
                <Headline>Light Theme Showcase</Headline>
                <Subheadline>Default palette – simple and universally appealing.</Subheadline>
                <div className="mt-6 flex flex-wrap justify-center gap-6">
                    {features.map((f, index) => (
                        <FeatureCard 
                            key={f.title} 
                            {...f} 
                            className="w-64"
                            colorScheme={index === 0 ? "blue" : index === 1 ? "green" : "purple"}
                            variant="shadow"
                            iconSize="xl"
                        />
                    ))}
                </div>
                <div className="mt-10 flex justify-center gap-4">
                    <CTAButton colorScheme="indigo">Primary CTA</CTAButton>
                    <CTAButton 
                        variant="outline" 
                        colorScheme="gray"
                        className="hover:bg-gray-50"
                    >
                        Secondary CTA
                    </CTAButton>
                </div>
                <div className="mx-auto mt-10 max-w-sm">
                    <TextInput 
                        label="Email" 
                        placeholder="you@example.com"
                        colorScheme="indigo"
                        size="lg"
                        leftIcon={<span>📧</span>}
                    />
                </div>
                <div className="mx-auto mt-6 max-w-md">
                    <AlertMessage 
                        variant="info" 
                        title="Heads up!"
                        colorScheme="blue"
                        icon={<span>💡</span>}
                    >
                        You can fully customise every element with colors, sizes, and variants.
                    </AlertMessage>
                </div>
                <div className="mx-auto mt-12 max-w-md">
                    <Testimonial
                        quote="This builder cut our onboarding dev time by 70%. Absolute game‑changer!"
                        avatarUrl="https://i.pravatar.cc/80?img=12"
                        name="Sofia Ali"
                        role="Product Lead @ Cal AI"
                        colorScheme="indigo"
                        variant="shadow"
                    />
                </div>
            </section>

            {/* Pastel Theme */}
            <section className="mx-auto w-full max-w-4xl rounded-3xl bg-pink-50/50 px-4 py-16 shadow-inner">
                <Headline 
                    className="text-pink-600" 
                    colorScheme="pink"
                    gradient={true}
                    size="3xl"
                >
                    Pastel Theme Showcase
                </Headline>
                <Subheadline 
                    className="text-pink-500"
                    colorScheme="pink"
                    size="xl"
                >
                    Soft, feminine & emotional vibes.
                </Subheadline>
                <div className="mt-6 flex flex-wrap justify-center gap-6">
                    {features.map((f) => (
                        <FeatureCard
                            key={f.title + "pastel"}
                            {...f}
                            className="w-64"
                            colorScheme="pink"
                            variant="elevated"
                            iconSize="lg"
                        />
                    ))}
                </div>
                <div className="mt-10 flex justify-center gap-4">
                    <CTAButton colorScheme="pink" size="xl">Love It</CTAButton>
                    <CTAButton 
                        variant="outline" 
                        colorScheme="pink"
                        size="xl"
                    >
                        Maybe Later
                    </CTAButton>
                </div>
                <div className="mx-auto mt-10 max-w-sm">
                    <TextInput
                        label="Name"
                        placeholder="Your lovely name"
                        colorScheme="pink"
                        size="lg"
                        variant="filled"
                    />
                </div>
                <div className="mx-auto mt-6 max-w-md">
                    <AlertMessage 
                        variant="success" 
                        title="Yay!"
                        colorScheme="pink"
                        icon={<span>🎉</span>}
                    >
                        You've unlocked the pastel palette with enhanced customization.
                    </AlertMessage>
                </div>
            </section>

            {/* Dark Theme */}
            <section className="mx-auto w-full max-w-4xl rounded-3xl bg-gray-900 px-4 py-16 text-gray-100 shadow-lg">
                <Headline 
                    className="text-indigo-400"
                    colorScheme="indigo"
                    size="4xl"
                >
                    Dark Theme Showcase
                </Headline>
                <Subheadline 
                    className="text-gray-400"
                    size="lg"
                >
                    Sleek, focused, and easy on the eyes at night.
                </Subheadline>
                <div className="mt-6 flex flex-wrap justify-center gap-6">
                    {features.map((f, index) => (
                        <FeatureCard
                            key={f.title + "dark"}
                            {...f}
                            className="w-64 border-gray-800 bg-gray-800 hover:shadow-gray-800"
                            colorScheme={index === 0 ? "cyan" : index === 1 ? "emerald" : "purple"}
                            variant="bordered"
                            iconSize="xl"
                        />
                    ))}
                </div>
                <div className="mt-10 flex justify-center gap-4">
                    <CTAButton 
                        colorScheme="indigo" 
                        size="xl"
                        rightIcon={<span>→</span>}
                    >
                        Get Started
                    </CTAButton>
                    <CTAButton 
                        variant="ghost" 
                        colorScheme="gray"
                        size="xl"
                    >
                        Learn More
                    </CTAButton>
                </div>
                <div className="mx-auto mt-10 max-w-sm">
                    <TextInput
                        label="Username"
                        placeholder="nightowl"
                        colorScheme="indigo"
                        size="lg"
                        variant="flushed"
                        className="border-gray-600 bg-gray-800 placeholder-gray-500 text-gray-100"
                        leftIcon={<span>👤</span>}
                    />
                </div>
                <div className="mx-auto mt-6 max-w-md">
                    <AlertMessage 
                        variant="warning" 
                        title="Caution!"
                        colorScheme="orange"
                        icon={<span>⚠️</span>}
                        closable={true}
                        onClose={() => console.log("Alert closed")}
                    >
                        This zone is optimised for dark‑mode aficionados with dynamic theming.
                    </AlertMessage>
                </div>
            </section>

            <Footer
                brand="Enhanced Builder"
                colorScheme="indigo"
                variant="branded"
                links={[
                    { label: "Docs", href: "#" },
                    { label: "Pricing", href: "#" },
                    { label: "Blog", href: "#" },
                    { label: "Support", href: "#" },
                ]}
            />
        </div>
    );
}
