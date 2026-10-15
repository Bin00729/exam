import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, colorR, colorG, colorB) {
  // Simple uncompressed or deflate PNG generator
  // 8-byte PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: 13 bytes
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // Color type 6: RGBA
  ihdr.writeUInt8(0, 10); // Compression method 0
  ihdr.writeUInt8(0, 11); // Filter method 0
  ihdr.writeUInt8(0, 12); // Interlace method 0

  const ihdrChunk = createChunk('IHDR', ihdr);

  // Raw RGBA scanlines with filter byte 0 at start of each line
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Draw rounded shield / circle icon with contrast
      if (dist < radius) {
        // Inner gradient / shield look
        const factor = (y / height);
        rawData[pixelOffset] = Math.min(255, Math.floor(colorR * (1 - factor * 0.3) + 79 * factor)); // R
        rawData[pixelOffset + 1] = Math.min(255, Math.floor(colorG * (1 - factor * 0.2) + 70 * factor)); // G
        rawData[pixelOffset + 2] = Math.min(255, Math.floor(colorB * (1 - factor * 0.1) + 229 * factor)); // B
        rawData[pixelOffset + 3] = 255; // Alpha
      } else if (dist < radius + 3) {
        // Anti-aliased border
        const alpha = Math.floor((1 - (dist - radius) / 3) * 255);
        rawData[pixelOffset] = colorR;
        rawData[pixelOffset + 1] = colorG;
        rawData[pixelOffset + 2] = colorB;
        rawData[pixelOffset + 3] = Math.max(0, Math.min(255, alpha));
      } else {
        // Background: deep navy #0f172a
        rawData[pixelOffset] = 15;
        rawData[pixelOffset + 1] = 23;
        rawData[pixelOffset + 2] = 42;
        rawData[pixelOffset + 3] = 255;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (c ^ buf[n]);
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcValue = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcValue, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write 192x192, 512x512, apple-touch-icon 180x180
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, 79, 70, 229));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, 79, 70, 229));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, 16, 185, 129));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, 79, 70, 229));

console.log('PWA icon assets created successfully!');
