import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { getProfileStats, type ProfileStats } from "@/lib/db";
import { computePlayerInitials } from "@/lib/playerInitials";

export default function Profiles() {
  const [stats, setStats] = useState<ProfileStats[] | null>(null);

  useEffect(() => {
    getProfileStats().then(setStats);
  }, []);

  if (!stats) return null;

  const initialsById = computePlayerInitials(stats.map((s) => s.profile));

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Joueurs" />
      <div className="flex flex-col gap-2 px-5 py-6">
        <p className="mb-1 text-sm text-ink-soft">
          Statistiques cumulées sur toutes vos parties terminées à plusieurs joueurs.
        </p>
        {stats.map(({ profile, matchesPlayed, wins }) => {
          const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;
          return (
            <div
              key={profile.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised px-4 py-3"
            >
              <span className="flex min-w-0 items-center gap-3">
                <PlayerAvatar playerId={profile.id} initials={initialsById[profile.id]} size={28} />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{profile.name}</span>
                  <span className="block text-xs text-ink-faint">
                    {matchesPlayed > 0
                      ? `${matchesPlayed} partie(s) jouée(s)`
                      : "Aucune partie terminée à plusieurs pour l'instant"}
                  </span>
                </span>
              </span>
              {matchesPlayed > 0 && (
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-lg font-bold tabular-nums text-felt-strong">
                    {wins}
                  </span>
                  <span className="block text-xs text-ink-faint">
                    victoire(s) · {winRate}%
                  </span>
                </span>
              )}
            </div>
          );
        })}
        {stats.length === 0 && (
          <p className="text-ink-faint">Aucun joueur pour l'instant.</p>
        )}
      </div>
    </div>
  );
}
