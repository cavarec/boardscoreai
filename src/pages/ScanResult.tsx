import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Card, Pill } from "@/components/ui/Card";
import { createMatch, getRuleSetForGame, linkBarcodeToGame } from "@/lib/db";
import { pushBarcodeLink } from "@/lib/sync";
import type { GameMatch } from "@/lib/matcher";
import { HIGH_CONFIDENCE_THRESHOLD } from "@/lib/matcher";

interface ScanResultState {
  matches: GameMatch[];
  ocrText: string;
  mode: "box" | "sheet";
  /** Code-barres à mémoriser une fois le jeu confirmé (scan direct ou secours OCR). */
  scannedBarcode?: string | null;
  /** Le meilleur candidat vient d'une correspondance directe de code-barres. */
  viaBarcode?: boolean;
}

export default function ScanResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ScanResultState | null;
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!state) navigate("/scan", { replace: true });
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const candidates = state.matches.filter((m) => !rejectedIds.includes(m.game.id));
  const best = candidates[0];
  const alternatives = candidates.slice(1);
  const guess = state.ocrText.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length >= 3) ?? "";

  async function confirm(gameId: string) {
    setStarting(true);
    if (state!.scannedBarcode) {
      await linkBarcodeToGame(state!.scannedBarcode, gameId);
      void pushBarcodeLink(state!.scannedBarcode, gameId);
    }
    const match = await createMatch(gameId);
    navigate(`/match/${match.id}/players`);
  }

  if (!best) {
    return (
      <div className="flex min-h-screen flex-col">
        <TopBar title="Jeu non reconnu" />
        <div className="flex flex-1 flex-col gap-4 px-5 py-6">
          <Card>
            <p className="text-ink-soft">
              Je n'ai pas retrouvé ce jeu dans le catalogue. Vous pouvez créer un nouveau modèle de
              score — l'OCR a déjà repéré le texte suivant, à corriger si besoin :
            </p>
            <p className="mt-3 rounded-xl bg-paper-sunken p-3 font-mono text-sm text-ink-soft">
              {guess || "(aucun texte lisible)"}
            </p>
          </Card>
          <Button
            onClick={() =>
              navigate("/community/new", {
                state: { gameNameGuess: guess, scannedBarcode: state.scannedBarcode },
              })
            }
          >
            Créer un modèle pour ce jeu
          </Button>
          <Button variant="secondary" onClick={() => navigate("/games/search")}>
            Rechercher un autre nom
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title="Jeu détecté" />
      <div className="flex flex-1 flex-col gap-4 px-5 py-6">
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">{best.game.name}</h2>
            {state.viaBarcode ? (
              <Pill tone="good">via code-barres</Pill>
            ) : best.score <= HIGH_CONFIDENCE_THRESHOLD ? (
              <Pill tone="good">confiance haute</Pill>
            ) : (
              <Pill tone="pick">à confirmer</Pill>
            )}
          </div>
          <p className="text-sm text-ink-faint">
            {best.game.publisher} · {best.game.year}
          </p>
          <CategoriesPreview gameId={best.game.id} />
        </Card>

        <div className="flex flex-col gap-3">
          <Button disabled={starting} onClick={() => confirm(best.game.id)}>
            Confirmer ce jeu
          </Button>
          <Button
            variant="secondary"
            disabled={starting}
            onClick={() => setRejectedIds((ids) => [...ids, best.game.id])}
          >
            Ce n'est pas le bon jeu
          </Button>
        </div>

        {alternatives.length > 0 && (
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-faint">
              Autres possibilités
            </p>
            <div className="flex flex-col gap-2">
              {alternatives.map((m) => (
                <button
                  key={m.game.id}
                  onClick={() => confirm(m.game.id)}
                  className="flex items-center justify-between rounded-xl border border-line bg-paper-raised px-4 py-3 text-left active:bg-paper-sunken"
                >
                  <span className="font-medium">{m.game.name}</span>
                  <span className="text-xs text-ink-faint">{m.game.publisher}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Button variant="ghost" onClick={() => navigate("/games/search")}>
          Rechercher un autre jeu
        </Button>
      </div>
    </div>
  );
}

function CategoriesPreview({ gameId }: { gameId: string }) {
  const [labels, setLabels] = useState<string[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getRuleSetForGame(gameId).then((rs) => {
      if (!cancelled) setLabels(rs?.categories.map((c) => c.label) ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [gameId]);
  if (!labels) return null;
  return <p className="text-sm text-ink-soft">{labels.join(" · ")}</p>;
}
