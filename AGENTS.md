# Mazen Chef — Agent Guide

## Project type
Static HTML/CSS/JS ES module site. No build tools, no bundler. Served via `npx serve`.

## Critical: Supabase client is custom, not the official SDK
- `assets/js/supabase-client.js` — native `fetch()`, no CDN import
- Config generated from `.env` by `node setup.js` → `assets/js/config/app-config.js`
- Always run `node setup.js` after changing `.env`
- Token stored in `localStorage` key `mazen_supabase_session`
- Auth headers: `Authorization: Bearer <token>` + `apikey: <anonKey>` on every request

## Chain API quirks
The custom query builder mimics Supabase JS syntax but has caveats:
- `.update(payload).eq('col', val)` and `.delete().eq('col', val)` are supported (return thenable objects)
- `.insert(payload)` does NOT support chaining — call directly
- All methods return `{ data, error }` — errors are never thrown, always returned
- The `from()` chain auto-calls `.select('*')` on init
- `.neq(col, val)` is available but `.not()`, `.or()`, `.in()` are NOT supported — filter in JS instead

## Key commands
```bash
npx serve . -l 3000 --cors --no-clipboard    # dev server (301 redirects .html → no-ext)
node setup.js                                  # generate config from .env
```

## Supabase project
- Ref: `tjecbskapkdgmjpkqncu`, region `eu-central-1`
- Tables: `menu_items` (id UUID PK, name, category, description, price, tag, created_at, display_type, section, sort_order) and `reservations` (id UUID PK, name, phone, email, branch, date, time, guests, special_requests, status default 'pending', created_at)
- SQL DDL + RLS policies in `supabase-setup.sql`
- Public can SELECT `menu_items` and INSERT `reservations`
- Authenticated users have full access to both tables
- Admin credentials: `admin@mazenchef.com` / `mazenchef1992@`

## Menu system (dual-page)
- **Homepage** (`index.html`): `menu-dynamic.js` fetches items WHERE `section IS NULL OR section = 'home'`, renders 6 `.menu-card` items in `#panel-syrian .menu-grid`. Falls back to static HTML.
- **Full menu page** (`menu.html`): `menu-full.js` fetches ALL items WHERE `section IS NOT NULL AND section != 'home'`, groups by `section`, renders each section with correct display type (`.item-card` or `.list-item`), and builds sidebar nav. Falls back to static HTML if Supabase fails.
- `menu.js` (non-module, `defer`) handles sidebar open/close and section navigation via `data-section-target` attribute delegation — works with dynamic content.
- Section IDs derived from section name: `"Cold Starters"` → `"cold-starters"` via kebab-case.

### Display types
- `display_type = 'card'`: rendered as `.item-card` with number, name, price, divider, description
- `display_type = 'list'`: rendered as `.list-item` with name, optional description, dots, price

### Columns added for full menu
- `section TEXT`: 'Cold Starters', 'Hot Starters', etc., or 'home' for homepage items
- `sort_order INTEGER`: position within section
- `display_type TEXT`: 'card' or 'list'

## Admin dashboard
- Login: `admin-login.html` → calls `supabase.auth.signInWithPassword()` → redirects to `admin-dashboard.html`
- Dashboard: `admin-dashboard.html` → calls `supabase.auth.getSession()` on load → redirects to login if no session
- Menu tab has a `<select id="sectionFilter">` to filter between 'home' and other sections
- Section options loaded dynamically from DB on page init
- Logout: clears localStorage and redirects to login
- Error messages from Auth API are JSON `{"error":"invalid_grant","error_description":"..."}` — parse with `JSON.parse()` before displaying

## Reservation flow
- Form submits to Supabase (`reservations` table) first, then opens WhatsApp with the same data (see `reservation.js`)
- Supabase save is fire-and-forget (caught with `console.warn` on failure)
- WhatsApp number from env var `WHATSAPP_PHONE` in `.env`

## Architecture
- Entry point: `index.html` loads `assets/js/app.js` which imports all `components/*.js`
- Components called on `DOMContentLoaded`, each is a self-contained init function
- CSS split: `main.css` (reset/vars/base), `components.css` (reusable blocks), `responsive.css` (responsive), `menu.css` (menu page), `admin.css` (admin panel)
- Dynamic menu on homepage loads from Supabase with static HTML fallback (see `menu-dynamic.js`)
- Full detailed menu on `menu.html` loads from Supabase via `menu-full.js`

## Gotchas
- `initMenuPreview` and `initMenuDynamic` both touch `.menu-grid` on the homepage — `initMenuDynamic` replaces the content entirely, overriding the static preview
- Service worker registration in `menu.html` uses a separate script (`pwa-register.js`)
- The `.env` file has a rogue `Supabase service_role key=` line that is not a valid env var name — `setup.js` ignores it but keep it clean
- Token persistence uses `localStorage` — never `sessionStorage`
- The `editMenuItem` function calls `.single()` which sets `limit=1` on the chain — this is a no-op on the backend but keeps compatibility with official SDK semantics
