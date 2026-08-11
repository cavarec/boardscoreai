/**
 * Petites anecdotes sur des jeux connus, affichées au hasard à chaque
 * démarrage (voir Home.tsx) pour égayer l'accueil. Faits généraux
 * (créateur, origine, record...), pas des citations attribuées mot pour
 * mot à quelqu'un — plus sûr à écrire de mémoire sans risquer une
 * fausse citation.
 */
export const GAME_FACTS: string[] = [
  "Catane a été créé par Klaus Teuber, un dentiste allemand devenu créateur de jeux.",
  "Le Monopoly trouve son origine dans « The Landlord's Game », déposé en 1904 par Elizabeth Magie.",
  "Le mot « meeple » vient de la contraction de « my » et « people », inventé par des fans de Carcassonne.",
  "Les échecs existent sous une forme reconnaissable depuis plus de 1500 ans.",
  "Le jeu de Go, originaire de Chine, serait vieux de plus de 2500 ans.",
  "Le Cluedo a été inventé par Anthony Pratt pendant la Seconde Guerre mondiale.",
  "Le Trivial Pursuit a été créé en 1979 par deux journalistes canadiens.",
  "Le Rummikub a été inventé par Ephraim Hertzano, un immigrant roumain.",
  "« The Mansion of Happiness » (1843) est considéré comme le premier jeu de société publié aux États-Unis.",
  "Le Scrabble a été inventé dans les années 1930 par un architecte au chômage, Alfred Mosher Butts.",
  "Le mot « ludique » vient du latin ludus, qui signifie tout simplement « jeu ».",
  "Les dominos seraient apparus en Chine dès le 12ᵉ siècle.",
  "Carcassonne tire son nom d'une cité médiévale fortifiée du sud de la France.",
  "Le Uno a été créé en 1971 par un coiffeur de l'Ohio, Merle Robbins.",
];

export function randomGameFact(): string {
  return GAME_FACTS[Math.floor(Math.random() * GAME_FACTS.length)];
}
