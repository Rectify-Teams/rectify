type CalloutVariant = "note" | "tip" | "warning" | "pitfall";

const VARIANTS: Record<CalloutVariant, { icon: string; label: string; border: string; bg: string; title: string }> = {
  note:    { icon: "ℹ️", label: "Note",    border: "border-blue-500/40",   bg: "bg-blue-500/[0.07]",   title: "text-blue-300"   },
  tip:     { icon: "✅", label: "Tip",     border: "border-green-500/40",  bg: "bg-green-500/[0.07]",  title: "text-green-300"  },
  warning: { icon: "⚠️", label: "Warning", border: "border-yellow-400/40", bg: "bg-yellow-400/[0.07]", title: "text-yellow-300" },
  pitfall: { icon: "🔴", label: "Pitfall", border: "border-red-400/40",    bg: "bg-red-400/[0.07]",    title: "text-red-300"    },
};

type CalloutProps = {
  type?: CalloutVariant;
  title?: string;
  children: any;
};

export function Callout({ type = "note", title, children }: CalloutProps) {
  const v = VARIANTS[type];
  return (
    <div className={`${v.bg} border-l-2 ${v.border} rounded-r-lg px-5 py-4 my-5`}>
      <p className={`text-sm font-semibold mb-1 ${v.title}`}>
        {v.icon} {title ?? v.label}
      </p>
      <div className="text-slate-300 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
