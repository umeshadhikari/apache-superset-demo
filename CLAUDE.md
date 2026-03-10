# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A demo application for embedding Apache Superset dashboards inside an Angular app. A Spring Boot backend proxies Superset API calls (login + guest token generation) so the frontend can embed dashboards via `@superset-ui/embedded-sdk`. Also includes a natural language chart builder that parses user queries into Superset chart configurations.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.3, Spring Data JPA, PostgreSQL, Lombok, Maven
- **Frontend:** Angular 19 (NgModule pattern, NOT standalone components), TypeScript 5.8, SCSS, Karma+Jasmine
- **Infrastructure:** Docker Compose (PostgreSQL 15, Apache Superset 3.1.3, nginx for production frontend)

## Build & Run Commands

### Local Development (start dependencies first)
```bash
docker compose up postgres superset
```

### Backend
```bash
cd payment-hub-backend
mvn spring-boot:run          # Run app (port 8080)
mvn test                     # Run all tests
mvn test -Dtest=SupersetServiceTest  # Run single test class
mvn package -DskipTests      # Build JAR without tests
```

### Frontend
```bash
cd payment-hub-frontend
npm ci                       # Install dependencies
ng serve                     # Dev server (port 4200, proxies /superset-api to :8088)
ng test                      # Run unit tests (Karma)
ng build --configuration production  # Production build
```

### Full Stack via Docker
```bash
docker compose --profile full up --build
```

## Architecture

```
Angular (:4200) → GET /api/superset/guest-token → Spring Boot (:8080) → Superset API (:8088)
                                                          ↕
                                                   PostgreSQL (:5432)
```

The backend serves two purposes:
1. **Domain API** — CRUD for payments, accounts, statements, feedback, payment files
2. **Superset proxy** — `SupersetApiService` authenticates with Superset (admin credentials from config), generates guest tokens for dashboard embedding, and `SupersetService` provides JDBC introspection with table allow-listing (`ALLOWED_TABLES`) for the dashboard builder

## API Endpoints

| Controller | Base Route | Methods |
|------------|-----------|---------|
| `PaymentController` | `/api/payments` | `GET /`, `POST /`, `GET /{reference}`, `PUT /{reference}/status`, `GET /stats`, `GET /daily-stats` |
| `AccountController` | `/api/accounts` | `GET /`, `GET /{id}`, `POST /` |
| `StatementController` | `/api/statements` | `GET /{accountId}?fromDate=...&toDate=...` |
| `PaymentFeedbackController` | `/api/feedback` | `GET /{paymentReference}`, `POST /` |
| `PaymentFileController` | `/api/payment-files` | `GET /`, `POST /`, `GET /{id}`, `PUT /{id}/status?status=...` |
| `SupersetController` | `/api/superset` | `GET /tables`, `POST /dashboards`, `GET /dashboards`, `DELETE /dashboards/{id}`, `GET /superset-dashboards`, `GET /health`, `GET /guest-token?dashboardId=...&username=...` |

## Key Backend Conventions

- Package root: `com.paymenthub` under `payment-hub-backend/src/main/java/`
- Constructor injection via `@RequiredArgsConstructor` (no `@Autowired`)
- Lombok everywhere: `@Data`, `@Builder`, `@Slf4j`, `@RequiredArgsConstructor`
- All controllers return `ResponseEntity<T>` with appropriate HTTP status codes
- Input validation via `@Valid` + JSR-303 constraints on DTOs
- Global exception handling in `GlobalExceptionHandler` (`@RestControllerAdvice`):
  - `SupersetIntegrationException` → HTTP 502
  - `NoSuchElementException` → HTTP 404
  - `IllegalArgumentException` → HTTP 400
- API docs: Swagger UI at `/swagger-ui.html`, OpenAPI spec at `/api-docs`
- `@Transactional` on service create/update methods
- `@PrePersist`/`@PreUpdate` lifecycle hooks auto-manage `createdAt`/`updatedAt` timestamps
- DB config defaults: `demo_db`/`demo_user`/`demo_pass` on `localhost:5432` (docker-compose overrides to `paymenthub`/`paymenthub`/`paymenthub`)
- Seed data in `data.sql` (20 accounts, 50+ payment files, 100+ payments) — set `spring.sql.init.mode=always` on fresh DB only

### Backend Entities

| Entity | Table | Key Fields |
|--------|-------|-----------|
| `Payment` | `payments` | paymentReference (unique), debitAccount, creditAccount, amount, currency, status (PENDING/PROCESSING/COMPLETED/FAILED/REJECTED/REVERSED) |
| `Account` | `accounts` | accountNumber (unique), accountName, bankCode, currency, balance, accountType, status |
| `Statement` | `statements` | transactionReference (unique), account (FK), payment (FK), debitAmount, creditAmount, balance |
| `PaymentFeedback` | `payment_feedbacks` | payment (FK), feedbackCode, feedbackStatus (SUCCESS/FAILED/PENDING/RETURNED) |
| `PaymentFile` | `payment_files` | fileReference (unique), fileName, fileType, status, totalAmount, totalCount |
| `SupersetDashboard` | `superset_dashboards` | name, config (JSON), tables (comma-separated), supersetDashboardId (UUID) |

