/**
 * Incrementally extracts one top-level JSON string field's VALUE from a stream
 * of raw text fragments — without ever holding valid JSON until the object is
 * fully closed.
 *
 * The chat endpoint asks the model for `{"response": "...", "suggestedQuestions": [...]}`
 * and streams it token-by-token. Deltas split anywhere — mid-key
 * (`"respo` / `nse":"halo`), mid-escape (`\` / `n`), mid-unicode-escape
 * (`\u00` / `e9`) — so this can't be regex-per-chunk; it has to be a small
 * state machine that remembers where it left off.
 *
 * Used to stream the "response" field's markdown text to the UI live, while
 * the rest of the JSON (suggestedQuestions, formTrigger) is only parsed once
 * the object is complete — same as before streaming existed.
 */
export class JsonStringFieldStreamer {
  private mode: 'seeking' | 'in_string' | 'done' = 'seeking';
  private seekBuffer = '';
  /** Raw (still-escaped) text held back because it ends mid-escape-sequence. */
  private pending = '';
  private readonly fieldPattern: RegExp;

  constructor(fieldName: string) {
    this.fieldPattern = new RegExp(`"${fieldName}"\\s*:\\s*"`);
  }

  /** Feed a raw chunk of streamed JSON text. Returns newly decoded field text ('' if none yet). */
  push(chunk: string): string {
    if (this.mode === 'done') return '';

    if (this.mode === 'seeking') {
      this.seekBuffer += chunk;
      const match = this.fieldPattern.exec(this.seekBuffer);
      if (!match) {
        // The field key can be split across many small deltas before it fully
        // appears. Cap the buffer so a response that never contains this field
        // doesn't accumulate the whole conversation in memory.
        if (this.seekBuffer.length > 4000) this.seekBuffer = this.seekBuffer.slice(-500);
        return '';
      }
      this.mode = 'in_string';
      const rest = this.seekBuffer.slice(match.index + match[0].length);
      this.seekBuffer = '';
      return this.consume(rest);
    }

    return this.consume(chunk);
  }

  private consume(raw: string): string {
    const s = this.pending + raw;
    this.pending = '';
    let out = '';
    let i = 0;

    while (i < s.length) {
      const c = s[i];

      if (c === '"') {
        this.mode = 'done';
        return out;
      }

      if (c === '\\') {
        const next = s[i + 1];
        if (next === undefined) {
          // Chunk ended exactly on a backslash — hold it for the next push().
          this.pending = s.slice(i);
          return out;
        }
        if (next === 'u') {
          const hex = s.slice(i + 2, i + 6);
          if (hex.length < 4) {
            this.pending = s.slice(i);
            return out;
          }
          out += String.fromCharCode(parseInt(hex, 16));
          i += 6;
          continue;
        }
        const escapes: Record<string, string> = {
          '"': '"', '\\': '\\', '/': '/', n: '\n', t: '\t', r: '\r', b: '\b', f: '\f',
        };
        out += escapes[next] ?? next;
        i += 2;
        continue;
      }

      out += c;
      i += 1;
    }
    return out;
  }
}
