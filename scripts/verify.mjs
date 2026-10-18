import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

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
let largestInlineScriptBytes = 0;
for (const lang of ['en', 'zh-cn']) {
  const route = lang === 'en' ? '/' : '/zh-cn/';
  const html = await readFile(path.join(dist, route, 'index.html'), 'utf8');
  const inlineBytes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].reduce((sum, match) => sum + Buffer.byteLength(match[1]), 0);
  largestInlineScriptBytes = Math.max(largestInlineScriptBytes, inlineBytes);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: H1`);
  assert.ok(html.includes(`href="https://ohmybot.si${route}"`), `${route}: canonical`);
  assert.ok(html.includes('https://caelis.dev/download/caelis-bot/'), `${route}: macOS download`);
  for (const format of ['setup', 'zip']) assert.ok(html.includes(`href="/download/windows/${format}/"`), `${route}: Windows ${format}`);
  assert.ok(!html.includes('href="https://github.com/caelis-labs/caelis-bot/releases/latest"'), `${route}: no default GitHub Windows download`);
  assert.ok(html.includes(`https://caelis.dev${lang === 'en' ? '' : '/zh-cn'}/docs/caelis-bot/installation/`), `${route}: localized guide`);
  assert.ok(html.includes('Authenticode') && html.includes('WebView2'), `${route}: platform requirements in FAQ`);
  assert.ok(!/Caelis App|caelis-app|data-media-pending|caelis-bot-current|caelis-bot-demo/.test(html), `${route}: no obsolete content or video placeholder`);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, attr, raw] of html.matchAll(/\b(href|src|poster)="([^"]+)"/g)) {
    if (/^(data:|mailto:)/.test(raw)) continue;
    const url = new URL(raw, `https://ohmybot.si${route}`);
    if (url.origin !== 'https://ohmybot.si') continue;
    const target = decodeURIComponent(url.pathname);
    if (['/download/windows/setup/', '/download/windows/zip/'].includes(target)) continue;
    const file = target.endsWith('/') ? target + 'index.html' : target;
    assert.ok(files.has(file), `${route}: missing ${attr} ${raw}`);
    if (url.hash && target === route) assert.ok(ids.has(url.hash.slice(1)), `${route}: missing fragment ${raw}`);
    checked++;
  }
  for (const name of ['plan','note','reminder']) {
    assert.ok(ids.has(`tab-${name}`) && ids.has(`example-${name}`), `${route}: workflow ${name}`);
  }
  assert.equal((html.match(/role="tabpanel"/g)||[]).length, 5);
  assert.equal((html.match(/<section class="faq[\s\S]*?<\/section>/)?.[0].match(/<details(?:\s|>)/g)||[]).length, 6);
  assert.ok(html.includes(`weekend-plan-${lang}.md`) && html.includes(`writing-notes-${lang}.md`));
  if (media.ready) {
    assert.ok(media.sourceVersion && media.duration > 0 && media.duration <= 60 && media[lang].description, 'Reviewed film provenance');
    assert.ok(media[lang].mobileBase, 'Phone cut is required for this film');
    assert.equal(media.mobileWidth / media.mobileHeight, 4 / 5, 'Authored phone aspect');
    assert.ok(html.includes(`srcset="${media[lang].mobileBase}.webp"`) && html.includes('media="(max-width: 640px)"'), 'Responsive phone poster');
    const video = html.match(/<video\b[^>]*>/)?.[0] || '';
    for (const attribute of ['controls', 'muted', 'playsinline']) assert.match(video, new RegExp(`\\b${attribute}\\b`));
    assert.ok(!video.includes('autoplay'), 'Film starts on user request');
    assert.ok(video.includes('preload="none"') && video.includes(`poster="${media[lang].base}.webp"`));
    const track = html.match(/<track\b[^>]*>/)?.[0] || '';
    assert.ok(track.includes(`src="${media[lang].base}.vtt"`) && track.includes(`srclang="${lang === 'en' ? 'en' : 'zh-CN'}"`));
    for (const publicBase of [media[lang].base, media[lang].mobileBase]) {
      const base = publicBase.slice(1);
      for (const extension of ['mp4', 'webp', 'vtt']) {
        const asset = `${base}.${extension}`;
        assert.equal(createHash('sha256').update(await readFile(path.join(dist, asset))).digest('hex'), media.sha256[path.basename(asset)], `Reviewed media changed: ${asset}`);
      }
      assert.ok((await stat(path.join(dist, `${base}.mp4`))).size < 15_000_000, 'Film exceeds 15 MB');
      assert.ok((await readFile(path.join(dist, `${base}.vtt`), 'utf8')).startsWith('WEBVTT'));
    }
  } else {
    assert.ok(!html.includes('<video') && !/<button[^>]*data-open-film/.test(html), 'No empty film frame while creative V2 is pending');
  }
}
for(const file of files) assert.ok(!/caelis-bot-(current|demo|film-v2)/.test(file), `Obsolete film: ${file}`);
for(const width of [600,1000]) assert.ok((await stat(path.join(dist,`assets/bot/companion-${width}.webp`))).size < 160_000, 'Character image budget');
const js = [...files].filter(file=>file.endsWith('.js'));
const scriptBytes = (await Promise.all(js.map(file=>stat(path.join(dist,file))))).reduce((sum,file)=>sum+file.size,0) + largestInlineScriptBytes;
assert.ok(scriptBytes < 20_000, `Script budget: ${scriptBytes}`);
console.log(`Verified 2 locales, 3 workflows each, 6 FAQs each, ${checked} local links/assets; ${scriptBytes} JS bytes. Film: ${media.ready ? `integrated; review status: ${media.reviewStatus}` : 'pending, no public placeholder'}.`);
