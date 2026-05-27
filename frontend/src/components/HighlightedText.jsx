/**
 * HighlightedText.jsx — Renders text with colored highlights for:
 *   - Ambiguous (vague) words  → red underline dashes
 *   - Abbreviations found      → purple highlight
 *   - Named entities (PERSON)  → green outline
 *   - Named entities (DATE)    → amber outline
 */
export default function HighlightedText({ text, ambiguousWords = [], abbreviationsFound = {}, entities = [] }) {
  if (!text) return null;

  // Build a sorted list of all spans to highlight
  const spans = [];

  // Ambiguous word spans
  ambiguousWords.forEach(word => {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    let m;
    while ((m = regex.exec(text)) !== null) {
      spans.push({ start: m.index, end: m.index + m[0].length, type: "vague", word });
    }
  });

  // Abbreviation spans
  Object.keys(abbreviationsFound).forEach(abbrev => {
    const regex = new RegExp(`\\b${abbrev.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    let m;
    while ((m = regex.exec(text)) !== null) {
      spans.push({ start: m.index, end: m.index + m[0].length, type: "abbrev", word: abbrev, expansion: abbreviationsFound[abbrev] });
    }
  });

  if (spans.length === 0) {
    return <span className="font-mono text-sm text-gray-200">{text}</span>;
  }

  // Sort by start, remove overlapping
  spans.sort((a, b) => a.start - b.start);
  const merged = [];
  for (const span of spans) {
    if (!merged.length || span.start >= merged[merged.length - 1].end) {
      merged.push(span);
    }
  }

  // Build rendered parts
  const parts = [];
  let cursor = 0;
  merged.forEach((span, i) => {
    if (cursor < span.start) {
      parts.push(<span key={`t-${i}`} className="text-gray-200">{text.slice(cursor, span.start)}</span>);
    }
    const content = text.slice(span.start, span.end);
    if (span.type === "vague") {
      parts.push(
        <span key={`v-${i}`} title={`Ambiguous: be more specific`}
          className="tag-VAGUE rounded px-1 cursor-help border-b-2 border-dashed border-red-400">
          {content}
        </span>
      );
    } else if (span.type === "abbrev") {
      parts.push(
        <span key={`a-${i}`} title={`Abbreviation: ${span.word} = ${span.expansion}`}
          className="tag-ABBREV rounded px-1 cursor-help">
          {content}
        </span>
      );
    }
    cursor = span.end;
  });
  if (cursor < text.length) {
    parts.push(<span key="tail" className="text-gray-200">{text.slice(cursor)}</span>);
  }

  return (
    <span className="font-mono text-sm leading-relaxed">
      {parts}
    </span>
  );
}
