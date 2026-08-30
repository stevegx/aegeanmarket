# Aegean Market 🍷

**Aegean Market** is a full-stack e-commerce web application for a Greek online liquor & wine store, built as a personal portfolio project to demonstrate modern full-stack web development skills with Next.js, React and MongoDB.

It covers the full feature set of a real online shop — product catalog with filtering/search, cart, checkout with guest support, user accounts, order history, product reviews with threaded replies and likes, favorites, and real-time-ish notifications — all built with a server-first architecture on the Next.js App Router.

> This is a personal, non-commercial project built for learning and portfolio purposes. Online payments run against **Stripe in test mode** (card & Klarna) — no real money moves; the IRIS and cash-on-delivery options are simulated.

**🔗 Live demo:** https://aegeanmarket.vercel.app/

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://aegeanmarket-9ljuckjei-stevevetsikas85-1053s-projects.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

---

## ✨ Features

**Catalog & discovery**
- Server-rendered product listing with pagination and combinable filters (category, price range, manufacturer, minimum rating, in-stock only, origin, volume, free-text search)
- Quick search endpoint for instant search-as-you-type
- Featured / latest / random product rails on the homepage
- Product detail pages with image, pricing, and rating summary

**Cart & checkout**
- Client-side cart (Zustand, persisted to `localStorage`) with optimistic add/update/remove
- Debounced full-replace background sync of the cart to the server so it survives across devices/sessions, with a login-time merge/replace prompt when a guest cart meets a saved one
- Full checkout flow with shipping address form, three payment options — **Stripe** (card or Klarna, via the deferred PaymentIntent flow), simulated IRIS instant transfer, and cash on delivery — and order confirmation
- Stripe orders are created unpaid and finalised (stock decremented, marked paid) by a `/api/webhooks/stripe` handler, so a payment that succeeds still completes even if the customer never returns to the site
- Guest checkout supported (no account required) alongside logged-in checkout

**Accounts & auth**
- JWT-based authentication (access + refresh tokens) with `httpOnly` cookies, verified via `jose`
- Google Sign-In (OAuth) alongside traditional email/password login, with automatic account linking by email
- Edge-level route protection (Next.js Proxy/Middleware) for admin, profile, and auth pages, including silent access-token refresh
- Registration, login, logout, and password change flows

**Reviews & ratings**
- One top-level review per user per product, with star ratings
- Threaded replies (self-referential comments) and per-review likes
- Automatic recalculation of a product's aggregate rating
- In-app notifications when someone replies to your review, with a polling notification bell

**Profile**
- Tabbed user profile: account info, security/password, order history, favorites, and reviews — all data-fetched in parallel on the server

**Admin panel**
- `/adminpage` dashboard (edge-guarded to admin role) for CRUD over products, blog posts, users, and orders, plus an order-items editor and a stats overview

**Other**
- Wishlist/favorites with optimistic UI
- Dark mode with a navbar toggle (light/dark/system), persisted to `localStorage` and synced to the user's account so it follows them across devices
- Mobile bottom tab bar and a cookie-consent banner
- Content pages (about, blog, shipping, payments, returns, contact)
- Product data importable from an external XML feed via a seeder script

---

## 🛠 Tech stack

