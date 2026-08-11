import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";

const PRESETS = [60, 180, 300, 600];

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Bip généré à la volée (Web Audio) plutôt qu'un fichier audio à charger :
 * l'app reste 100% locale et ne dépend d'aucun asset externe. */
function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Web Audio indisponible : tant pis, pas de son plutôt qu'un plantage.
  }
}

export default function Timer() {
  const [duration, setDuration] = useState(180);
  const [remaining, setRemaining] = useState(180);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setRunning(false);
          beep();
          navigator.vibrate?.([200, 100, 200]);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function setPreset(seconds: number) {
    setRunning(false);
    setDuration(seconds);
    setRemaining(seconds);
  }

  function reset() {
    setRunning(false);
    setRemaining(duration);
  }

  const done = remaining === 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Minuteur" />
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-6">
        <p
          className={`font-mono text-6xl font-bold tabular-nums ${
            done ? "text-brick" : "text-felt-strong"
          }`}
        >
          {format(remaining)}
        </p>

        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                duration === p
                  ? "border-felt bg-felt-tint text-felt-strong"
                  : "border-line-strong text-ink-soft"
              }`}
            >
              {p < 60 ? `${p}s` : `${p / 60} min`}
            </button>
          ))}
        </div>

        <div className="flex w-full max-w-xs gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={reset}
            disabled={remaining === duration && !running}
          >
            Réinitialiser
          </Button>
          <Button
            className="flex-1"
            onClick={() => setRunning((r) => !r)}
            disabled={remaining === 0}
          >
            {running ? "Pause" : "Démarrer"}
          </Button>
        </div>
      </div>
    </div>
  );
}
