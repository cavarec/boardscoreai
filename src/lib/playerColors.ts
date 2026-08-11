/**
 * Couleur stable par joueur, dérivée de son id (pas de son `order`, qui
 * change avec le tirage au sort du joueur qui commence — sinon les couleurs
 * se mélangeraient à chaque tirage). Couleurs fixes (pas de tokens de thème)
 * pour rester reconnaissables identiquement en clair et en sombre.
 */
export interface PlayerColor {
  fill: string;
  text: string;
}

const PLAYER_COLORS: PlayerColor[] = [
  { fill: "#C4452E", text: "#FDEDE8" },
  { fill: "#2E6FA3", text: "#E9F1F8" },
  { fill: "#E7A33E", text: "#412402" },
  { fill: "#5B8C4A", text: "#EAF3DE" },
  { fill: "#7A5FBF", text: "#EEEDFE" },
  { fill: "#3F9C8C", text: "#E1F5EE" },
  { fill: "#B0518C", text: "#FBEAF0" },
  { fill: "#8A7355", text: "#F5F0E6" },
];

export function playerColor(id: string): PlayerColor {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return PLAYER_COLORS[hash % PLAYER_COLORS.length];
}
