'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Notetaker notes come in WhatsApp style (*bold*, "* " bullets) and were being
// shown as raw text — an asterisk-heavy wall. Normalize to Markdown so they
// render as real structure. Gemini output (AI / combined) is already Markdown,
// so it's passed through untouched (whatsapp={false}).
function whatsappToMarkdown(src: string): string {
  const bold = (s: string) => s.replace(/\*(?!\s)([^*\n]+?)(?<!\s)\*/g, '**$1**');

  const proc = (raw: string): string => {
    const line = raw.replace(/\s+$/, '');
    if (line.trim() === '') return '';
    const ws = line.match(/^\s*/)?.[0] ?? '';
    const body = line.slice(ws.length);
    // Real bullet: "* text" or "- text"
    const bullet = body.match(/^[*-]\s+(.*)$/);
    if (bullet) return `${ws}- ${bold(bullet[1])}`;
    // Leading "*text" with a single unmatched asterisk → treat as a bullet and
    // drop the stray marker (common in hand-typed notetaker lines).
    if (body.startsWith('*') && (body.match(/\*/g)?.length ?? 0) === 1) {
      return `${ws}- ${bold(body.slice(1).trimStart())}`;
    }
    return `${ws}${bold(body)}`;
  };

  // Notetaker text rarely uses blank lines, but Markdown needs them to separate
  // paragraphs from lists. Insert a break between adjacent non-empty lines
  // unless both are bullets (so a bullet group stays one tight list).
  const lines = src.split('\n').map(proc);
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    const prev = i > 0 ? lines[i - 1] : '';
    if (cur !== '' && prev !== '') {
      const bothBullets =
        cur.trimStart().startsWith('- ') && prev.trimStart().startsWith('- ');
      if (!bothBullets) out.push('');
    }
    out.push(cur);
  }
  return out.join('\n');
}

/**
 * Calm, width-capped Markdown renderer for sermon notes. Constrains the reading
 * measure (~66ch) so text no longer runs the full width of the panel, and turns
 * WhatsApp markup into proper bold/bullets instead of literal asterisks.
 */
export function NoteMarkdown({
  text,
  whatsapp = false,
  className = '',
}: {
  text: string;
  whatsapp?: boolean;
  className?: string;
}) {
  const md = whatsapp ? whatsappToMarkdown(text) : text;
  return (
    <div
      className={
        'prose prose-sm prose-neutral dark:prose-invert max-w-[66ch] leading-relaxed ' +
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ' +
        'prose-p:my-2 prose-p:leading-relaxed ' +
        'prose-headings:font-semibold prose-headings:text-foreground prose-headings:mt-4 prose-headings:mb-2 prose-headings:text-[0.95rem] ' +
        'prose-strong:font-semibold prose-strong:text-foreground ' +
        '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 ' +
        '[&_li]:my-1 [&_li]:marker:text-muted-foreground/60 ' +
        'prose-a:text-primary prose-a:underline ' +
        'prose-hr:my-4 ' +
        className
      }
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  );
}
