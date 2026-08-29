# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Next.js version notice (from AGENTS.md)

This project pins a Next.js version that may have breaking changes vs. your training data — APIs, conventions, and file structure may differ. Before writing Next.js-specific code, check the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint (flat config, eslint-config-next core-web-vitals + typescript)
npm run feed     # npx tsx scripts/productFeeder.mjs — wipes and reseeds the Product collection from products/products.xml
```

```bash
npm run test:e2e         # Playwright E2E (login/register/OAuth) -- see below
npm run test:e2e:ui      # same, in Playwright's watch UI
npm run test:e2e:report  # open the last HTML report
```

The only automated tests are the Playwright E2E specs in `e2e/`: the auth surface
(`register.spec.ts`, `login.spec.ts`, `oauth.spec.ts`) and cart sync
(`cart-sync.spec.ts` — login merge/replace modal, logout clearing, full-replace
push; it seeds products / carts directly via `e2e/db.ts` against the same
`aegeanmarket_e2e` database). There is no unit-test framework (no Jest/Vitest).
`e2e/` and `playwright.config.ts` are excluded from `tsconfig.json` and ESLint.

`npm run test:e2e` needs a git-ignored `.env.test` (already present locally) pointing
`MONGODB_URI` at a dedicated `aegeanmarket_e2e` database — `global-setup`/`global-teardown`
**drop that database** around every run, so never point it at real data. `.env.test` also
sets two test-only escape hatches honoured by production code when set:
`DISABLE_RATE_LIMIT=1` (short-circuits `lib/rateLimit.ts`) and `E2E_GOOGLE_BYPASS=1`
(lets `lib/oauth.ts` accept a forged `e2e.<base64url-claims>` token instead of a real
Google id token). Playwright's `webServer` runs its own `next build && next start` on
**port 3100** (so it coexists with a running `npm run dev` on :3000).

Type-checking: `npx tsc --noEmit` (no dedicated script; `tsconfig.json` has `noEmit: true`).

## Environment

Requires a `.env.local` with: `NEXT_PUBLIC_APP_URL`, `MONGODB_URI` (plus `MONGODB_USERNAME`/`MONGODB_PASSWORD` used to build it), `JWT_SECRET`, `REFRESH_SECRET`, `JWT_EXPIRES_IN`.

## Architecture

Next.js 16 App Router + React 19, MongoDB via Mongoose, Zustand for client state, Tailwind v4 + shadcn/ui (`components.json`, style `base-mira`, icon library `hugeicons`). Path alias `@/*` → repo root.

### Data flow: server-first, client stores are a thin sync layer

Product/user/order/review data is fetched **only** in Server Components or Server Actions (`app/**/actions/*.ts`, `'use server'` files under `app/actions/`) via direct Mongoose queries — there is no client-side data-fetching for primary content (listings, product detail, profile tabs are all server-rendered from `searchParams`/`params`).

Client Zustand stores (`app/products/store/useCartStore.ts`, `app/products/store/useFavoritesStore.ts`, `app/store/useNotificationsStore.ts`, `app/(auth)/store/useAuthStore.ts`) exist to mirror server state into interactive UI (cart badge, favorite hearts, notification bell, nav auth state). Only `useCartStore` is persisted to localStorage (via `zustand/middleware persist`); the others are populated fresh on each full page load by small `'use client'` "handler" components mounted in `app/layout.tsx` (`CartSyncHandler`, `FavoritesSyncHandler`) which gate their fetch on `useAuthStore.isLoggedIn`. `useAuthStore` itself is seeded synchronously from the `initialSession` prop that `RootLayout` computes server-side via `getSession()` and passes down through `Navbar` — don't reintroduce a client-side `getSession()` call there, it was removed deliberately to avoid a redundant JWT verification + request waterfall.

Cart state has a two-way sync: local optimistic updates in `useCartStore`/`useCartStore.addItem` etc., plus a debounced (5s) `pushCart()` — a full-replace `PUT /api/cart` (missing items are deleted; an empty array clears the DB cart) — from `CartSyncHandler`, and a `fetchCart()`/`fetchFavorites()`/`fetchNotifications()` pull from `/api/cart`, `/api/favorites`, `/api/notifications` respectively on login. `NotificationBell` additionally polls `/api/notifications` every 30s while mounted. On login, `loginForm`/`registerForm` snapshot the guest cart, then call `useCartStore.reconcileAfterLogin(guestItems)`: guest-only or DB-only carts merge silently; if BOTH are non-empty it sets `pendingMerge`, which opens `CartMergeModal` (KEEP BOTH = union keeping the larger quantity per product / USE THIS DEVICE = guest cart wins, DB cart discarded; dismiss = KEEP BOTH). `CartSyncHandler` gates its initial pull and its debounced push on the store's `hasHydratedFromDb` flag (set by `fetchCart`/`reconcileAfterLogin`, reset by `resetForLogout`). Logout (`navbar` `onLogout`) calls `useCartStore.resetForLogout()` — the cart is cleared so it never leaks to the next user on a shared device.

### Auth

JWT-based, cookie-stored (`auth_token` short-lived + `refresh_token`), verified with `jose`. Three layers, each independent:
- `proxy.ts` (Next.js 16 renamed Middleware to Proxy; exports `proxy` instead of `middleware`) — verifies/refreshes the token at the edge for most routes (matcher excludes `api`, `_next/static`, `_next/image`, `favicon.ico`), handles redirects for `/admin`, `/login`, `/register`, `/profile/*`.
- `app/actions/getSession.ts` (`'use server'`) — the source of truth used inside Server Components/Server Actions/API routes to get `{ username, userId }` from the `auth_token` cookie.
- `app/actions/auth-utils.ts` — lower-level `verifyToken`/`signAccessToken` helpers (used by login/refresh flows).

Login/register/logout live under `app/(auth)/`; validation schemas (`registerSchema`, `LoginSchema`, `CartSchema`, `shippingAddressSchema`) are centralized in `lib/validate.ts` (Zod).

### Database (`lib/db.ts`)

Single cached Mongoose connection (`global.mongoose`, standard Next.js hot-reload-safe pattern) via `connectDB()`. `lib/db.ts` also hosts most read-side aggregate queries used by Server Components (`getUserFromDb`, `getUserOrders`, `getUserFavorites`, `getUserReviews`, `getUserNotifications`, `getProductReviews`, `recalcProductRating`) — prefer adding new cross-model read queries here rather than inlining Mongoose calls in page components, to keep `connectDB()` usage and `.lean()`/`.select()` projection patterns consistent.

Models (`models/*.ts`): `Products`, `User` (has embedded `favorites: ObjectId[]` ref to Product), `cart` (one doc per user, `items: [{ product, quantity }]`), `Orders` (supports both logged-in `user` and guest checkout via `guestEmail`/`guestName`), `Review` (self-referential via `parent` for replies; one top-level review per user per product enforced by a partial unique index), `Notification` (currently only `type: 'reply'`, created when someone replies to a review).

Product documents are seeded from an external XML feed (`products/products.xml`, ~20k lines) via `scripts/productFeeder.mjs` (`npm run feed`), which `bulkWrite`s upserts keyed on `sku` and **deletes all existing products first**. The `image` field is a literal external URL (`ekava.gr`) copied from the feed — it is not proxied or rehosted.

### Images

Product images are hosted externally on `ekava.gr`/`www.ekava.gr` (whitelisted via `remotePatterns` in `next.config.ts`) and rendered through `next/image`, which proxies/resizes them via Next's Image Optimizer. `minimumCacheTTL` is set high (31 days) since these are static catalog photos. Always pass a `sizes` prop on `fill` images sized smaller than full viewport width (grid cards, carousel items) — omitting it makes the optimizer assume `100vw` and fetch/cache oversized variants. Avoid `unoptimized` on product images — it sends the browser directly to the external host, bypassing Next's cache (the origin itself sends weak/`private` cache headers, so Next's cache is the only real caching layer in front of it).

### Route groups

- `app/(auth)/` — login/register, not part of the URL path.
- `app/(footerpages)/` — static/content pages (about, blog, shipping, payments, returns, contact), not part of the URL path.
- `app/products/` — listing (`page.tsx`, server-rendered from `searchParams`: page/category/maxPrice/manufacturer/minRating/onlyInStock/q/volume/origin) and `[id]/` product detail + reviews.
- `app/checkout/` — `CheckoutClient.tsx` drives the checkout form/payment method selection (`PaymentMethodMock`/`PaymentMethodSelector` — payment is mocked, not a real gateway).
- `app/profile/[id]/` — tabbed profile (`components/ProfileTabs.tsx`: info/security/orders/favorites/reviews), all data fetched server-side in parallel in `page.tsx`.
- `app/api/` — route handlers used only where a Server Action doesn't fit (client polling/mutation endpoints): `cart` (`GET` populated cart / `PUT` full-replace write), `favorites`, `notifications`, `quick-search`.
