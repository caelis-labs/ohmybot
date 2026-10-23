import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
test('hosted bootstrap preserves reviewed official bytes and stays static',()=>{
 const bytes=readFileSync(new URL('../public/install.sh',import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'85b34f5cbb7afa367773a1ee14fa45509913627c12e4fd9f7f985b474aaefd6a');
 const routes=JSON.parse(readFileSync(new URL('../public/_routes.json',import.meta.url)));
 assert.ok(!routes.include.includes('/install.sh'));
});
