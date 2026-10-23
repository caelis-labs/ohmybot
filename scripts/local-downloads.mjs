import { resolveDownload as macOS } from "../functions/download/macos.js";
import { resolveDownload as windows } from "../functions/download/windows/[format].js";
import { resolveDownload as linux } from "../functions/download/linux/[arch].js";

// Development-only bridge to the exact production Functions handlers.
// No downloads are executed at build time, and no package bytes are proxied.
export function localDownloads() {
  return {
    name: "local-download-functions",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || "/", "http://127.0.0.1");
        const mac = url.pathname === "/download/macos/";
        const win = url.pathname.match(/^\/download\/windows\/(setup|zip)\/$/);
        const lin = url.pathname.match(/^\/download\/linux\/(amd64|arm64)\/$/);
        if (!mac && !win && !lin) return next();
        if (!["GET", "HEAD"].includes(req.method)) {
          res.writeHead(405, { Allow: "GET, HEAD" });
          res.end();
          return;
        }
        try {
          const response = mac
            ? await macOS(new Request(url, { method: req.method }))
            : win
              ? await windows(win[1])
              : await linux(lin[1]);
          res.writeHead(response.status, Object.fromEntries(response.headers));
          res.end(req.method === "HEAD" ? undefined : await response.text());
        } catch {
          res.writeHead(503);
          res.end("Download temporarily unavailable.");
        }
      });
    },
  };
}
