# 🏥 Healthcare Appointment System on Azure

![Azure](https://img.shields.io/badge/Cloud-Microsoft%20Azure-0078D4?logo=microsoftazure&logoColor=white)
![Node.js](https://img.shields.io/badge/API-Node.js%20%2B%20Express-339933?logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)
![Azure SQL](https://img.shields.io/badge/Database-Azure%20SQL-CC2927?logo=microsoftsqlserver&logoColor=white)
![Entra ID](https://img.shields.io/badge/Auth-Microsoft%20Entra%20ID-0078D4?logo=microsoft&logoColor=white)

A cloud-native **healthcare appointment management system** deployed on **Microsoft Azure**. Patients sign in with Microsoft Entra ID, browse providers, and book or cancel appointments; providers get a schedule dashboard. The app runs as a React SPA served by an Express API on Azure App Service, backed by a private Azure SQL Database — with no secrets in code (managed identity + Key Vault).

> ⚠️ **Live demo is currently offline.** The Azure resources were deprovisioned to avoid ongoing cloud costs, so there is no public URL at the moment. The architecture, source, screenshots-in-slides, and presentation below document the working system.

## Contents

- [Architecture](#architecture)
- [How it works](#how-it-works)
- [Tech stack](#tech-stack)
- [Repository structure](#repository-structure)
- [Running locally](#running-locally)
- [Security](#security)
- [Documentation](#documentation)

## Architecture

```mermaid
flowchart TB
  User["👤 Patients"]
  subgraph Azure["Microsoft Azure — resource group rg-healthappt"]
    Entra["Microsoft Entra ID<br/>OAuth2 / OIDC sign-in"]
    KV["Azure Key Vault<br/>secrets"]
    AI["Application Insights<br/>logs and metrics"]
    subgraph VNet["VNet healthappt-vnet 10.0.0.0/16"]
      subgraph Web["snet-web 10.0.1.0/24"]
        App["Azure App Service<br/>React SPA + Express API, Node<br/>+ managed identity"]
      end
      subgraph Data["snet-data 10.0.2.0/24"]
        PE["Private Endpoint pe-sql"]
        SQL["Azure SQL Database<br/>serverless, TDE, no public access"]
      end
    end
  end
  User -->|"HTTPS 443"| App
  User -.->|"sign in (OAuth2/OIDC)"| Entra
  App -->|"TCP 1433 (private)"| PE --> SQL
  App -.->|"managed identity"| KV
  App -.->|"telemetry"| AI
```

## How it works

1. A patient opens the site and **signs in** — Microsoft Entra ID returns an OAuth2/OIDC token.
2. The browser calls the app over **HTTPS 443** → **Azure App Service** (React front end + Express API).
3. App Service **validates the token**, then reaches the database on **TCP 1433** through a **Private Endpoint** → **Azure SQL Database** (fully private, inside the VNet).
4. App Service reads secrets from **Key Vault** using its **managed identity** — no passwords in code.
5. App Service streams logs & metrics to **Application Insights**.

## Tech stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, MSAL (`@azure/msal-react`), React Router |
| **Backend** | Node.js, Express, `mssql`, `jsonwebtoken` + `jwks-rsa` (Entra token validation), Helmet, `@azure/identity` |
| **Database** | Azure SQL Database (private endpoint, TDE) |
| **Identity** | Microsoft Entra ID (two app registrations: SPA + API) |
| **Cloud** | Azure App Service, VNet + subnets + NSGs, Key Vault, Application Insights, Managed Identity |

## Repository structure

```
Healthcare-Appointment-Azure/
│
├── healthappt-backend/       # Express REST API (Node.js)
│   ├── src/
│   │   ├── auth.js               # Verifies the Entra sign-in token per request
│   │   ├── db.js                 # Azure SQL (password locally, managed identity in Azure)
│   │   └── routes/               # me, providers, appointments
│   ├── db/schema.sql             # Tables + sample data
│   ├── server.js
│   └── .env.example
│
├── healthappt-frontend/      # React + Vite single-page app
│   ├── src/
│   │   ├── pages/                # Home, Book, MyAppointments, Provider, Profile
│   │   ├── components/           # NavBar, AuthGate
│   │   ├── authConfig.js         # MSAL config (reads Entra IDs from env)
│   │   └── api.js                # useApi() — attaches the access token
│   └── .env.example
│
├── Architecture Diagram - Draw It Professionally.md   # Azure architecture blueprint
├── Cloud Computing - Project Plan ... .pptx           # Project plan deck
├── Healthcare on Azure - Final Project Presentation (COMPLETE).pptx
└── updated GKDM.png
```

## Running locally

Each part has its own detailed README. In short:

**Backend** (`healthappt-backend`)
```bash
npm install
cp .env.example .env      # fill in Azure SQL + Entra values
npm run dev               # http://localhost:8080/api/health
```

**Frontend** (`healthappt-frontend`)
```bash
npm install
cp .env.example .env      # set VITE_API_BASE=http://localhost:8080/api
npm run dev               # http://localhost:5173
```

See [`healthappt-backend/README.md`](healthappt-backend/README.md) and [`healthappt-frontend/README.md`](healthappt-frontend/README.md) for full steps.

## Security

- **No secrets in the repo.** Real values live only in local `.env` files (git-ignored); `.env.example` templates show the shape. In Azure, the app uses its **managed identity** instead of passwords.
- The database has **no public access** — it is reached only through a private endpoint from the web subnet.
- Every API request is authenticated against **Microsoft Entra ID** before touching data.

## Documentation

- **Architecture blueprint:** [`Architecture Diagram - Draw It Professionally.md`](Architecture%20Diagram%20-%20Draw%20It%20Professionally.md)
- **Final presentation:** `Healthcare on Azure - Final Project Presentation (COMPLETE).pptx`
- **Project plan:** `Cloud Computing - Project Plan - Healthcare Appointment System (Azure).pptx`
