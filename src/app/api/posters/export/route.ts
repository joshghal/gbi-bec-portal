import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { verifyAuthToken } from '@/lib/firebase-admin';

const POSTERS_DIR = path.join(process.cwd(), 'public/posters');
const EXPORTS_DIR = path.join(POSTERS_DIR, 'exports');

export async function POST(request: NextRequest) {
  const authError = await verifyAuthToken(request);
  if (authError) return authError;

  let files: string[];
  try {
    const body = await request.json();
    files = body.files;
  } catch {
    files = [];
  }

  const allHtml = fs.readdirSync(POSTERS_DIR).filter(f => f.endsWith('.html')).sort();
  const toExport = files && files.length > 0
    ? allHtml.filter(f => files.includes(f))
    : allHtml;

  if (toExport.length === 0) {
    return NextResponse.json({ error: 'No poster files found' }, { status: 400 });
  }

  fs.mkdirSync(EXPORTS_DIR, { recursive: true });

  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    return NextResponse.json(
      { error: 'Puppeteer tidak tersedia di environment ini.' },
      { status: 500 }
    );
  }

  const results: { file: string; png: string; sizeKB: number }[] = [];
  const errors: { file: string; error: string }[] = [];

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 908, height: 567, deviceScaleFactor: 3 });

    for (const file of toExport) {
      try {
        const filePath = path.join(POSTERS_DIR, file);
        const pngName = file.replace('.html', '.png');
        const outPath = path.join(EXPORTS_DIR, pngName);

        await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 15000 });

        const poster = await page.$('.poster');
        if (poster) {
          await poster.screenshot({ path: outPath, type: 'png', omitBackground: true });
        } else {
          await page.screenshot({ path: outPath, type: 'png' });
        }

        const sizeKB = Math.round(fs.statSync(outPath).size / 1024);
        results.push({ file, png: pngName, sizeKB });
      } catch (err) {
        errors.push({ file, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    }

    await browser.close();
  } catch (err) {
    return NextResponse.json(
      { error: `Browser launch failed: ${err instanceof Error ? err.message : 'Unknown'}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ results, errors, total: toExport.length });
}
