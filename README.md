# Payment Hub — Apache Superset Embedded Analytics Demo

A production-style reference application that embeds **Apache Superset** dashboards and charts inside an **Angular 19 + Spring Boot 3** payment processing hub. The project demonstrates three embedding strategies — SDK-based dashboard embedding, direct Superset iframe exploration, and an AI-powered natural language chart builder — all branded with **FIS Global** theming.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Getting Started](#getting-started)
7. [Running the Full Stack with Docker](#running-the-full-stack-with-docker)
8. [Configuration Reference](#configuration-reference)
9. [Application Features](#application-features)
10. [API Reference](#api-reference)
11. [Frontend Routes](#frontend-routes)
12. [Superset Integration Deep Dive](#superset-integration-deep-dive)
13. [FIS Global Theming](#fis-global-theming)
14. [Data Model and Sample Data](#data-model-and-sample-data)
15. [CORS and Proxy Configuration](#cors-and-proxy-configuration)
16. [Row-Level Security](#row-level-security)
17. [Troubleshooting](#troubleshooting)
18. [License](#license)

---

## Overview

Payment Hub is a multi-module demo that simulates a centralized payment processing and analytics platform. It combines a Spring Boot REST API with an Angular single-page application and uses Apache Superset as its embedded analytics engine. The key differentiator is the **Natural Language Chart Builder** — a chat-style interface where users type plain English queries like *"show me payments by channel this month"* and the system automatically creates and embeds Superset charts in real time.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Browser                                                                    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐        │
│  │  Angular 19 SPA (:4200)                                         │        │
│  │                                                                 │        │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │        │
│  │  │  Payment      │  │  Dashboard   │  │  NL Chart Builder     │ │        │
│  │  │  Management   │  │  Embedding   │  │  (Ask a Question)     │ │        │
│  │  │  CRUD pages   │  │  SDK iframes │  │  chat → Superset API  │ │        │
│  │  └──────┬───────┘  └──────┬───────┘  └──────────┬────────────┘ │        │
│  │         │                 │                      │              │        │
│  │         │  REST API       │  Guest Token         │  /superset-  │        │
│  │         │  /api/*         │  /api/superset/*     │  api/* proxy │        │
│  └─────────┼─────────────────┼──────────────────────┼──────────────┘        │
│            │                 │                      │                       │
└────────────┼─────────────────┼──────────────────────┼───────────────────────┘
             ▼                 ▼                      ▼
┌──────────────────────┐  ┌────────────────────────────────────────────────┐
│  Spring Boot (:8080) │  │  Apache Superset (:8088)                       │
│                      │  │                                                │
│  • Domain CRUD API   │  │  • Dashboard hosting & embedding               │
│  • Superset proxy    │──│  • REST API for chart creation                 │
│    (login + guest    │  │  • Guest token authentication                  │
│     token)           │  │  • FIS-branded color scheme                    │
│  • Swagger UI        │  │  • Custom CSS theme overlay                    │
└──────────┬───────────┘  └────────────────┬───────────────────────────────┘
           │                               │
           ▼                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PostgreSQL (:5432)                                                      │
│                                                                          │
│  ┌─────────────────────────┐    ┌─────────────────────────────────────┐  │
│  │  paymenthub / demo_db   │    │  superset (metadata)                │  │
│  │  payments, accounts,    │    │  dashboards, charts, datasets,      │  │
│  │  statements, feedback,  │    │  users, roles, permissions          │  │
│  │  payment_files          │    │                                     │  │
│  └─────────────────────────┘    └─────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

The system has three data-flow paths:

- **Domain API path:** Angular → Spring Boot REST API → PostgreSQL (for payment CRUD operations)
- **Dashboard embedding path:** Angular → Spring Boot (guest token) → Superset API → iframe rendered in Angular via the Embedded SDK
- **NL Chart Builder path:** Angular → `/superset-api` dev proxy → Superset REST API (authenticate, create chart, embed via iframe)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Angular (NgModule pattern) | 19.2 |
| Frontend | TypeScript | 5.8 |
| Frontend | Superset Embedded SDK | 0.3.x |
| Frontend | SCSS | — |
| Backend | Java | 17 |
| Backend | Spring Boot | 3.2.3 |
| Backend | Spring Data JPA | 3.2.x |
| Backend | Lombok | — |
| Backend | springdoc OpenAPI | 2.3.0 |
| Database | PostgreSQL | 15 / 16 |
| Analytics | Apache Superset | 3.1.3 |
| Cache | Redis | 7 (Alpine) |
| Build | Maven | 3.8+ |
| Build | npm | 9+ |
| Container | Docker Compose | v2+ |

---

## Project Structure

```
apache-superset-demo/
├── docker-compose.yml                  # Root compose: Postgres + Superset + Backend + Frontend
├── pom.xml                             # Parent Maven POM
├── CLAUDE.md                           # AI assistant project context
│
├── payment-hub-backend/                # ── Spring Boot 3 Backend ──
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/paymenthub/
│       │   ├── PaymentHubApplication.java
│       │   ├── config/                 # CorsConfig, AppConfig, ApplicationStartupLogger
│       │   ├── controller/             # REST controllers (Payment, Account, Statement,
│       │   │                           #   PaymentFile, PaymentFeedback, Superset)
│       │   ├── dto/                    # Request/response DTOs + Superset guest token DTOs
│       │   ├── exception/              # GlobalExceptionHandler, SupersetIntegrationException
│       │   ├── model/                  # JPA entities (Account, Payment, PaymentFile,
│       │   │                           #   PaymentFeedback, Statement, SupersetDashboard)
│       │   ├── repository/             # Spring Data JPA repositories
│       │   └── service/                # Business logic + SupersetApiService + SupersetService
│       └── resources/
│           ├── application.properties
│           └── data.sql                # Seed data (20 accounts, 2000 payments, etc.)
│
├── payment-hub-frontend/               # ── Angular 19 Frontend ──
│   ├── Dockerfile
│   ├── nginx.conf                      # Production reverse proxy config
│   ├── proxy.conf.json                 # Dev proxy: /superset-api → localhost:8088
│   ├── angular.json
│   ├── package.json
│   └── src/
│       ├── environments/
│       │   └── environment.ts          # API URLs, Superset credentials
│       ├── styles.scss                 # Global FIS-themed styles
│       └── app/
│           ├── app.module.ts           # Root NgModule (all components declared here)
│           ├── app-routing.module.ts   # Route definitions
│           ├── app.component.*         # Shell: FIS-branded sidebar + top bar
│           ├── models/
│           │   └── payment.model.ts    # TypeScript interfaces
│           ├── services/
│           │   ├── payment.service.ts
│           │   ├── account.service.ts
│           │   ├── statement.service.ts
│           │   ├── payment-file.service.ts
│           │   ├── feedback.service.ts
│           │   ├── superset.service.ts          # Guest token + dashboard CRUD
│           │   ├── superset-direct.service.ts   # Direct Superset API (NL builder)
│           │   └── nl-parser.service.ts         # Natural language → chart config
│           └── components/
│               ├── home/                # Stats overview dashboard
│               ├── payments/            # Payment listing with filters
│               ├── payment-detail/      # Single payment + feedback
│               ├── create-payment/      # Payment creation form
│               ├── payment-files/       # File listing
│               ├── statements/          # Statement viewer
│               ├── dashboard-builder/   # Build & link Superset dashboards
│               ├── dashboard-list/      # Saved dashboard gallery
│               ├── superset-embed/      # Embedded dashboard (SDK)
│               ├── superset-explorer/   # Direct Superset link
│               └── nl-chart-builder/    # Natural Language Chart Builder
│
└── superset-docker/                    # ── Superset Docker Config ──
    ├── Dockerfile.superset
    ├── docker-compose.yml              # Standalone Superset compose (Postgres + Redis)
    ├── superset_config.py              # CORS, embedding, FIS theme, color schemes
    ├── superset-init.sh                # Bootstrap script (db upgrade, admin, init)
    ├── init-db.sql                     # Database initialization
    ├── fis-superset-theme.css          # Custom CSS for FIS branding inside Superset
    └── CONNECTION_CONFIG.md            # Database connection instructions
```

---

## Prerequisites

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Docker + Docker Compose | v2.0+ | Run PostgreSQL, Redis, and Superset containers |
| Java (JDK) | 17 | Build and run the Spring Boot backend |
| Maven | 3.8+ | Backend build tool (or use the included `mvnw` wrapper) |
| Node.js | 18+ | Build and run the Angular frontend |
| npm | 9+ | Frontend dependency management (bundled with Node.js) |
| Git | 2.0+ | Clone the repository |

---

## Getting Started

### Step 1 — Clone the Repository

```bash
git clone https://github.com/umeshadhikari/apache-superset-demo.git
cd apache-superset-demo
```

### Step 2 — Start Infrastructure (PostgreSQL + Superset)

```bash
docker compose up postgres superset
```

Wait until you see `Superset is up and running` in the logs. This can take 60–90 seconds on the first run while Superset runs database migrations and creates the admin user.

Once ready, open **http://localhost:8088** and log in with **admin / admin**.

### Step 3 — Connect Superset to the Payment Hub Database

1. In Superset, go to **Settings → Database Connections → + Database**.
2. Choose **PostgreSQL** and enter the following connection details:

| Field | Value |
|-------|-------|
| Host | `postgres` (if Superset runs in Docker) or `localhost` |
| Port | `5432` |
| Database | `demo_db` |
| Username | `demo_user` |
| Password | `demo_pass` |

3. Click **Test Connection**, then **Save** with the display name **"Payment Hub"**.
4. Navigate to **Data → Datasets** and add these tables: `payments`, `payment_files`, `accounts`, `statements`, `payment_feedback`.

### Step 4 — Enable Dashboard Embedding

1. Open or create a dashboard in Superset.
2. Click **⋮ → Embed dashboard**.
3. Copy the **UUID** from the embed dialog — you will paste this into the Angular app.

### Step 5 — Start the Spring Boot Backend

```bash
cd payment-hub-backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8080** and auto-creates the database schema via Hibernate. On the first run with a fresh database, seed data (`data.sql`) populates sample accounts, payments, statements, and feedback records.

Verify the backend is running:

```bash
curl http://localhost:8080/api/payments/stats
```

### Step 6 — Start the Angular Frontend

```bash
cd payment-hub-frontend
npm install         # first time only
ng serve
```

The Angular dev server starts on **http://localhost:4200** with a proxy that routes `/superset-api/*` requests to Superset at `localhost:8088`, which avoids CORS issues for the NL Chart Builder.

Open **http://localhost:4200** in your browser. You should see the FIS-branded Payment Hub application.

### Step 7 — Link a Dashboard in the App

1. Navigate to **Dashboard Builder** (`/dashboard-builder`) in the sidebar.
2. Paste the Superset embed UUID from Step 4.
3. Click **Save & Publish**.
4. Go to **My Dashboards** (`/dashboards`) and click **View Embedded** to see the dashboard rendered inside the Angular app.

---

## Running the Full Stack with Docker

To run all four services (PostgreSQL, Superset, Spring Boot backend, Angular frontend) in Docker:

```bash
docker compose --profile full up --build
```

| Service | URL |
|---------|-----|
| Angular Frontend | http://localhost:4200 |
| Spring Boot API | http://localhost:8080 |
| Superset | http://localhost:8088 |
| PostgreSQL | localhost:5432 |

The `full` profile builds and starts the backend and frontend Docker images in addition to the infrastructure services.

---

## Configuration Reference

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/demo_db` | JDBC URL for the backend |
| `SPRING_DATASOURCE_USERNAME` | `demo_user` | PostgreSQL username |
| `SPRING_DATASOURCE_PASSWORD` | `demo_pass` | PostgreSQL password |
| `SUPERSET_URL` | `http://localhost:8088` | Superset base URL (used by backend proxy) |
| `SUPERSET_ADMIN_USERNAME` | `admin` | Superset admin username |
| `SUPERSET_ADMIN_PASSWORD` | `admin` | Superset admin password |
| `SUPERSET_SECRET_KEY` | (set in compose) | Superset Flask secret key |
| `POSTGRES_DB` | `demo_db` | PostgreSQL database name |
| `POSTGRES_USER` | `demo_user` | PostgreSQL user |
| `POSTGRES_PASSWORD` | `demo_pass` | PostgreSQL password |

### Key Configuration Files

| File | Purpose |
|------|---------|
| `payment-hub-backend/src/main/resources/application.properties` | Backend database, JPA, and Superset settings |
| `payment-hub-frontend/src/environments/environment.ts` | Frontend API URLs and Superset credentials |
| `payment-hub-frontend/proxy.conf.json` | Angular dev proxy (`/superset-api` → `:8088`) |
| `superset-docker/superset_config.py` | Superset CORS, embedding, FIS theme, color schemes |
| `superset-docker/fis-superset-theme.css` | Custom CSS for FIS branding inside Superset |
| `docker-compose.yml` | Root Docker Compose for all services |

---

## Application Features

### Payment Management
The core domain includes full CRUD operations for payments, accounts, payment files, statements, and payment feedback. The home page displays aggregate statistics with daily trend data.

### Embedded Superset Dashboards
Dashboards created in Superset can be embedded into the Angular app using the `@superset-ui/embedded-sdk`. The backend generates guest tokens via the Superset API, and the SDK handles iframe rendering with automatic token refresh (5-minute expiry).

### Natural Language Chart Builder
Navigate to **Analytics → Ask a Question** (`/analytics/ask`) for a chat-style interface. Type plain English queries and the system creates Superset charts automatically:

- *"show me payments by channel"* → Pie chart grouped by channel
- *"total amount by payment type as a bar chart"* → Bar chart with SUM(amount)
- *"payments by status this month"* → Pie chart with time filter
- *"top 10 error codes"* → Chart limited to 10 rows
- *"payment trend over time"* → Time series line chart
- *"count of statements by transaction type"* → Switches to statements dataset

The NL parser detects the dataset (payments or statements), group-by columns, metrics (count, sum, avg), time filters, chart types, and row limits. Charts are created via the Superset REST API and embedded inline as iframes.

### Dashboard Builder
A form-based interface at `/dashboard-builder` lets users configure and link Superset dashboards by UUID. Saved dashboards appear in the gallery at `/dashboards`.

---

## API Reference

### Domain Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List all payments |
| POST | `/api/payments` | Create a new payment |
| GET | `/api/payments/{reference}` | Get payment by reference |
| PUT | `/api/payments/{reference}/status` | Update payment status |
| GET | `/api/payments/stats` | Aggregated dashboard statistics |
| GET | `/api/payment-files` | List all payment files |
| GET | `/api/accounts` | List all accounts |
| GET | `/api/statements/{accountId}` | Statements for an account |
| GET | `/api/feedback/{paymentReference}` | Feedback for a payment |

### Superset Integration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/superset/tables` | List database tables with columns |
| GET | `/api/superset/dashboards` | List saved dashboard configurations |
| POST | `/api/superset/dashboards` | Save a new dashboard configuration |
| DELETE | `/api/superset/dashboards/{id}` | Delete a dashboard configuration |
| GET | `/api/superset/guest-token` | Generate a Superset guest token for embedding |

**Guest token parameters:**

| Parameter | Required | Description |
|-----------|----------|-------------|
| `dashboardId` | Yes | Superset embedded dashboard UUID |
| `username` | No | End-user identifier for audit/RLS (default: `guest`) |

### Useful Development URLs

| URL | Description |
|-----|-------------|
| http://localhost:8080/swagger-ui.html | Interactive API documentation |
| http://localhost:8080/api-docs | OpenAPI 3.0 JSON spec |
| http://localhost:8088 | Apache Superset (admin / admin) |

---

## Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Stats overview with daily trend charts |
| `/payment-files` | Payment Files | File listing with status indicators |
| `/payments` | Payments | Payment listing with filters and search |
| `/payments/create` | Create Payment | Payment creation form |
| `/payments/:reference` | Payment Detail | Single payment view with feedback history |
| `/statements` | Statements | Statement viewer by account |
| `/dashboard-builder` | Dashboard Builder | Build and link Superset dashboards by UUID |
| `/dashboards` | My Dashboards | Gallery of saved dashboards |
| `/superset-embed/:dashboardId` | Embedded Dashboard | Full Superset dashboard rendered via SDK |
| `/analytics/superset` | Superset Explorer | Direct link to Superset instance |
| `/analytics/ask` | Ask a Question | Natural Language Chart Builder |

---

## Superset Integration Deep Dive

The application uses three distinct approaches to integrate with Superset:

### 1. SDK-Based Dashboard Embedding

The `superset-embed` component uses `@superset-ui/embedded-sdk` to render full dashboards inside iframes with authentication managed by guest tokens. The flow is:

1. Angular calls `GET /api/superset/guest-token?dashboardId=<UUID>` on the Spring Boot backend.
2. The backend's `SupersetApiService` authenticates with Superset using admin credentials (`POST /api/v1/security/login`).
3. It then requests a guest token (`POST /api/v1/security/guest_token/`) scoped to the specific dashboard and user.
4. The guest token is returned to Angular, which passes it to the Embedded SDK.
5. The SDK renders the dashboard in an iframe and auto-refreshes the token before expiry (5 minutes).

### 2. Direct Superset Access

The `superset-explorer` component provides a direct link to the full Superset UI at `localhost:8088` for power users who want to build charts and dashboards using the native interface.

### 3. Natural Language Chart Builder

The `nl-chart-builder` component enables non-technical users to create charts by typing plain English. The implementation involves three services:

- **NlParserService** (`nl-parser.service.ts`): Parses natural language into a structured `NlIntent` object containing dataset, group-by column, metric, viz type, time filter, and row limit.
- **SupersetDirectService** (`superset-direct.service.ts`): Authenticates with Superset via the Angular dev proxy, then creates charts using `POST /api/v1/chart/` with properly structured `params` and `query_context`.
- **NlChartBuilderComponent**: Chat-style UI that renders suggestion chips, message history, intent tags, loading skeletons, and embedded chart iframes.

API calls from the NL builder go through the Angular dev proxy (`/superset-api` → `localhost:8088`) to avoid CORS issues. Iframe embeds use the direct Superset URL with the browser's existing session cookie.

---

## FIS Global Theming

The application is branded with FIS Global's visual identity across both the Angular app and embedded Superset.

### Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| FIS Green | `#4BCD3E` | Primary accent, active states, buttons |
| Dark Teal | `#00565b` | Sidebar gradient endpoint |
| Cyan | `#00c1d5` | Links, secondary accents |
| Navy | `#0a2540` | Sidebar gradient start, dark backgrounds |
| Light Green | `#8dc63f` | Chart palette, secondary green |

### Angular Theming (`styles.scss`, `app.component.scss`)

- Sidebar uses a navy-to-teal gradient (`#0a2540 → #00565b`)
- FIS Green (`#4BCD3E`) for active navigation states and section headers
- CSS custom properties (`--fis-green`, `--fis-cyan`, etc.) for consistent theming
- FIS logo and badge in the top navigation bar

### Superset Theming (`superset_config.py`, `fis-superset-theme.css`)

- `EXTRA_CATEGORICAL_COLOR_SCHEMES` defines a "FIS Global" color palette for all chart visualizations
- `fis-superset-theme.css` overrides Superset's navbar, buttons, tabs, and loading indicators with FIS colors
- The theme CSS is injected via Docker volume mount into Superset's pythonpath

---

## Data Model and Sample Data

### Entity Relationships

```
Account ──< Payment (via debit_account_id / credit_account_id)
Account ──< Statement
PaymentFile ──< Payment
Payment ──< PaymentFeedback
Payment ──< Statement
SupersetDashboard (stores dashboard config JSON + Superset UUID)
```

### Sample Data (loaded from `data.sql`)

| Entity | Records | Details |
|--------|---------|---------|
| Accounts | 20 | SAVINGS, CHECKING, CORPORATE — multi-currency |
| Payment Files | 50 | BULK, SINGLE, BATCH — all statuses |
| Payments | 2,000 | Spread across 12 months, multiple channels |
| Payment Feedbacks | ~1,400 | Linked to payments |
| Statements | ~600 | Linked to accounts and payments |

### NL Chart Builder Datasets

The NL parser recognizes two datasets with these column aliases:

**Payments dataset** (ID: 1): `channel`, `status`, `payment_type`, `currency`, `error_code`, `amount`, `account_id`, `debit_account_id`, `credit_account_id`, `created_at`

**Statements dataset** (ID: 2): `transaction_type`, `description`, `balance`, `debit_amount`, `credit_amount`, `created_at`

---

## CORS and Proxy Configuration

### Development Setup

Two mechanisms handle cross-origin communication:

**Spring Boot CORS filter** (`CorsConfig.java`): Allows `http://localhost:4200` to call the backend API at `localhost:8080`. Configured as a global `CorsFilter` bean plus `@CrossOrigin` annotations on controllers.

**Angular dev proxy** (`proxy.conf.json`): Routes `/superset-api/*` requests through the Angular dev server to `http://localhost:8088`, making Superset API calls same-origin from the browser's perspective. This is used exclusively by the NL Chart Builder.

```json
{
  "/superset-api": {
    "target": "http://localhost:8088",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": { "^/superset-api": "" }
  }
}
```

**Superset CORS** (`superset_config.py`): Allows `http://localhost:4200` and `http://localhost:8080` as origins with credentials support.

### Production Recommendations

- Replace `localhost` origins with actual domain names in `CorsConfig.java`, `@CrossOrigin` annotations, and `superset_config.py`.
- Remove `addAllowedOriginPattern("*")` from `CorsConfig.java`.
- Place all services behind a reverse proxy (nginx, Traefik, etc.) for unified origin.
- Re-enable `TALISMAN_ENABLED` and `WTF_CSRF_ENABLED` in Superset.
- Rotate `SUPERSET_SECRET_KEY` and use environment-specific secrets.

---

## Row-Level Security

The guest token endpoint supports per-user data isolation through Superset's Row-Level Security (RLS):

1. In Superset, go to **Security → Row Level Security** and create a rule:
   - **Table:** `payments`
   - **Clause:** `debit_account_id = '{{ current_username() }}'`
2. Assign the rule to the **Gamma** role (used by guest tokens).
3. When requesting a guest token, pass the `username` parameter to scope the data to that user.

---

## Troubleshooting

### Superset won't start
Make sure PostgreSQL is healthy before Superset starts. Run `docker compose up postgres` first and wait for the healthcheck to pass, then start Superset.

### "Add required control values to preview chart" in NL builder
This means the chart's `params` are missing a required form field. For pie, treemap, and funnel chart types, Superset expects `metric` (singular) in addition to `metrics` (plural). The NL parser handles this automatically.

### CORS errors on NL Chart Builder API calls
Ensure the Angular dev server is running with the proxy config (`ng serve` reads `proxy.conf.json` from `angular.json`). API calls should go to `/superset-api/...`, not directly to `localhost:8088`.

### Embedded dashboard shows blank iframe
Verify that dashboard embedding is enabled in Superset (look for the **Embed dashboard** option in the dashboard menu). Check that `FEATURE_FLAGS.EMBEDDED_SUPERSET` is `true` and `X-Frame-Options` is set to `ALLOWALL` in `superset_config.py`.

### Backend can't connect to PostgreSQL
Check that Docker Compose PostgreSQL is running on port 5432 and that the credentials in `application.properties` match those in `docker-compose.yml` (default: `demo_user` / `demo_pass` / `demo_db` for local dev, `paymenthub` / `paymenthub` / `paymenthub` for Docker Compose).

### Seed data not loading
Set `spring.sql.init.mode=always` in `application.properties` on a fresh database. After the initial load, change it back to `never` to avoid duplicate inserts.

---

## License

This project is for demonstration purposes only.
