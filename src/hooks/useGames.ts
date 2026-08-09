import { useEffect, useState } from "react";
import { getAllGames } from "@/lib/db";
import type { Game } from "@/types";

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAllGames().then((list) => {
      if (!cancelled) {
        setGames(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { games, loading };
}
