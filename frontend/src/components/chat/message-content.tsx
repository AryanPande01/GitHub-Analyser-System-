/** Lightweight markdown-ish renderer for chat messages */
export function ChatMessageContent({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-sm leading-relaxed">
      {paragraphs.map((para, i) => {
        const lines = para.split("\n");
        const isList = lines.every((l) => /^[\s]*[-•*]\s/.test(l) || /^[\s]*\d+\.\s/.test(l) || l.trim() === "");

        if (isList && lines.some((l) => l.trim())) {
          return (
            <ul key={i} className="ml-1 list-none space-y-1.5">
              {lines.filter(Boolean).map((line, j) => {
                const text = line.replace(/^[\s]*[-•*]\s/, "").replace(/^[\s]*\d+\.\s/, "");
                return (
                  <li key={j} className="flex gap-2">
                    <span className="text-[var(--accent)]">•</span>
                    <span>{renderInline(text)}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        return (
          <p key={i} className="whitespace-pre-wrap">
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
