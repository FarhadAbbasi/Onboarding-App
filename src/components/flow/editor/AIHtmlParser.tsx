// AI prompt requirement:
// "The <body> of the HTML must contain a single <main> (the main wrapper) for theme/background/layout. Inside this wrapper, use only the allowed elements for content blocks (e.g., <h1>, <h2>, <ul>, <button>, <blockquote>, etc.) as direct children. Do not use any additional <main> or <div>s inside the main wrapper."
//
// Utility to parse AI-generated HTML into blocks and theme, and serialize back

export interface ParsedBlock {
  id: string;
  type: string;
  content: string;
  styles?: React.CSSProperties;
}

export interface ParsedTheme {
  html: string; // The full HTML document with the main wrapper <main> present but empty
}

const ALLOWED_BLOCK_TYPES = [
  'headline',
  'subheadline',
  'feature',
  'cta',
  'testimonial',
  'paragraph',
  'link',
  'footer',
  'illustration',
];

function extractBackgroundFromBody(body: HTMLElement): string | undefined {
  const bg = body.style.background || body.style.backgroundColor;
  if (bg) return bg;
  // Try to find a background in a wrapper div
  const wrapper = body.querySelector('div[style*="background"]');
  if (wrapper && wrapper instanceof HTMLElement) {
    return wrapper.style.background || wrapper.style.backgroundColor;
  }
  return undefined;
}

function extractBlockType(el: HTMLElement): string | undefined {
  // First check for data-element attribute (our new standard)
  if (el.dataset.element && ALLOWED_BLOCK_TYPES.includes(el.dataset.element)) {
    let type = el.dataset.element;
    // Map AI component names to our component names
    if (type === 'feature') type = 'feature-list';
    return type;
  }
  // Legacy support: check data-type
  if (el.dataset.type && ALLOWED_BLOCK_TYPES.includes(el.dataset.type)) {
    let type = el.dataset.type;
    // Map AI component names to our component names
    if (type === 'feature') type = 'feature-list';
    return type;
  }
  // Check class names for type hints
  const classList = Array.from(el.classList);
  for (const type of ALLOWED_BLOCK_TYPES) {
    if (classList.some(cls => cls.toLowerCase().includes(type))) return type;
  }
  // Fallback: tag name mapping
  const tag = el.tagName.toLowerCase();
  if (tag === 'h1') return 'headline';
  if (tag === 'h2') return 'subheadline';
  if (tag === 'ul' || tag === 'ol') return 'feature-list';
  if (tag === 'button') return 'cta';
  if (tag === 'blockquote') return 'testimonial';
  if (tag === 'p') return 'paragraph';
  if (tag === 'a') return 'link';
  if (tag === 'footer') return 'footer';
  if (tag === 'svg') return 'illustration';
  return undefined;
}

function extractBlockContent(el: HTMLElement, type: string): string {
  // For testimonial, try to extract structured info
  if (type === 'testimonial') {
    const text = el.textContent || '';
    const author = el.querySelector('.author')?.textContent || '';
    const role = el.querySelector('.role')?.textContent || '';
    const company = el.querySelector('.company')?.textContent || '';
    return JSON.stringify({ text, author, role, company });
  }
  // For feature-list, serialize list items
  if (type === 'feature-list' || type === 'feature') {
    const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent || '');
    return JSON.stringify({ features: items });
  }
  // Default: innerText
  return el.textContent || '';
}

export function parseAIHtmlToBlocksAndTheme(html: string): { blocks: ParsedBlock[]; theme: ParsedTheme } {

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;
  let blocks: ParsedBlock[] = [];
  let blockId = 1;

  // Find the main wrapper <main> (the only child of body)
  const wrapper = Array.from(body.children).find(
    el => el.tagName.toLowerCase() === 'main'
  ) as HTMLElement | undefined;
  if (!wrapper) {
    console.warn('[AIHtmlParser] No main wrapper <main> found in <body>!');
    return { blocks: [], theme: { html } };
  }

  // Extract blocks from direct children of wrapper
  Array.from(wrapper.children).forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const type = extractBlockType(el);
    if (!type) return;
    const content = extractBlockContent(el, type);
    const styles: React.CSSProperties = {};
    if (el.style.color) styles.color = el.style.color;
    if (el.style.fontSize) styles.fontSize = el.style.fontSize;
    if (el.style.background) styles.background = el.style.background;
    const block = {
      id: `block-${blockId++}`,
      type,
      content,
      styles: Object.keys(styles).length ? styles : undefined,
    };

    blocks.push(block);
  });

  // Remove all children from the wrapper <main> (but keep the wrapper itself)
  while (wrapper.firstChild) {
    wrapper.removeChild(wrapper.firstChild);
  }

  // Serialize the full HTML document as the theme, with the wrapper <main> empty
  const themeHtml = doc.documentElement.outerHTML;
  const theme: ParsedTheme = { html: themeHtml };

  if (blocks.length === 0) {
    console.warn('[AIHtmlParser] No blocks found in main wrapper <main>!');
  }
  return { blocks, theme };
}

// Serialize blocks and theme back to HTML
export function serializeBlocksAndThemeToHtml(blocks: ParsedBlock[], theme: ParsedTheme): string {
  // TODO: Implement serialization logic
  return '';
} 