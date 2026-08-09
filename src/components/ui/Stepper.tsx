import { useState } from "react";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

/**
 * Contrôle +/- géant : c'est la brique la plus utilisée de l'app pendant
 * une partie, elle doit rester tapable sans regarder précisément l'écran.
 * Le nombre au centre est aussi tapable pour saisir une valeur directement
 * au clavier — indispensable pour les scores à deux chiffres (le niveau de
 * terraformation, par exemple) qu'on ne va pas cliquer un par un.
 */
export function Stepper({ value, onChange, step = 1, min, max }: StepperProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const clamp = (v: number) => {
    let next = v;
    if (min !== undefined) next = Math.max(min, next);
    if (max !== undefined) next = Math.min(max, next);
    return next;
  };

  function startEditing() {
    setDraft(String(value));
    setEditing(true);
  }

  function commit() {
    const parsed = Number(draft);
    if (draft.trim() !== "" && !Number.isNaN(parsed)) {
      onChange(clamp(parsed));
    }
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        type="number"
        inputMode="numeric"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        onFocus={(e) => e.currentTarget.select()}
        className="h-11 w-16 shrink-0 rounded-xl border border-felt bg-paper-raised text-center font-mono text-lg font-bold tabular-nums outline-none"
      />
    );
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
      <button
        type="button"
        onClick={startEditing}
        aria-label="Saisir une valeur"
        className="h-11 w-14 shrink-0 rounded-xl text-center font-mono text-lg font-bold tabular-nums active:bg-paper-sunken"
      >
        {value}
      </button>
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
