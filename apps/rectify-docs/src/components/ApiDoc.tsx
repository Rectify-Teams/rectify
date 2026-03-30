import { CodeBlock } from "./CodeBlock";

type Param = { name: string; type: string; optional?: boolean; description: string };

type ApiDocProps = {
  name: string;
  signature: string;
  description: string;
  params?: Param[];
  returns?: string;
  example?: string;
};

export function ApiDoc({ name, signature, description, params, returns, example }: ApiDocProps) {
  return (
    <div className="border border-white/[0.08] rounded-xl overflow-hidden mb-8">
      {/* Name bar */}
      <div className="bg-white/[0.03] px-5 py-3 border-b border-white/[0.06]">
        <code className="text-violet-300 font-mono font-semibold">{name}</code>
      </div>

      <div className="p-5">
        <CodeBlock code={signature} lang="ts" />
        <p className="text-slate-400 text-sm leading-relaxed mb-4">{description}</p>

        {params && params.length > 0 && (
          <div className="mb-4">
            <p className="text-[0.7rem] uppercase tracking-widest text-slate-500 font-semibold mb-3">Parameters</p>
            <div className="border border-white/[0.07] rounded-lg overflow-hidden text-sm">
              {params.map((p, i) => (
                <div
                  key={p.name}
                  className={`flex gap-4 px-4 py-2.5 ${i !== 0 ? "border-t border-white/[0.06]" : ""}`}
                >
                  <code className="text-blue-300 shrink-0 w-28">{p.name}{p.optional ? "?" : ""}</code>
                  <code className="text-teal-300 shrink-0 w-36 truncate">{p.type}</code>
                  <span className="text-slate-400">{p.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {returns && (
          <p className="text-sm text-slate-400 mb-4">
            <span className="text-slate-300 font-semibold">Returns: </span>
            <code className="text-teal-300">{returns}</code>
          </p>
        )}

        {example && (
          <>
            <p className="text-[0.7rem] uppercase tracking-widest text-slate-500 font-semibold mb-1">Example</p>
            <CodeBlock code={example} lang="tsx" />
          </>
        )}
      </div>
    </div>
  );
}
