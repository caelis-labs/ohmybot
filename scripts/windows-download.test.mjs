import {test} from 'node:test';
import assert from 'node:assert/strict';
import {downloadURL, resolveDownload} from '../functions/download/windows/[format].js';

function index(tag='v0.16.0') {
  const channel=tag.includes('preview')?'preview':'stable';
  return {schema:1,platform:'windows-amd64',tag,source:'a'.repeat(40),channel,
    baseURL:`https://releases.caelis.dev/caelis-bot/releases/windows-amd64/${tag}/`,
    artifacts:[['nsis','-Setup.exe'],['zip','.zip']].map(([format,suffix])=>({format,file:`Caelis-Bot-${tag.slice(1)}-windows-amd64-${channel}${suffix}`,sha256:'b'.repeat(64),length:123}))};
}
test('Setup and ZIP resolve the same current R2 release without a site rebuild',async()=>{
  for(const tag of ['v0.16.0','v0.16.1','v0.17.0-windows.preview.1']) for(const format of ['setup','zip']) {
    const data=index(tag);
    const response=await resolveDownload(format,async(url,options)=>{
      assert.equal(url,'https://releases.caelis.dev/caelis-bot/downloads/windows-amd64/latest.json');
      assert.equal(options.redirect,'error');
      return Response.json(data);
    });
    assert.equal(response.status,302);
    assert.equal(response.headers.get('location'),downloadURL(data,format));
    assert.equal(response.headers.get('cache-control'),'no-store');
    assert.ok(response.headers.get('location').startsWith(data.baseURL));
  }
});
test('untrusted paths, malformed or duplicate artifacts cannot redirect a download',async()=>{
  for(const mutate of [d=>d.baseURL='https://github.com/',d=>d.tag='../escape',d=>d.platform='darwin-arm64',d=>d.channel='preview',d=>d.source='unknown',d=>d.artifacts[0].file='../escape.exe',d=>d.artifacts[0].sha256='',d=>d.artifacts[0].length=0,d=>d.artifacts.push(d.artifacts[0])]) {
    const data=index();mutate(data);
    const response=await resolveDownload('setup',async()=>Response.json(data));
    assert.equal(response.status,503);assert.equal(response.headers.get('location'),null);
  }
});
test('missing metadata and unsupported formats fail without a GitHub fallback',async()=>{
  for(const fetcher of [async()=>{throw Error('network');},async()=>new Response('',{status:404}),async()=>new Response('broken'),async()=>new Response('x'.repeat(16385))]) assert.equal((await resolveDownload('zip',fetcher)).status,503);
  assert.equal((await resolveDownload('other',()=>{throw Error('must not fetch');})).status,404);
});
