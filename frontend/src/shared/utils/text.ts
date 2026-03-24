/**
 * Text utility functions.
 */

/**
 * Normalize text by cleaning up line breaks and whitespace.
 */
export function normalizeText(text: string): string {
  // Handle CORO (chorus) marked text
  if (text.includes('@CORO@')) {
    const parts = text.split('\n');
    const header = parts[0];
    const body = parts.slice(1).join('\n');

    const normalizedBody = body
      .replace(/\r\n/g, '\n')
      .split(/\n{2,}/g)
      .map((block) => block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n\n');

    return `${header}\n${normalizedBody}`;
  }

  // Regular text normalization
  const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/g);
  return blocks
    .map((block) => block.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Check if text contains CORO marker.
 */
export function isCoro(text: string): boolean {
  return text.includes('@CORO@');
}

/**
 * Clean CORO marker from text.
 */
export function cleanCoroText(text: string): string {
  return text.replace(/@CORO@[^\n]*\n?/, '').trim();
}
