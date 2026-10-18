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

The current English and Chinese Bot films are 56-second native macOS recordings of v0.15.2 source (`c6579eecb9da57a91090174b9a414750a3e3ef4f`), made in an isolated ad-hoc build. This is not acceptance evidence for the signed download binary. The scenes show model setup, fictional attachment notes, actual model responses and a Markdown checklist saved in Notebook. Waiting time is edited. No separate desktop-pet, external messaging, file-preview click or download-click demonstration is claimed.

The six reviewed MP4/WebP/VTT files live in `public/assets/video/`. `src/data/bot-media.json` records their source, duration, localized paths and SHA-256 hashes; verification rejects altered media or a pending placeholder. Only public final assets are included, never recording profiles, raw takes or private paths. Old v0.2.0 files and `bot-demo.json` remain solely for URL compatibility and historical reproduction; current pages use `bot-media.json`.

The player keeps muted inline looping, explicit pause and reduced-motion behavior. Controls sit below the image, preserving every recorded pixel. The film includes embedded captions; optional localized VTT captions can be enabled with CC, including fullscreen. Standard fullscreen keeps the same controls; iPhone Safari uses native video fullscreen when available. If fullscreen is denied, native controls become available. Physical iOS/Android playback still requires device verification.

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
