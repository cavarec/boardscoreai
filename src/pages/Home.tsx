import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { db, getFullMatch, type FullMatch } from "@/lib/db";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "Encore debout ?";
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default function Home() {
  const [resumable, setResumable] = useState<FullMatch | null>(null);

  useEffect(() => {
    db.matches
      .where("status")
      .equals("in_progress")
      .last()
      .then((m) => (m ? getFullMatch(m.id) : undefined))
      .then((full) => setResumable(full ?? null));
  }, []);

  return (
    <div className="flex flex-col gap-6 px-5 pt-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-felt-strong">BoardScore AI</p>
        <h1 className="mt-1 font-display text-3xl font-bold">{greeting()} 👋</h1>
        <p className="mt-1 text-ink-soft">Que jouez-vous ce soir ?</p>
      </div>

      <div className="flex flex-col gap-3">
        <Link to="/scan?mode=box">
          <Button className="w-full">Scanner la boîte du jeu</Button>
        </Link>
        <Link to="/scan?mode=sheet">
          <Button variant="secondary" className="w-full">
            Scanner la fiche de score
          </Button>
        </Link>
        <Link to="/games/search">
          <Button variant="secondary" className="w-full">
            Rechercher un jeu manuellement
          </Button>
        </Link>
      </div>

      {resumable && (
        <Card className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[0.68rem] uppercase tracking-wide text-amber-strong">
              Partie en cours
            </p>
            <p className="truncate font-semibold">{resumable.game.name}</p>
            <p className="text-sm text-ink-faint">{resumable.players.length} joueur(s)</p>
          </div>
          <Link to={`/match/${resumable.match.id}/score`}>
            <Button size="md">Reprendre</Button>
          </Link>
        </Card>
      )}

      <Card className="bg-felt-tint">
        <p className="text-sm text-ink-soft">
          Une idée de jeu en tête ?{" "}
          <Link to="/assistant" className="font-semibold text-felt-strong underline underline-offset-2">
            Demandez à l'assistant
          </Link>{" "}
          — « je joue à Wingspan », ou décrivez le jeu si vous ne connaissez pas son nom.
        </p>
      </Card>
    </div>
  );
}
