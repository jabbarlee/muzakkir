/**
 * Content processor for markdown from Supabase
 * Handles HTML tags, Arabic text formatting, and cleanup
 */

/**
 * Process raw content from Supabase and prepare it for rendering
 * - Converts <p class="arabic"> tags to proper markdown with styling
 * - Cleans up metadata/frontmatter if present
 * - Handles line breaks properly
 */
export function processContent(rawContent: string): string {
  if (!rawContent) return "";

  let content = rawContent;

  // Remove frontmatter/metadata block if present (YAML-style)
  content = content.replace(/^---[\s\S]*?---\n*/m, "");

  // Remove any date/metadata lines at the start
  content = content.replace(
    /^(date:|publish_date:|place:|aliases:|tags:|keywords:|source_name:|source_url:).*\n*/gm,
    ""
  );

  // Convert <p class="arabic" dir="rtl"> to a custom div with arabic class
  // This preserves the HTML for rehype-raw to process
  content = content.replace(
    /<p\s+class="arabic"\s+dir="rtl">([\s\S]*?)<\/p>/gi,
    '<div class="arabic-verse" dir="rtl">$1</div>'
  );

  // Also handle variations of the arabic class
  content = content.replace(
    /<p\s+dir="rtl"\s+class="arabic">([\s\S]*?)<\/p>/gi,
    '<div class="arabic-verse" dir="rtl">$1</div>'
  );

  // Convert <br/> and <br> to proper line breaks within arabic blocks
  content = content.replace(/<br\s*\/?>/gi, "\n");

  // Clean up multiple consecutive newlines (more than 2)
  content = content.replace(/\n{3,}/g, "\n\n");

  // Trim leading/trailing whitespace
  content = content.trim();

  return content;
}

/**
 * Check if text contains Arabic characters
 */
export function containsArabic(text: string): boolean {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  return arabicPattern.test(text);
}

/**
 * Extract the chapter title from content (if embedded)
 */
export function extractChapterTitle(content: string): string | null {
  // Look for a heading at the start
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  return null;
}

