# Oh My Bot

The single English / Simplified Chinese marketing website for **Caelis Bot**, at https://ohmybot.si. Guides and the macOS release resolver live at caelis.dev. Windows downloads point to the official GitHub latest release.

## Development

Use Node.js 22.16 or newer (minimum 22.12).

```sh
npm ci
npm run check
npm run build
npm run verify
npm run dev
```

## Design and content

The 2026-10-18 redesign uses an open, warm canvas, the released Caelis companion artwork, concise bilingual copy, and three interactive input-to-result examples. The examples are explicitly illustrative, and their downloadable Markdown files are fictional public samples. They are not live inference or screenshots of the app. Model, platform and privacy details are in the expandable FAQ and linked guides.

`src/data/bot-content.json` owns both languages. Claims are checked against published Bot **v0.15.2** (`c6579eecb9da57a91090174b9a414750a3e3ef4f`). A later main commit is not a release. macOS Apple Silicon and Windows x64 are published; Windows is unsigned. Do not advertise POCs, plans or unverified platform parity.

`BotLanding.astro`, `bot-landing.css` and `bot-landing.ts` own presentation and interaction. Tabs have arrow/Home/End keyboard behavior; FAQ uses native details; theme selection persists when storage is available. Hero/reveal/tab animation is short and respects reduced motion. No autoplay film, third-party requests, analytics or WebGL runtime is needed.

## Artwork and optional film

The transparent character image is rendered from the unmodified, publicly shipped `caelis-garden-outfit-v1.glb` at the release SHA above. It is artwork, not a product screenshot. See `public/assets/bot/PROVENANCE.md`, `ATTRIBUTION.md` and `LICENSE.md` for provenance and original asset terms. The logo is the existing owner-selected Bot mark. No user chats or credentials are included.

The previous slideshow and 56-second recording were removed from the public bundle as part of the authorized V2 redesign. The separately produced V2 creative film is integrated in English and Chinese: 48 seconds, 1080p30, silent H.264. It combines released character rendering with authored illustrative workflows; it is not a native recording. `src/data/bot-media.json` records provenance and the six exact asset hashes. **Independent visual review rejected V2; it remains temporary local preview only. V3 is required before final acceptance or publication.** The page also works independently of it.

For an approved replacement delivery, set `ready`, duration (maximum 60 seconds), source version, localized MP4/WebP/VTT bases/descriptions and file SHA-256 values. The explicit-play dialog uses native controls, muted inline playback, localized captions and native fullscreen with a reversible viewport-expanded fallback when the browser denies it. Optional `mobileBase` selects a separately composed mobile cut on opening at <=640px, with a corresponding poster and VTT; no mid-play resizing swaps the source. Test both languages on actual integrated pages before accepting the assets. Physical iOS/Android fullscreen needs separate device verification.

## Cloudflare Pages

- Official repository: `caelis-labs/ohmybot`
- Documented production branch: `main`
- Build: `npm run build`, output: `dist`
- Domains: `ohmybot.si`, `www.ohmybot.si`

GitHub Actions builds pushes and PRs without a publishing step. Git-connected Cloudflare Pages can deploy independently. Live branch deployment rules must be verified before any push. This work remains local; no domain, Pages account or production settings were changed.

## License

Code inherits Apache-2.0 from the original website. Character artwork and media remain subject to the original asset terms. This repository does not relicense character assets.
