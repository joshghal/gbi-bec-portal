'use client';

import { useState } from 'react';

interface FAQItem {
  q: string;
  a: string;
}

/**
 * Render a minimal markdown-link-aware answer.
 * Supports `[label](https://...)` syntax — the rest passes through as text.
 * Kept deliberately tiny (no full markdown parser) since the FAQ strings are
 * authored in-repo and the syntax is predictable.
 */
function renderAnswer(text: string): React.ReactNode {
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <a
        key={key++}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-2 hover:underline"
      >
        {match[1]}
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

/**
 * FAQ accordion that keeps all answer content mounted in the DOM
 * at all times — only the wrapper's height/opacity animates. This
 * preserves SEO: Googlebot reads the full Q&A from the rendered
 * HTML regardless of open/closed state, and the FAQPage JSON-LD
 * (rendered separately on the page) remains the authoritative
 * structured-data source for rich results.
 */
export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border-t border-border/50 last:border-b">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-start justify-between gap-6 py-5 sm:py-6 text-left cursor-pointer group"
            >
              <h4 className="font-serif text-lg sm:text-xl font-bold tracking-[-0.02em] leading-[1.3] text-foreground group-hover:opacity-70 transition-opacity">
                {item.q}
              </h4>
              <span
                className="shrink-0 mt-1 w-6 h-6 flex items-center justify-center text-foreground/40 transition-transform duration-300"
                style={{ transform: isOpen ? 'rotate(45deg)' : 'none' }}
                aria-hidden="true"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1v12M1 7h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>
            {/* Height animation via `display: grid` + animated
                grid-template-rows between 0fr and 1fr. Pure CSS, keeps the
                answer always mounted in the DOM for SEO. */}
            <div
              className="grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
              style={{
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <p className="pb-6 text-base sm:text-lg text-foreground/70 leading-relaxed">
                  {renderAnswer(item.a)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
