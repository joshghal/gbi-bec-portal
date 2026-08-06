# Lighthouse Audit — gbibec.id (mobile)

**Date:** 2026-08-06 · **Tool:** Lighthouse 12 (headless Chrome, mobile, simulated throttling)
**Measured: 58/74 pages.** 16 kabar posts could not be measured — the site 403-rate-limited the automated sweep (see end); they are template-clones of measured kabar posts, so every page-type is represented.

## Site averages (over 58 measured pages)

| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| ⚠️ 72¹ | 🟠 83 | 🟢 99 | 🟢 100 |

> **¹ Performance is UNRELIABLE in this run — do not trust the 72.** The sweep ran 74 pages through one Chrome on a loaded machine, inflating timings. Evidence: the homepage measured **P97 / LCP 2.0s in isolation** but **P60 / LCP 11.0s in the sweep**. Accessibility / Best-Practices / SEO are deterministic audits (contrast, ARIA, meta, tags) and are unaffected by machine load — those three are reliable. Performance needs a clean re-measure (fresh Chrome per page on an idle machine) or field data (GSC Core Web Vitals / PSI). The LCP/CLS/TBT figures in the tables below carry the same caveat.

## SEO — issues (by pages affected, of 58)

_No failing audits._

## ACCESSIBILITY — issues (by pages affected, of 58)

| Issue | Pages |
|---|---|
| Background and foreground colors do not have a sufficient contrast ratio. | 58 |
| `[user-scalable="no"]` is used in the `<meta name="viewport">` element or the `[maximum-scale]` attribute is less than 5. | 58 |
| Links do not have a discernible name | 42 |
| Buttons do not have an accessible name | 41 |
| Heading elements are not in a sequentially-descending order | 1 |
| Links rely on color to be distinguishable. | 1 |

## BEST-PRACTICES — issues (by pages affected, of 58)

| Issue | Pages |
|---|---|
| Displays images with incorrect aspect ratio | 12 |

## Lowest performance pages

| Page | Perf | LCP | CLS | TBT | SI |
|---|---|---|---|---|---|
| /kabar/undangan-ibadah-raya-minggu-17-mei-2026 | 🔴 48 | 4.1 s | 0.255 | 1,420 ms | 2.7 s |
| /kabar/undangan-ibadah-raya-minggu-7-juni-2026 | 🟠 52 | 4.2 s | 0.257 | 840 ms | 3.1 s |
| / | 🟠 60 | 11.0 s | 0 | 50 ms | 6.7 s |
| /kabar/12-juli-2026-khotbah-ps-jeffry-rama-undangan-ibadah-minggu | 🟠 62 | 9.5 s | 0 | 100 ms | 5.3 s |
| /kabar/14-juni-2026-khotbah-oleh-ps-erick-philip-undangan-ibadah-mi | 🟠 62 | 9.7 s | 0 | 60 ms | 5.2 s |
| /kabar | 🟠 63 | 7.5 s | 0.046 | 10 ms | 5.2 s |
| /kabar/19-juli-2026-khotbah-oleh-ps-owen-sandjoto-undangan-ibadah-m | 🟠 63 | 7.1 s | 0 | 10 ms | 5.2 s |
| /kabar/26-juli-2026-ps-aruna-undangan-ibadah-raya-minggu | 🟠 63 | 8.0 s | 0 | 20 ms | 5.3 s |
| /kabar/26-juli-2026-ps-aruna-wirjolukito-undangan-ibadah-raya-mingg | 🟠 63 | 7.3 s | 0 | 50 ms | 5.2 s |
| /kabar/baptisan-air-9-mei-2026 | 🟠 63 | 7.8 s | 0 | 20 ms | 5.3 s |
| /kabar/ibadah-raya-minggu-12-april-2026 | 🟠 63 | 7.4 s | 0 | 10 ms | 5.3 s |
| /kabar/masa-depan-penuh-harapan-catatan-khotbah-ibadah-raya-28-juni-2026 | 🟠 63 | 7.5 s | 0 | 10 ms | 5.4 s |
| /kabar/minggu-5-juli-2026-dipimpin-ps-johan-lumoindong-undangan-iba | 🟠 63 | 8.0 s | 0 | 10 ms | 5.1 s |
| /kabar/rumah-doa-online-11-mei-2026-dan-25-mei-2026 | 🟠 63 | 7.4 s | 0 | 10 ms | 5.2 s |
| /baptisan | 🟠 64 | 6.4 s | 0 | 10 ms | 5.5 s |

