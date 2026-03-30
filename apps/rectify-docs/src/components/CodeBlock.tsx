import { useState, useEffect } from "@rectify-dev/core";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("tsx", typescript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("json", json);

type CodeBlockProps = {
  code: string;
  lang?: string;
  filename?: string;
};

export function CodeBlock({ code, lang = "tsx", filename }: CodeBlockProps) {
  const [id] = useState(`cb-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const langKey = lang === "tsx" || lang === "jsx" ? "typescript" : lang;
      const result = hljs.highlight(code.trim(), { language: langKey });
      el.innerHTML = result.value;
    } catch {
      /* leave as plain text */
    }
  }, [id, code, lang]);

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.08] my-5 text-sm">
      {filename && (
        <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border-b border-white/[0.06]">
          <span className="text-slate-500 text-xs font-mono">{filename}</span>
          <span className="ml-auto text-slate-600 text-[10px] uppercase tracking-wider">{lang}</span>
        </div>
      )}
      <pre className="bg-[#161622] overflow-x-auto p-5 leading-relaxed">
        <code id={id} className="hljs font-mono">
          {code.trim()}
        </code>
      </pre>
    </div>
  );
}
