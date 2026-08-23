# Frontend — Healthcare Appointment app (React + Vite)

A multi-page single-page app with Microsoft Entra ID sign-in.

## Run it locally
1. Make sure the backend is running first (see ../healthappt-backend).
2. In this folder:
   ```bash
   npm install
   cp .env.example .env      # then edit .env with your real values (VITE_API_BASE=http://localhost:8080/api for local)
   npm run dev
   ```
3. Open http://localhost:5173 and click **Sign in**.

## Pages & structure
- `src/main.jsx` — sets up MSAL sign-in + React Router.
- `src/App.jsx` — navigation, routes, and the shared "me" profile.
- `src/pages/`
  - `Home.jsx` — landing page / hero.
  - `Book.jsx` — two-step booking (choose provider → pick a time).
  - `MyAppointments.jsx` — your bookings, with cancel.
  - `Provider.jsx` — schedule dashboard (Provider/Admin role only).
  - `Profile.jsx` — your account details.
- `src/components/` — `NavBar`, `AuthGate` (sign-in wrapper).
- `src/api.js` — `useApi()` hook (attaches the access token to API calls).
- `src/styles.css` — the whole theme.

## Build for production (same as before)
```bash
# set VITE_API_BASE=/api in .env first
npm run build
rm -rf ../healthappt-backend/public && cp -r dist ../healthappt-backend/public
```
Then deploy the backend (which now serves the built app). Routing works on refresh/deep-links because the API serves index.html for non-API routes.
