import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Card";
import { listCommunityTemplates, voteTemplate } from "@/lib/db";
import { FORMULA_LABELS } from "@/lib/scoreEngine";
import type { CommunityTemplate } from "@/types";

const STATUS_TONE: Record<CommunityTemplate["status"], "good" | "pick" | "warn"> = {
  approved: "good",
  pending: "pick",
  rejected: "warn",
};
const STATUS_LABEL: Record<CommunityTemplate["status"], string> = {
  approved: "validé",
  pending: "en attente",
  rejected: "rejeté",
};

export default function Community() {
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);

  async function refresh() {
    setTemplates(await listCommunityTemplates());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="flex flex-col gap-4 px-5 pt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="min-w-0 font-display text-2xl font-bold">Communauté</h1>
        <Link to="/community/new" className="shrink-0">
          <Button size="md">+ Proposer</Button>
        </Link>
      </div>
      <p className="text-sm text-ink-soft">
        Chaque modèle proposé ici enrichit la base commune. Votez pour faire remonter les modèles
        les plus fiables.
      </p>

      <div className="flex flex-col gap-3">
        {templates.map((t) => (
          <div key={t.id} className="rounded-xl border border-line bg-paper-raised p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{t.gameNameGuess}</p>
                <p className="text-xs text-ink-faint">
                  {t.proposedCategories.length} catégorie(s) ·{" "}
                  {new Date(t.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <Pill tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Pill>
            </div>

            <ul className="mt-3 flex flex-wrap gap-1.5">
              {t.proposedCategories.map((c, i) => (
                <li
                  key={i}
                  className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-ink-soft"
                >
                  {c.label} · {FORMULA_LABELS[c.formulaType]}
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={async () => {
                  await voteTemplate(t.id, 1);
                  refresh();
                }}
                className="flex items-center gap-1 rounded-full border border-line-strong px-3 py-1 text-sm active:bg-paper-sunken"
              >
                👍 {t.votes}
              </button>
              {t.sourceNote && <p className="truncate text-xs text-ink-faint">{t.sourceNote}</p>}
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <p className="text-ink-faint">Aucune proposition pour l'instant — soyez le premier !</p>
        )}
      </div>
    </div>
  );
}
