const origin = "https://releases.caelis.dev/caelis-bot";

export function artifactURL(manifest, asset = "dmg") {
  if (!["dmg", "checksum"].includes(asset))
    throw new Error("Unsupported asset");
  if (
    manifest?.schema !== 1 ||
    !/^\d+\.\d+\.\d+$/.test(manifest.version) ||
    manifest.tag !== `v${manifest.version}` ||
    manifest.file !== `Caelis-Bot-${manifest.version}-macos-arm64.dmg` ||
    !/^[a-f0-9]{40}$/.test(manifest.source) ||
    !/^[a-f0-9]{64}$/.test(manifest.sha256) ||
    !Number.isSafeInteger(manifest.length) ||
    manifest.length <= 0 ||
    manifest.length > 512 * 1024 * 1024
  ) {
    throw new Error("Invalid release metadata");
  }
  return `${origin}/releases/${manifest.tag}/${manifest.file}${asset === "checksum" ? ".sha256" : ""}`;
}

// This site owns the resolver. Resolve at click time because old R2 releases
// can be removed; never redirect to a URL supplied by untrusted metadata.
export async function resolveDownload(request, fetcher = globalThis.fetch) {
  if (!["GET", "HEAD"].includes(request.method)) {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const asset = new URL(request.url).searchParams.get("asset") || "dmg";
  if (!["dmg", "checksum"].includes(asset))
    return new Response(null, { status: 400 });
  try {
    const signal = AbortSignal.timeout(8000);
    const response = await fetcher(`${origin}/latest.json`, {
      signal,
      redirect: "manual",
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Metadata unavailable");
    const body = await response.text();
    if (body.length > 16384) throw new Error("Metadata too large");
    const manifest = JSON.parse(body);
    const location = artifactURL(manifest, asset);
    const available = await fetcher(location, {
      method: "HEAD",
      signal,
      redirect: "manual",
      cache: "no-store",
    });
    if (
      !available.ok ||
      (asset === "dmg" &&
        Number(available.headers.get("content-length")) !== manifest.length)
    ) {
      throw new Error("Artifact unavailable");
    }
    return new Response(null, {
      status: 302,
      headers: { Location: location, "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(
      request.method === "HEAD"
        ? null
        : "Download temporarily unavailable. Please try again shortly. / 下载暂时不可用，请稍后重试。",
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "Retry-After": "30",
        },
      },
    );
  }
}

export const onRequest = ({ request }) => resolveDownload(request);
