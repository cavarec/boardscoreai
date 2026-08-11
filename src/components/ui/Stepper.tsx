interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

/**
 * Champ numérique flanqué de +/- : la saisie directe au clavier est
 * l'interaction principale (visible d'emblée, pas cachée derrière un tap sur
 * le nombre) — indispensable pour les scores à deux chiffres qu'on ne va pas
 * cliquer un par un. Les boutons +/- restent pour les ajustements rapides
 * d'une unité.
 */
export function Stepper({ value, onChange, step = 1, min, max }: StepperProps) {
  const clamp = (v: number) => {
    let next = v;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  };

  function commit(raw: string) {
    const parsed = Number(raw);
    if (raw.trim() !== "" && !Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
  }

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
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => commit(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        aria-label="Valeur"
        className="h-11 w-16 shrink-0 rounded-xl border border-felt bg-paper-raised text-center font-mono text-lg font-bold tabular-nums outline-none"
      />
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
