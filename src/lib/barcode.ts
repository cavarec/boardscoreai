import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
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
 * `facingMode: environment` seul laisse le navigateur choisir librement
 * l'objectif arrière : sur un iPhone à plusieurs capteurs, Safari retient
 * parfois l'ultra grand-angle (mauvaise mise au point de près, cadre trop
 * large) plutôt que le grand-angle principal. On demande d'abord la
 * permission caméra avec une contrainte générique (nécessaire pour que les
 * `label` des périphériques soient renseignés), puis on choisit explicitement
 * le meilleur capteur arrière par son libellé.
 */
async function primeCameraPermission(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
    });
    stream.getTracks().forEach((track) => track.stop());
  } catch {
    // Ignoré : si la permission est refusée ici, la tentative réelle plus
    // bas échouera de la même façon et remontera l'erreur via onError.
  }
}

async function pickBackCameraDeviceId(): Promise<string | undefined> {
  if (!navigator.mediaDevices?.enumerateDevices) return undefined;
  const devices = await navigator.mediaDevices.enumerateDevices();
  const backCameras = devices.filter(
    (d) => d.kind === "videoinput" && d.label && /back|arrière|rear/i.test(d.label)
  );
  if (!backCameras.length) return undefined;

  // Le grand-angle principal ("Back Camera" nu) fait le point de plus près
  // et le plus fiable pour un code-barres ; l'ultra grand-angle et le
  // téléobjectif sont écartés en priorité, les objectifs virtuels
  // combinés ("Dual"/"Triple") restent un choix intermédiaire correct.
  const rank = (label: string) => {
    const l = label.toLowerCase();
    if (/ultra|tele|télé|wide angle|grand.angle/.test(l)) return 0;
    if (/dual|triple/.test(l)) return 1;
    return 2;
  };

  return [...backCameras].sort((a, b) => rank(b.label) - rank(a.label))[0].deviceId;
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

  function decode(constraints: MediaStreamConstraints): Promise<IScannerControls> {
    return reader.decodeFromConstraints(constraints, videoElement, (result, error, controls) => {
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
    });
  }

  await primeCameraPermission();
  const deviceId = await pickBackCameraDeviceId().catch(() => undefined);
  const resolution = { width: { ideal: 1920 }, height: { ideal: 1080 } };
  const preferredConstraints: MediaStreamConstraints = deviceId
    ? { video: { deviceId: { exact: deviceId }, ...resolution } }
    : { video: { facingMode: { ideal: "environment" }, ...resolution } };

  try {
    let controls: IScannerControls;
    try {
      controls = await decode(preferredConstraints);
    } catch (err) {
      // Le choix explicite du capteur peut échouer (appareil débranché entre
      // temps, id périmé) : on retente avec une contrainte générique plutôt
      // que d'abandonner tout de suite.
      if (!deviceId) throw err;
      controls = await decode({ video: { facingMode: { ideal: "environment" }, ...resolution } });
    }
    // iOS Safari démarre parfois le flux sans lancer réellement la lecture
    // vidéo tant qu'un .play() explicite n'est pas rappelé.
    videoElement.play?.().catch(() => {});
    return { stop: () => controls.stop() };
  } catch (err) {
    onError(err);
    return { stop: () => {} };
  }
}
