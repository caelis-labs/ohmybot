import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const media = JSON.parse(await readFile(path.join(root, 'src/data/bot-media.json'), 'utf8'));
const files = new Set();
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else files.add('/' + path.relative(dist, file));
  }
}
await walk(dist);
let checked = 0;
for (const lang of ['en', 'zh-cn']) {
  const route = lang === 'en' ? '/' : '/zh-cn/';
  const html = await readFile(path.join(dist, route, 'index.html'), 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: H1`);
  assert.ok(html.includes(`href="https://ohmybot.si${route}"`), `${route}: canonical`);
  assert.ok(html.includes('https://caelis.dev/download/caelis-bot/'), `${route}: macOS download`);
  assert.ok(html.includes('https://github.com/caelis-labs/caelis-bot/releases/latest'), `${route}: Windows downloads`);
  assert.ok(html.includes(`https://caelis.dev${lang === 'en' ? '' : '/zh-cn'}/docs/caelis-bot/installation/`), `${route}: localized guide`);
  assert.ok(html.includes('Authenticode') && html.includes('WebView2'), `${route}: Windows requirements`);
  for (const [, attr, raw] of html.matchAll(/\b(href|src|poster)="([^"]+)"/g)) {
    if (/^(data:|mailto:|#)/.test(raw)) continue;
    const url = new URL(raw, `https://ohmybot.si${route}`);
    if (url.origin !== 'https://ohmybot.si') continue;
    const target = decodeURIComponent(url.pathname);
    const file = target.endsWith('/') ? target + 'index.html' : target;
    assert.ok(files.has(file), `${route}: missing ${attr} ${raw}`);
    checked++;
  }
  if (media.ready) {
    assert.ok(media.sourceVersion && media.platform && media.duration > 0 && media[lang].description, 'Recording provenance');
    const base = media[lang].base.slice(1);
    assert.ok(html.includes(`${media[lang].base}.mp4`), `${route}: recording source`);
    assert.ok((await stat(path.join(dist, `${base}.mp4`))).size < 25_000_000, 'Recording exceeds 25 MB');
    assert.ok((await readFile(path.join(dist, `${base}.vtt`), 'utf8')).startsWith('WEBVTT'), 'Recording captions');
  } else {
    assert.ok(html.includes('data-media-pending') && !html.includes('<video'), `${route}: honest recording placeholder`);
  }
}
console.log(`Verified 2 language pages and ${checked} local links/assets; recording ${media.ready ? 'integrated' : 'pending'}.`);
