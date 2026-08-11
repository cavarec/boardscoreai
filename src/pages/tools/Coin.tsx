import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";

export default function Coin() {
  const [result, setResult] = useState<"pile" | "face" | null>(null);
  const [flipping, setFlipping] = useState(false);

  function flip() {
    setFlipping(true);
    setResult(null);
    setTimeout(() => {
      setResult(Math.random() < 0.5 ? "pile" : "face");
      setFlipping(false);
    }, 500);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Pile ou face" />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-5 py-6">
        <div
          className={`flex h-32 w-32 items-center justify-center rounded-full border-4 border-amber bg-amber-tint transition-transform duration-500 ${
            flipping ? "animate-spin" : ""
          }`}
        >
          <span className="font-display text-2xl font-bold text-amber-strong">
            {flipping ? "…" : result ? (result === "pile" ? "Pile" : "Face") : "?"}
          </span>
        </div>

        <Button className="w-full max-w-xs" onClick={flip} disabled={flipping}>
          Lancer
        </Button>
      </div>
    </div>
  );
}
