import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useGames } from "@/hooks/useGames";
import { respondToMessage, type AssistantReply } from "@/lib/assistant";
import { createMatch } from "@/lib/db";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  reply?: AssistantReply;
}

const INTRO: ChatMessage = {
  id: "intro",
  role: "assistant",
  text:
    "Bonjour ! Dites-moi à quoi vous jouez — « je joue à Azul » — ou décrivez le jeu si vous ne connaissez pas son nom exact.",
};

export default function Assistant() {
  const { games } = useGames();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([INTRO]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text: trimmed };
    const reply = respondToMessage(trimmed, games);
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: reply.text,
      reply,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
  }

  async function startMatch(gameId: string) {
    const match = await createMatch(gameId);
    navigate(`/match/${match.id}/players`);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-5 pt-8 pb-3">
        <h1 className="font-display text-2xl font-bold">Assistant</h1>
        <p className="text-sm text-ink-faint">Simulation locale — aucune donnée envoyée à un serveur.</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-felt text-paper-raised"
                    : "bg-paper-raised border border-line text-ink"
                }`}
              >
                <p>{m.text}</p>
                {m.reply?.kind === "match_found" && m.reply.game && (
                  <Button size="md" className="mt-2 w-full" onClick={() => startMatch(m.reply!.game!.id)}>
                    Commencer une partie
                  </Button>
                )}
                {m.reply?.kind === "suggestions" && m.reply.suggestions && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    {m.reply.suggestions.map((s) => (
                      <button
                        key={s.game.id}
                        onClick={() => startMatch(s.game.id)}
                        className="rounded-lg border border-line-strong bg-paper px-3 py-1.5 text-left text-ink active:bg-paper-sunken"
                      >
                        {s.game.name}
                      </button>
                    ))}
                  </div>
                )}
                {m.reply?.kind === "not_found" && (
                  <Button
                    size="md"
                    variant="secondary"
                    className="mt-2 w-full"
                    onClick={() =>
                      navigate("/community/new", { state: { gameNameGuess: m.reply!.gameNameGuess } })
                    }
                  >
                    Créer un modèle pour ce jeu
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="safe-bottom flex gap-2 border-t border-line px-4 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez un message…"
          className="flex-1 rounded-full border border-line-strong bg-paper-raised px-4 py-2.5 outline-none focus:border-felt"
        />
        <button
          type="submit"
          aria-label="Envoyer"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-felt text-paper-raised"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
}
