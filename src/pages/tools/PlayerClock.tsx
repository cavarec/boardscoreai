import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { computePlayerInitials } from "@/lib/playerInitials";

interface ClockPlayer {
  id: string;
  name: string;
  elapsed: number;
}

function format(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Chronomètre façon pendule d'échecs : le temps tourne pour un seul joueur
 * à la fois. Toucher un joueur démarre son temps et arrête celui d'un autre
 * — pas besoin de bouton "tour suivant" séparé. */
export default function PlayerClock() {
  const [name, setName] = useState("");
  const [players, setPlayers] = useState<ClockPlayer[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activeId) return;
    intervalRef.current = setInterval(() => {
      setPlayers((prev) =>
        prev.map((p) => (p.id === activeId ? { ...p, elapsed: p.elapsed + 1 } : p))
      );
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeId]);

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayers((prev) => [...prev, { id: crypto.randomUUID(), name: trimmed, elapsed: 0 }]);
    setName("");
  }

  function remove(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    if (activeId === id) setActiveId(null);
  }

  function reset() {
    setActiveId(null);
    setPlayers((prev) => prev.map((p) => ({ ...p, elapsed: 0 })));
  }

  const initialsById = computePlayerInitials(players);

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Chronomètre par joueur" />
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom du joueur"
            className="h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-paper-raised px-4 text-base outline-none focus:border-felt"
          />
          <Button type="submit" size="md" className="h-11">
            Ajouter
          </Button>
        </form>

        {players.length > 0 && (
          <p className="text-xs text-ink-faint">Touchez un joueur pour démarrer ou arrêter son temps.</p>
        )}

        <div className="flex flex-col gap-2">
          {players.map((p) => {
            const isActive = p.id === activeId;
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveId(isActive ? null : p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setActiveId(isActive ? null : p.id);
                }}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                  isActive ? "border-felt bg-felt-tint" : "border-line bg-paper-raised"
                }`}
              >
                <span className="flex items-center gap-3">
                  <PlayerAvatar playerId={p.id} initials={initialsById[p.id]} size={24} />
                  <span className="font-medium">{p.name}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span
                    className={`font-mono text-lg font-bold tabular-nums ${
                      isActive ? "text-felt-strong" : "text-ink"
                    }`}
                  >
                    {format(p.elapsed)}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(p.id);
                    }}
                    className="text-xs text-ink-faint underline underline-offset-2"
                  >
                    Retirer
                  </button>
                </span>
              </div>
            );
          })}
          {players.length === 0 && <p className="text-ink-faint">Ajoutez des joueurs pour commencer.</p>}
        </div>

        {players.length > 0 && (
          <Button variant="secondary" className="mt-auto w-full" onClick={reset}>
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
