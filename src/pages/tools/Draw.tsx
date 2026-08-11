import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";

export default function Draw() {
  const [name, setName] = useState("");
  const [names, setNames] = useState<string[]>([]);
  const [drawn, setDrawn] = useState<string | null>(null);

  function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setNames((prev) => [...prev, trimmed]);
    setName("");
    setDrawn(null);
  }

  function remove(i: number) {
    setNames((prev) => prev.filter((_, idx) => idx !== i));
    setDrawn(null);
  }

  function draw() {
    if (names.length === 0) return;
    setDrawn(names[Math.floor(Math.random() * names.length)]);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Tirage au sort" />
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
            placeholder="Nom"
            className="h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-paper-raised px-4 text-base outline-none focus:border-felt"
          />
          <Button type="submit" size="md" className="h-11">
            Ajouter
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          {names.map((n, i) => (
            <button
              key={`${n}-${i}`}
              onClick={() => remove(i)}
              title="Retirer"
              className="flex items-center gap-1.5 rounded-full border border-line-strong bg-paper-raised px-3 py-1.5 text-sm text-ink active:bg-paper-sunken"
            >
              {n} ✕
            </button>
          ))}
          {names.length === 0 && <p className="text-ink-faint">Ajoutez au moins deux noms.</p>}
        </div>

        {drawn && (
          <div className="mt-4 flex flex-col items-center gap-1 rounded-2xl border border-amber bg-amber-tint px-6 py-8">
            <p className="text-sm text-amber-strong">Tiré au sort</p>
            <p className="font-display text-3xl font-bold text-amber-strong">{drawn}</p>
          </div>
        )}

        <Button className="mt-auto w-full" onClick={draw} disabled={names.length < 2}>
          Tirer au sort
        </Button>
      </div>
    </div>
  );
}
