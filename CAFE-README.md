# Brew & Bloom

Mobile-first café ordering with persistent Cloudflare D1 storage, customer order tracking, manager menu editing and kitchen statuses, owner reports and CSV export, printable order invoices, and UPI QR codes.

## First use

The hosted preview starts owner-private. Open `/admin`, sign in with ChatGPT, and choose **Set up café as owner**. Complete this before widening the Site audience. The first signed-in account performing this setup becomes the café owner. Dashboard settings allow a manager email, café address, tax rate and real UPI ID. Manager access also requires the Site audience to permit that account.

The menu is sample content. Sales start empty. Tax defaults to zero and must be configured for the business. Invoice output is a general order bill, not a configured statutory GST tax invoice. Photos are representative, from Unsplash: Nathan Dumlao (latte), David Thielen (croissant), Trình Minh Thư (sandwich).

An empty UPI ID produces a non-payment demonstration QR. A configured UPI ID produces an amount-specific `upi://pay` QR and app link. Payments are confirmed by staff after checking receipt. There is no payment-provider webhook or automatic bank verification. Cancelled paid orders require staff to handle refunds externally.

## Development

Requires Node 22.13 or later. Install with `npm ci`, generate migrations using `npm run db:generate`, build with `npm run build`, and run `npm run dev`. Apply migrations to the local database as described in README.md. `node scripts/verify-cafe.mjs` verifies the running loopback preview with temporary local role and order fixtures, restoring them afterward; it never targets production.

Customer baskets are device-local drafts; order and menu records are authoritative in D1. Local storage remembers the most recent order and its private access token on that device. Staff APIs enforce owner/manager authorization. Prices, availability and totals are validated on the server, and checkout uses an idempotency key to prevent duplicate orders on retry.

Reports currently cover the latest 1,000 orders; the UI discloses this bound. For larger operations, add server-side date-range aggregation and paginated order history before relying on long-range reports.

## Separate workspaces

- /: customer menu and order tracking only.
- /manager: manager sign-in, menu management, live orders only.
- /admin: owner sign-in, reports and settings only.

Each route checks the authenticated role on the server. Staff opening the customer URL are redirected to their own workspace. Managers and admins cannot enter each other’s views. Signed-in customers receive a 404 for staff routes; anonymous staff-route visits start sign-in. The API checks both surface and permitted action, rejects cross-role requests, and prevents caching. Role revocation clears the visible workspace when the next request is rejected. Staff workspaces never load customer basket/order tokens from browser storage.

