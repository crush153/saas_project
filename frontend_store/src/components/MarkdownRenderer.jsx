'use client';

/**
 * MarkdownRenderer - Render markdown đơn giản không cần thư viện
 * Hỗ trợ: heading, bold, italic, code, link, bullet list, numbered list, quote, xuống dòng
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  // Tách thành các dòng
  const lines = content.split('\n');
  const elements = [];
  let inList = false;
  let listItems = [];
  let listType = null;

  const processInline = (text) => {
    let processed = text
      // Code inline: `code`
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-500 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>')
      // Bold: **text** hoặc __text__
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
      .replace(/__(.+?)__/g, '<strong class="font-bold text-gray-900">$1</strong>')
      // Italic: *text* hoặc _text_
      .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
      .replace(/_(.+?)_/g, '<em class="italic">$1</em>')
      // Link: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>')
      // Strikethrough: ~~text~~
      .replace(/~~(.+?)~~/g, '<del class="text-gray-400">$1</del>');
    return processed;
  };

  const flushList = () => {
    if (listItems.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <Tag key={`list-${elements.length}`} className={`${listType === 'ol' ? 'list-decimal' : 'list-disc'} pl-5 space-y-1 my-2`}>
          {listItems.map((item, i) => (
            <li key={i} className="text-gray-700" dangerouslySetInnerHTML={{ __html: processInline(item) }} />
          ))}
        </Tag>
      );
      listItems = [];
      inList = false;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Heading: ## text
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const Tag = `h${level}`;
      elements.push(
        <Tag key={i} className={`font-bold text-gray-900 mt-4 mb-2 ${level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : level === 3 ? 'text-base' : 'text-sm'}`}
          dangerouslySetInnerHTML={{ __html: processInline(headingMatch[2]) }}
        />
      );
      continue;
    }

    // Quote: > text
    const quoteMatch = trimmed.match(/^>\s+(.+)$/);
    if (quoteMatch) {
      flushList();
      elements.push(
        <blockquote key={i} className="border-l-4 border-blue-300 bg-blue-50 pl-4 py-2 my-2 text-gray-700 italic rounded-r"
          dangerouslySetInnerHTML={{ __html: processInline(quoteMatch[1]) }}
        />
      );
      continue;
    }

    // Horizontal rule: ---
    if (/^---+\s*$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={i} className="my-4 border-gray-200" />);
      continue;
    }

    // Bullet list: - item hoặc * item
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!inList) {
        inList = true;
        listType = 'ul';
      }
      listItems.push(bulletMatch[1]);
      continue;
    }

    // Numbered list: 1. item
    const numMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numMatch) {
      if (!inList) {
        inList = true;
        listType = 'ol';
      }
      listItems.push(numMatch[1]);
      continue;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={i} className="text-gray-700 leading-relaxed mb-2"
        dangerouslySetInnerHTML={{ __html: processInline(trimmed) }}
      />
    );
  }

  flushList();

  return <div className="markdown-content">{elements}</div>;
}