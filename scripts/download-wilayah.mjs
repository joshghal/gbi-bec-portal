import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api';
const OUT_DIR = path.join(__dirname, '../public/data/wilayah');

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function fetchJSON(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 503 || res.status === 429) {
        console.log(`  Rate limited, waiting ${(i + 1) * 2}s...`);
        await delay((i + 1) * 2000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  Retry ${i + 1}/${retries} for ${url}`);
      await delay((i + 1) * 2000);
    }
  }
}

async function main() {
  // Load existing districts
  const districts = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'districts.json'), 'utf8'));
  console.log(`Loaded ${districts.length} Jawa Barat districts`);

  // Check for existing partial villages
  let allVillages = [];
  const processedDistricts = new Set();
  const villagesPath = path.join(OUT_DIR, 'villages.json');
  if (fs.existsSync(villagesPath)) {
    try {
      allVillages = JSON.parse(fs.readFileSync(villagesPath, 'utf8'));
      for (const v of allVillages) processedDistricts.add(v.district_id);
      console.log(`Resuming: ${allVillages.length} villages from ${processedDistricts.size} districts already downloaded`);
    } catch { /* start fresh */ }
  }

  const remaining = districts.filter(d => !processedDistricts.has(d.id));
  console.log(`Fetching villages for ${remaining.length} remaining districts...`);

  let count = 0;
  for (const dist of remaining) {
    const villages = await fetchJSON(`${BASE_URL}/villages/${dist.id}.json`);
    for (const v of villages) {
      allVillages.push({ id: v.id, district_id: dist.id, name: v.name });
    }
    count++;
    if (count % 25 === 0) {
      console.log(`  ${count}/${remaining.length} done (${allVillages.length} total villages)`);
      // Save progress every 25 districts
      fs.writeFileSync(villagesPath, JSON.stringify(allVillages));
    }
    await delay(100); // 100ms between requests
  }

  fs.writeFileSync(villagesPath, JSON.stringify(allVillages));
  console.log(`\nDone! ${allVillages.length} Jawa Barat villages saved.`);
}

main().catch(console.error);
