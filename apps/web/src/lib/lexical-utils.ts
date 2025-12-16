/**
 * Lexical Utilities for hybrid Markdown/Lexical JSON support
 */

/**
 * Check if content is valid Lexical JSON
 */
export function isLexicalJSON(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return parsed && typeof parsed === "object" && "root" in parsed;
  } catch {
    return false;
  }
}

/**
 * Convert simple Markdown to Lexical JSON format
 * This is a basic converter for backwards compatibility with existing Markdown content
 */
export function markdownToLexicalJSON(markdown: string): string {
  const lines = markdown.split("\n");
  const children: unknown[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Heading detection
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      children.push({
        type: "heading",
        tag: `h${level}`,
        children: parseInlineText(text),
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      });
      i++;
      continue;
    }

    // Unordered list detection
    if (line.match(/^[-*]\s+/)) {
      const listItems: unknown[] = [];
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        const itemText = lines[i].replace(/^[-*]\s+/, "");
        listItems.push({
          type: "listitem",
          value: listItems.length + 1,
          children: [
            {
              type: "paragraph",
              children: parseInlineText(itemText),
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        });
        i++;
      }
      children.push({
        type: "list",
        listType: "bullet",
        start: 1,
        tag: "ul",
        children: listItems,
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      });
      continue;
    }

    // Ordered list detection
    if (line.match(/^\d+\.\s+/)) {
      const listItems: unknown[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        const itemText = lines[i].replace(/^\d+\.\s+/, "");
        listItems.push({
          type: "listitem",
          value: listItems.length + 1,
          children: [
            {
              type: "paragraph",
              children: parseInlineText(itemText),
              direction: "ltr",
              format: "",
              indent: 0,
              version: 1,
            },
          ],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        });
        i++;
      }
      children.push({
        type: "list",
        listType: "number",
        start: 1,
        tag: "ol",
        children: listItems,
        direction: "ltr",
        format: "",
        indent: 0,
        version: 1,
      });
      continue;
    }

    // Regular paragraph
    children.push({
      type: "paragraph",
      children: parseInlineText(line),
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    });
    i++;
  }

  // If no content, add empty paragraph
  if (children.length === 0) {
    children.push({
      type: "paragraph",
      children: [],
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    });
  }

  return JSON.stringify({
    root: {
      type: "root",
      children,
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  });
}

/**
 * Parse inline text with basic formatting support
 * Returns array of text nodes with formatting
 */
function parseInlineText(text: string): unknown[] {
  // For now, return plain text - more complex parsing can be added later
  // This handles **bold** and *italic* by stripping the markers
  const cleanText = text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1");

  if (!cleanText.trim()) {
    return [];
  }

  return [
    {
      type: "text",
      text: cleanText,
      detail: 0,
      format: 0,
      mode: "normal",
      style: "",
      version: 1,
    },
  ];
}

/**
 * Get content in Lexical JSON format, converting from Markdown if needed
 */
export function getContentAsLexicalJSON(content: string | null | undefined): string | null {
  if (!content) return null;
  
  if (isLexicalJSON(content)) {
    return content;
  }
  
  return markdownToLexicalJSON(content);
}

/**
 * Create empty Lexical JSON document
 */
export function createEmptyLexicalJSON(): string {
  return JSON.stringify({
    root: {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [],
          direction: "ltr",
          format: "",
          indent: 0,
          version: 1,
        },
      ],
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  });
}

