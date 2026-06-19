# Mazen Chef — Agent Guide

## Project type
Static HTML/CSS/JS ES module site. No build tools, no bundler. Served via `npx serve`.

## Key commands
```bash
npx serve . -l 3000 --cors --no-clipboard    # dev server (301 redirects .html → no-ext)
node setup.js                                  # generate config from .env
```

## Supabase client (custom, not official SDK)
- `assets/js/supabase-client.js` — native `fetch()`, no CDN import
- Config generated from `.env` by `node setup.js` → `assets/js/config/app-config.js`
- Always run `node setup.js` after changing `.env`
- Token stored in `localStorage` key `mazen_supabase_session`
- Auth headers: `Authorization: Bearer <token>` + `apikey: <anonKey>` on every request

### Custom query builder quirks
- `.update(payload).eq('col', val)` and `.delete().eq('col', val)` supported (return thenable objects)
- `.insert(payload)` does NOT support chaining — call directly
- All methods return `{ data, error }` — errors are never thrown
- The `from()` chain auto-calls `.select('*')` on init
- `.neq(col, val)` available but `.not()`, `.or()`, `.in()` NOT supported — filter in JS

## Supabase project
- Ref: `tjecbskapkdgmjpkqncu`, region `eu-central-1`
- Tables: `menu_items` (id UUID PK, name, category, description, price, tag, created_at, display_type, section, sort_order, image_url) and `reservations` (id UUID PK, name, phone, email, branch, date, time, guests, special_requests, status default 'pending', created_at)
- SQL DDL + RLS policies in `supabase-setup.sql`
- Public can SELECT `menu_items` and INSERT `reservations`
- Authenticated users have full access to both tables
- Admin credentials: `admin@mazenchef.com` / `mazenchef1992@`

## Menu system
- **Homepage** (`index.html`): `app.js` imports `menu-full-embed.js` which calls `initMenuFullEmbed()`. Fetches ALL items WHERE `section IS NOT NULL AND section != 'home'`, groups by `section`, renders each section with correct display type (`.item-card` or `.list-item`), and builds sidebar nav with SVG icons and section-to-section navigation. Falls back silently if Supabase fails.
- **Full menu page** (`menu.html`): loads `menu.js` (non-module, `defer`) for sidebar open/close and section navigation via `data-section-target` attribute delegation. Section IDs derived from section name: `"Cold Starters"` → `"cold-starters"` via kebab-case.


### Display types
- `display_type = 'card'`: rendered as `.item-card` with number, name, price, divider, description
- `display_type = 'list'`: rendered as `.list-item` with name, optional description, dots, price

### Columns
- `section TEXT`: 'Cold Starters', 'Hot Starters', etc., or 'home' for homepage items
- `sort_order INTEGER`: position within section
- `display_type TEXT`: 'card' or 'list'

## Admin dashboard
- Login: `admin-login.html` → calls `supabase.auth.signInWithPassword()` → redirects to `admin-dashboard.html`
- Dashboard: `admin-dashboard.html` → calls `supabase.auth.getSession()` on load → redirects to login if no session
- Error messages from Auth API are JSON `{"error":"invalid_grant","error_description":"..."}` — parsed with `JSON.parse()` in `admin-login.js:parseError()`
- Menu tab has `<select id="sectionFilter">` to filter between 'home' and other sections; options loaded dynamically from DB
- Logout: clears localStorage and redirects to login

## Reservation flow
- Form submits to Supabase (`reservations` table) first, then opens WhatsApp with same data (see `reservation.js`)
- Supabase save is fire-and-forget (caught with `console.warn` on failure)
- WhatsApp number from env var `WHATSAPP_PHONE` in `.env`

## Architecture
- Entry point: `index.html` loads `assets/js/app.js` (ES module) which imports all `components/*.js`
- Components called on `DOMContentLoaded`, each is a self-contained init function
- CSS split: `main.css` (reset/vars/base), `components.css` (reusable blocks), `responsive.css` (responsive), `menu.css` (menu page), `admin.css` (admin panel)
- HTML partials in `components/` (header, footer, modal) — loaded server-side, not JS-injected
- PWA: service worker `sw.js` registered by `pwa-register.js` on `menu.html` only
- Page-specific scripts: `menu.js` (menu sidebar), `admin-login.js`, `admin-dashboard.js`

## Gotchas
- `initMenuFullEmbed` replaces `.menu-grid` content entirely, overriding any static preview
- `.env` has a rogue `Supabase service_role key=` line (invalid env var name) — `setup.js` ignores it but keep the file clean
- Never commit `.env` — contains API keys
- Token persistence uses `localStorage` only — never `sessionStorage`
- The `editMenuItem` function calls `.single()` which sets `limit=1` — no-op on backend but kept for SDK compatibility
