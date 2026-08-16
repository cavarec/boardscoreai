import { playerColor } from "@/lib/playerColors";

/** Badge rond aux initiales du joueur (type avatar Slack/Gmail), utilisé là
 * où l'espace est trop réduit pour un pion illustré tout en restant lisible
 * à 1-3 lettres. `white` : mêmes raisons que Meeple — sur un onglet actif
 * dont le fond prend déjà la couleur du joueur, on inverse les couleurs pour
 * rester visible. */
export function PlayerAvatar({
  playerId,
  initials,
  size = 20,
  white = false,
}: {
  playerId: string;
  initials: string;
  size?: number;
  white?: boolean;
}) {
  const { fill, text } = playerColor(playerId);
  const bg = white ? "#FFFFFF" : fill;
  const label = white ? fill : text;
  const fontSize = initials.length >= 3 ? size * 0.32 : initials.length === 2 ? size * 0.4 : size * 0.5;

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, backgroundColor: bg, color: label, fontSize }}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-mono font-bold leading-none"
    >
      {initials}
    </span>
  );
}
