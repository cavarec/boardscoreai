/**
 * Attribue à chaque joueur les initiales les plus courtes qui restent
 * uniques dans le groupe : 1 lettre par défaut, 2 si deux joueurs partagent
 * la même initiale, 3 au maximum si le doublon persiste (au-delà, la
 * collision est acceptée telle quelle — cas de deux prénoms identiques).
 */
export function computePlayerInitials(players: { id: string; name: string }[]): Record<string, string> {
  const keys = new Map(players.map((p) => [p.id, normalize(p.name)]));
  const initials: Record<string, string> = {};

  for (let len = 1; len <= 3; len++) {
    const counts = new Map<string, number>();
    for (const p of players) {
      if (initials[p.id]) continue;
      const prefix = (keys.get(p.id) ?? "").slice(0, len);
      counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    }
    for (const p of players) {
      if (initials[p.id]) continue;
      const prefix = (keys.get(p.id) ?? "").slice(0, len);
      if (len === 3 || counts.get(prefix) === 1) initials[p.id] = prefix.toUpperCase();
    }
  }

  return initials;
}

// Enlève les accents (é -> e) pour que les initiales restent lisibles même
// décomposées : "̀-ͯ" couvre les diacritiques combinants Unicode.
function normalize(name: string): string {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
