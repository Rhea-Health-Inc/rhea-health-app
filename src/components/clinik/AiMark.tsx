import { Sparkles } from "lucide-react";

/**
 * The single provenance marker for anything Rhea's AI generated: the
 * Sparkles glyph, in brand green. Use the labelled chip on generated
 * documents and outputs; use the icon-only mark in dense lists and card
 * headers. If the AI marker ever changes, it changes here — nowhere else.
 */
export function AiMark({
  variant = "chip",
  className = "",
}: {
  variant?: "chip" | "icon";
  className?: string;
}) {
  if (variant === "icon") {
    return (
      <Sparkles
        aria-label="AI generated"
        role="img"
        className={`w-3.5 h-3.5 text-primary shrink-0 ${className}`}
      />
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary shrink-0 ${className}`}
    >
      <Sparkles aria-hidden className="w-3 h-3" /> AI
    </span>
  );
}
