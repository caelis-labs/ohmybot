import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const content = JSON.parse(await readFile(path.join(root, 'src/data/bot-content.json'), 'utf8'));
const media = JSON.parse(await readFile(path.join(root, 'src/data/bot-media.json'), 'utf8'));
const release = JSON.parse(await readFile(path.join(root, 'src/data/release.json'), 'utf8'));

const files = new Set();
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else files.add('/' + path.relative(dist, file));
  }
}
await walk(dist);

const pngSize = async file => {
  const data = await readFile(file);
  assert.equal(data.toString('ascii', 1, 4), 'PNG', `${file} is not a PNG`);
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
};
const jpegSize = async file => {
  const data = await readFile(file);
  assert.equal(data[0], 0xff);
  assert.equal(data[1], 0xd8);
  let offset = 2;
  while (offset < data.length) {
    if (data[offset] !== 0xff) { offset++; continue; }
    const marker = data[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) };
    }
    offset += 2 + data.readUInt16BE(offset + 2);
  }
  throw new Error(`${file}: no JPEG SOF marker`);
};

for (const [name, width, height, maxBytes] of [
  ['public/favicon-32.png', 32, 32, 10_000],
  ['public/favicon-64.png', 64, 64, 20_000],
  ['public/apple-touch-icon.png', 180, 180, 60_000],
]) {
  const file = path.join(root, name);
  const info = await stat(file);
  assert.ok(info.size < maxBytes, `${name} exceeds ${maxBytes} bytes (${info.size})`);
  assert.deepEqual(await pngSize(file), { width, height }, `${name}: dimensions`);
}
for (const [name, width, height, maxBytes] of [
  ['public/og-cover.jpg', 1200, 630, 200_000],
  ['public/og-cover-zh.jpg', 1200, 630, 200_000],
]) {
  const file = path.join(root, name);
  const info = await stat(file);
  assert.ok(info.size < maxBytes, `${name} exceeds ${maxBytes} bytes (${info.size})`);
  assert.deepEqual(await jpegSize(file), { width, height }, `${name}: dimensions`);
}

let checked = 0;
let scriptBytes = 0;
for (const lang of ['en', 'zh-cn']) {
  const c = content[lang];
  const route = lang === 'en' ? '/' : '/zh-cn/';
  const html = await readFile(path.join(dist, route, 'index.html'), 'utf8');
  const inlineBytes = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)]
    .reduce((sum, match) => sum + Buffer.byteLength(match[1]), 0);
  scriptBytes += inlineBytes;

  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${route}: H1`);
  assert.ok(html.includes(`href="https://ohmybot.si${route}"`), `${route}: canonical`);
  assert.ok(html.includes('hreflang="x-default"'), `${route}: hreflang`);
  assert.ok(html.includes('summary_large_image'), `${route}: large social card`);
  assert.ok(html.includes('og:image:width'), `${route}: OG dimensions`);
  assert.ok(html.includes('application/ld+json'), `${route}: structured data`);
  assert.ok(c.metaTitle, `${route}: localized page`);
  assert.ok(html.includes(c.metaTitle.replaceAll('&', '&amp;')), `${route}: localized title`);


  for (const id of ['top', 'product', 'character', 'models', 'privacy', 'download', 'faq']) {
    assert.ok(html.includes(`id="${id}"`), `${route}: missing #${id}`);
  }
  const catalogue = await readFile(path.join(dist, route === '/' ? 'download/index.html' : 'zh-cn/download/index.html'), 'utf8');
  assert.ok(!html.includes('data-platform-card='), `${route}: homepage must not list all platforms`);
  assert.equal((html.match(/data-download-cta/g) || []).length, 1, `${route}: one hero download action`);
  for (const platform of c.download.platforms) {
    assert.ok(catalogue.includes(`data-platform-card="${platform.id}"`), `${route}: catalogue platform`);
  }
  for (const href of [release.macos, release.windowsSetup, release.windowsZip, release.linuxAmd64, release.linuxArm64]) {
    assert.ok(catalogue.includes(`href="${href}"`), `${route}: missing download ${href}`);
  }
  assert.ok(catalogue.includes(release.linuxInstall), `${route}: Linux install command`);
  assert.ok(catalogue.includes('SmartScreen'), `${route}: Windows signing note`);
  assert.equal(release.macos, '/download/macos/', 'macOS resolver belongs to this site');
  assert.ok(!html.includes('data-platform-summary'), 'Homepage omits technical platform footnotes');
  const faqHtml = html.slice(html.indexOf('class="faq-list"'));
  assert.equal((faqHtml.match(/<details(?:\s|>)/g) || []).length, c.faq.items.length, `${route}: FAQ count`);
  assert.ok(html.includes(c.faq.items[0][0]), `${route}: first FAQ`);

  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const [, attr, raw] of (html + catalogue).matchAll(/\b(href|src|poster)="([^"]+)"/g)) {
    if (/^(data:|mailto:)/.test(raw)) continue;
    const url = new URL(raw, `https://ohmybot.si${route}`);
    if (url.origin !== 'https://ohmybot.si') continue;
    const target = decodeURIComponent(url.pathname);
    if (['/download/macos/', '/download/windows/setup/', '/download/windows/zip/', '/download/linux/amd64/', '/download/linux/arm64/'].includes(target)) continue;
    const file = target.endsWith('/') ? target + 'index.html' : target;
    assert.ok(files.has(file), `${route}: missing ${attr} ${raw}`);
    if (url.hash && target === route) assert.ok(ids.has(url.hash.slice(1)), `${route}: missing fragment ${raw}`);
    checked++;
  }

  if (media.ready) {
    assert.ok(media.sourceVersion && media.duration > 0 && media.duration <= 60 && media[lang].description, 'Reviewed film provenance');
    assert.ok(media[lang].mobileBase, 'Phone cut is required for this film');
    assert.equal(media.mobileWidth / media.mobileHeight, 4 / 5, 'Authored phone aspect');
    assert.ok(html.includes(`data-mobile-base="${media[lang].mobileBase}"`), `${route}: responsive video source`);
    const video = html.match(/<video\b[^>]*>/)?.[0] || '';
    for (const attribute of ['controls', 'muted', 'playsinline']) assert.match(video, new RegExp(`\\b${attribute}\\b`));
    assert.ok(!video.includes('autoplay'), 'Film starts on user request');
    assert.ok(video.includes('preload="none"') && video.includes(`data-desktop-base="${media[lang].base}"`), `${route}: poster is set on open`);
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
    assert.ok(!/\<button[^>]*data-open-film/.test(html), 'Removed brand film must stay removed');
    assert.ok(!html.includes('<video'), 'Product demos must render as DOM, not video');
    for (const kind of ['handoff', 'decisions', 'events']) assert.ok(html.includes(`data-product-demo="${kind}"`), `Missing code demo: ${kind}`);
    assert.equal((html.match(/data-demo-control/g) || []).length, 0, 'Demos loop without playback controls');
  }
}

