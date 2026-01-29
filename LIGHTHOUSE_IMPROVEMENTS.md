# Lighthouse & Performance Improvement Checklist

Use this checklist to audit and improve Core Web Vitals, SEO, and accessibility.

## Code-level optimization suggestions (applied)

- **Images**: `next/image` everywhere; `priority` on LCP images (first spotlight, first escort card, first profile image); `sizes` for responsive loading; `placeholder="blur"` + `blurDataURL` where useful.
- **Metadata**: `metadataBase` in root layout; per-route `title`, `description`, `alternates.canonical`; `generateMetadata` for `/escorts/[id]` with dynamic OG/Twitter.
- **Semantics**: Single `<main id="main-content">` in layout; home/escorts/detail use `<div>`; correct `h1` → `h2` → `h3` hierarchy; `section`, `article`, `nav`, `aside` where appropriate.
- **A11y**: Skip link (`.skip-link`), focus-visible on buttons/links, mobile nav keyboard + ARIA, breadcrumbs with `aria-label="Breadcrumb"`.
- **Performance**: `WebVitals` + `useReportWebVitals`; `lib/analytics` stubs for page views and Web Vitals; ready to plug in GA4 or similar.

## 1. Performance (LCP, INP, CLS)

- [x] **LCP**: `priority` on first above-the-fold image (home spotlight, escorts list, escort detail).
- [x] **Images**: All escort images use `next/image` with `sizes` and `placeholder="blur"` where applicable.
- [x] **CLS**: Fixed-height containers (`h-48`) for image grids; no layout shift from images.
- [ ] **INP**: Reduce main-thread work; avoid long tasks during interactions. Profile with Chrome DevTools.
- [ ] **Lazy load below-fold**: Non-priority images use default `loading="lazy"` (next/image default).
- [ ] **Fonts**: `display: "swap"` on Geist fonts to avoid FOIT; preconnect to font origins if needed.

## 2. SEO

- [x] **Metadata API**: Root `metadata` + `metadataBase`; per-page `title`, `description`, `alternates.canonical`.
- [x] **Dynamic meta**: `generateMetadata` for `/escorts/[id]` (title, description, OG, Twitter).
- [x] **OpenGraph & Twitter**: `openGraph`, `twitter` in layout and key pages; `summary_large_image` where relevant.
- [x] **Sitemap**: `app/sitemap.ts` — static routes + dynamic `/escorts/[id]`.
- [x] **Robots**: `app/robots.ts` — allow `/`, disallow `/api/`, `/auth/`, `/dashboard/`, etc.; `sitemap` URL.
- [x] **Canonical URLs**: Home, `/escorts`, `/pricing`, `/escorts/[id]` set via `alternates.canonical`.

## 3. Structure & Semantics

- [x] **Heading hierarchy**: Single `h1` per page; section `h2`; cards `h3`. No skipped levels.
- [x] **Semantic HTML**: `main`, `header`, `section`, `article`, `nav`, `aside` used appropriately.
- [x] **Breadcrumbs**: `Breadcrumbs` on `/escorts` and `/escorts/[id]` with `aria-label="Breadcrumb"`.
- [x] **Internal linking**: Footer links, nav, breadcrumbs, CTAs to key pages.

## 4. Accessibility

- [x] **Skip link**: “Skip to main content” with `.skip-link`; `main` has `id="main-content"` and `tabIndex={-1}`.
- [x] **Focus visible**: Buttons and links use `focus-visible:outline-2 focus-visible:outline-emerald-400` (or equivalent).
- [x] **Keyboard**: Mobile nav toggle and menu links focusable; Escape closes menu.
- [x] **ARIA**: `aria-label` on nav, carousel, breadcrumbs; `aria-expanded` / `aria-controls` on mobile menu.
- [ ] **Contrast**: Verify text/background (e.g. zinc-400 on black) meets WCAG AA (4.5:1 for normal text).

## 5. Analytics & Monitoring

- [x] **Web Vitals**: `WebVitals` component uses `useReportWebVitals`; reports to `lib/analytics` stubs.
- [x] **Analytics stub**: `reportPageView`, `reportWebVital`, `reportEvent` in `lib/analytics.ts`; ready for GA4/Vercel.
- [ ] **Google Search Console**: Add property, verify via meta tag or DNS; submit sitemap URL. Add `metadata.verification.google` in root layout when you have the code.
- [ ] **Real User Monitoring**: Wire `reportWebVital` to your analytics (e.g. `gtag`) in production.

## 6. Optional Next Steps

- Add `fetchPriority="high"` to LCP image if needed (next/image supports it via legacy `priority`).
- Enable `experimental.webVitalsAttribution` in `next.config` to debug LCP/CLS sources.
- Consider `next/dynamic` for below-fold client components (e.g. chat button) to reduce initial JS.
- Run `npm run build` and Lighthouse CI on PRs to guard regressions.

## Quick Commands

```bash
# Production build
npm run build

# Run Lighthouse (Chrome DevTools or CLI)
npx lighthouse https://your-domain.com --view --preset=desktop
npx lighthouse https://your-domain.com --view --preset=mobile
```

## Environment

- **Sitemap / canonical / OG base URL**: `SITE_URL` or `NEXTAUTH_URL` (see `lib/site-url.ts`). Set in production.
