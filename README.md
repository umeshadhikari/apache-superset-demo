# Apache Superset Demo — Payment Hub

A multi-module IntelliJ project demonstrating **real embedded Apache Superset dashboards** in an
Angular + Spring Boot **Payment Hub** application, backed by **PostgreSQL**.

## Project Structure

```
apache-superset-demo/               ← Root (parent Maven POM + IntelliJ project)
├── docker-compose.yml              ← One-command local dev stack
├── superset/
│   └── superset_config.py          ← Superset config (embedding, CORS, RLS)
├── payment-hub-backend/            ← Spring Boot 3 back-end module (Maven)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/paymenthub/
│       │   ├── PaymentHubApplication.java
│       │   ├── config/             (CorsConfig, AppConfig, DataInitializer)
│       │   ├── controller/         (Payment, PaymentFile, Account, Statement,
│       │   │                        Feedback, Superset — incl. guest-token endpoint)
│       │   ├── dto/                (request/response DTOs + SupersetGuestToken*)
│       │   ├── model/              (Account, Payment, PaymentFile, PaymentFeedback,
│       │   │                        Statement, SupersetDashboard)
│       │   ├── repository/         (Spring Data JPA repos)
│       │   └── service/            (business-logic + SupersetApiService)
│       └── main/resources/
│           ├── application.properties          (PostgreSQL default; env-var overrides)
│           ├── application-postgres.properties (PostgreSQL profile — additional overrides)
│           └── data.sql            (seed: 20 accounts · 50 files · 2 000 payments …)
└── payment-hub-frontend/           ← Angular 19 front-end module (npm)
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/app/
        ├── components/
        │   ├── home/
        │   ├── payment-files/
        │   ├── payments/
        │   ├── payment-detail/
        │   ├── create-payment/
        │   ├── statements/
        │   ├── dashboard-builder/  (build + link a Superset dashboard by UUID)
        │   ├── dashboard-list/     (list saved dashboards; embed or open in Superset)
        │   └── superset-embed/     ← NEW — full embedded dashboard via Embedded SDK
        ├── models/
        │   └── payment.model.ts
        └── services/
            └── superset.service.ts (includes getGuestToken())
```

---

## Prerequisites

| Tool | Min Version | Notes |
|------|-------------|-------|
| Docker + Docker Compose | 24+ | Required for PostgreSQL and Superset |
| Java (JDK) | 17 | Required for Spring Boot (local dev only) |
| Maven | 3.8+ | Or use `./mvnw` |
| Node.js | 18+ | Required for Angular (local dev only) |
| npm | 9+ | Bundled with Node.js |

---

## Quickstart (Docker — recommended)

### 1. Clone the repository

```bash
git clone https://github.com/umeshadhikari/apache-superset-demo.git
cd apache-superset-demo
```

### 2. Start PostgreSQL and Superset

```bash
docker compose up postgres superset
```

Wait until you see `Superset is up and running` in the logs (may take ~60 seconds on first run).

Superset is now available at **http://localhost:8088** — log in with **admin / admin**.

### 3. Connect Superset to the Payment Hub database

1. In Superset → **Settings → Database Connections → + Database**
2. Choose **PostgreSQL** and enter:
   - **Host:** `localhost`
   - **Port:** `5432`
   - **Database:** `demo_db`
   - **Username / Password:** `demo_user` / `demo_pass`
3. Test the connection and save as **"Payment Hub"**.
4. Go to **Data → Datasets** and add the tables:
   `payments`, `payment_files`, `accounts`, `statements`, `payment_feedback`

### 4. Enable dashboard embedding

1. In Superset → **Dashboards** → open or create a dashboard.
2. Click **⋮ → Embed dashboard**.
3. Copy the **UUID** shown in the embed dialog.

### 5. Link the UUID in the Angular app

When saving a dashboard in the **Dashboard Builder** (`/dashboard-builder`):
- Paste the Superset UUID into the **"Superset Dashboard UUID"** field.
- Click **Save & Publish**.

