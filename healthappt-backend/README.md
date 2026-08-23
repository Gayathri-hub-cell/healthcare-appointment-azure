# Backend — Healthcare Appointment API (Node.js + Express)

## Run it locally
1. Make sure you have Node.js 20+ installed (`node -v`).
2. In this folder:
   ```bash
   npm install
   cp .env.example .env      # then edit .env with your real values
   npm run dev
   ```
3. Open http://localhost:8080/api/health — you should see `{"status":"ok"}`.

## What each file does
- `server.js` — starts the web server and wires up the routes.
- `src/db.js` — connects to Azure SQL (username/password locally, managed identity in Azure).
- `src/auth.js` — verifies the Microsoft Entra sign-in token on every request.
- `src/routes/` — the API endpoints (me, providers, appointments).
- `db/schema.sql` — the database tables + sample data (run once in Azure SQL).

The full step-by-step instructions are in **Build Guide (Beginner) - Healthcare Appointment System.md**.
