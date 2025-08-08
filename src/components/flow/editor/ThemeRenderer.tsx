import React, { useEffect, useRef } from 'react';
import type { ParsedTheme } from './AIHtmlParser';

interface ThemeRendererProps {
  theme: ParsedTheme;
  children?: React.ReactNode;
}

/**
 * Renders the theme HTML (with empty wrapper div) and injects children into the wrapper div.
 */
export const ThemeRenderer: React.FC<ThemeRendererProps> = ({ theme, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!theme?.html || !containerRef.current) return;
    // Parse the theme HTML and inject it into the container
    containerRef.current.innerHTML = theme.html;
    // Find the main wrapper div
    const wrapper = containerRef.current.querySelector('body > div');
    if (wrapper && children) {
      // Clear any existing children (should be empty already)
      while (wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);
      // Create a React portal for the children
      // Instead, we append a placeholder and render children after
      const placeholder = document.createElement('div');
      placeholder.setAttribute('data-theme-blocks', '');
      wrapper.appendChild(placeholder);
    }
  }, [theme]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* We'll render children into the placeholder after the theme HTML is set */}
      {theme?.html && (
        <RenderBlocksIntoTheme>{children}</RenderBlocksIntoTheme>
      )}
    </div>
  );
};

// Helper to render children into the placeholder div inside the theme
const RenderBlocksIntoTheme: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const placeholder = document.querySelector('[data-theme-blocks]');
    if (placeholder && placeholder.parentElement) {
      // Render children into the placeholder
      // Remove any previous React roots
      placeholder.innerHTML = '';
      // Use ReactDOM to render children into the placeholder
      // (React 18+)
      // @ts-ignore
      import('react-dom/client').then(({ createRoot }) => {
        createRoot(placeholder).render(children);
      });
    }
  }, [children]);
  return null;
}; 