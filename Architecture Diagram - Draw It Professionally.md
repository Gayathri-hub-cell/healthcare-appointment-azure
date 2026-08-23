# How to Draw a Professional Azure Architecture Diagram (slide 5)
*The AWS example your professor showed gets its polish from three things: **service icons**, **nested boundary boxes** (Cloud → account → network → subnets), and a **numbered flow**. Recreate the same style in draw.io for Azure. Draw it yourself — this is the blueprint, not the final image.*

---

## 1. The nested boundaries (draw these boxes first, biggest to smallest)

```
┌─ Microsoft Azure ─────────────────────────────────────────────────────────────┐
│ ┌─ Subscription: Azure subscription 1   ·   Resource group: rg-healthappt ────┐ │
│ │                                                                             │ │
│ │   Microsoft Entra ID            Azure Key Vault           Application       │ │
│ │   (sign-in, OAuth2/OIDC)        (secrets)                 Insights (logs)   │ │
│ │                                                                             │ │
│ │ ┌─ VNet  healthappt-vnet   10.0.0.0/16 ──────────────────────────────────┐ │ │
│ │ │ ┌─ snet-web  10.0.1.0/24 ──────┐   ┌─ snet-data  10.0.2.0/24 ────────┐ │ │ │
│ │ │ │ NSG nsg-web: allow 443 in    │   │ NSG nsg-data: allow 1433        │ │ │ │
│ │ │ │                              │   │            from snet-web only    │ │ │ │
│ │ │ │   Azure App Service          │──▶│   Private Endpoint (pe-sql)      │ │ │ │
│ │ │ │   (React + Express, Node)    │1433│              │                  │ │ │ │
│ │ │ │   + managed identity         │   │              ▼                  │ │ │ │
│ │ │ └──────────────────────────────┘   │   Azure SQL Database            │ │ │ │
│ │ │                                     │   (serverless · TDE · no public)│ │ │ │
│ │ │                                     └─────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────────┘
      ▲
      │  HTTPS 443
 ┌────┴─────┐
 │ Patients │   ← users, drawn OUTSIDE the Azure box (left or bottom)
 └──────────┘
```

## 2. The numbered flow (add little numbered circles ① ② ③ like the AWS example)
- **①** Patient opens the site and **signs in** → **Microsoft Entra ID** returns a token (OAuth2 / OIDC).
- **②** Browser calls the app over **HTTPS 443** → **Azure App Service** (React front end + Express API).
- **③** App Service validates the token, then reaches the database on **TCP 1433** through the **Private Endpoint** → **Azure SQL Database** (all private, inside the VNet).
- **④** App Service reads secrets from **Key Vault** using its **managed identity** (no passwords).
- **⑤** App Service sends logs & metrics to **Application Insights**.

## 3. Each component → which draw.io shape to use
| Box on your diagram | draw.io shape to search for |
|---|---|
| Patients (users) | "Users" / "User" |
| Azure App Service | "App Service" |
| Azure SQL Database | "SQL Database" |
| Private Endpoint | "Private Endpoint" (or "Private Link") |
| Microsoft Entra ID | "Azure Active Directory" / "Entra" |
| Azure Key Vault | "Key Vault" |
| Application Insights | "Application Insights" |
| Virtual Network / subnets | "Virtual Network" / "Subnet" (or plain rounded rectangles) |
| NSG | "Network Security Group" (or a labelled note) |

## 4. Build it in draw.io — step by step
1. Open **app.diagrams.net** → **Create New Diagram** → **Blank**.
2. Turn on Azure icons: bottom-left **More Shapes… → Networking → tick "Azure" → Apply**. Now the search box (top-left) finds all the shapes in the table above.
3. **Draw the boundary boxes first**, biggest to smallest: the "Microsoft Azure" box, then the subscription box, then the VNet box, then the two subnet boxes inside it. Give each a title in the top-left corner and a light fill so they read as containers. *(Plain rounded rectangles are fine — icons aren't required, only accuracy.)*
4. **Drop the service icons** into the right boxes (App Service in snet-web; Private Endpoint in snet-data; Entra ID / Key Vault / App Insights up top; Azure SQL next to the private endpoint; Patients outside on the left).
5. **Connect them with arrows**, and **double-click each arrow to label the port/protocol**: `HTTPS 443`, `sign in (OAuth2/OIDC)`, `TCP 1433 (private)`, `443 (managed identity)`, `telemetry`.
6. **Add the numbered circles** ①–⑤ next to each step of the flow (draw a small circle, type the number).
7. **Add the NSG rules** as small labels on each subnet, and a short note on the SQL box: `public access: Disabled · TDE`.
8. **Export**: **File → Export as → PNG** (white background, 2× scale for sharpness) → paste into **slide 5** and delete the dashed placeholder.

## 5. What earns full marks (double-check these are on it)
- The **two subnets with their IP ranges** (10.0.1.0/24, 10.0.2.0/24) and the VNet range (10.0.0.0/16).
- The **ports**: 443 inbound, 1433 internal only.
- The **private endpoint** and a clear note that **the database has no public access**.
- **Entra ID** for sign-in and **managed identity** for the database/Key Vault (passwordless).
- The **numbered request flow** so the examiner can follow the story.

*Tip: keep it clean — boxes aligned, arrows not crossing where avoidable, consistent colors for the boundaries. That's what makes it look as professional as the AWS example.*
