import { playerColor } from "@/lib/playerColors";

/** Pion coloré identifiant un joueur, dans le même esprit qu'un vrai meeple
 * de jeu de société — utilisé partout où un joueur apparaît (liste,
 * onglets de saisie, classement) pour le reconnaître d'un coup d'œil. */
export function Meeple({ playerId, size = 20 }: { playerId: string; size?: number }) {
  const { fill } = playerColor(playerId);
  return (
    <svg
      viewBox="0 0 24 28"
      width={size}
      height={(size * 28) / 24}
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="12" cy="7" r="6" fill={fill} />
      <path d="M4 27c0-7 3.5-11 8-11s8 4 8 11Z" fill={fill} />
    </svg>
  );
}
