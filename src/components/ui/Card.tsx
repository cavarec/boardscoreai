import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-paper-raised border border-line rounded-card shadow-card p-4 ${className}`}
      {...props}
    />
  );
}

export function Pill({
  tone = "neutral",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "good" | "warn" | "pick" }) {
  const tones: Record<string, string> = {
    neutral: "border-line-strong text-ink-soft",
    good: "border-felt text-felt-strong bg-felt-tint",
    warn: "border-brick text-brick bg-brick-tint",
    pick: "border-amber text-amber-strong bg-amber-tint",
  };
  return (
    <span
      className={`inline-flex items-center font-mono text-[0.68rem] tracking-wide px-2 py-0.5 rounded-full border ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
