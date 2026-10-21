const origin = 'https://releases.caelis.dev/caelis-bot';
const architectures = new Set(['amd64', 'arm64']);

// Match the public install index used by the official Linux bootstrap. The
// installer verifies its Ed25519 signature; this route only selects a download.
export function downloadURL(index, arch, asset = 'package') {
  if (!architectures.has(arch) || !['package', 'checksum'].includes(asset)) throw new Error('Unsupported download');
  if (index?.schema !== 1 || index.product !== 'caelisbot' ||
      index.platform !== `linux-${arch}` || index.channel !== 'stable' ||
      index.buildKind !== 'release' || !/^\d+\.\d+\.\d+$/.test(index.version) ||
      !/^[a-f0-9]{40}$/.test(index.source) || !Array.isArray(index.assets)) throw new Error('Invalid release index');
  const name = `caelisbot-${index.version}-linux-${arch}.${asset === 'checksum' ? 'sha256' : 'tar.gz'}`;
  const matches = index.assets.filter(item => item?.name === name);
  if (matches.length !== 1 || !/^[a-f0-9]{64}$/.test(matches[0].sha256) ||
      !Number.isSafeInteger(matches[0].length) || matches[0].length <= 0 ||
      matches[0].length > 512 * 1024 * 1024) throw new Error('Invalid artifact');
  return `${origin}/releases/linux-${arch}/v${index.version}/${name}`;
}

export async function resolveDownload(arch, asset = 'package', fetcher = (url, options) => globalThis.fetch(url, options)) {
  if (!architectures.has(arch) || !['package', 'checksum'].includes(asset)) return new Response('Download not found.', { status: 404 });
  try {
    const response = await fetcher(`${origin}/downloads/linux-${arch}/latest.json`, {
      redirect: 'manual', signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/json' }, cf: { cacheTtl: 0 },
    });
    if (!response.ok) throw new Error('Index unavailable');
    const body = await response.text();
    if (body.length > 65536) throw new Error('Index too large');
    const location = downloadURL(JSON.parse(body), arch, asset);
    return new Response(null, { status: 302, headers: { Location: location, 'Cache-Control': 'no-store' } });
  } catch {
    return new Response('Download temporarily unavailable. Please try again shortly. / 下载暂时不可用，请稍后重试。', {
      status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '30' },
    });
  }
}

export const onRequestGet = ({ params, request }) => resolveDownload(params.arch, new URL(request.url).searchParams.get('asset') || 'package');
export const onRequestHead = onRequestGet;
