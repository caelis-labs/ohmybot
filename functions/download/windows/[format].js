const indexURL = 'https://releases.caelis.dev/caelis-bot/downloads/windows-amd64/latest.json';
const origin = 'https://releases.caelis.dev';
const suffixes = { setup: ['nsis', '-Setup.exe'], zip: ['zip', '.zip'] };

export function downloadURL(index, format) {
  const target = suffixes[format];
  if (!target) throw new Error('Unsupported format');
  if (index.schema !== 1 || index.platform !== 'windows-amd64' ||
      !/^v\d+\.\d+\.\d+(?:-windows\.preview\.[1-9]\d*)?$/.test(index.tag) ||
      !/^[a-f0-9]{40}$/.test(index.source)) throw new Error('Invalid release index');
  const channel = index.tag.includes('-windows.preview.') ? 'preview' : 'stable';
  const base = `${origin}/caelis-bot/releases/windows-amd64/${index.tag}/`;
  if (index.channel !== channel || index.baseURL !== base || !Array.isArray(index.artifacts)) throw new Error('Invalid release location');
  const artifacts = index.artifacts.filter(item => item.format === target[0]);
  const expected = `Caelis-Bot-${index.tag.slice(1)}-windows-amd64-${channel}${target[1]}`;
  if (artifacts.length !== 1 || artifacts[0].file !== expected ||
      !/^[a-f0-9]{64}$/.test(artifacts[0].sha256) ||
      !Number.isSafeInteger(artifacts[0].length) || artifacts[0].length <= 0 || artifacts[0].length > 512 * 1024 * 1024) throw new Error('Invalid artifact');
  return base + expected;
}

export async function resolveDownload(format, fetcher = fetch) {
  if (!Object.hasOwn(suffixes, format)) return new Response('Download not found.', { status: 404 });
  try {
    const response = await fetcher(indexURL, { redirect: 'error', signal: AbortSignal.timeout(8000), headers: { Accept: 'application/json' }, cf: { cacheTtl: 0 } });
    if (!response.ok) throw new Error('Index unavailable');
    const body = await response.text();
    if (body.length > 16384) throw new Error('Index too large');
    const location = downloadURL(JSON.parse(body), format);
    return new Response(null, { status: 302, headers: { Location: location, 'Cache-Control': 'no-store' } });
  } catch {
    return new Response('Download temporarily unavailable. Please try again shortly. / 下载暂时不可用，请稍后重试。', {
      status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '30' },
    });
  }
}

export const onRequestGet = ({ params }) => resolveDownload(params.format);
export const onRequestHead = onRequestGet;
