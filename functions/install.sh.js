// Serve the maintained official bootstrap through the website's stable URL.
const upstream = 'https://releases.caelis.dev/caelis-bot/install.sh';
export async function serveInstaller(fetcher = globalThis.fetch, head = false) {
  try {
    const response = await fetcher(upstream, { redirect: 'error', signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error('Unavailable');
    const script = await response.text();
    if (!script.startsWith('#!') || script.length > 262144) throw new Error('Invalid script');
    return new Response(head ? null : script, { headers: {
      'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    return new Response(head ? null : 'Installer temporarily unavailable.\n', { status: 503, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
export const onRequestGet = () => serveInstaller();
export const onRequestHead = () => serveInstaller(globalThis.fetch, true);
