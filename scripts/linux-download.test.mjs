import { test } from 'node:test';
import assert from 'node:assert/strict';
import { downloadURL, resolveDownload } from '../functions/download/linux/[arch].js';

const index = (arch, version = '0.18.1') => ({
  schema: 1, product: 'caelisbot', platform: `linux-${arch}`, channel: 'stable',
  buildKind: 'release', version, source: 'a'.repeat(40),
  assets: ['tar.gz', 'sha256'].map(ext => ({ name: `caelisbot-${version}-linux-${arch}.${ext}`, length: 1234, sha256: 'b'.repeat(64) })),
});

test('Linux packages and checksums follow each architecture index across releases', async () => {
  for (const arch of ['amd64', 'arm64']) for (const version of ['0.18.1', '0.19.0']) for (const asset of ['package', 'checksum']) {
    const data = index(arch, version);
    const response = await resolveDownload(arch, asset, async (url, options) => {
      assert.equal(url, `https://releases.caelis.dev/caelis-bot/downloads/linux-${arch}/latest.json`);
      assert.equal(options.redirect, 'manual');
      return Response.json(data);
    });
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), downloadURL(data, arch, asset));
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('wrong identity, architecture, inventory and unavailable indices cannot redirect', async () => {
  for (const mutate of [d => d.product = 'other', d => d.platform = 'linux-arm64', d => d.channel = 'dev', d => d.buildKind = 'dev', d => d.version = '../escape', d => d.source = '', d => d.assets[0].name = '../escape.tar.gz', d => d.assets[0].length = 0, d => d.assets[0].sha256 = '', d => d.assets.push(d.assets[0])]) {
    const data = index('amd64'); mutate(data);
    const response = await resolveDownload('amd64', 'package', async () => Response.json(data));
    assert.equal(response.status, 503); assert.equal(response.headers.get('location'), null);
  }
  for (const fetcher of [async () => { throw Error('network'); }, async () => new Response('', { status: 404 }), async () => new Response('', { status: 302, headers: { Location: 'https://example.com' } }), async () => new Response('invalid'), async () => new Response('x'.repeat(65537))]) {
    assert.equal((await resolveDownload('arm64', 'package', fetcher)).status, 503);
  }
  const noFetch = () => { throw Error('unsupported input must not fetch'); };
  assert.equal((await resolveDownload('x86', 'package', noFetch)).status, 404);
  assert.equal((await resolveDownload('amd64', 'installer', noFetch)).status, 404);
});