| Layer            | Technology |
|-------------------|------------|
| Framework         | [Next.js 16](https://nextjs.org/) (App Router, React Server Components, Server Actions) |
| UI                | [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (`base-mira` style), [Base UI](https://base-ui.com/), [Hugeicons](https://hugeicons.com/), [Embla Carousel](https://www.embla-carousel.com/), [next-themes](https://github.com/pacocoursey/next-themes) (dark mode) |
| Client state       | [Zustand](https://zustand-demo.pmnd.rs/) (cart, favorites, notifications, auth) |
| Database / ORM     | [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/) |
| Payments           | [Stripe](https://stripe.com/) (test mode) — `stripe` (server) + `@stripe/react-stripe-js` / `@stripe/stripe-js` (Payment Element), deferred PaymentIntent flow + webhook |
| Auth               | [jose](https://github.com/panva/jose) (JWT sign/verify), `bcryptjs` (password hashing), httpOnly cookies, Google Sign-In (OAuth) |
| Validation         | [Zod](https://zod.dev/) |
| Language           | TypeScript |
| Testing            | [Playwright](https://playwright.dev/) (end-to-end) |
| Tooling            | ESLint (flat config, `eslint-config-next`), `tsx` for scripts |

---

## 🏗 Architecture highlights

- **Server-first data flow.** Products, users, orders, and reviews are fetched only in Server Components and Server Actions via direct Mongoose queries — there is no client-side fetching for primary page content. Listing, product detail, and profile pages are rendered directly from `searchParams`/`params`.
- **Client stores as a thin sync layer.** Zustand stores mirror server state into interactive UI (cart badge, favorite hearts, notification bell). Only the cart store is persisted to `localStorage`; the others are re-populated on each page load by small client "handler" components mounted in the root layout, gated on auth state.
- **Two-way cart sync.** Local optimistic cart updates are debounced (5s) and pushed as a full replace to `PUT /api/cart` (missing items are deleted; an empty array clears the saved cart), while `GET /api/cart` hydrates the store on login. When a non-empty guest cart meets a non-empty saved cart at login, a modal offers "keep both" (union, larger quantity wins) or "use this device".
- **Deferred Stripe payments.** For online orders the client sizes the Payment Element from a server-computed cart total, then on submit a Server Action creates the order (unpaid) + a PaymentIntent restricted to `card` and `klarna`; `stripe.confirmPayment` finalises it and `/api/webhooks/stripe` verifies the signed event, decrements stock, and marks the order paid.
- **Theme sync.** Dark/light/system preference is stored in `localStorage` for instant, flash-free theming, and synced to the user's account (`/api/theme`) on login/change so it follows them to a new device.
- **Layered auth.** A Next.js Proxy (edge middleware) verifies/refreshes JWTs and guards `/admin`, `/login`, `/register`, and `/profile/*`; a `getSession()` server action is the source of truth inside Server Components/Actions/route handlers; lower-level token helpers back the login/refresh flows.
- **Centralized DB read layer.** Cross-model aggregate queries (user data, orders, favorites, reviews, notifications, rating recalculation) live in `lib/db.ts` on top of a single cached Mongoose connection, keeping projection/`.lean()` patterns consistent across the app.
- **Optimized external images.** Product photos are served from an external catalog host and routed through `next/image`'s optimizer/cache rather than served unoptimized.

---

## 📁 Project structure

```
app/
  (auth)/            # Login & register (route group, not in the URL)
  (footerpages)/      # Static content pages (about, blog, shipping, returns, contact...)
  actions/            # Server Actions shared across the app (auth, orders, Stripe payment, reviews, profile...)
  adminpage/          # Admin dashboard (products / blog / users / orders CRUD)
  api/                # Route handlers for client mutation/polling (cart, favorites, notifications, quick-search, theme) + Stripe webhook
  checkout/           # Checkout flow (shipping form, payment methods, Stripe Payment Element, confirmation)
  products/           # Product listing, detail pages, reviews, cart/favorites client stores
  profile/[id]/        # Tabbed user profile (info, security, orders, favorites, reviews)
  store/               # App-wide client stores (notifications)
components/            # Shared UI components (shadcn/ui + Base UI)
lib/                    # DB connection & aggregate queries, validation schemas, Stripe client, rate limiting
models/                 # Mongoose schemas (Product, User, Cart, Order, Review, Notification)
products/               # Source XML product feed
scripts/                # Product feeder / seeding script
e2e/                    # Playwright end-to-end specs (auth, cart sync) + test DB helpers
proxy.ts                # Edge auth middleware (Next.js 16 Proxy)
```

---

## 🚀 Getting started

### Prerequisites

- Node.js 18.18+ (Node 20 recommended)
- A MongoDB database (local or Atlas)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000

MONGODB_USERNAME=your_mongodb_username
MONGODB_PASSWORD=your_mongodb_password
MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=15m

NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

`NEXT_PUBLIC_GOOGLE_CLIENT_ID` comes from a Google Cloud Console OAuth 2.0 Client ID (Web application type) — it's optional; if it's unset, the Google Sign-In button simply doesn't render.

The `STRIPE_*` values come from your [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) (test mode). For local webhook delivery, run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and use the signing secret it prints as `STRIPE_WEBHOOK_SECRET`. Klarna must be enabled for the account in the Dashboard's payment-method settings.

### 3. (Optional) Seed the product catalog

Populates the `Products` collection from the bundled XML feed (`products/products.xml`). **This wipes the existing collection first.**

```bash
npm run feed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📜 Available scripts

| Command           | Description |
|--------------------|-------------|
| `npm run dev`      | Start the development server |
| `npm run build`    | Create a production build |
| `npm run start`    | Run the production build |
| `npm run lint`     | Run ESLint |
| `npm run feed`     | Reseed the product catalog from `products/products.xml` |
| `npm run test:e2e` | Run the Playwright end-to-end suite |
| `npm run test:e2e:ui` | Run Playwright in watch/UI mode |
| `npm run test:e2e:report` | Open the last Playwright HTML report |
| `npx tsc --noEmit` | Type-check the project |

---

## 🔒 Notes on this being a portfolio project

- Online payments use **Stripe in test mode** — real card/Klarna flows, but no real charges (test card `4242 4242 4242 4242`). The IRIS transfer option is a UI simulation and cash on delivery records the order without any gateway.
- Product data and images are sourced from a third-party catalog feed for demonstration purposes.
- Automated coverage is Playwright end-to-end specs for the auth surface and cart sync (`e2e/`), run against a dedicated `aegeanmarket_e2e` database; there is no unit-test framework. TypeScript and ESLint back the rest.

---

## 👤 Author

Built by **Steve Vetsikas** as a personal project to practice and showcase full-stack web development with the modern Next.js/React ecosystem.
