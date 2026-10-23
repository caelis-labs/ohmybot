# CaelisBot

The single English / Simplified Chinese marketing website for **CaelisBot**, at https://ohmybot.si. Guides live at caelis.dev; this site owns its macOS resolver at `/download/macos/`. Windows Setup and ZIP use `/download/windows/setup/` and `/download/windows/zip/`. Cloudflare Pages Functions resolve the latest validated macOS, Windows and Linux metadata on R2 and redirect only to its allowlisted R2 artifact paths. No package bytes pass through the website.

The current page targets published Bot **v0.18.2** (`https://releases.caelis.dev/caelis-bot/latest.json`). Release metadata is centralized in `src/data/release.json`; do not duplicate version strings in page copy.

## Development

Use Node.js 22.16 or newer (minimum 22.12).

```sh
npm ci
npm run check
npm run build
npm run verify
npm run dev
```

`npm run verify` checks both locales, local links/assets, release version, FAQ count, icon/OG dimensions and budgets, film hashes and the script budget.

## Page structure and motion

The landing page follows caelis.dev's cool-white, ink and blue-violet palette, Manrope typography and generous editorial spacing. The companion artwork is the main visual anchor.

1. **Hero** — character, short promise, OS-aware download and secondary film link.
2. **Scroll story** — ongoing delegation, approvals/questions and remote continuity; three short statements share a sticky illustrated stage.
3. **One point of contact** — task coordination and remembered preferences. Explicitly distinguish Telegram from the experimental Weixin text channel; remote work requires the host running and online.
4. **Download** — one OS-aware action on the homepage. `/download/` and `/zh-cn/download/` contain all platforms, requirements, checksums and alternative artifacts.

`src/data/bot-content.json` owns both languages; `release.json` owns download URLs and release metadata. CSS handles finite entrance and scene transitions. A passive requestAnimationFrame update selects the nearest story step and adds bounded desktop portrait depth. IntersectionObserver reveals sections. Reduced-motion disables animation; without JavaScript the workflow text and download links remain available.

## Positioning and evidence boundary

The primary promise is "You hand it off. Bot follows through." The demonstrated sequence is repeated delegation, context-aware coordination of questions and approvals, then continued work through Telegram. Persistent identity and local preferences connect the sequence. This is a positioning choice, not a claim that competitors cannot do any of these things.

