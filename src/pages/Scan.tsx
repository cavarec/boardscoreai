import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { useGames } from "@/hooks/useGames";
import { PSM, recognizeText, type OcrProgress } from "@/lib/ocr";
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
  const { games } = useGames();

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title={mode === "sheet" ? "Scanner la fiche de score" : "Scanner la boîte"} />
      <PhotoCapture mode={mode} games={games} />
    </div>
  );
}

function PhotoCapture({
  mode,
  games,
}: {
  mode: "box" | "sheet";
  games: ReturnType<typeof useGames>["games"];
}) {
  const navigate = useNavigate();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [stageLabel, setStageLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function runOcr(input: File | Blob) {
    setProcessing(true);
    try {
      const text = await recognizeText(input, (p) => setStageLabel(STAGE_LABELS[p.stage]), {
        // Un titre de boîte est stylisé et éparpillé sur une illustration :
        // le mode "texte épars" le repère mieux qu'une analyse de mise en
        // page pensée pour un document classique.
        psm: mode === "box" ? PSM.SPARSE_TEXT : undefined,
      });
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

  function reset() {
    setPendingFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  if (previewUrl && pendingFile && !processing) {
    return (
      <div className="flex flex-1 flex-col gap-4 px-5 py-6">
        <ImageCropper
          src={previewUrl}
          instructions={
            mode === "sheet"
              ? "Cadrez la zone des scores, sans le reste de la fiche"
              : "Cadrez le titre du jeu, sans le reste de la boîte"
          }
          onConfirm={(blob) => runOcr(blob)}
          onSkip={() => runOcr(pendingFile)}
        />
        {error && <p className="rounded-xl bg-brick-tint p-3 text-sm text-brick">{error}</p>}
        <Button variant="ghost" onClick={reset}>
          Reprendre une photo
        </Button>
      </div>
    );
  }

  return (
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
        <Button variant="secondary" disabled={processing} onClick={() => galleryInputRef.current?.click()}>
          Choisir dans la galerie
        </Button>
        <Button variant="ghost" onClick={() => navigate("/games/search")}>
          Plutôt rechercher le nom manuellement
        </Button>
      </div>
    </div>
  );
}

type CropHandle = "move" | "nw" | "ne" | "sw" | "se";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const DEFAULT_CROP: CropRect = { x: 10, y: 25, w: 80, h: 50 };
const MIN_CROP_PCT = 15;

function clampCrop(r: CropRect): CropRect {
  const w = Math.min(100, Math.max(MIN_CROP_PCT, r.w));
  const h = Math.min(100, Math.max(MIN_CROP_PCT, r.h));
  const x = Math.min(100 - w, Math.max(0, r.x));
  const y = Math.min(100 - h, Math.max(0, r.y));
  return { x, y, w, h };
}

/**
 * Recadrage manuel avant OCR : une photo de boîte ou de fiche entière inclut
 * beaucoup d'illustration/bruit autour du texte utile. Laisser l'utilisateur
 * isoler juste la zone à lire améliore la reconnaissance bien plus qu'un
 * meilleur prétraitement seul, sans dépendance externe (juste des rectangles
 * positionnés en pourcentage, indépendants de la taille réelle de l'image).
 */
function ImageCropper({
  src,
  instructions,
  onConfirm,
  onSkip,
}: {
  src: string;
  instructions: string;
  onConfirm: (blob: Blob) => void;
  onSkip: () => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<CropRect>(DEFAULT_CROP);
  const dragRef = useRef<{ handle: CropHandle; startX: number; startY: number; start: CropRect } | null>(
    null
  );

  function beginDrag(handle: CropHandle) {
    return (e: ReactPointerEvent<HTMLElement>) => {
      e.stopPropagation();
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { handle, startX: e.clientX, startY: e.clientY, start: rect };
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!drag || !bounds) return;
    const dx = ((e.clientX - drag.startX) / bounds.width) * 100;
    const dy = ((e.clientY - drag.startY) / bounds.height) * 100;
    const next = { ...drag.start };
    if (drag.handle === "move") {
      next.x = drag.start.x + dx;
      next.y = drag.start.y + dy;
    } else {
      if (drag.handle.includes("w")) {
        next.x = drag.start.x + dx;
        next.w = drag.start.w - dx;
      }
      if (drag.handle.includes("e")) {
        next.w = drag.start.w + dx;
      }
      if (drag.handle.includes("n")) {
        next.y = drag.start.y + dy;
        next.h = drag.start.h - dy;
      }
      if (drag.handle.includes("s")) {
        next.h = drag.start.h + dy;
      }
    }
    setRect(clampCrop(next));
  }

  function endDrag() {
    dragRef.current = null;
  }

  async function confirmCrop() {
    const img = imgRef.current;
    if (!img) return;
    const sx = (rect.x / 100) * img.naturalWidth;
    const sy = (rect.y / 100) * img.naturalHeight;
    const sw = (rect.w / 100) * img.naturalWidth;
    const sh = (rect.h / 100) * img.naturalHeight;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sw));
    canvas.height = Math.max(1, Math.round(sh));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => blob && onConfirm(blob), "image/png");
  }

  const corners: CropHandle[] = ["nw", "ne", "sw", "se"];

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <div
        ref={containerRef}
        className="relative mx-auto inline-block touch-none select-none"
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <img
          ref={imgRef}
          src={src}
          alt="À recadrer"
          className="max-h-[60vh] w-auto rounded-xl"
          draggable={false}
        />
        <div
          className="absolute cursor-move border-2 border-amber"
          style={{
            left: `${rect.x}%`,
            top: `${rect.y}%`,
            width: `${rect.w}%`,
            height: `${rect.h}%`,
            boxShadow: "0 0 0 999px rgba(0,0,0,0.45)",
          }}
          onPointerDown={beginDrag("move")}
        >
          {corners.map((corner) => (
            <span
              key={corner}
              onPointerDown={beginDrag(corner)}
              className={[
                "absolute h-6 w-6 touch-none rounded-full border-2 border-amber bg-paper-raised",
                corner.includes("n") ? "-top-3" : "-bottom-3",
                corner.includes("w") ? "-left-3" : "-right-3",
              ].join(" ")}
            />
          ))}
        </div>
      </div>
      <p className="text-center text-sm text-ink-faint">{instructions}</p>
      <div className="flex w-full flex-col gap-3">
        <Button onClick={confirmCrop}>Rogner et analyser</Button>
        <Button variant="secondary" onClick={onSkip}>
          Utiliser la photo entière
        </Button>
      </div>
    </div>
  );
}
