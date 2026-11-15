// Fyller inn "image" for varer i items.json som mangler bilde,
// ved å hente og:image fra første butikklenke. Kjør: npm run bilder
import { readFileSync, writeFileSync } from 'node:fs';

const file = new URL('../items.json', import.meta.url);
const data = JSON.parse(readFileSync(file, 'utf8'));
let changed = 0;

for (const group of data.groups) {
  for (const item of group.items) {
    if (item.image || !item.links?.[0]?.url) continue;
    const url = item.links[0].url;
    try {
      const html = await (await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
        signal: AbortSignal.timeout(15000),
      })).text();
      const tag = html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i)?.[0];
      const img = tag?.match(/content=["']([^"']+)["']/i)?.[1];
      if (img) {
        item.image = img.replace(/^http:\/\//, 'https://').replace(/&amp;/g, '&');
        changed++;
        console.log('✓', item.name);
      } else {
        console.log('– fant ikke bilde (butikken blokkerer kanskje bots):', item.name);
      }
    } catch (e) {
      console.log('– feil for', item.name, e.message);
    }
  }
}

if (changed) {
  writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  console.log(`Oppdaterte ${changed} bilde(r) i items.json`);
} else {
  console.log('Ingen nye bilder.');
}
