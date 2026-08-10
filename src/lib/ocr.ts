import { createWorker, PSM, type Worker } from "tesseract.js";

/**
 * OCR 100% côté client (Tesseract.js, dans un Web Worker) : aucune image
 * n'est envoyée à un serveur. Le premier scan télécharge les données de
 * langue depuis le CDN Tesseract (mis en cache par le service worker
 * ensuite, voir vite.config.ts) ; les scans suivants fonctionnent hors-ligne.
 */

export { PSM };

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

export interface OcrOptions {
  /** SPARSE_TEXT convient à un titre stylisé éparpillé sur une illustration ;
   * AUTO (défaut Tesseract) suppose une mise en page de document classique. */
  psm?: PSM;
}

const MIN_DIM = 900;
const MAX_DIM = 1800;

/**
 * Trouve le seuil qui sépare le mieux deux populations de pixels (texte vs
 * fond) à partir de l'histogramme des niveaux de gris. Une simple photo de
 * boîte de jeu a un fond illustré en dégradé qu'un étirement de contraste
 * seul ne suffit pas à effacer ; Tesseract lit beaucoup mieux un texte
 * réduit à du noir sur blanc.
 */
function otsuThreshold(gray: Uint8ClampedArray): number {
  const histogram = new Array(256).fill(0);
  for (const v of gray) histogram[v]++;
  const total = gray.length;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * histogram[t];

  let sumB = 0;
  let weightB = 0;
  let maxVariance = 0;
  let threshold = 127;
  for (let t = 0; t < 256; t++) {
    weightB += histogram[t];
    if (weightB === 0) continue;
    const weightF = total - weightB;
    if (weightF === 0) break;
    sumB += t * histogram[t];
    const meanB = sumB / weightB;
    const meanF = (sum - sumB) / weightF;
    const variance = weightB * weightF * (meanB - meanF) ** 2;
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = t;
    }
  }
  return threshold;
}

/**
 * Tesseract est conçu pour du texte de document plat, pas pour un logo
 * stylisé sur fond illustré avec reflets. Ce prétraitement (niveaux de gris,
 * étirement de contraste, binarisation d'Otsu, redimensionnement dans une
 * plage que Tesseract digère bien) améliore la reconnaissance sans rien
 * coûter, mais ne remplace pas une vraie vision par IA pour ce cas d'usage.
 */
async function preprocessForOcr(image: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(image);
  const longest = Math.max(bitmap.width, bitmap.height);
  // On agrandit les images trop petites (galerie compressée) autant qu'on
  // réduit les trop grandes : dans les deux cas, en dehors de sa plage
  // idéale, le moteur LSTM de Tesseract perd en précision.
  const scale = longest > MAX_DIM ? MAX_DIM / longest : longest < MIN_DIM ? MIN_DIM / longest : 1;
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponible");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
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
  const stretched = new Uint8ClampedArray(w * h);
  for (let p = 0; p < gray.length; p++) {
    stretched[p] = ((gray[p] - min) / range) * 255;
  }

  const threshold = otsuThreshold(stretched);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const v = stretched[p] >= threshold ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = v;
  }
  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob a échoué"))), "image/png");
  });
}

/** Lance la reconnaissance de texte sur une image (File, Blob, ou dataURL). */
export async function recognizeText(
  image: File | Blob | string,
  onProgress?: (p: OcrProgress) => void,
  options: OcrOptions = {}
): Promise<string> {
  onProgress?.({ stage: "loading-engine", progress: 0 });
  const worker = await getWorker();
  await worker.setParameters({ tessedit_pageseg_mode: options.psm ?? PSM.AUTO });
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
