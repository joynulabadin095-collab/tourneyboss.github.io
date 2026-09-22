# Tourney Boss

Tournament hosting, entry-fee collection, and prize-wallet platform.

- Players join tournaments by paying an entry fee (bKash/Bank, admin-verified) and receive prizes into an in-site wallet.
- Organizers host tournaments by paying a hosting fee (bKash/Bank, admin-verified).
- Admin verifies all entry fees, hosting fees, and player cash-out requests.

This is a standalone website, separate from any mobile app.

## Stack

- Frontend: React + TypeScript + Vite, deployed to GitHub Pages via GitHub Actions
- Data layer: currently browser localStorage (`src/data/store.ts`) as a placeholder — every
  function there is meant to be swapped for real API calls once the backend is live
- Backend (separate repo, not yet built): Node.js + TypeScript + Firestore, deployed on Render

## Local development

```bash
npm install
npm run dev
```

## Deploy

Push to `main` — GitHub Actions builds and deploys automatically to GitHub Pages.
One-time setup: in the repo, go to **Settings → Pages → Build and deployment → Source**,
and select **GitHub Actions**.

## Demo accounts (seeded in localStorage)

| Role | Phone |
|---|---|
| Admin | 01700000000 |
| Organizer | 01711111111 |
| Player | 01722222222 |

Or register a new Player/Organizer account from `/register`.
