# Oh My Bot

Independent website for Caelis Bot at https://ohmybot.si.

The initial English and Chinese pages are extracted from the Caelis Bot project page in [caelis.dev](https://github.com/caelis-labs/caelis.dev), source commit `2021fd8584be75124fe2d7d38e26d7a8bd09533b`. Product copy, demo videos, captions, theme switching, and responsive layout are preserved. Documentation and the latest macOS download continue to use caelis.dev.

## Development

Use Node.js 22.16 or newer (minimum 22.12).

```sh
npm ci
npm run dev
npm run check
npm run build
```

## Cloudflare Pages

- Repository: `caelis-labs/ohmybot`
- Production branch: `main`
- Build command: `npm run build`
- Output directory: `dist`
- Custom domains: `ohmybot.si`, `www.ohmybot.si`
- Static site; no secrets or runtime bindings required.

## License

Code inherits Apache-2.0 from the original website. Character artwork and media remain subject to their original asset terms; see `public/assets/bot/LICENSE.md` and `ATTRIBUTION.md`. The repository does not relicense character assets.
