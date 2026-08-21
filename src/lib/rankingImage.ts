import { playerColor } from "@/lib/playerColors";
import type { PlayerResult } from "@/types";

interface RankingImageOptions {
  title: string;
  ranking: PlayerResult[];
  initialsById: Record<string, string>;
}

/**
 * Dessine le classement dans un <canvas> pour un partage visuel (image PNG)
 * plutôt qu'un simple message texte — mêmes couleurs de thème (lues en live
 * sur :root, donc cohérentes avec le clair/sombre actif) et même logique de
 * barres que l'écran de classement, pour qu'un ami qui reçoit l'image
 * reconnaisse tout de suite l'app. Retourne null si le canvas échoue
 * (navigateur sans support), auquel cas l'appelant retombe sur le texte.
 */
export function renderRankingImage({
  title,
  ranking,
  initialsById,
}: RankingImageOptions): Promise<Blob | null> {
  const style = getComputedStyle(document.documentElement);
  const cssVar = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;

  const bg = cssVar("--bg", "#ece8dc");
  const bgRaised = cssVar("--bg-raised", "#f6f3e9");
  const bgSunken = cssVar("--bg-sunken", "#e1dccb");
  const ink = cssVar("--ink", "#1b1f1d");
  const inkSoft = cssVar("--ink-soft", "#4b534c");
  const inkFaint = cssVar("--ink-faint", "#7a8078");
  const felt = cssVar("--felt", "#1ea39c");
  const feltStrong = cssVar("--felt-strong", "#0d726d");
  const amber = cssVar("--amber", "#a6690e");

  const width = 1080;
  const paddingX = 72;
  const rowHeight = 176;
  const headerHeight = 260;
  const footerHeight = 110;
  const height = headerHeight + ranking.length * rowHeight + footerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = feltStrong;
  ctx.font = "600 28px ui-monospace, monospace";
  ctx.fillText("BOARDSCORE AI", paddingX, 84);

  ctx.fillStyle = ink;
  ctx.font = "700 52px ui-serif, Georgia, serif";
  ctx.fillText(title, paddingX, 158);

  ctx.fillStyle = inkSoft;
  ctx.font = "400 30px -apple-system, system-ui, sans-serif";
  ctx.fillText("Classement", paddingX, 206);

  const winnerTotal = ranking[0]?.total ?? 0;
  const totals = ranking.map((r) => r.total);
  const range = Math.max(...totals) - Math.min(...totals) || 1;

  const rankColor = (position: number) =>
    position === 1 ? amber : position === 2 ? inkFaint : position === 3 ? felt : inkFaint;

  ranking.forEach((r, i) => {
    const rowTop = headerHeight + i * rowHeight;
    const centerY = rowTop + 56;

    ctx.fillStyle = r.position <= 3 ? rankColor(r.position) : bgSunken;
    ctx.beginPath();
    ctx.arc(paddingX + 28, centerY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = r.position <= 3 ? bgRaised : inkFaint;
    ctx.font = "700 28px ui-monospace, monospace";
    ctx.textAlign = "center";
    ctx.fillText(String(r.position), paddingX + 28, centerY + 10);

    const { fill, text } = playerColor(r.player.profileId ?? r.player.id);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(paddingX + 100, centerY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = text;
    ctx.font = "700 22px ui-monospace, monospace";
    ctx.fillText(initialsById[r.player.id] ?? "", paddingX + 100, centerY + 8);

    ctx.textAlign = "left";
    ctx.fillStyle = ink;
    ctx.font = "600 36px -apple-system, system-ui, sans-serif";
    ctx.fillText(r.player.name, paddingX + 152, centerY + 12);

    ctx.textAlign = "right";
    ctx.fillStyle = feltStrong;
    ctx.font = "700 42px ui-monospace, monospace";
    ctx.fillText(`${r.total} pts`, width - paddingX, centerY + 14);
    ctx.textAlign = "left";

    const barY = centerY + 44;
    const barWidth = width - paddingX * 2;
    ctx.fillStyle = bgSunken;
    drawRoundedRect(ctx, paddingX, barY, barWidth, 12, 6);
    ctx.fill();
    const fraction = Math.max(0.12, 1 - Math.abs(winnerTotal - r.total) / range);
    ctx.fillStyle = rankColor(r.position);
    drawRoundedRect(ctx, paddingX, barY, barWidth * fraction, 12, 6);
    ctx.fill();
  });

  ctx.fillStyle = inkFaint;
  ctx.font = "400 26px -apple-system, system-ui, sans-serif";
  ctx.fillText("boardscoreai.vercel.app", paddingX, height - footerHeight / 2 + 10);

  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), "image/png"));
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
