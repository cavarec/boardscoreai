import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";

const PIP_LAYOUTS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

function Die({ value, rolling }: { value: number; rolling: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`h-14 w-14 shrink-0 ${rolling ? "animate-pulse" : ""}`}
      role="img"
      aria-label={`Dé : ${value}`}
    >
      <rect x="4" y="4" width="92" height="92" rx="16" fill="var(--bg-raised)" stroke="var(--line-strong)" strokeWidth="3" />
      {PIP_LAYOUTS[value].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="7" fill="var(--felt-strong)" />
      ))}
    </svg>
  );
}

export default function Dice() {
  const [count, setCount] = useState(2);
  const [results, setResults] = useState<number[]>([4, 5]);
  const [rolling, setRolling] = useState(false);

  function roll() {
    setRolling(true);
    setTimeout(() => {
      setResults(Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6)));
      setRolling(false);
    }, 400);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Dés" />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-ink-soft">Nombre de dés</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCount((c) => Math.max(1, c - 1))}
              className="h-9 w-9 rounded-lg border border-line-strong text-lg font-bold text-ink-soft active:bg-paper-sunken"
            >
              –
            </button>
            <span className="w-6 text-center font-mono text-lg font-bold">{count}</span>
            <button
              onClick={() => setCount((c) => Math.min(6, c + 1))}
              className="h-9 w-9 rounded-lg border border-line-strong text-lg font-bold text-ink-soft active:bg-paper-sunken"
            >
              +
            </button>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {results.slice(0, count).map((v, i) => (
            <Die key={i} value={v} rolling={rolling} />
          ))}
        </div>

        {count > 1 && (
          <p className="text-sm text-ink-faint">
            Total : <span className="font-mono font-bold text-felt-strong">{results.slice(0, count).reduce((a, b) => a + b, 0)}</span>
          </p>
        )}

        <Button className="w-full max-w-xs" onClick={roll} disabled={rolling}>
          Lancer les dés
        </Button>
      </div>
    </div>
  );
}
