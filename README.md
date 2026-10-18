# Oh My Bot

Independent English and Simplified Chinese website for **Caelis Bot** at https://ohmybot.si, from the official `caelis-labs/ohmybot` repository. Caelis Bot is the desktop product; it is separate from the `caelis bot` terminal command and Caelis App.

The original design was extracted from `caelis-labs/caelis.dev` at `2021fd8584be75124fe2d7d38e26d7a8bd09533b`. The refresh preserves its fonts, palette, hero, film frame, scenario rows, theme behavior and responsive layout. It expands the content with macOS/Windows downloads, setup, models, screenshots and FAQ. Guides and macOS download resolution use caelis.dev; Windows downloads use official GitHub Latest release assets.

## Development

Use Node.js 22.16 or newer (minimum 22.12).

```sh
npm ci
npm run check
npm run build
npm run verify
npm run dev
```

## Content and recording

`src/data/bot-content.json` owns English and Chinese product copy. The reviewed source is Bot v0.15.2 / `c6579eecb9da57a91090174b9a414750a3e3ef4f` (2026-10-18), also the verified main at review time. Windows availability follows the published Setup/ZIP and release notes; Windows binaries are unsigned. The app's code and docs contain some historical Windows-next statements, which do not override the actual public release assets. Marketing does not advertise every source/POC capability or promise complete platform parity.

`src/data/bot-media.json` controls the current recording. The old v0.2.0 scripted film is retained at its old asset URL, but removed from the current product page and social card. A separate video Worker is producing real footage. Until reviewed delivery arrives, `ready: false` renders an explicit recording-in-preparation state with the existing brand icon. This refresh is not complete for video.

After privacy/provenance review, place new English/Chinese MP4, WebP and WebVTT sets in `public/assets/video/`, update paths, real duration, source release, platform and truthful descriptions in the media JSON, then enable it. Use new filenames, never silently relabel old footage. The existing player preserves visibility, pause and reduced-motion behavior. Check both locales, captions, playback, theme and mobile layout. The website owner integrates assets; the video Worker owns its independent production directory.

## Cloudflare Pages

The existing repository documents:

- Repository: `caelis-labs/ohmybot`
- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- Custom domains: `ohmybot.si`, `www.ohmybot.si`

GitHub Actions builds pushes and PRs; it contains no publishing step. Git-connected Cloudflare Pages may deploy independently. Verify live branch settings before pushing if production deployment could result. No domain, Pages or production configuration change is part of the content refresh. Static site; no secrets or runtime bindings required.

## License

Code inherits Apache-2.0 from the original website. Character artwork and media remain subject to their original asset terms; see `public/assets/bot/LICENSE.md` and `ATTRIBUTION.md`. The repository does not relicense character assets.
