const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Ensure directory exists
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Generate SVG Icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#3b1261" />
      <stop offset="60%" stop-color="#1c0933" />
      <stop offset="100%" stop-color="#090312" />
    </radialGradient>
    <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="50%" stop-color="#7e22ce" />
      <stop offset="100%" stop-color="#4c1d95" />
    </linearGradient>
    <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="100%" stop-color="#eab308" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Fondo redondeado estilo App Icon -->
  <rect width="512" height="512" rx="115" fill="url(#bgGlow)" />
  <rect width="504" height="504" x="4" y="4" rx="111" fill="none" stroke="#a855f7" stroke-width="4" stroke-opacity="0.4" />

  <!-- Partículas y destellos de fondo -->
  <circle cx="120" cy="140" r="4" fill="#fde047" opacity="0.8" />
  <circle cx="390" cy="130" r="5" fill="#67e8f9" opacity="0.9" />
  <circle cx="100" cy="330" r="3.5" fill="#f472b6" opacity="0.7" />
  <circle cx="410" cy="320" r="4" fill="#fde047" opacity="0.8" />
  
  <!-- Gran Estrella Brillante -->
  <path d="M 150 180 Q 150 195 135 195 Q 150 195 150 210 Q 150 195 165 195 Q 150 195 150 180" fill="#fef08a" filter="url(#glow)" />
  <path d="M 370 200 Q 370 212 358 212 Q 370 212 370 224 Q 370 212 382 212 Q 370 212 370 200" fill="#93c5fd" filter="url(#glow)" />

  <!-- Ala del sombrero de bruja -->
  <ellipse cx="256" cy="365" rx="175" ry="38" fill="#3b0764" opacity="0.8" />
  <ellipse cx="256" cy="360" rx="170" ry="34" fill="url(#hatGrad)" filter="url(#glow)" />
  <ellipse cx="256" cy="358" rx="155" ry="24" fill="#581c87" />

  <!-- Cono del sombrero -->
  <path d="M 160 350 C 185 240, 230 140, 315 95 C 330 87, 332 108, 305 130 C 275 155, 275 240, 352 350 Z" fill="url(#hatGrad)" />

  <!-- Cinta mágica del sombrero -->
  <path d="M 165 348 C 215 365, 295 365, 347 348 C 342 328, 335 316, 335 316 C 285 330, 225 330, 177 316 Z" fill="url(#ribbonGrad)" />

  <!-- Hebilla dorada -->
  <rect x="236" y="322" width="40" height="32" rx="7" fill="url(#goldGrad)" stroke="#854d0e" stroke-width="2" />
  <rect x="246" y="330" width="20" height="16" rx="3" fill="#be185d" />

  <!-- Setita mágica de rubí en la esquina -->
  <g transform="translate(110, 330) scale(0.9)">
    <!-- Tallo -->
    <path d="M 28 35 C 28 20, 42 20, 42 35 L 45 52 C 45 56, 25 56, 25 52 Z" fill="#fdf4ff" />
    <!-- Sombrerillo seta -->
    <path d="M 10 35 C 10 10, 60 10, 60 35 C 50 38, 20 38, 10 35 Z" fill="#ef4444" filter="url(#glow)" />
    <!-- Motas blancas -->
    <circle cx="25" cy="22" r="4.5" fill="#ffffff" opacity="0.9" />
    <circle cx="45" cy="24" r="3.5" fill="#ffffff" opacity="0.9" />
    <circle cx="35" cy="15" r="3" fill="#ffffff" opacity="0.9" />
  </g>

  <!-- Brillo mágico estelar en la punta -->
  <circle cx="318" cy="95" r="8" fill="#fef08a" filter="url(#glow)" />
  <circle cx="318" cy="95" r="4" fill="#ffffff" />
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon, 'utf8');
console.log('Created icons/icon.svg');

