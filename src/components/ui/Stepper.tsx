interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

/** Contrôle +/- géant : c'est la brique la plus utilisée de l'app pendant
 * une partie, elle doit rester tapable sans regarder précisément l'écran. */
export function Stepper({ value, onChange, step = 1, min, max }: StepperProps) {
  const clamp = (v: number) => {
    let next = v;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Diminuer"
        onClick={() => onChange(clamp(value - step))}
        className="h-11 w-11 shrink-0 rounded-xl border border-line-strong text-xl font-bold text-ink-soft active:bg-paper-sunken"
      >
        –
      </button>
      <span className="w-14 text-center font-mono text-lg font-bold tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="Augmenter"
        onClick={() => onChange(clamp(value + step))}
        className="h-11 w-11 shrink-0 rounded-xl border border-line-strong text-xl font-bold text-ink-soft active:bg-paper-sunken"
      >
        +
      </button>
    </div>
  );
}
