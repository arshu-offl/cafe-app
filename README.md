# Brew & Bloom — static Next.js café demo

This version is a fully static export, ready for Vercel. No backend, database service, authentication service, API keys, or environment variables are required.

## Run locally

Requires Node.js 22.13 or later.

```powershell
cd "C:\Users\admin\OneDrive\Documents\ChatGPT\CafeDashboard\cafe"
npm ci
npm run dev
```

Open http://localhost:3000. Routes: `/` (customer), `/manager/` (manager), `/admin/` (admin). Each view has separate navigation.

## Build and preview the deployable files

```powershell
npm run build
npm start
```

`out/` contains the complete static website. `npm start` serves it on http://127.0.0.1:3000; set PORT to change the preview port. This project intentionally uses a static file server instead of `next start`, which does not serve an exported app.

## Deploy to Vercel

1. Push this project to your own GitHub/GitLab/Bitbucket repository. The existing `origin` belongs to the previous Sites deployment; do not push this migration there. Add a new remote for your repository, or upload the source to a new repository.
2. Import the repository in Vercel using Add New → Project.
3. Set Root Directory to `cafe` if importing the parent CafeDashboard folder. If the repository itself starts with this package.json, leave Root Directory at the repository root.
4. Framework: Next.js. Build command: `npm run build`. Output directory: `out`. Use Node.js 22.x. These build settings are also in vercel.json.
5. Deploy. No environment variables or database setup are needed.

Alternatively, from this directory use `npx vercel` for a preview or `npx vercel --prod` for production, following the sign-in/project prompts. The Vercel CLI must be connected to your account. This migration does not automatically deploy to Vercel or replace the existing Sites-hosted version.

## JSON data and persistence

- `data/menu.json`: starting menu items (prices are in rupees).
- `data/settings.json`: café name, address, UPI ID and tax percentage.
- `data/orders.json`: starting orders, empty by default. Order monetary amounts use integer paise.

The JSON files are bundled at build time. Editing them requires a rebuild/redeploy. Once a browser has saved demo changes, those browser values take priority over the seed files.

Orders, menu edits, statuses, payment marks and settings are saved as JSON in localStorage under `brew-bloom-static-v1`. Separate tabs on the same origin/browser share updates. Different devices, browser profiles and hostnames do not share data. The app cannot rewrite deployed JSON files. Clearing site storage removes local demo data and restores the seed data.

Admin → Backup JSON downloads the browser's complete data snapshot. To turn a snapshot into new seed files, save its `items` array into data/menu.json, its `settings` object into data/settings.json and its `orders` array into data/orders.json, then rebuild. Use synthetic order data only: bundled JSON is public. The app also exports sales CSV files and prints invoices using the browser's Print / Save as PDF facility.

## Demo limitations

This static version has no authentication. Customer, manager and admin pages are separate interfaces, but anyone with their URLs can open them. Browser-side action routing is not a security boundary. Do not use the static demo for confidential reports or real shared café operations. A backend and verified staff sessions are needed to restore secure role restrictions and cross-device order processing.

UPI remains a non-payment sample QR while the UPI ID is blank. Configuring a real UPI ID generates a real payment request; the app cannot verify payment with a bank. Payment status is a manual demo entry. Invoices are general order bills, not configured statutory GST tax invoices.

The previous Cloudflare/Sites source and migration history are preserved under `legacy/sites/` for reference and excluded from TypeScript checking and Vercel uploads. Existing cloud and local D1 data have not been copied or deleted.

## Checks

```powershell
npm test
npm run typecheck
npm run build
```

Tests cover persistence, checkout retry deduplication, integer money totals, sold-out items, invalid input, immutable invoice details, reports, JSON exports and storage errors.