### Backend Tests

Single test file: `SupersetServiceTest` (JUnit 5 + Mockito, 8 test methods)
- Tests `ALLOWED_TABLES` whitelist validation
- Tests `saveDashboard` table allowlist enforcement

## Key Frontend Conventions

- All components declared in `AppModule` (NgModule pattern, `standalone: false`)
- API base URL configured in `src/environments/environment.ts`
- Strict TypeScript: `strict: true`, `strictTemplates`, `noImplicitReturns`
- Models/interfaces in `src/app/models/payment.model.ts`
- Services in `src/app/services/`, components in `src/app/components/`
- Reactive forms in `CreatePaymentComponent`, template-driven forms elsewhere
- Global error handler: `superset-error-handler.ts` catches uncaught errors (including SDK errors)
- No NgRx — component-level RxJS subscriptions for state management
- Dev proxy: `proxy.conf.json` rewrites `/superset-api/*` → `http://localhost:8088` (avoids CORS for NL chart builder)

### Frontend Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `HomeComponent` | Dashboard overview with stats |
| `/payments` | `PaymentsComponent` | List/filter payments |
| `/payments/create` | `CreatePaymentComponent` | Reactive form to create payment |
| `/payments/:reference` | `PaymentDetailComponent` | Payment detail + feedback |
| `/payment-files` | `PaymentFilesComponent` | List payment batch files |
| `/statements` | `StatementsComponent` | Account statement viewer |
| `/dashboard-builder` | `DashboardBuilderComponent` | Create/configure Superset dashboards |
| `/dashboards` | `DashboardListComponent` | Browse saved dashboards |
| `/superset-embed/:dashboardId` | `SupersetEmbedComponent` | Embed dashboard (SDK or iframe) |
| `/analytics/superset` | `SupersetExplorerComponent` | Browse Superset explore UI |
| `/analytics/ask` | `NlChartBuilderComponent` | Natural language chart creation |

### Frontend Services

| Service | Purpose |
|---------|---------|
| `payment.service.ts` | CRUD payments, stats, daily stats |
| `account.service.ts` | CRUD accounts |
| `statement.service.ts` | Account statements with date range |
| `feedback.service.ts` | Payment feedback CRUD |
| `payment-file.service.ts` | Payment file upload/status |
| `superset.service.ts` | Tables, dashboards, guest tokens (via backend proxy) |
| `superset-direct.service.ts` | Direct Superset REST API (chart creation, datasets, CSRF/auth handling) |
| `nl-parser.service.ts` | Natural language → chart config (regex-based intent extraction) |

### Superset Embed Component

`superset-embed` auto-detects dashboard ID format:
- **UUID** → uses `@superset-ui/embedded-sdk` `embedDashboard()` with guest token (3x retry, exponential backoff)
- **Numeric** → iframe fallback with direct Superset URL
- Includes 15-second slow-load warning, session expiry handling, offline detection

## Database

- `spring.jpa.hibernate.ddl-auto=update` — Hibernate manages schema
- `SupersetService.ALLOWED_TABLES` whitelist: `payments`, `status_feedback`, `dashboards`, `statements`

## Superset Configuration

- `superset/superset_config.py` enables embedded mode and CORS for `localhost:4200`/`localhost:8080`
- Guest tokens use `Gamma` role, 5-min expiry (SDK auto-refreshes)
- CSRF and Talisman disabled when `SUPERSET_ENV=development`
- `X-Frame-Options: ALLOWALL` for iframe embedding

## Docker Infrastructure

### Root docker-compose.yml

| Service | Container | Port | Notes |
|---------|-----------|------|-------|
| `postgres` | paymenthub-postgres | 5432 | PostgreSQL 15, health check via pg_isready |
| `superset` | paymenthub-superset | 8088 | Superset 3.1.3, health check via /health, 60s start period |
| `backend` | paymenthub-backend | 8080 | Profile: `full`, multi-stage build (eclipse-temurin:17) |
| `frontend` | paymenthub-frontend | 4200→80 | Profile: `full`, multi-stage build (node:20 + nginx:alpine) |

### Alternate: superset-docker/

Standalone Superset stack with PostgreSQL 16, Redis 7, custom Dockerfile, and FIS branding CSS. Use root `docker-compose.yml` for integrated development.

### Production Frontend

`nginx.conf` serves Angular SPA and proxies `/api/*` to `backend:8080` (Docker service name).
