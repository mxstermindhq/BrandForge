"use client";

import { useCallback, useState } from "react";

type CodeBlockProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
};

/** Lightweight syntax-highlighted code block with copy button (lazy-loaded). */
export function CodeBlock({
  code,
  language = "text",
  showLineNumbers = false,
}: CodeBlockProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [code]);

  const lines = code.trimEnd().split("\n");

  return (
    <div className="relative mt-4 overflow-hidden rounded-md border border-b1 bg-[#0d1117] text-left">
      <div className="flex items-center justify-between border-b border-b1 bg-s2 px-3 py-1.5">
        <span className="font-mono text-[9px] uppercase tracking-wider text-muted">{language}</span>
        <button
          type="button"
          onClick={onCopy}
          className="font-mono text-[9px] text-accent-bright hover:text-text"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
        <code className="font-mono text-[#e6edf3]">
          {showLineNumbers
            ? lines.map((line, i) => (
                <span key={`${i}-${line.slice(0, 12)}`} className="table-row">
                  <span className="table-cell select-none pr-4 text-right text-muted">{i + 1}</span>
                  <span className="table-cell">{line || " "}</span>
                  {"\n"}
                </span>
              ))
            : code}
        </code>
      </pre>
    </div>
  );
}