## All measured pages

| Page | P | A | BP | SEO |
|---|---|---|---|---|
| / | 🟠 60 | 🟢 90 | 🟢 96 | 🟢 100 |
| /baptisan | 🟠 64 | 🟢 91 | 🟢 96 | 🟢 100 |
| /creative-ministry | 🟢 100 | 🟢 91 | 🟢 96 | 🟢 100 |
| /formulir | 🟢 98 | 🟠 85 | 🟢 100 | 🟢 100 |
| /formulir/baptis | 🟠 67 | 🟠 89 | 🟢 100 | 🟢 100 |
| /formulir/mclass | 🟠 65 | 🟠 89 | 🟢 100 | 🟢 100 |
| /formulir/penyerahan-anak | 🟠 65 | 🟠 89 | 🟢 100 | 🟢 100 |
| /helpdesk | 🟠 82 | 🟠 80 | 🟢 100 | 🟢 100 |
| /ibadah-raya | 🟠 66 | 🟠 87 | 🟢 96 | 🟢 100 |
| /kabar | 🟠 63 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/12-juli-2026-khotbah-pelayan-firman-undangan-ibadah-minggu | 🟠 85 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/12-juli-2026-khotbah-ps-jeffry-rama-undangan-ibadah-minggu | 🟠 62 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/14-juni-2026-khotbah-oleh-ps-erick-philip-undangan-ibadah-mi | 🟠 62 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/19-juli-2026-khotbah-oleh-pelayan-firman-undangan-ibadah-min | 🟠 82 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/19-juli-2026-khotbah-oleh-ps-owen-sandjoto-undangan-ibadah-m | 🟠 63 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/2-agustus-2026-bersama-ps-yansen-wiyono-undangan-ibadah-ming | 🟠 79 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/26-juli-2026-ps-aruna-undangan-ibadah-raya-minggu | 🟠 63 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/26-juli-2026-ps-aruna-wirjolukito-undangan-ibadah-raya-mingg | 🟠 63 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/baptisan-air-9-mei-2026 | 🟠 63 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/belajar-dari-hidup-kisah-para-rasul-catatan-khotbah-ibadah-raya-26-juli-2026 | 🟠 73 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/catatan-khotbah-ibadah-minggu-5-april-2026 | 🟢 100 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/catatan-khotbah-ibadah-raya-19-april-2026 | 🟠 79 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/happy-36th-anniversary-gbi-sukawarna-dan-rayon-2-17-juni-2026 | 🟠 64 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/hidup-yg-diubahkan-catatan-khotbah-ibadah-raya-14-juni-2026 | 🟠 64 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/ibadah-gbi-bec-minggu-24-mei-2025-ditiadakan | 🟢 93 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/ibadah-jumat-agung-3-april-2026 | 🟠 64 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/ibadah-kenaikan-yesus-kristus-kamis-14-mei-2026 | 🟢 92 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/ibadah-minggu-gbi-bec-sukawarna | 🟢 93 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/ibadah-minggu-gbi-bec-sukawarna-1 | 🟢 97 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/ibadah-raya-minggu---19-april-2026 | 🟠 80 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/ibadah-raya-minggu-12-april-2026 | 🟠 63 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/iman-yang-hidup-catatan-khotbah-ibadah-raya-2-agustus-2026 | 🟢 100 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/masa-depan-penuh-harapan-catatan-khotbah-ibadah-raya-28-juni-2026 | 🟠 63 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/melihat-dan-mengerti-catatan-khotbah-ibadah-raya-19-juli-2026 | 🟠 78 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/membangun-di-tengah-krisis-catatan-khotbah-ibadah-raya-21-juni-2026 | 🟠 64 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/mengenal-tuhan-dan-tahu-diri-catatan-khotbah-ibadah-raya-5-juli-2026 | 🟠 65 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/menyembah-dalam-roh-catatan-khotbah-ibadah-raya-7-juni-2026 | 🟠 74 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/minggu-5-juli-2026-dipimpin-ps-johan-lumoindong-undangan-iba | 🟠 63 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/nantikanlah-tuhan-catatan-khotbah-ibadah-raya-17-mei-2026 | 🟠 78 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/pendaftaran-kom-100-dan-200 | 🟠 64 | 🟠 80 | 🟢 100 | 🟢 100 |
| /kabar/penyerahan-anak-14-juni-2026 | 🟠 64 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kabar/penyerahan-anak-24-mei-2026 | 🟠 64 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/rumah-doa-online-11-mei-2026-dan-25-mei-2026 | 🟠 63 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/undangan-ibadah-raya-minggu-10-mei-2026 | 🟠 64 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/undangan-ibadah-raya-minggu-17-mei-2026 | 🔴 48 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/undangan-ibadah-raya-minggu-26-april-2026 | 🟠 71 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/undangan-ibadah-raya-minggu-31-mei-2026 | 🟠 71 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/undangan-ibadah-raya-minggu-7-juni-2026 | 🟠 52 | 🟠 79 | 🟢 100 | 🟢 100 |
| /kabar/worship-nite-onsite-bersama-ps-andy-ambarita-10-juni-2026 | 🟠 64 | 🟠 81 | 🟢 100 | 🟢 100 |
| /kom | 🟢 99 | 🟢 91 | 🟢 96 | 🟢 100 |
| /kom/100 | 🟠 66 | 🟢 91 | 🟢 96 | 🟢 100 |
| /kom/200 | 🟠 66 | 🟢 91 | 🟢 96 | 🟢 100 |
| /kom/300 | 🟠 66 | 🟢 91 | 🟢 96 | 🟢 100 |
| /kom/400 | 🟠 66 | 🟢 91 | 🟢 96 | 🟢 100 |
| /mclass | 🟠 64 | 🟢 91 | 🟢 96 | 🟢 100 |
| /pemberkatan-nikah | 🟠 65 | 🟢 91 | 🟢 96 | 🟢 100 |
| /penyerahan-anak | 🟠 64 | 🟢 91 | 🟢 96 | 🟢 100 |
| /saran | 🟠 67 | 🟠 89 | 🟢 100 | 🟢 100 |

