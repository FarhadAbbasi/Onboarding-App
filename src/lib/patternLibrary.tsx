// =============================================================================
// Layer B: Pattern & Layout Library
// High-level templates with slots that AI fills (no layout invention allowed)
// =============================================================================

import React from 'react';
import { designTokens } from './designTokens';
import type { DesignTone } from './designTokens';

// Base slot interface that all patterns use
export interface BaseSlots {
  tone: DesignTone;
}

// =============================================================================
// Hero Patterns
// =============================================================================

export interface HeroSplitSlots extends BaseSlots {
  headline: string;
  body: string;
  illustration?: string;
  cta: {
    label: string;
    variant: 'primary' | 'secondary';
  };
}

export const HeroSplit: React.FC<HeroSplitSlots> = ({ 
  headline, 
  body, 
  illustration, 
  cta, 
  tone 
}) => (
  <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
        {/* Content */}
        <div className="lg:pr-8 lg:pt-4">
          <div className="lg:max-w-lg">
            <h1 
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
              style={{ fontSize: 'var(--fs-4xl)', fontFamily: 'var(--font-family)' }}
            >
              {headline}
            </h1>
            <p 
              className="mt-6 text-lg leading-8 text-gray-600"
              style={{ fontSize: 'var(--fs-lg)', marginTop: 'var(--space-stack)' }}
            >
              {body}
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <button
                className={`rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
                  cta.variant === 'primary' 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                    : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                }`}
                style={{ 
                  borderRadius: 'var(--radius-base)',
                  padding: 'var(--space-inline) var(--space-stack)',
                  transition: 'var(--motion-base) var(--motion-curve)'
                }}
              >
                {cta.label}
              </button>
            </div>
          </div>
        </div>
        
        {/* Illustration */}
        <div className="flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg">
            {illustration ? (
              <img 
                src={illustration} 
                alt="Hero illustration" 
                className="w-full h-auto rounded-2xl shadow-xl"
                style={{ borderRadius: 'var(--radius-base)' }}
              />
            ) : (
              <div 
                className="aspect-square w-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl shadow-xl flex items-center justify-center"
                style={{ borderRadius: 'var(--radius-base)' }}
              >
                <div className="text-white text-6xl">📱</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export interface HeroCenteredSlots extends BaseSlots {
  headline: string;
  body: string;
  cta: {
    label: string;
    variant: 'primary' | 'secondary';
  };
  features?: string[];
}

export const HeroCentered: React.FC<HeroCenteredSlots> = ({ 
  headline, 
  body, 
  cta, 
  features,
  tone 
}) => (
  <section className="relative isolate px-6 pt-14 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen flex items-center">
    <div className="mx-auto max-w-2xl text-center">
      <h1 
        className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
        style={{ fontSize: 'var(--fs-5xl)', fontFamily: 'var(--font-family)' }}
      >
        {headline}
      </h1>
      <p 
        className="mt-6 text-lg leading-8 text-gray-600"
        style={{ fontSize: 'var(--fs-lg)', marginTop: 'var(--space-stack)' }}
      >
        {body}
      </p>
      
      {features && (
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {features.map((feature, index) => (
            <span 
              key={index}
              className="inline-flex items-center gap-x-1.5 rounded-full bg-indigo-100 px-3 py-1.5 text-sm font-medium text-indigo-700"
              style={{ 
                borderRadius: 'var(--radius-base)',
                padding: 'var(--space-tight) var(--space-inline)'
              }}
            >
              ✓ {feature}
            </span>
          ))}
        </div>
      )}
      
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <button
          className={`rounded-xl px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
            cta.variant === 'primary' 
              ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
              : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
          }`}
          style={{ 
            borderRadius: 'var(--radius-base)',
            padding: 'var(--space-stack) var(--space-component)',
            transition: 'var(--motion-base) var(--motion-curve)'
          }}
        >
          {cta.label}
        </button>
      </div>
    </div>
  </section>
);

// =============================================================================
// Feature Patterns
// =============================================================================

export interface FeatureGrid3x2Slots extends BaseSlots {
  headline: string;
  body?: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export const FeatureGrid3x2: React.FC<FeatureGrid3x2Slots> = ({ 
  headline, 
  body, 
  features,
  tone 
}) => (
  <section className="py-24 bg-white">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 
          className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          style={{ fontSize: 'var(--fs-3xl)', fontFamily: 'var(--font-family)' }}
        >
          {headline}
        </h2>
        {body && (
          <p 
            className="mt-4 text-lg leading-8 text-gray-600"
            style={{ fontSize: 'var(--fs-lg)', marginTop: 'var(--space-stack)' }}
          >
            {body}
          </p>
        )}
      </div>
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col">
              <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                <div 
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-600 text-white text-lg"
                  style={{ 
                    borderRadius: 'var(--radius-base)',
                    fontSize: 'var(--fs-lg)'
                  }}
                >
                  {feature.icon}
                </div>
                {feature.title}
              </dt>
              <dd 
                className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600"
                style={{ fontSize: 'var(--fs-base)', marginTop: 'var(--space-stack)' }}
              >
                <p className="flex-auto">{feature.description}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  </section>
);

export interface FeatureAlternatingSlots extends BaseSlots {
  features: Array<{
    headline: string;
    body: string;
    illustration?: string;
    cta?: {
      label: string;
      variant: 'primary' | 'secondary';
    };
  }>;
}

export const FeatureAlternating: React.FC<FeatureAlternatingSlots> = ({ 
  features,
  tone 
}) => (
  <section className="py-24 bg-white">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      {features.map((feature, index) => (
        <div 
          key={index}
          className={`mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center ${
            index > 0 ? 'mt-32' : ''
          }`}
        >
          {/* Content */}
          <div className={index % 2 === 1 ? 'lg:order-2 lg:pl-8' : 'lg:pr-8'}>
            <div className="lg:max-w-lg">
              <h2 
                className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
                style={{ fontSize: 'var(--fs-3xl)', fontFamily: 'var(--font-family)' }}
              >
                {feature.headline}
              </h2>
              <p 
                className="mt-6 text-lg leading-8 text-gray-600"
                style={{ fontSize: 'var(--fs-lg)', marginTop: 'var(--space-stack)' }}
              >
                {feature.body}
              </p>
              {feature.cta && (
                <div className="mt-8">
                  <button
                    className={`rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
                      feature.cta.variant === 'primary' 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                        : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                    }`}
                    style={{ 
                      borderRadius: 'var(--radius-base)',
                      transition: 'var(--motion-base) var(--motion-curve)'
                    }}
                  >
                    {feature.cta.label}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Illustration */}
          <div className={`flex ${index % 2 === 1 ? 'lg:order-1 lg:justify-start' : 'lg:justify-end'}`}>
            <div className="relative w-full max-w-lg">
              {feature.illustration ? (
                <img 
                  src={feature.illustration} 
                  alt="Feature illustration" 
                  className="w-full h-auto rounded-2xl shadow-xl"
                  style={{ borderRadius: 'var(--radius-base)' }}
                />
              ) : (
                <div 
                  className="aspect-square w-full bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl shadow-xl flex items-center justify-center"
                  style={{ borderRadius: 'var(--radius-base)' }}
                >
                  <div className="text-white text-6xl">🎯</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// =============================================================================
// Testimonial Patterns
// =============================================================================

export interface TestimonialCarouselSlots extends BaseSlots {
  headline?: string;
  testimonials: Array<{
    content: string;
    author: string;
    title: string;
    company: string;
    avatar?: string;
    rating?: number;
  }>;
}

export const TestimonialCarousel: React.FC<TestimonialCarouselSlots> = ({ 
  headline, 
  testimonials,
  tone 
}) => (
  <section className="py-24 bg-gray-50">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      {headline && (
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            style={{ fontSize: 'var(--fs-3xl)', fontFamily: 'var(--font-family)' }}
          >
            {headline}
          </h2>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {testimonials.slice(0, 3).map((testimonial, index) => (
          <div 
            key={index}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ 
              borderRadius: 'var(--radius-base)',
              padding: 'var(--space-inset)',
              transition: 'var(--motion-base) var(--motion-curve)'
            }}
          >
            {/* Rating */}
            {testimonial.rating && (
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating! ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}
            
            {/* Content */}
            <blockquote 
              className="text-gray-700 leading-relaxed mb-6"
              style={{ fontSize: 'var(--fs-base)' }}
            >
              "{testimonial.content}"
            </blockquote>
            
            {/* Author */}
            <div className="flex items-center gap-4">
              {testimonial.avatar ? (
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                  style={{ borderRadius: 'var(--radius-base)' }}
                />
              ) : (
                <div 
                  className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ borderRadius: 'var(--radius-base)' }}
                >
                  {testimonial.author.charAt(0)}
                </div>
              )}
              <div>
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-600">{testimonial.title}</div>
                <div className="text-sm text-gray-500">{testimonial.company}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// =============================================================================
// Pricing Patterns
// =============================================================================

export interface PricingTiersSlots extends BaseSlots {
  headline: string;
  body?: string;
  tiers: Array<{
    name: string;
    price: string;
    period?: string;
    features: string[];
    cta: {
      label: string;
      variant: 'primary' | 'secondary';
    };
    popular?: boolean;
  }>;
}

export const PricingTiers: React.FC<PricingTiersSlots> = ({ 
  headline, 
  body, 
  tiers,
  tone 
}) => (
  <section className="py-24 bg-white">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 
          className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
          style={{ fontSize: 'var(--fs-3xl)', fontFamily: 'var(--font-family)' }}
        >
          {headline}
        </h2>
        {body && (
          <p 
            className="mt-6 text-lg leading-8 text-gray-600"
            style={{ fontSize: 'var(--fs-lg)', marginTop: 'var(--space-stack)' }}
          >
            {body}
          </p>
        )}
      </div>
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
        <div className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-3">
          {tiers.map((tier, index) => (
            <div 
              key={index}
              className={`rounded-3xl p-8 ring-1 ${
                tier.popular 
                  ? 'bg-indigo-600 ring-indigo-600 relative' 
                  : 'bg-white ring-gray-200 hover:ring-gray-300'
              } transition-all duration-200 hover:shadow-lg`}
              style={{ 
                borderRadius: 'var(--radius-base)',
                padding: 'var(--space-inset)',
                transition: 'var(--motion-base) var(--motion-curve)'
              }}
            >
              {tier.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32">
                  <div className="rounded-full bg-indigo-500 px-3 py-2 text-sm font-medium text-white text-center">
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between gap-x-4">
                <h3 
                  className={`text-lg font-semibold leading-8 ${
                    tier.popular ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {tier.name}
                </h3>
              </div>
              
              <p className="mt-4 flex items-baseline gap-x-2">
                <span 
                  className={`text-4xl font-bold tracking-tight ${
                    tier.popular ? 'text-white' : 'text-gray-900'
                  }`}
                  style={{ fontSize: 'var(--fs-3xl)' }}
                >
                  {tier.price}
                </span>
                {tier.period && (
                  <span 
                    className={`text-sm font-semibold leading-6 tracking-wide ${
                      tier.popular ? 'text-indigo-200' : 'text-gray-600'
                    }`}
                  >
                    {tier.period}
                  </span>
                )}
              </p>
              
              <ul className="mt-8 space-y-3 text-sm leading-6">
                {tier.features.map((feature, featureIndex) => (
                  <li 
                    key={featureIndex}
                    className={`flex gap-x-3 ${
                      tier.popular ? 'text-indigo-200' : 'text-gray-600'
                    }`}
                  >
                    <svg 
                      className={`h-6 w-5 flex-none ${
                        tier.popular ? 'text-indigo-400' : 'text-indigo-600'
                      }`}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                className={`mt-8 block w-full rounded-xl px-3 py-3 text-center text-sm font-semibold leading-6 shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
                  tier.popular
                    ? 'bg-white text-indigo-600 hover:bg-gray-50'
                    : tier.cta.variant === 'primary'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                    : 'bg-white text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-50'
                }`}
                style={{ 
                  borderRadius: 'var(--radius-base)',
                  transition: 'var(--motion-base) var(--motion-curve)'
                }}
              >
                {tier.cta.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// =============================================================================
// FAQ Patterns
// =============================================================================

export interface FAQSlots extends BaseSlots {
  headline: string;
  body?: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export const FAQ: React.FC<FAQSlots> = ({ 
  headline, 
  body, 
  questions,
  tone 
}) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 
            className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
            style={{ fontSize: 'var(--fs-3xl)', fontFamily: 'var(--font-family)' }}
          >
            {headline}
          </h2>
          {body && (
            <p 
              className="mt-6 text-lg leading-8 text-gray-600"
              style={{ fontSize: 'var(--fs-lg)', marginTop: 'var(--space-stack)' }}
            >
              {body}
            </p>
          )}
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="space-y-6">
            {questions.map((item, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                style={{ 
                  borderRadius: 'var(--radius-base)',
                  padding: 'var(--space-inset)'
                }}
              >
                <dt>
                  <button
                    className="flex w-full items-start justify-between text-left"
                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  >
                    <span 
                      className="text-lg font-semibold leading-7 text-gray-900"
                      style={{ fontSize: 'var(--fs-lg)' }}
                    >
                      {item.question}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      <svg
                        className={`h-6 w-6 transform transition-transform duration-200 ${
                          openIndex === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </button>
                </dt>
                {openIndex === index && (
                  <dd className="mt-4 pr-12">
                    <p 
                      className="text-base leading-7 text-gray-600"
                      style={{ fontSize: 'var(--fs-base)' }}
                    >
                      {item.answer}
                    </p>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

// =============================================================================
// Contact Form Patterns
// =============================================================================

export interface ContactFormSlots extends BaseSlots {
  headline: string;
  body?: string;
  fields: Array<{
    label: string;
    type: 'text' | 'email' | 'textarea';
    placeholder?: string;
    required?: boolean;
  }>;
  cta: {
    label: string;
    variant: 'primary' | 'secondary';
  };
}

export const ContactForm: React.FC<ContactFormSlots> = ({ 
  headline, 
  body, 
  fields,
  cta,
  tone 
}) => (
  <section className="py-24 bg-white">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        {/* Content */}
        <div className="lg:pr-8">
          <div className="lg:max-w-lg">
            <h2 
              className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              style={{ fontSize: 'var(--fs-3xl)', fontFamily: 'var(--font-family)' }}
            >
              {headline}
            </h2>
            {body && (
              <p 
                className="mt-6 text-lg leading-8 text-gray-600"
                style={{ fontSize: 'var(--fs-lg)', marginTop: 'var(--space-stack)' }}
              >
                {body}
              </p>
            )}
            
            {/* Contact info */}
            <dl className="mt-10 space-y-4 text-base leading-7 text-gray-600">
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Email</span>
                  <svg className="h-7 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </dt>
                <dd>support@example.com</dd>
              </div>
              <div className="flex gap-x-4">
                <dt className="flex-none">
                  <span className="sr-only">Phone</span>
                  <svg className="h-7 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </dt>
                <dd>+1 (555) 123-4567</dd>
              </div>
            </dl>
          </div>
        </div>
        
        {/* Form */}
        <div className="lg:pl-8">
          <form className="mx-auto max-w-xl">
            <div className="grid grid-cols-1 gap-6">
              {fields.map((field, index) => (
                <div key={index}>
                  <label 
                    htmlFor={`field-${index}`}
                    className="block text-sm font-semibold leading-6 text-gray-900 mb-2"
                  >
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`field-${index}`}
                      name={`field-${index}`}
                      rows={4}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                      style={{ 
                        borderRadius: 'var(--radius-base)',
                        transition: 'var(--motion-base) var(--motion-curve)'
                      }}
                    />
                  ) : (
                    <input
                      type={field.type}
                      id={`field-${index}`}
                      name={`field-${index}`}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                      style={{ 
                        borderRadius: 'var(--radius-base)',
                        transition: 'var(--motion-base) var(--motion-curve)'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-8">
              <button
                type="submit"
                className={`w-full rounded-xl px-6 py-4 text-lg font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
                  cta.variant === 'primary' 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                    : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
                }`}
                style={{ 
                  borderRadius: 'var(--radius-base)',
                  transition: 'var(--motion-base) var(--motion-curve)'
                }}
              >
                {cta.label}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
);

// =============================================================================
// Pattern Registry
// =============================================================================

export const patternRegistry = {
  'HeroSplit': HeroSplit,
  'HeroCentered': HeroCentered,
  'FeatureGrid3x2': FeatureGrid3x2,
  'FeatureAlternating': FeatureAlternating,
  'TestimonialCarousel': TestimonialCarousel,
  'PricingTiers': PricingTiers,
  'FAQ': FAQ,
  'ContactForm': ContactForm,
} as const;

export type PatternName = keyof typeof patternRegistry;

// Type helpers for AI to understand available slots
export type PatternSlots<T extends PatternName> = 
  T extends 'HeroSplit' ? HeroSplitSlots :
  T extends 'HeroCentered' ? HeroCenteredSlots :
  T extends 'FeatureGrid3x2' ? FeatureGrid3x2Slots :
  T extends 'FeatureAlternating' ? FeatureAlternatingSlots :
  T extends 'TestimonialCarousel' ? TestimonialCarouselSlots :
  T extends 'PricingTiers' ? PricingTiersSlots :
  T extends 'FAQ' ? FAQSlots :
  T extends 'ContactForm' ? ContactFormSlots :
  never;

// AI-friendly pattern descriptions
export const patternDescriptions = {
  'HeroSplit': 'Two-column hero with headline, body text, CTA, and illustration/visual on the side',
  'HeroCentered': 'Centered hero section with headline, body, CTA, and optional feature badges',
  'FeatureGrid3x2': '3-column grid showcasing features with icons, titles, and descriptions',
  'FeatureAlternating': 'Alternating feature sections with content and illustrations',
  'TestimonialCarousel': '3-column testimonial grid with ratings, quotes, and author info',
  'PricingTiers': 'Pricing tiers with name, price, period, features, and CTA',
  'FAQ': 'FAQ section with questions and answers',
  'ContactForm': 'Contact form with headline, body, fields, and CTA',
} as const; 