// 2. Pure Node PNG Generator
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c >>> 0;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function createPng(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0;
    rgbaBuffer.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idatCompressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', idatCompressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Draw the rasterized icon directly into RGBA buffer
function renderAppIcon(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.44;

  const setPixel = (x, y, r, g, b, a = 255) => {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const idx = (Math.floor(y) * size + Math.floor(x)) * 4;
    // Alpha blending
    const srcA = a / 255;
    const dstA = buf[idx + 3] / 255;
    const outA = srcA + dstA * (1 - srcA);
    if (outA > 0) {
      buf[idx] = Math.round((r * srcA + buf[idx] * dstA * (1 - srcA)) / outA);
      buf[idx + 1] = Math.round((g * srcA + buf[idx + 1] * dstA * (1 - srcA)) / outA);
      buf[idx + 2] = Math.round((b * srcA + buf[idx + 2] * dstA * (1 - srcA)) / outA);
      buf[idx + 3] = Math.round(outA * 255);
    }
  };

  // 1. Rounded rectangle background
  const cornerR = size * 0.22;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Check distance to rounded rect boundary
      let inside = true;
      let dx = 0, dy = 0;
      if (x < cornerR) dx = cornerR - x;
      else if (x > size - 1 - cornerR) dx = x - (size - 1 - cornerR);
      if (y < cornerR) dy = cornerR - y;
      else if (y > size - 1 - cornerR) dy = y - (size - 1 - cornerR);

      if (dx > 0 && dy > 0) {
        if (Math.hypot(dx, dy) > cornerR) inside = false;
      }

      if (inside) {
        const distCenter = Math.hypot(x - cx, y - cy * 0.9) / (size * 0.7);
        // Radial gradient: #38125a to #0d041a
        const factor = Math.min(1, Math.max(0, distCenter));
        const r = Math.round(56 * (1 - factor) + 13 * factor);
        const g = Math.round(18 * (1 - factor) + 4 * factor);
        const b = Math.round(90 * (1 - factor) + 26 * factor);
        setPixel(x, y, r, g, b, 255);

        // Border glow
        const borderDist = Math.min(x, size - 1 - x, y, size - 1 - y);
        if (borderDist < size * 0.035) {
          setPixel(x, y, 168, 85, 247, 180);
        }
      }
    }
  }

  // 2. Draw Witch Hat
  // Hat Brim (ellipse)
  const brimY = cy + size * 0.20;
  const brimRx = size * 0.35;
  const brimRy = size * 0.08;
  for (let y = Math.floor(brimY - brimRy * 1.5); y <= Math.ceil(brimY + brimRy * 1.5); y++) {
    for (let x = Math.floor(cx - brimRx * 1.2); x <= Math.ceil(cx + brimRx * 1.2); x++) {
      const d = Math.pow((x - cx) / brimRx, 2) + Math.pow((y - brimY) / brimRy, 2);
      if (d <= 1.0) {
        // Shadow/glow
        setPixel(x, y, 126, 34, 206, 255);
      } else if (d <= 1.15) {
        setPixel(x, y, 168, 85, 247, Math.round(255 * (1.15 - d) / 0.15));
      }
    }
  }

  // Hat Cone (triangle/curve)
  const coneTopX = cx + size * 0.12;
  const coneTopY = cy - size * 0.32;
  for (let y = Math.floor(coneTopY); y <= Math.floor(brimY); y++) {
    const progress = (y - coneTopY) / (brimY - coneTopY);
    const halfWidth = progress * (size * 0.24);
    const curveOffset = Math.sin(progress * Math.PI) * (-size * 0.05);
    const rowCenterX = cx + (coneTopX - cx) * (1 - progress) + curveOffset;

    for (let x = Math.floor(rowCenterX - halfWidth); x <= Math.ceil(rowCenterX + halfWidth); x++) {
      const grad = (x - (rowCenterX - halfWidth)) / (halfWidth * 2);
      const r = Math.round(147 * (1 - grad) + 88 * grad);
      const g = Math.round(51 * (1 - grad) + 28 * grad);
      const b = Math.round(234 * (1 - grad) + 135 * grad);
      setPixel(x, y, r, g, b, 255);
    }
  }

  // Hat Ribbon (crimson pink band)
  const ribbonY = brimY - size * 0.04;
  const ribbonH = size * 0.06;
  for (let y = Math.floor(ribbonY); y <= Math.floor(ribbonY + ribbonH); y++) {
    const progress = (y - coneTopY) / (brimY - coneTopY);
    const halfWidth = progress * (size * 0.24) * 1.02;
    const curveOffset = Math.sin(progress * Math.PI) * (-size * 0.05);
    const rowCenterX = cx + (coneTopX - cx) * (1 - progress) + curveOffset;

    for (let x = Math.floor(rowCenterX - halfWidth); x <= Math.ceil(rowCenterX + halfWidth); x++) {
      setPixel(x, y, 236, 72, 153, 255);
    }
  }

  // Gold Buckle
  const buckleW = size * 0.08;
  const buckleH = size * 0.06;
  const buckleX = cx - buckleW / 2;
  const buckleY = ribbonY;
  for (let y = Math.floor(buckleY); y <= Math.floor(buckleY + buckleH); y++) {
    for (let x = Math.floor(buckleX); x <= Math.floor(buckleX + buckleW); x++) {
      const border = x === Math.floor(buckleX) || x === Math.floor(buckleX + buckleW) ||
                     y === Math.floor(buckleY) || y === Math.floor(buckleY + buckleH);
      if (border) setPixel(x, y, 250, 204, 21, 255);
      else setPixel(x, y, 190, 24, 93, 255);
    }
  }

  // Tip Star Glow
  for (let dy = -size * 0.06; dy <= size * 0.06; dy++) {
    for (let dx = -size * 0.06; dx <= size * 0.06; dx++) {
      const dist = Math.hypot(dx, dy);
      if (dist < size * 0.04) {
        const alpha = Math.max(0, 1 - dist / (size * 0.04));
        setPixel(coneTopX + dx, coneTopY + dy, 254, 240, 138, Math.round(alpha * 255));
      }
    }
  }
  setPixel(coneTopX, coneTopY, 255, 255, 255, 255);

  // Magic Sparkles (Cross stars)
  const drawStar = (sx, sy, starR, r, g, b) => {
    for (let d = -starR; d <= starR; d++) {
      setPixel(sx + d, sy, r, g, b, 240);
      setPixel(sx, sy + d, r, g, b, 240);
    }
    setPixel(sx, sy, 255, 255, 255, 255);
  };
  drawStar(cx - size * 0.25, cy - size * 0.15, size * 0.03, 253, 224, 71);
  drawStar(cx + size * 0.28, cy - size * 0.10, size * 0.025, 103, 232, 249);
  drawStar(cx - size * 0.28, cy + size * 0.10, size * 0.02, 244, 114, 182);

  // Red mushroom beside the hat
  const shroomX = cx - size * 0.24;
  const shroomY = brimY + size * 0.02;
  const shroomR = size * 0.08;
  for (let y = Math.floor(shroomY - shroomR); y <= Math.ceil(shroomY + shroomR * 0.3); y++) {
    for (let x = Math.floor(shroomX - shroomR); x <= Math.ceil(shroomX + shroomR); x++) {
      if (Math.hypot(x - shroomX, y - shroomY) <= shroomR && y <= shroomY) {
        setPixel(x, y, 239, 68, 68, 255);
      }
    }
  }
  // Mushroom stem
  for (let y = Math.floor(shroomY); y <= Math.ceil(shroomY + shroomR * 0.5); y++) {
    for (let x = Math.floor(shroomX - shroomR * 0.35); x <= Math.ceil(shroomX + shroomR * 0.35); x++) {
      setPixel(x, y, 253, 244, 255, 255);
    }
  }
  // Spots
  drawStar(shroomX - size * 0.03, shroomY - size * 0.04, size * 0.012, 255, 255, 255);
  drawStar(shroomX + size * 0.03, shroomY - size * 0.03, size * 0.012, 255, 255, 255);

  return createPng(size, height = size, buf);
}

const p192 = renderAppIcon(192);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), p192);
console.log('Created icons/icon-192.png (' + p192.length + ' bytes)');

const p512 = renderAppIcon(512);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), p512);
console.log('Created icons/icon-512.png (' + p512.length + ' bytes)');
