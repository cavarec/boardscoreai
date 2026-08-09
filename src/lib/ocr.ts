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

/**
 * Tesseract est conçu pour du texte de document plat, pas pour un logo
 * stylisé sur fond illustré avec reflets. Ce prétraitement (niveaux de
 * gris + étirement de contraste, redimensionnement à une taille que
 * Tesseract digère bien) améliore la reconnaissance sans rien coûter,
 * mais ne remplace pas une vraie vision par IA pour ce cas d'usage précis.
 */
async function preprocessForOcr(image: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(image);
  const maxDim = 1800;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponible");
  ctx.drawImage(bitmap, 0, 0, w, h);

  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;
  const gray = new Uint8ClampedArray(w * h);
  let min = 255;
  let max = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const g = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[p] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const range = Math.max(1, max - min);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const stretched = ((gray[p] - min) / range) * 255;
    data[i] = data[i + 1] = data[i + 2] = stretched;
  }
  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob a échoué"))), "image/png");
  });
}

/** Lance la reconnaissance de texte sur une image (File, Blob, ou dataURL). */
export async function recognizeText(
  image: File | Blob | string,
  onProgress?: (p: OcrProgress) => void
): Promise<string> {
  onProgress?.({ stage: "loading-engine", progress: 0 });
  const worker = await getWorker();
  onProgress?.({ stage: "recognizing", progress: 0.4 });

  let input: File | Blob | string = image;
  if (image instanceof Blob) {
    try {
      input = await preprocessForOcr(image);
    } catch (err) {
      console.warn("[BoardScore AI] Prétraitement d'image ignoré :", err);
    }
  }

  const {
    data: { text },
  } = await worker.recognize(input);
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