## Could not measure (site 403 under load — re-run after cooldown)

- /kabar/21-juni-2026-ps-timothy-abraham-undangan-ibadah-raya-minggu
- /kabar/28-juni-2026-bersama-ps-chandra-sundjaja-undangan-ibadah-min
- /kabar/catatan-khotbah-ibadah-jumat-agung-3-april-2026
- /kabar/catatan-khotbah-ibadah-raya-12-april-2026
- /kabar/catatan-khotbah-ibadah-raya-26-april-2026
- /kabar/catatan-khotbah-ibadah-raya-3-mei-2026
- /kabar/ibadah-minggu-dan-perayaan-hut-gbi-bec-ke-36
- /kabar/karya-roh-kudus-catatan-khotbah-ibadah-raya-10-mei-2026
- /kabar/kutipan-alkitab
- /kabar/m-class-online-4-mei-2026
- /kabar/m-class-online-6-april-2026
- /kabar/makna-di-balik-pergumulan-catatan-khotbah-ibadah-raya-12-juli-2026
- /kabar/penyerahan-anak-12-april-2026
- /kabar/rumah-doa-online-juni-2026
- /kabar/sunday-service-ibadah-raya-minggu-april-2026
- /kabar/undangan-ibadah-raya-minggu-3-mei-2026

_Raw per-page JSON: `analytics/out/lh/`. Summary: `analytics/out/lh/summary.json`._
