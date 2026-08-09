// Génère les icônes PWA (192, 512, maskable 512, apple-touch-icon) en PNG pur,
// sans dépendance de rendu d'image : un tampon RGBA est peint pixel par pixel
// à l'aide de fonctions de distance signée (technique SDF), puis encodé en
// PNG à la main (zlib est fourni nativement par Node). Objectif : un logo de
// dé qui matche la charte BoardScore AI sans tirer de dépendance native.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/icons");
mkdirSync(outDir, { recursive: true });

const FELT = [0x12, 0x38, 0x32]; // #123832 — fond
const AMBER = [0xa8, 0x68, 0x1f]; // #A8681F — dé
const PAPER = [0xf6, 0xf3, 0xe9]; // #F6F3E9 — pips

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function mix(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// Rounded-box signed distance function (Inigo Quilez). Négatif = à l'intérieur.
function roundedBoxSDF(px, py, halfW, halfH, radius) {
  const qx = Math.abs(px) - (halfW - radius);
  const qy = Math.abs(py) - (halfH - radius);
  const outsideX = Math.max(qx, 0);
  const outsideY = Math.max(qy, 0);
  return Math.hypot(outsideX, outsideY) + Math.min(Math.max(qx, qy), 0) - radius;
}

function circleSDF(px, py, cx, cy, r) {
  return Math.hypot(px - cx, py - cy) - r;
}

function coverageFromSDF(d) {
  return clamp(0.5 - d, 0, 1);
}

/**
 * @param {number} size
 * @param {{ maskable?: boolean }} opts
 * @returns {Buffer} RGBA pixels, size*size*4 bytes
 */
function renderIcon(size, { maskable = false } = {}) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const dieHalf = size * (maskable ? 0.27 : 0.34);
  const dieRadius = dieHalf * 0.32;
  const pipRadius = dieHalf * 0.16;
  const pipOffset = dieHalf * 0.5;
  const pips = [
    [0, 0],
    [-pipOffset, -pipOffset],
    [pipOffset, -pipOffset],
    [-pipOffset, pipOffset],
    [pipOffset, pipOffset],
  ];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5 - cx;
      const py = y + 0.5 - cy;

      let color = FELT;

      const dDie = roundedBoxSDF(px, py, dieHalf, dieHalf, dieRadius);
      const dieCoverage = coverageFromSDF(dDie);
      if (dieCoverage > 0) color = mix(color, AMBER, dieCoverage);

      if (dieCoverage > 0.5) {
        for (const [ox, oy] of pips) {
          const dPip = circleSDF(px, py, ox, oy, pipRadius);
          const pipCoverage = coverageFromSDF(dPip);
          if (pipCoverage > 0) color = mix(color, PAPER, pipCoverage);
        }
      }

      const idx = (y * size + x) * 4;
      buf[idx] = Math.round(color[0]);
      buf[idx + 1] = Math.round(color[1]);
      buf[idx + 2] = Math.round(color[2]);
      buf[idx + 3] = 255;
    }
  }
  return buf;
}

// ---- Minimal PNG encoder (IHDR + IDAT + IEND), 8-bit RGBA, filter "none" ----
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(rgba, size) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(size * (1 + size * 4));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // filter: none
    rgba.copy(raw, rowStart + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idatData = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idatData),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function writeIcon(name, size, opts) {
  const rgba = renderIcon(size, opts);
  const png = encodePNG(rgba, size);
  const dest = path.join(outDir, name);
  writeFileSync(dest, png);
  console.log(`✓ ${name} (${size}x${size}, ${(png.length / 1024).toFixed(1)} kB)`);
}

writeIcon("icon-192.png", 192, {});
writeIcon("icon-512.png", 512, {});
writeIcon("icon-maskable-512.png", 512, { maskable: true });
writeIcon("apple-touch-icon.png", 180, {});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#123832"/>
  <rect x="18" y="18" width="28" height="28" rx="6" fill="#A8681F"/>
  <circle cx="32" cy="32" r="2.6" fill="#F6F3E9"/>
  <circle cx="24" cy="24" r="2.6" fill="#F6F3E9"/>
  <circle cx="40" cy="24" r="2.6" fill="#F6F3E9"/>
  <circle cx="24" cy="40" r="2.6" fill="#F6F3E9"/>
  <circle cx="40" cy="40" r="2.6" fill="#F6F3E9"/>
</svg>
`;
writeFileSync(path.join(outDir, "icon.svg"), svg);
console.log("✓ icon.svg");
