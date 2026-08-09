import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { useGames } from "@/hooks/useGames";
import { recognizeText, type OcrProgress } from "@/lib/ocr";
import { matchGamesFromOcrText } from "@/lib/matcher";

const STAGE_LABELS: Record<OcrProgress["stage"], string> = {
  "loading-engine": "Démarrage du moteur OCR…",
  "loading-language": "Chargement du dictionnaire…",
  recognizing: "Lecture du texte…",
  done: "Analyse terminée",
};

export default function Scan() {
  const [params] = useSearchParams();
  const mode = params.get("mode") === "sheet" ? "sheet" : "box";
  const navigate = useNavigate();
  const { games } = useGames();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [stageLabel, setStageLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setProcessing(true);
    try {
      const text = await recognizeText(file, (p) => setStageLabel(STAGE_LABELS[p.stage]));
      const matches = matchGamesFromOcrText(games, text, 5);
      navigate("/scan/result", { state: { matches, ocrText: text, mode } });
    } catch (err) {
      console.error(err);
      setError(
        "La lecture du texte a échoué (vérifiez votre connexion pour le premier scan). Vous pouvez rechercher le jeu manuellement."
      );
    } finally {
      setProcessing(false);
      setStageLabel(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title={mode === "sheet" ? "Scanner la fiche de score" : "Scanner la boîte"} />
      <div className="flex flex-1 flex-col gap-4 px-5 py-6">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-amber/60 bg-paper-raised p-6 text-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Aperçu du scan" className="max-h-64 rounded-xl object-contain" />
          ) : (
            <p className="text-ink-faint">
              {mode === "sheet"
                ? "Cadrez la fiche de score, bien à plat et sans reflet"
                : "Cadrez le nom du jeu sur la boîte"}
            </p>
          )}
          {processing && (
            <p className="flex items-center gap-2 font-mono text-sm text-amber-strong">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber" />
              {stageLabel}
            </p>
          )}
        </div>

        {error && <p className="rounded-xl bg-brick-tint p-3 text-sm text-brick">{error}</p>}

        <div className="flex flex-col gap-3">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button disabled={processing} onClick={() => cameraInputRef.current?.click()}>
            Capturer avec l'appareil photo
          </Button>
          <Button
            variant="secondary"
            disabled={processing}
            onClick={() => galleryInputRef.current?.click()}
          >
            Choisir dans la galerie
          </Button>
          <Button variant="ghost" onClick={() => navigate("/games/search")}>
            Plutôt rechercher le nom manuellement
          </Button>
        </div>
      </div>
    </div>
  );
}