for (const width of [600, 1000]) assert.ok((await stat(path.join(dist, `assets/bot/companion-${width}.webp`))).size < 160_000, 'Character image budget');
for (const file of files) assert.ok(!/caelis-bot-(current|demo|film-v2)/.test(file), `Obsolete film: ${file}`);
const js = [...files].filter(file => file.endsWith('.js'));
const jsBytes = (await Promise.all(js.map(file => stat(path.join(dist, file))))).reduce((sum, file) => sum + file.size, 0) + scriptBytes;
assert.ok(jsBytes < 20_000, `Script budget: ${jsBytes}`);
assert.ok(!(await readFile(path.join(dist, 'index.html'), 'utf8')).includes('/bot-icon.png'), 'Oversized bot-icon must not be referenced');

console.log(`Verified 2 locales with download catalogues, ${content.en.faq.items.length} FAQs each, ${checked} local links/assets, release ${release.tag}; ${jsBytes} JS bytes. Film: ${media.ready ? "integrated, illustrative" : "removed"}.`);

// Navigation must remain on the independent Bot site, including all guides.
for (const file of files) {
 if (!file.endsWith('.html')) continue;
 const html = await readFile(path.join(dist,file),'utf8');
 for (const [,raw] of html.matchAll(/\bhref="([^"]+)"/g)) {
  const url = new URL(raw, `https://ohmybot.si${file.replace(/index\.html$/, '')}`);
  assert.ok(!['caelis.dev','www.caelis.dev'].includes(url.hostname), `Main-site link in ${file}: ${raw}`);
  assert.equal(url.origin, 'https://ohmybot.si', `External navigation in ${file}: ${raw}`);
  const target = url.pathname.endsWith('/') ? url.pathname+'index.html' : url.pathname;
  if (url.pathname.startsWith('/download/') && !files.has(target)) continue;
  assert.ok(files.has(target), `Broken local link in ${file}: ${raw}`);
 }
}
assert.ok(!(await readFile(path.join(root,'public/_redirects'),'utf8')).includes('https://caelis.dev'), 'No main-site redirect rules');
