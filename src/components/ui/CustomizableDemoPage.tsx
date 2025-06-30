import React from "react";
import {
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
import { CustomizableWrapper } from "./CustomizableWrapper";

// Icons for the feature cards
const Lightning = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M13.178 2.252a.75.75 0 01.822.274l6.75 9a.75.75 0 01-.598 1.2H14.25l1.572 9.43a.75.75 0 01-1.295.635l-10.5-12a.75.75 0 01.57-1.247H9.75l-1.696-7.29a.75.75 0 01.415-.83z" clipRule="evenodd" />
    </svg>
);

const Shield = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
        <path fillRule="evenodd" d="M11.484 1.648a.75.75 0 011.032 0l7.5 6.75a.75.75 0 01.034 1.06l-7.5 8.25a.75.75 0 01-1.12 0l-7.5-8.25a.75.75 0 01.034-1.06l7.5-6.75z" clipRule="evenodd" />
    </svg>
);

const Sparkles = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75L13.352 10.202L17.031 10.469L14.516 12.781L15.867 16.234L12 14.156L8.133 16.234L9.484 12.781L6.969 10.469L10.648 10.202L12 6.75Z" />
        <path d="M21 12h.01" />
        <path d="M3 12h.01" />
    </svg>
);

export default function CustomizableDemoPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold mb-4">🎨 Live UI Customization Demo</h1>
                    <p className="text-lg opacity-90">
                        Hover over any element to see the edit button, then click to customize colors, sizes, variants, and more!
                    </p>
                    <div className="mt-4 flex justify-center gap-4 text-sm">
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                            🖱️ Right-click elements
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                            ✏️ Click edit button
                        </span>
                        <span className="bg-white/20 px-3 py-1 rounded-full">
                            🎨 Customize live
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-16 py-16">
                {/* Customizable Buttons Section */}
                <section className="mx-auto w-full max-w-4xl px-4">
                    <div className="text-center mb-8">
                        <CustomizableWrapper 
                            elementType="Headline" 
                            defaultProps={{ colorScheme: 'indigo', size: 'xl' }}
                        >
                            <Headline>Customizable Buttons</Headline>
                        </CustomizableWrapper>
                        
                        <CustomizableWrapper 
                            elementType="Subheadline"
                            defaultProps={{ colorScheme: 'gray', size: 'lg' }}
                        >
                            <Subheadline>Click any button to change its appearance</Subheadline>
                        </CustomizableWrapper>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        <CustomizableWrapper 
                            elementType="Button"
                            defaultProps={{ colorScheme: 'blue', size: 'lg', variant: 'solid' }}
                        >
                            <Button colorScheme="blue" size="lg">Primary Action</Button>
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="Button"
                            defaultProps={{ colorScheme: 'green', size: 'md', variant: 'outline' }}
                        >
                            <Button colorScheme="green" variant="outline">Secondary</Button>
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="Button"
                            defaultProps={{ colorScheme: 'purple', size: 'sm', variant: 'ghost' }}
                        >
                            <Button colorScheme="purple" variant="ghost" size="sm">Ghost Button</Button>
                        </CustomizableWrapper>
                    </div>
                </section>

                {/* Customizable Feature Cards */}
                <section className="mx-auto w-full max-w-4xl px-4">
                    <div className="text-center mb-8">
                        <CustomizableWrapper 
                            elementType="Headline"
                            defaultProps={{ colorScheme: 'emerald', size: 'lg' }}
                        >
                            <Headline colorScheme="emerald">Customizable Feature Cards</Headline>
                        </CustomizableWrapper>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        <CustomizableWrapper 
                            elementType="FeatureCard"
                            defaultProps={{ colorScheme: 'blue', variant: 'shadow', iconSize: 'lg' }}
                        >
                            <FeatureCard
                                icon={Lightning}
                                title="Fast Setup"
                                description="Deploy onboarding flows in minutes with our drag‑and‑drop builder."
                                colorScheme="blue"
                                variant="shadow"
                            />
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="FeatureCard"
                            defaultProps={{ colorScheme: 'green', variant: 'elevated', iconSize: 'xl' }}
                        >
                            <FeatureCard
                                icon={Shield}
                                title="Secure"
                                description="Built‑in XSS protection and instant CSRF shields."
                                colorScheme="green"
                                variant="elevated"
                                iconSize="xl"
                            />
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="FeatureCard"
                            defaultProps={{ colorScheme: 'purple', variant: 'bordered', iconSize: 'lg' }}
                        >
                            <FeatureCard
                                icon={Sparkles}
                                title="Delightful"
                                description="Smooth micro‑animations keep users engaged from step 1."
                                colorScheme="purple"
                                variant="bordered"
                            />
                        </CustomizableWrapper>
                    </div>
                </section>

                {/* Customizable Form Elements */}
                <section className="mx-auto w-full max-w-2xl px-4">
                    <div className="text-center mb-8">
                        <CustomizableWrapper 
                            elementType="Headline"
                            defaultProps={{ colorScheme: 'pink', size: 'lg' }}
                        >
                            <Headline colorScheme="pink">Customizable Form Elements</Headline>
                        </CustomizableWrapper>
                    </div>

                    <div className="space-y-6">
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
                            defaultProps={{ colorScheme: 'emerald', size: 'md', variant: 'filled' }}
                        >
                            <TextInput
                                label="Full Name"
                                placeholder="Enter your name"
                                colorScheme="emerald"
                                variant="filled"
                                leftIcon={<span>👤</span>}
                            />
                        </CustomizableWrapper>
                    </div>
                </section>

                {/* Customizable Alerts */}
                <section className="mx-auto w-full max-w-3xl px-4">
                    <div className="text-center mb-8">
                        <CustomizableWrapper 
                            elementType="Headline"
                            defaultProps={{ colorScheme: 'orange', size: 'lg' }}
                        >
                            <Headline colorScheme="orange">Customizable Alerts</Headline>
                        </CustomizableWrapper>
                    </div>

                    <div className="space-y-4">
                        <CustomizableWrapper 
                            elementType="AlertMessage"
                            defaultProps={{ colorScheme: 'blue', variant: 'info' }}
                        >
                            <AlertMessage
                                variant="info"
                                title="Info Alert"
                                colorScheme="blue"
                                icon={<span>ℹ️</span>}
                            >
                                This is a customizable info alert. Try changing its color scheme!
                            </AlertMessage>
                        </CustomizableWrapper>

                        <CustomizableWrapper 
                            elementType="AlertMessage"
                            defaultProps={{ colorScheme: 'green', variant: 'success' }}
                        >
                            <AlertMessage
                                variant="success"
                                title="Success!"
                                colorScheme="green"
                                icon={<span>✅</span>}
                                closable={true}
                                onClose={() => console.log('Alert closed')}
                            >
                                You can customize colors, add icons, and make alerts closable.
                            </AlertMessage>
                        </CustomizableWrapper>
                    </div>
                </section>

                {/* Customizable Testimonial */}
                <section className="mx-auto w-full max-w-2xl px-4">
                    <div className="text-center mb-8">
                        <CustomizableWrapper 
                            elementType="Headline"
                            defaultProps={{ colorScheme: 'cyan', size: 'lg' }}
                        >
                            <Headline colorScheme="cyan">Customizable Testimonials</Headline>
                        </CustomizableWrapper>
                    </div>

                    <div className="flex justify-center">
                        <CustomizableWrapper 
                            elementType="Testimonial"
                            defaultProps={{ colorScheme: 'indigo', variant: 'shadow' }}
                        >
                            <Testimonial
                                quote="This customization system is amazing! I can change everything in real-time."
                                avatarUrl="https://i.pravatar.cc/80?img=12"
                                name="Sofia Ali"
                                role="Product Designer"
                                colorScheme="indigo"
                                variant="shadow"
                            />
                        </CustomizableWrapper>
                    </div>
                </section>

                {/* Instructions */}
                <section className="mx-auto w-full max-w-4xl px-4">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            🎨 How to Customize
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6 text-sm">
                            <div className="bg-white rounded-lg p-4">
                                <div className="text-2xl mb-2">🖱️</div>
                                <h3 className="font-semibold mb-2">Right Click</h3>
                                <p className="text-gray-600">Right-click any element to open the customization panel</p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <div className="text-2xl mb-2">✏️</div>
                                <h3 className="font-semibold mb-2">Edit Button</h3>
                                <p className="text-gray-600">Or hover and click the edit button that appears</p>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <div className="text-2xl mb-2">🎨</div>
                                <h3 className="font-semibold mb-2">Live Changes</h3>
                                <p className="text-gray-600">See your changes applied instantly as you customize</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <CustomizableWrapper 
                    elementType="Footer"
                    defaultProps={{ colorScheme: 'gray', variant: 'default' }}
                >
                    <Footer
                        brand="Customizable UI"
                        colorScheme="gray"
                        links={[
                            { label: "Documentation", href: "#" },
                            { label: "Examples", href: "#" },
                            { label: "Support", href: "#" },
                        ]}
                    />
                </CustomizableWrapper>
            </div>
        </div>
    );
} 