import test from 'node:test';
import assert from 'node:assert/strict';
import { serveInstaller } from '../functions/install.sh.js';
test('same-origin installer preserves official bytes and supports HEAD', async () => {
 const script = '#!/bin/sh\necho installer\n';
 const fetcher = async (url, options) => { assert.equal(url, 'https://releases.caelis.dev/caelis-bot/install.sh'); assert.equal(options.redirect, 'error'); return new Response(script); };
 assert.equal(await (await serveInstaller(fetcher)).text(), script);
 assert.equal(await (await serveInstaller(fetcher, true)).text(), '');
});
test('installer fails closed on upstream errors and invalid responses', async () => {
 for (const fetcher of [async()=>new Response('missing',{status:404}),async()=>new Response('<html>error</html>'),async()=>{throw new Error('offline');}]) {
  const result=await serveInstaller(fetcher); assert.equal(result.status,503); assert.equal(result.headers.get('Cache-Control'),'no-store');
 }
});
