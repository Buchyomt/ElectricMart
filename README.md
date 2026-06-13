# EllectricMart2

Full-stack e-commerce app for electrical materials: **React (Vite)** frontend + **Express + MongoDB** backend.

## Project layout

| Path | Role |
|------|------|
| `src/` | React UI (shop, checkout, admin, auth) |
| `server/` | Express API, Mongoose models, routes |
| `server/.env` | Secrets and `MONGO_URI` (copy from `.env.example`) |
| `vite.config.js` | Proxies `/api` → `http://127.0.0.1:5005` |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- MongoDB Atlas cluster (or local MongoDB) with a connection string in `server/.env`

## Run locally

Open **two terminals**:

**Terminal 1 — API**

```bash
cd server
npm install
npm run dev
```

Wait for: `Connected to MongoDB Atlas` and `Server running at http://localhost:5005`.

**Terminal 2 — Frontend**

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## MongoDB connection fails?

If you see *"IP that isn't whitelisted"* or `MongooseServerSelectionError`:

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Open your project → **Network Access** → **Add IP Address**.
3. Add your current public IP, or **Allow Access from Anywhere** (`0.0.0.0/0`) for development only.
4. Confirm the database user in **Database Access** matches `MONGO_URI`.
5. Restart the server: `npm run dev` in `server/`.

`PORT` in `server/.env` must be **5005** so it matches the Vite proxy.

## Scripts

| Command | Where | Purpose |
|---------|--------|---------|
| `npm run dev` | root | Vite dev server (port 5173) |
| `npm run build` | root | Production build |
| `npm run dev` | `server/` | API with nodemon (port 5005) |
| `npm start` | `server/` | API without nodemon |
| `npm run seed` | `server/` | Seed products (requires DB) |
