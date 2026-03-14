import { launch } from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTERS_DIR = path.join(__dirname, '../public/posters');
const OUT_DIR = path.join(POSTERS_DIR, 'exports');

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const htmlFiles = fs.readdirSync(POSTERS_DIR)
    .filter(f => f.endsWith('.html'))
    .sort();

  console.log(`Found ${htmlFiles.length} posters. Exporting to ${OUT_DIR}/\n`);

  const browser = await launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 908, height: 567, deviceScaleFactor: 3 });

  for (const file of htmlFiles) {
    const filePath = path.join(POSTERS_DIR, file);
    const pngName = file.replace('.html', '.png');
    const outPath = path.join(OUT_DIR, pngName);

    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 15000 });

    // Screenshot the .poster element at 3x for crisp output
    const poster = await page.$('.poster');
    if (poster) {
      await poster.screenshot({ path: outPath, type: 'png', omitBackground: true });
    } else {
      await page.screenshot({ path: outPath, type: 'png' });
    }

    const size = (fs.statSync(outPath).size / 1024).toFixed(0);
    console.log(`  ✓ ${pngName} (${size}KB)`);
  }

  await browser.close();
  console.log(`\nDone! ${htmlFiles.length} PNGs exported to public/posters/exports/`);
}

main().catch(console.error);
