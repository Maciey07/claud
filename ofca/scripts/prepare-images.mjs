// Przygotowuje zdjęcia z docs/references do src/assets/photos.
// Uruchom: npm run assets (wymaga sharp z devDependencies).
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const REF = 'docs/references';
const OUT = 'src/assets/photos';
await mkdir(OUT, { recursive: true });

// Zdjęcia reportażowe: tylko przeskalowanie, optymalizacja formatów robi Astro <Image>.
await sharp(`${REF}/ref-04-zongler-rynek.jpg`).resize({ width: 2000 }).jpeg({ quality: 82 }).toFile(`${OUT}/zongler-rynek.jpg`);
await sharp(`${REF}/ref-01-diabolo-scena.jpg`).resize({ width: 2000 }).jpeg({ quality: 82 }).toFile(`${OUT}/diabolo-scena.jpg`);
await sharp(`${REF}/ref-03-infopunkt-namiot.jpg`).resize({ width: 1300 }).jpeg({ quality: 82 }).toFile(`${OUT}/infopunkt-namiot.jpg`);

// Plakat Teatru Wernisaż: wycinamy samo zdjęcie z ramki.
await sharp(`${REF}/ref-02-plakat-teatr-wernisaz.jpg`)
  .extract({ left: 92, top: 118, width: 890, height: 1030 })
  .jpeg({ quality: 85 })
  .toFile(`${OUT}/teatr-wernisaz.jpg`);

// Postać z parasolem (ref-05): wycięcie z pomarańczowego tła do PNG z przezroczystością.
// Napisy z posta usuwamy, a cyfrę „1” nachodzącą na parasol zastępujemy lustrzanym fragmentem parasola.
{
  const src = await sharp(`${REF}/ref-05-countdown-1-dzien.jpg`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = src.info.width, H = src.info.height;
  const px = src.data;
  const out = Buffer.from(px);
  const orange = [254, 96, 33];
  const center = [545, 565], radius = 372;
  const at = (x, y) => (y * W + x) * 4;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      const inDigit = x >= 60 && x <= 435 && y >= 375 && y <= 705;
      const inText = y < 222 || (y > 930 && x < 330);
      const inUmbrella = Math.hypot(x - center[0], y - center[1]) < radius;
      if (inText) { out[i + 3] = 0; continue; }
      if (inDigit && inUmbrella) {
        const j = at(2 * center[0] - x, y);
        out[i] = px[j]; out[i + 1] = px[j + 1]; out[i + 2] = px[j + 2]; out[i + 3] = 255;
        continue;
      }
      if (inDigit) { out[i + 3] = 0; continue; }
      const d = Math.hypot(px[i] - orange[0], px[i + 1] - orange[1], px[i + 2] - orange[2]);
      if (d < 90) out[i + 3] = d < 55 ? 0 : Math.round(((d - 55) / 35) * 255);
    }
  }
  await sharp(out, { raw: src.info })
    .extract({ left: 150, top: 175, width: 810, height: 905 })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(`${OUT}/parasol-duotone.png`);
}
console.log('OK');
