# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A single-page static portfolio site for Shahriyor Jo'rayev (digital marketing / Telegram blogging). Plain HTML/CSS/JS — no framework, no bundler, no package.json, no build step.

Live site: https://shjurayev.uz/ (custom domain via Cloudflare DNS → Hetzner VPS, Nginx, Let's Encrypt TLS)
Also mirrored at https://shahriyorjurayev.github.io/portfolio/ (GitHub Pages from the `main` branch, source path `/`, configured through the GitHub API `repos/{owner}/{repo}/pages` rather than a `gh-pages` branch or Pages UI toggle) — kept as a fallback, not the primary target.

## Commands

There is no build/lint/test tooling. To preview locally, serve the directory as static files, e.g.:

```
python3 -m http.server 8420
```

(matches the debug config in `.claude/launch.json`, which runs the same command on port 8420).

Deploying to GitHub Pages is just committing to `main` and pushing — it rebuilds automatically:

```
git add -A && git commit -m "..." && git push origin main
```

The VPS (`shjurayev.uz`) serves a separate `git clone` of this repo at `/var/www/shjurayev.uz` on the Hetzner server (user `shahriyor`, IP `77.42.27.88`, Nginx + Let's Encrypt TLS). `.github/workflows/deploy.yml` auto-deploys on every push to `main`: it SSHes in with a dedicated, restricted deploy key (GitHub secrets `DEPLOY_HOST`/`DEPLOY_USER`/`DEPLOY_SSH_KEY`) and runs `git pull` in that directory. The key's `authorized_keys` entry on the VPS has a forced `command=` restriction, so it can only ever run that one `git pull` — nothing else, regardless of what the workflow sends. If the auto-deploy ever needs to be run manually:

```
ssh shahriyor@77.42.27.88
cd /var/www/shjurayev.uz && git pull
```

## Architecture

**Single page, three script files, load order matters.** `index.html` loads `js/i18n.js` → `js/theme.js` → `js/main.js` in that order. `main.js` and the inline rotator code depend on the global `translations` object defined in `i18n.js`, so it must stay first.

**i18n is a flat key/dict lookup, not a library.** `js/i18n.js` defines `translations = { uz: {...}, en: {...}, ru: {...} }` (uz is default/fallback). Any element with `data-i18n="some.key"` gets its `textContent` replaced by `translations[lang]["some.key"]` in `applyLanguage()`. Language choice persists in `localStorage` under `portfolio-lang` and fires a `langchange` CustomEvent that other modules (achievements marquee, contact rotator) listen for to re-render. When adding new translatable text: add the key to all three language dicts in `i18n.js` AND add `data-i18n="..."` to the element in `index.html` with the uz string as the static fallback content.

**Theme (light/dark) is a `data-theme` attribute on `<html>`, driven by CSS custom properties.** `js/theme.js` toggles `data-theme` and persists to `localStorage` (`portfolio-theme`), defaulting to the OS `prefers-color-scheme`. All theme-dependent colors live in `css/themes.css` as `:root` vars overridden under `[data-theme="dark"]`; components in `style.css` should only ever reference these vars, never hardcode colors.

**Marquees (achievements ticker, projects carousel) are built, not CSS-only-looped.** `buildSeamlessMarquee()` in `main.js` clones a track's children until the total width covers the container, then duplicates the whole set once more so a `translateX(-50%)` CSS keyframe loops seamlessly regardless of item count or viewport width. It's called on load and on window resize (debounced). The achievements track content itself is re-rendered per-language from `translations[lang].achievements` (see `initAchievements()`), then rebuilt via `buildSeamlessMarquee(track, true)` — the `true` forces it to recapture `_marqueeSource` since the language swap replaced the DOM children.

**Scroll-driven UI is IntersectionObserver-based**, not scroll event math: `initScrollSpy()` highlights the active nav link, `initScrollReveal()` adds `.in-view` to `.reveal` elements once, `initCounters()` triggers `animateCounter()` once per `.counter` element (reads `data-target`/`data-suffix`).

## Content notes

- Contact/social links (Telegram `t.me/jsh_uz`, Instagram, YouTube) are hardcoded in `index.html` in multiple places (header logo, hero CTA, social section, footer) — update all occurrences together.
- Project cards in the `#projects` marquee reference images in `assets/images/`; removing an image file without removing/updating its `<img src>` in `index.html` leaves a broken image live on the site.
- `sitemap.xml`, `robots.txt`, and `og:url` in `index.html` all reference the production URL (`https://shjurayev.uz`) — keep in sync if the domain changes.
