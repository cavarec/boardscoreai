import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";

const WHEEL_COLORS = ["#C4452E", "#2E6FA3", "#E7A33E", "#5B8C4A", "#7A5FBF", "#3F9C8C", "#B0518C", "#8A7355"];

export default function Wheel() {
  const [option, setOption] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  function add() {
    const trimmed = option.trim();
    if (!trimmed) return;
    setOptions((prev) => [...prev, trimmed]);
    setOption("");
    setWinner(null);
  }

  function remove(i: number) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
    setWinner(null);
  }

  function spin() {
    if (options.length < 2 || spinning) return;
    setSpinning(true);
    setWinner(null);
    const segAngle = 360 / options.length;
    const targetIndex = Math.floor(Math.random() * options.length);
    const targetCenter = targetIndex * segAngle + segAngle / 2;
    const base = rotation - (rotation % 360);
    const finalRotation = base + 5 * 360 + (360 - targetCenter);
    setRotation(finalRotation);
    setTimeout(() => {
      setSpinning(false);
      setWinner(options[targetIndex]);
    }, 3000);
  }

  const segAngle = options.length > 0 ? 360 / options.length : 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Roue de sélection" />
      <div className="flex flex-1 flex-col gap-5 px-5 py-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
          className="flex gap-2"
        >
          <input
            autoFocus
            value={option}
            onChange={(e) => setOption(e.target.value)}
            placeholder="Option"
            className="h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-paper-raised px-4 text-base outline-none focus:border-felt"
          />
          <Button type="submit" size="md" className="h-11">
            Ajouter
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {options.map((o, i) => (
            <button
              key={`${o}-${i}`}
              onClick={() => remove(i)}
              title="Retirer"
              className="flex items-center gap-1.5 rounded-full border border-line-strong bg-paper-raised px-3 py-1.5 text-sm text-ink active:bg-paper-sunken"
            >
              {o} ✕
            </button>
          ))}
          {options.length === 0 && <p className="text-ink-faint">Ajoutez au moins deux options.</p>}
        </div>

        {options.length >= 2 && (
          <div className="relative flex flex-1 items-center justify-center py-4">
            <div className="relative h-64 w-64">
              <div
                aria-hidden="true"
                className="absolute -top-1 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rotate-45 border-r-4 border-b-4 border-felt-strong bg-paper"
              />
              <div
                className="h-64 w-64 overflow-hidden rounded-full border-4 border-line-strong"
                style={{
                  background: `conic-gradient(${options
                    .map((_, i) => `${WHEEL_COLORS[i % WHEEL_COLORS.length]} ${i * segAngle}deg ${(i + 1) * segAngle}deg`)
                    .join(", ")})`,
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? "transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : undefined,
                }}
              >
                {options.map((o, i) => {
                  // Centre du texte au milieu du rayon de la part (pas collé
                  // au centre ni au bord) : c'est là qu'une étiquette reste
                  // lisible quel que soit le nombre d'options.
                  const angle = i * segAngle + segAngle / 2;
                  const rad = (angle * Math.PI) / 180;
                  const labelRadius = 76;
                  const x = labelRadius * Math.sin(rad);
                  const y = -labelRadius * Math.cos(rad);
                  return (
                    <span
                      key={i}
                      className="absolute left-1/2 top-1/2 w-16 truncate text-center text-xs font-semibold text-paper-raised"
                      style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${angle}deg)` }}
                    >
                      {o}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {winner && (
          <div className="flex flex-col items-center gap-1 rounded-2xl border border-amber bg-amber-tint px-6 py-4">
            <p className="text-sm text-amber-strong">Résultat</p>
            <p className="font-display text-2xl font-bold text-amber-strong">{winner}</p>
          </div>
        )}

        <Button className="w-full" onClick={spin} disabled={options.length < 2 || spinning}>
          Tourner la roue
        </Button>
      </div>
    </div>
  );
}
