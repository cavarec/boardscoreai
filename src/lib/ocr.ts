import { createWorker, type Worker } from "tesseract.js";

/**
 * OCR 100% côté client (Tesseract.js, dans un Web Worker) : aucune image
 * n'est envoyée à un serveur. Le premier scan télécharge les données de
 * langue depuis le CDN Tesseract (mis en cache par le service worker
 * ensuite, voir vite.config.ts) ; les scans suivants fonctionnent hors-ligne.
 */

let workerPromise: Promise<Worker> | null = null;

function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker("fra+eng").catch((err) => {
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

export type OcrProgressStage =
  | "loading-engine"
  | "loading-language"
  | "recognizing"
  | "done";

export interface OcrProgress {
  stage: OcrProgressStage;
  progress: number; // 0..1
}

/** Lance la reconnaissance de texte sur une image (File, Blob, ou dataURL). */
export async function recognizeText(
  image: File | Blob | string,
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  onProgress?.({ stage: "loading-engine", progress: 0 });
  const worker = await getWorker();
  onProgress?.({ stage: "recognizing", progress: 0.4 });
  const {
    data: { text },
  } = await worker.recognize(image);
  onProgress?.({ stage: "done", progress: 1 });
  return text;
}

/** Libère le worker (utile en fin de session pour rendre la mémoire). */
export async function terminateOcr(): Promise<void> {
  if (!workerPromise) return;
  const worker = await workerPromise;
  await worker.terminate();
  workerPromise = null;
}