Memory and messaging alone are not exclusive differentiators: [Hermes documents both](https://hermes-agent.nousresearch.com/docs/reference/faq), and [OpenClaw documents execution approvals](https://docs.openclaw.ai/tools/exec-approvals). No comparative ranking or feature absence claim is made for Hermes, OpenClaw, Muse, Grok Bot or ChatGPT Dots. A public head-to-head comparison would require versioned product identification and equivalent live tasks.

Bot product/architecture documentation describes one long-lived conversation, independent delegated tasks, original-request approval authority and shared remote decision handling. Weixin remains an experimental private-text channel in that documentation. The site keeps this limit visible and does not promise operation while the host sleeps or is offline. This change is website presentation and download routing only; no Bot capability or Bot-facing skill workflow changes.

## Real captures and remaining TODOs

The hero is released character artwork. The scroll scenes are **HTML/CSS illustrations with synthetic data**, labelled as such. They are not native product screenshots. `TODO(real-capture)` marks where reviewed native images or short loops may replace the scenes.

The secondary 48-second film remains explicitly labelled as illustrative. `TODO(real-demo)` marks the future native recording replacement. Use synthetic data, review privacy, update alternative text and provenance before changing these disclosures.

## Release sync

`src/data/release.json` currently mirrors v0.18.2 (released 2026-10-22). The next step is to generate this file from the public `latest.json` manifest and fail CI when the site version differs from the published stable version. Until then, update it in the same change as any release-facing copy.

## Performance

The production build is intentionally light: no third-party runtime, no WebGL, no autoplay film. The hero and Worker-card illustration reuse the 600px character derivative; the film poster is set only when the dialog opens. The oversized source icon is no longer referenced.

The previous design's throttled measurements do not establish performance for this redesign. Re-measure the production build before publishing a new LCP or transfer-size claim. The build verifier enforces a 20 KB script budget; no animation framework or third-party runtime was added.

## Next steps

- Replace the illustrative product stage and capability visuals with reviewed native captures (see TODOs above).
- Replace the brand film with a 20–30 second native demo; keep the current film secondary.
- Generate `release.json` from the public stable manifest and fail CI on drift.
- Inject a privacy-friendly analytics provider and verify the event stream; add use-case/model/privacy pages when there is capacity for ongoing SEO content.

## Analytics

No third-party analytics script is loaded by default. The page emits a provider-agnostic `caelis:track` CustomEvent and calls `window.plausible(name, { props })` or `window.umami.track(name, props)` when either is present.

Events: `download_cta`, `download_click`, `film_open`, `faq_open`, `linux_copy`, `theme_toggle`, `scroll_depth`.

Inject the chosen provider in `SiteLayout.astro` or an edge-injected script. Download redirects should also be counted at the resolver/edge so a navigation does not lose the event. Do not send PII, full URLs or clipboard content.

## Brand assets

- `public/favicon-32.png` (32×32), `public/favicon-64.png` (64×64), `public/apple-touch-icon.png` (180×180)
- `public/og-cover.jpg` and `public/og-cover-zh.jpg` (1200×630, <200 KB)
- `public/assets/bot/companion-600.webp` / `companion-1000.webp` — released character artwork; see `public/assets/bot/PROVENANCE.md`, `ATTRIBUTION.md` and `LICENSE.md`.
- `src/assets/brand/bot-icon-source.png` is the original 1254×1254 source used to derive the favicons; it is not copied to `public/` and must not be reintroduced as the header logo or OG image.

## Downloads

`npm run dev` includes a development-only Vite bridge to the same handlers used by Pages Functions. It handles GET/HEAD for the known download routes; static production output still relies on Cloudflare Pages Functions. No package bytes pass through the site.

macOS resolves the current public manifest and checks the named artifact with HEAD, including its declared length, before redirecting directly to R2. Invalid metadata, missing artifacts and timeouts return 503 without an unverified redirect. `?asset=checksum` resolves the checksum file. Windows and Linux retain their index-based resolvers. See `functions/download/` and `scripts/*-download.test.mjs`.

The platform CTA updates its label and href on the client. Without JavaScript, or on mobile/unknown devices, it opens the localized download catalogue instead of guessing a desktop OS.

## Cloudflare Pages

- Official repository: `caelis-labs/ohmybot`
- Documented production branch: `main`
- Build: `npm run build`, output: `dist`
- Domains: `ohmybot.si`, `www.ohmybot.si`
- `public/_routes.json` limits Functions to the download routes; marketing pages remain static.

GitHub Actions builds pushes and PRs without a publishing step. Git-connected Cloudflare Pages deploys independently. Verify live branch deployment rules before pushing.

## License

Code inherits Apache-2.0 from the original website. Character artwork and media remain subject to the original asset terms. This repository does not relicense character assets.

## Worker-focused positioning

Lead with desktop companion + Worker supervision + Attach to the original native conversation. The interactive terminal illustration keeps the Worker status visible when its observation surface closes. Bot + Codex can answer from known context and handle inspectable approvals within existing authority; missing context, secret/opaque payloads and new authority remain user decisions. Do not imply equivalent automatic approval handling for every backend or universal replacement of runtime goals/workflows.

Conditional follow-up supports custom authorized scripts, available tools from selected Bot plugin connections, structured results and native conditions, or task completion. This is extensible rather than a fixed list of tools; Runtime-native tools and unrelated external MCP connections are not automatically included. The host must remain running; sleeping or quitting cannot guarantee wakeups.

Evidence: Caelis Bot `docs/product.md` (task cards, original terminal, resident arrangements), `docs/architecture.md` (Worker question/approval routing and event collection), and bot-core `references/tasks.md` / `references/interactions.md`. This change only updates the website; no Bot runtime behavior or Bot skill guidance changes are needed.

Homepage copy describes user outcomes in plain language. Worker, Attach and Coding Runtime remain implementation terms in documentation rather than marketing headlines. Codex-specific automatic answering/approval scope is disclosed below the feature sections and in the FAQ.

## Independent documentation

The Bot site owns bilingual guides in `src/data/guides.json`, rendered by `GuidePage.astro` and localized `/docs/` routes. Navigation and legacy redirects stay on this site. Release storage remains `releases.caelis.dev` for package delivery only; it is not a main-site page dependency. Update guides alongside verified product changes. Home-page technical setup details belong in the guide or download catalogue.

## Current presentation

The homepage uses three looping HTML/CSS product demonstrations with synthetic tasks, based on the App's conversation and task-card styling. No video is embedded. The character uses a static frame of the App idle pose. Motion pauses offscreen and respects reduced-motion preferences.

The independent bilingual download catalogue and chapter-based guides live on this site. Download buttons resolve current release artifacts. `/install.sh` is a byte-identical static copy of the official bootstrap, verified on 2026-10-23 and pinned by a SHA-256 test. Refresh it from the official release source when the bootstrap changes. It is excluded from Functions routing. The bootstrap still verifies and installs packages using its official release infrastructure.

Run `npm run check`, `npm run build`, and `npm run verify` before publishing. The verification suite includes download resolvers and installer byte integrity. This presentation update does not change Bot runtime behavior or require Bot skill changes.
