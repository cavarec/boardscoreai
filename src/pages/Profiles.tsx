import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import {
  getHeadToHead,
  getProfileStats,
  mergeProfiles,
  renameProfile,
  type HeadToHead,
  type ProfileStats,
} from "@/lib/db";
import { computePlayerInitials } from "@/lib/playerInitials";

type H2hResult = HeadToHead & { opponentName: string };

export default function Profiles() {
  const [stats, setStats] = useState<ProfileStats[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [mergingId, setMergingId] = useState<string | null>(null);
  const [h2hId, setH2hId] = useState<string | null>(null);
  const [h2hResult, setH2hResult] = useState<H2hResult | null>(null);

  async function refresh() {
    setStats(await getProfileStats());
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!stats) return null;

  const initialsById = computePlayerInitials(stats.map((s) => s.profile));

  function toggleExpanded(profileId: string) {
    setExpandedId((id) => (id === profileId ? null : profileId));
    setMergingId(null);
    setH2hId(null);
    setH2hResult(null);
  }

  function toggleMerging(profileId: string) {
    setH2hId(null);
    setH2hResult(null);
    setMergingId((id) => (id === profileId ? null : profileId));
  }

  function toggleH2h(profileId: string) {
    setMergingId(null);
    setH2hResult(null);
    setH2hId((id) => (id === profileId ? null : profileId));
  }

  async function handleRename(profileId: string, currentName: string) {
    const next = prompt("Renommer ce joueur :", currentName);
    if (!next || !next.trim() || next.trim() === currentName) return;
    await renameProfile(profileId, next);
    await refresh();
  }

  async function handleMerge(sourceId: string, sourceName: string, targetId: string, targetName: string) {
    if (
      !confirm(
        `Fusionner "${sourceName}" avec "${targetName}" ? Toutes les parties de "${sourceName}" seront comptées pour "${targetName}", et "${sourceName}" disparaîtra. Irréversible.`
      )
    )
      return;
    await mergeProfiles(sourceId, targetId);
    setMergingId(null);
    setExpandedId(null);
    await refresh();
  }

  async function handleHeadToHead(profileId: string, opponentId: string, opponentName: string) {
    const result = await getHeadToHead(profileId, opponentId);
    setH2hResult({ ...result, opponentName });
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Joueurs" />
      <div className="flex flex-col gap-2 px-5 py-6">
        <p className="mb-1 text-sm text-ink-soft">
          Statistiques cumulées sur toutes vos parties terminées à plusieurs joueurs.
        </p>
        {stats.map(({ profile, matchesPlayed, wins, byGame }) => {
          const winRate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;
          const isExpanded = expandedId === profile.id;
          const isMerging = mergingId === profile.id;
          const isH2h = h2hId === profile.id;
          return (
            <div
              key={profile.id}
              className="overflow-hidden rounded-xl border border-line bg-paper-raised"
            >
              <button
                onClick={() => toggleExpanded(profile.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
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
              </button>
              {isExpanded && (
                <div className="flex flex-col gap-3 border-t border-line px-4 py-3">
                  {byGame.length > 0 && (
                    <div>
                      {byGame.map((g) => (
                        <div key={g.gameId} className="flex items-center justify-between py-1 text-sm">
                          <span className="truncate text-ink-soft">{g.gameName}</span>
                          <span className="shrink-0 font-mono tabular-nums">
                            {g.wins}/{g.matchesPlayed} · {Math.round((g.wins / g.matchesPlayed) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={() => handleRename(profile.id, profile.name)}
                      className="text-sm text-ink-soft underline underline-offset-2"
                    >
                      Renommer
                    </button>
                    {stats.length > 1 && (
                      <>
                        <button
                          onClick={() => toggleH2h(profile.id)}
                          className="text-sm text-ink-soft underline underline-offset-2"
                        >
                          Face à face avec...
                        </button>
                        <button
                          onClick={() => toggleMerging(profile.id)}
                          className="text-sm text-ink-soft underline underline-offset-2"
                        >
                          Fusionner avec...
                        </button>
                      </>
                    )}
                  </div>

                  {isH2h && !h2hResult && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs text-ink-faint">Comparer "{profile.name}" à :</p>
                      {stats
                        .filter((s) => s.profile.id !== profile.id)
                        .map((s) => (
                          <button
                            key={s.profile.id}
                            onClick={() => handleHeadToHead(profile.id, s.profile.id, s.profile.name)}
                            className="rounded-lg border border-line-strong px-3 py-2 text-left text-sm active:bg-paper-sunken"
                          >
                            {s.profile.name}
                          </button>
                        ))}
                    </div>
                  )}

                  {isH2h && h2hResult && (
                    <div className="rounded-lg bg-felt-tint px-3 py-2">
                      {h2hResult.matchesPlayed === 0 ? (
                        <p className="text-sm text-ink-soft">
                          Aucune partie jouée ensemble avec {h2hResult.opponentName}.
                        </p>
                      ) : (
                        <>
                          <p className="font-mono text-base font-bold tabular-nums text-felt-strong">
                            {profile.name} {h2hResult.winsA} – {h2hResult.winsB} {h2hResult.opponentName}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-faint">
                            {h2hResult.matchesPlayed} partie(s) jouée(s) ensemble
                            {h2hResult.ties > 0 ? ` · ${h2hResult.ties} égalité(s)` : ""}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {isMerging && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs text-ink-faint">
                        Choisir le profil qui absorbe "{profile.name}" :
                      </p>
                      {stats
                        .filter((s) => s.profile.id !== profile.id)
                        .map((s) => (
                          <button
                            key={s.profile.id}
                            onClick={() =>
                              handleMerge(profile.id, profile.name, s.profile.id, s.profile.name)
                            }
                            className="rounded-lg border border-line-strong px-3 py-2 text-left text-sm active:bg-paper-sunken"
                          >
                            {s.profile.name}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
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