The **My Dashboards** page (`/dashboards`) now shows a **📊 View Embedded** button.
Clicking it navigates to `/superset-embed/<uuid>` where the dashboard is rendered
inside the app via the [Superset Embedded SDK](https://superset.apache.org/docs/embedded-superset/).

### 6. Start the Spring Boot back-end

```bash
cd payment-hub-backend && mvn spring-boot:run
```

Back-end starts on **http://localhost:8080** and connects to PostgreSQL at `localhost:5432/demo_db`.

### 7. Start the Angular front-end

```bash
cd payment-hub-frontend
npm install          # first time only
ng serve
```

App is available at **http://localhost:4200**.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/payments` | List all payments |
| POST | `/api/payments` | Create a new payment |
| GET | `/api/payments/{reference}` | Get payment by reference |
| PUT | `/api/payments/{reference}/status` | Update payment status |
| GET | `/api/payments/stats` | Aggregated dashboard statistics |
| GET | `/api/payment-files` | List all payment files |
| GET | `/api/accounts` | List all accounts |
| GET | `/api/statements/{accountId}` | Get statements for an account |
| GET | `/api/feedback/{paymentReference}` | Get feedback for a payment |
| GET | `/api/superset/tables` | List DB tables with columns |
| GET | `/api/superset/dashboards` | List saved dashboards |
| POST | `/api/superset/dashboards` | Save a new dashboard configuration |
| DELETE | `/api/superset/dashboards/{id}` | Delete a dashboard |
| **GET** | **`/api/superset/guest-token`** | **Generate Superset guest token for embedding** |

**Guest token parameters:**
- `dashboardId` — Superset embedded dashboard UUID (required)
- `username` — end-user identifier for audit / RLS (optional, default: `guest`)

**Useful URLs (local dev):**
- Swagger UI: http://localhost:8080/swagger-ui.html
- Apache Superset: http://localhost:8088 (admin / admin)

---

## Frontend Routes

| Route | Page |
|-------|------|
| `/` | Home — stats overview |
| `/payment-files` | Payment File listing |
| `/payments` | Payment listing with filters |
| `/payments/:reference` | Payment detail + feedback |
| `/payments/create` | Create payment form |
| `/statements` | Statement viewer |
| `/dashboard-builder` | Build & link a Superset dashboard |
| `/dashboards` | Saved Dashboard listing |
| `/superset-embed/:dashboardId` | **Embedded Superset dashboard (new)** |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (Angular 19)                                   │
│  ┌──────────────────┐   ┌────────────────────────────┐  │
│  │  Angular App     │   │  Superset Embedded SDK     │  │
│  │  /superset-embed │──▶│  <iframe src=Superset>     │  │
│  └────────┬─────────┘   └────────────────────────────┘  │
│           │  GET /api/superset/guest-token               │
└───────────┼─────────────────────────────────────────────┘
            ▼
┌─────────────────────────────────────────────────────────┐
│  Spring Boot Backend (:8080)                            │
│  SupersetApiService                                     │
│    POST /api/v1/security/login   ─────▶  Superset       │
│    POST /api/v1/security/guest_token/ ─▶ (:8088)        │
└─────────────────────────────────────────────────────────┘
            ▼
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL (:5432)                                     │
│  Databases: demo_db (app data), superset (metadata)     │
└─────────────────────────────────────────────────────────┘
```

---

## Row-Level Security (RLS)

The guest-token endpoint accepts an optional `username` parameter which is forwarded
to Superset for audit purposes. To enforce per-tenant data isolation:

1. In Superset → **Security → Row Level Security**, create a rule:
   - **Table:** `payments`
   - **Clause:** `debit_account_id = '{{ current_username() }}'`
2. Assign the rule to the **Gamma** role (used for guest tokens).

---

## Sample Data

| Entity | Records |
|--------|---------|
| Accounts | 20 (SAVINGS / CHECKING / CORPORATE, multi-currency) |
| Payment Files | 50 (BULK / SINGLE / BATCH, all statuses) |
| Payments | 2 000 (spread across 12 months) |
| Payment Feedbacks | ~1 400 |
| Statements | ~600 |

---

## Data Model

```
Account ──< Payment (debit / credit)
Account ──< Statement
PaymentFile ──< Payment
Payment ──< PaymentFeedback
Payment ──< Statement
SupersetDashboard (stores config JSON + Superset dashboard UUID)
```

---

## CORS Configuration (Local Development)

When running Angular (`ng serve`) on **http://localhost:4200** and Spring Boot on **http://localhost:8080**, the browser enforces
[CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) because the two origins differ by port.

### How it is configured

| Layer | File | What it does |
|-------|------|--------------|
| Global filter | `payment-hub-backend/src/main/java/com/paymenthub/config/CorsConfig.java` | Registers a `CorsFilter` bean that adds `Access-Control-Allow-Origin: http://localhost:4200` (and a wildcard pattern for other dev origins) to **every** response, including preflight `OPTIONS` requests. |
| Controller annotation | `@CrossOrigin(origins = "http://localhost:4200")` on every `@RestController` | Spring MVC–level reinforcement so CORS headers are set correctly even if the filter chain is bypassed. |

### What to change for production / other environments

- Replace `http://localhost:4200` with your actual front-end origin (e.g. `https://app.example.com`) in both `CorsConfig.java` and all `@CrossOrigin` annotations.
- Remove `addAllowedOriginPattern("*")` from `CorsConfig.java` — it is present for demo convenience only.
- If you add an nginx/reverse-proxy in front of the backend, ensure it forwards (and does not strip) the `Access-Control-*` response headers.

---

## License

This project is for demonstration purposes only.
