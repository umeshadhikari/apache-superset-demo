# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A demo application for embedding Apache Superset dashboards inside an Angular app. A Spring Boot backend proxies Superset API calls (login + guest token generation) so the frontend can embed dashboards via `@superset-ui/embedded-sdk`.

## Tech Stack

- **Backend:** Java 17, Spring Boot 3.2.3, Spring Data JPA, PostgreSQL, Lombok, Maven
- **Frontend:** Angular 19 (NgModule pattern, NOT standalone components), TypeScript 5.8, SCSS, Karma+Jasmine
- **Infrastructure:** Docker Compose (PostgreSQL 15, Apache Superset 3.1.3)

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
ng serve                     # Dev server (port 4200)
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

## Key Backend Conventions

- Package root: `com.paymenthub` under `payment-hub-backend/src/main/java/`
- Constructor injection via `@RequiredArgsConstructor` (no `@Autowired`)
- Lombok everywhere: `@Data`, `@Builder`, `@Slf4j`, `@RequiredArgsConstructor`
- Global exception handling in `GlobalExceptionHandler` (`@RestControllerAdvice`)
- Custom `SupersetIntegrationException` maps to HTTP 502
- API docs: Swagger UI at `/swagger-ui.html`, OpenAPI spec at `/api-docs`
- DB config defaults: `demo_db`/`demo_user`/`demo_pass` on `localhost:5432` (docker-compose overrides to `paymenthub`/`paymenthub`/`paymenthub`)
- Seed data in `data.sql` — set `spring.sql.init.mode=always` on fresh DB only

## Key Frontend Conventions

- All components declared in `AppModule` (NgModule pattern, `standalone: false`)
- API base URL configured in `src/environments/environment.ts`
- `superset-embed` component auto-detects UUID vs numeric dashboard IDs (SDK embed vs iframe fallback)
- Strict TypeScript: `strict: true`, `strictTemplates`, `noImplicitReturns`
- Models/interfaces in `src/app/models/payment.model.ts`
- Services in `src/app/services/`, components in `src/app/components/`

## Database

- `spring.jpa.hibernate.ddl-auto=update` — Hibernate manages schema
- `SupersetService.ALLOWED_TABLES` whitelist prevents exposing system tables through the dashboard builder

## Superset Configuration

- `superset/superset_config.py` enables embedded mode and CORS for `localhost:4200`/`localhost:8080`
- Guest tokens use `Gamma` role, 5-min expiry (SDK auto-refreshes)
- CSRF and Talisman disabled when `SUPERSET_ENV=development`