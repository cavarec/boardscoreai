import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { useGames } from "@/hooks/useGames";
import { recognizeText, type OcrProgress } from "@/lib/ocr";
import { matchGamesFromOcrText } from "@/lib/matcher";
import type { BarcodeScanHandle } from "@/lib/barcode";
import { lookupBarcode } from "@/lib/db";

const STAGE_LABELS: Record<OcrProgress["stage"], string> = {
  "loading-engine": "Démarrage du moteur OCR…",
  "loading-language": "Chargement du dictionnaire…",
  recognizing: "Lecture du texte…",
  done: "Analyse terminée",
};

type CaptureMode = "barcode" | "photo";

export default function Scan() {
  const [params] = useSearchParams();
  const mode = params.get("mode") === "sheet" ? "sheet" : "box";
  const location = useLocation();
  const { games } = useGames();

  // Le code-barres n'a de sens que pour la boîte — une fiche de score n'en a pas.
  const [captureMode, setCaptureMode] = useState<CaptureMode>(mode === "box" ? "barcode" : "photo");
  // Conservé pour mémoriser l'association code-barres -> jeu une fois le jeu
  // confirmé, même si on est passé par l'OCR ou la recherche en secours.
  const [pendingBarcode, setPendingBarcode] = useState<string | null>(
    (location.state as { scannedBarcode?: string } | null)?.scannedBarcode ?? null
  );

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title={mode === "sheet" ? "Scanner la fiche de score" : "Scanner la boîte"} />
      {captureMode === "barcode" ? (
        <BarcodeCapture
          onUnresolved={(code) => {
            setPendingBarcode(code);
            setCaptureMode("photo");
          }}
          onSwitchToPhoto={() => setCaptureMode("photo")}
        />
      ) : (
        <PhotoCapture mode={mode} games={games} pendingBarcode={pendingBarcode} />
      )}
      {mode === "box" && (
        <div className="px-5 pb-6">
          <Button
            variant="ghost"
            onClick={() => setCaptureMode(captureMode === "barcode" ? "photo" : "barcode")}
          >
            {captureMode === "barcode" ? "Plutôt scanner le nom du jeu" : "Plutôt scanner le code-barres"}
          </Button>
        </div>
      )}
    </div>
  );
}

function BarcodeCapture({
  onUnresolved,
  onSwitchToPhoto,
}: {
  onUnresolved: (code: string) => void;
  onSwitchToPhoto: () => void;
}) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleRef = useRef<BarcodeScanHandle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const video = videoRef.current;
    if (!video) return;

    // Chargé à la demande : la bibliothèque de décodage (ZXing) ne doit pas
    // alourdir le chargement initial de l'app pour les utilisateurs qui ne
    // scannent jamais de code-barres.
    import("@/lib/barcode").then(({ startBarcodeScan }) => {
      if (cancelled) return;
      startBarcodeScan(
        video,
        async (code) => {
          if (cancelled) return;
          setChecking(true);
          const game = await lookupBarcode(code);
          if (cancelled) return;
          if (game) {
            navigate("/scan/result", {
              state: { matches: [{ game, score: 0 }], ocrText: "", mode: "box", viaBarcode: true },
            });
          } else {
            onUnresolved(code);
          }
        },
        (err) => {
          if (cancelled) return;
          console.error(err);
          setError(
            "Caméra inaccessible (permission refusée ou aucune caméra détectée). Essayez le scan du nom ou la recherche manuelle."
          );
        }
      ).then((handle) => {
        if (cancelled) handle.stop();
        else handleRef.current = handle;
      });
    });

    return () => {
      cancelled = true;
      handleRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-6">
      <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-amber/60 bg-paper-sunken">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />
        <div className="pointer-events-none absolute inset-x-10 top-1/2 h-16 -translate-y-1/2 rounded-lg border-2 border-amber" />
        {!error && (
          <p className="absolute bottom-3 left-0 right-0 text-center text-sm text-paper-raised drop-shadow">
            {checking ? "Vérification…" : "Cadrez le code-barres au dos de la boîte"}
          </p>
        )}
      </div>

      {error && <p className="rounded-xl bg-brick-tint p-3 text-sm text-brick">{error}</p>}

      <div className="flex flex-col gap-3">
        {error ? (
          <Button onClick={onSwitchToPhoto}>Scanner le nom du jeu à la place</Button>
        ) : (
          <Button variant="ghost" onClick={() => navigate("/games/search")}>
            Plutôt rechercher le nom manuellement
          </Button>
        )}
      </div>
    </div>
  );
}

function PhotoCapture({
  mode,
  games,
  pendingBarcode,
}: {
  mode: "box" | "sheet";
  games: ReturnType<typeof useGames>["games"];
  pendingBarcode: string | null;
}) {
  const navigate = useNavigate();
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
      navigate("/scan/result", { state: { matches, ocrText: text, mode, scannedBarcode: pendingBarcode } });
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
    <div className="flex flex-1 flex-col gap-4 px-5 py-6">
      {pendingBarcode && (
        <p className="rounded-xl bg-amber-tint p-3 text-sm text-amber-strong">
          Code-barres {pendingBarcode} non reconnu — une fois le jeu confirmé, il sera mémorisé pour
          la prochaine fois.
        </p>
      )}
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
        <Button variant="ghost" onClick={() => navigate("/games/search", { state: { scannedBarcode: pendingBarcode } })}>
          Plutôt rechercher le nom manuellement
        </Button>
      </div>
    </div>
  );
}
