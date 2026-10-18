# CaelisBot

The single English / Simplified Chinese marketing website for **CaelisBot**, at https://ohmybot.si. Guides and the macOS release resolver live at caelis.dev. Windows downloads point to the official GitHub latest release.

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

The 2026-10-18 redesign uses an open, warm canvas, a result-led hero, the released Caelis artwork at small companion scale, concise bilingual copy, and three interactive input-to-result examples. The examples are explicitly illustrative, and their downloadable Markdown files are fictional public samples. They are not live inference or screenshots of the app. Model, platform and privacy details are in the expandable FAQ and linked guides.

`src/data/bot-content.json` owns both languages. Claims are checked against published Bot **v0.15.2** (`c6579eecb9da57a91090174b9a414750a3e3ef4f`). A later main commit is not a release. macOS Apple Silicon and Windows x64 are published; Windows is unsigned. Do not advertise POCs, plans or unverified platform parity.

`BotLanding.astro`, `bot-landing.css` and `bot-landing.ts` own presentation and interaction. Tabs have arrow/Home/End keyboard behavior; FAQ uses native details; theme selection persists when storage is available. Hero/reveal/tab animation is short and respects reduced motion. No autoplay film, third-party requests, analytics or WebGL runtime is needed.

## Artwork and optional film

The transparent character image is rendered from the unmodified, publicly shipped `caelis-garden-outfit-v1.glb` at the release SHA above. It is artwork, not a product screenshot. See `public/assets/bot/PROVENANCE.md`, `ATTRIBUTION.md` and `LICENSE.md` for provenance and original asset terms. The logo is the existing owner-selected Bot mark. The hero and companion section show the complete unchanged artwork at a small scale, without portrait cropping or enlarged hands. This is a composition change, not a model/pose repair. No user chats or credentials are included.

The previous slideshow and 56-second recording were removed from the public bundle as part of the authorized V2 redesign. The separately produced V3.1 candidate film is integrated in English and Chinese: four 48-second, 30fps silent H.264 files, with 1920×1080 desktop and independently composed 1080×1350 phone cuts. It combines released character rendering with authored illustrative workflows; it is not a native recording. `src/data/bot-media.json` records provenance and the twelve exact asset hashes. **Media remains a local candidate, with the delivered CaelisBot branding and smaller, relaxed-arm character composition. The coordinator relayed the video reviewer’s updated assessment: the earlier brief text ghosting and mobile card-edge overflow are nonblocking suggestions, not standalone release blockers. The twelve revised delivery hashes are verified; independent final-media acceptance remains pending; integration is not permission to publish.** The page also works independently of it.

For an approved replacement delivery, set `ready`, duration (maximum 60 seconds), source version, localized MP4/WebP/VTT bases/descriptions and file SHA-256 values. The explicit-play dialog uses native controls, muted inline playback, localized captions and native fullscreen with a reversible viewport-expanded fallback when the browser denies it. Optional `mobileBase` selects a separately composed mobile cut on opening at <=640px, with a corresponding poster and VTT; no mid-play resizing swaps the source. Test both languages on actual integrated pages before accepting the assets. Physical iOS/Android fullscreen needs separate device verification.

## Cloudflare Pages

- Official repository: `caelis-labs/ohmybot`
- Documented production branch: `main`
- Build: `npm run build`, output: `dist`
- Domains: `ohmybot.si`, `www.ohmybot.si`

GitHub Actions builds pushes and PRs without a publishing step. Git-connected Cloudflare Pages can deploy independently. Live branch deployment rules must be verified before any push. This work remains local; no domain, Pages account or production settings were changed.

## License

Code inherits Apache-2.0 from the original website. Character artwork and media remain subject to the original asset terms. This repository does not relicense character assets.
