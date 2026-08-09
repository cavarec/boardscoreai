import { BrowserMultiFormatReader } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType, NotFoundException } from "@zxing/library";

/**
 * Scan de code-barres en direct depuis la caméra (EAN-13/EAN-8/UPC, les
 * formats utilisés au dos des boîtes de jeu). C'est un raccourci : lire le
 * code est un problème résolu (ZXing), mais savoir à quel jeu il correspond
 * ne l'est pas — voir lib/db.ts (lookupBarcode/linkBarcodeToGame) pour la
 * table de correspondance construite par la communauté au fil des scans.
 */

const hints = new Map();
hints.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
]);

export interface BarcodeScanHandle {
  stop: () => void;
}

/**
 * Démarre la lecture continue depuis la caméra arrière. Appelle `onDetected`
 * une seule fois (la lecture s'arrête automatiquement après un succès) et
 * `onError` si la caméra est inaccessible (permission refusée, pas de
 * caméra…). Retourne un handle à `stop()` impérativement au démontage de
 * l'écran pour libérer la caméra.
 */
export async function startBarcodeScan(
  videoElement: HTMLVideoElement,
  onDetected: (code: string) => void,
  onError: (error: unknown) => void
): Promise<BarcodeScanHandle> {
  const reader = new BrowserMultiFormatReader(hints);
  let stopped = false;

  try {
    const controls = await reader.decodeFromConstraints(
      { video: { facingMode: "environment" } },
      videoElement,
      (result, error) => {
        if (stopped) return;
        if (result) {
          stopped = true;
          controls.stop();
          onDetected(result.getText());
          return;
        }
        // NotFoundException est levée en continu tant qu'aucun code n'est
        // dans le cadre : ce n'est pas une erreur, juste "rien lu pour l'instant".
        if (error && !(error instanceof NotFoundException)) {
          onError(error);
        }
      }
    );
    return { stop: () => controls.stop() };
  } catch (err) {
    onError(err);
    return { stop: () => {} };
  }
}
