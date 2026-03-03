# Apache Superset Demo — Payment Hub

A multi-module IntelliJ project demonstrating the custom dashboard capabilities of
[Apache Superset](https://superset.apache.org/) using a **Payment Hub** domain.

## Project Structure

```
apache-superset-demo/               ← Root (parent Maven POM + IntelliJ project)
├── .idea/                          ← IntelliJ project files (modules.xml, misc.xml, vcs.xml)
├── payment-hub-backend/            ← Spring Boot 3 back-end module (Maven)
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/paymenthub/
│       │   ├── PaymentHubApplication.java
│       │   ├── config/             (CorsConfig, DataInitializer)
│       │   ├── controller/         (Payment, PaymentFile, Account, Statement, Feedback, Superset)
│       │   ├── dto/                (request/response DTOs)
│       │   ├── model/              (Account, Payment, PaymentFile, PaymentFeedback, Statement, SupersetDashboard)
│       │   ├── repository/         (Spring Data JPA repos)
│       │   └── service/            (business-logic services)
│       └── main/resources/
│           ├── application.properties
│           └── data.sql            (20 accounts · 50 files · 2 000 payments · ~1 400 feedbacks · 600 statements)
└── payment-hub-frontend/           ← Angular 17 front-end module (npm)
    ├── package.json
    └── src/app/
        ├── components/
        │   ├── home/               (stats cards + recent payments)
        │   ├── payment-files/      (payment-file listing with status filter)
        │   ├── payments/           (payment listing with filters)
        │   ├── payment-detail/     (full detail + feedback + status update)
        │   ├── create-payment/     (reactive form)
        │   ├── statements/         (account + date-range filter)
        │   ├── dashboard-builder/  (Superset dashboard construction UI)
        │   └── dashboard-list/     (saved dashboard cards)
        ├── models/
        │   └── payment.model.ts
        └── services/               (PaymentService, AccountService, SupersetService, …)
```

---

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Java (JDK) | 17 | Required for Spring Boot |
| Maven | 3.8+ | Or use the included Maven wrapper |
| Node.js | 18+ | Required for Angular |
| npm | 9+ | Bundled with Node.js |
| Angular CLI | 17 | `npm install -g @angular/cli@17` |
| Apache Superset | 3.x | Optional — only needed for live dashboard embedding |

---

## Quickstart

### 1. Clone the repository

```bash
git clone https://github.com/umeshadhikari/apache-superset-demo.git
cd apache-superset-demo
```

### 2. Open in IntelliJ IDEA

1. **File → Open** and select the repository root directory.  
   IntelliJ detects the parent `pom.xml` and imports both Maven and Angular modules automatically.
2. Set the Project SDK to **Java 17** (**File → Project Structure → Project**).
3. For the Angular module, IntelliJ will detect `package.json` and enable Node.js support
   (install the **Angular and AngularJS** plugin if prompted).

---

## Running the Back-end (Spring Boot)

```bash
cd payment-hub-backend
mvn spring-boot:run
```

Or in IntelliJ: right-click `PaymentHubApplication` → **Run**.

The back-end starts on **http://localhost:8080**.

| Endpoint | Description |
|----------|-------------|
| `GET  /api/payments` | List all payments |
| `POST /api/payments` | Create a new payment |
| `GET  /api/payments/{reference}` | Get payment by reference |
| `PUT  /api/payments/{reference}/status` | Update payment status |
| `GET  /api/payments/stats` | Aggregated dashboard statistics |
| `GET  /api/payment-files` | List all payment files |
| `GET  /api/accounts` | List all accounts |
| `GET  /api/statements/{accountId}` | Get statements for an account |
| `GET  /api/feedback/{paymentReference}` | Get feedback for a payment |
| `GET  /api/superset/tables` | List DB tables with columns (for dashboard builder) |
| `GET  /api/superset/dashboards` | List saved dashboards |
| `POST /api/superset/dashboards` | Save a new dashboard configuration |

**Useful URLs:**

- Swagger UI: http://localhost:8080/swagger-ui.html  
- H2 Console: http://localhost:8080/h2-console  
  - JDBC URL: `jdbc:h2:mem:paymenthub`  
  - Username: `sa` · Password: *(empty)*

---

## Running the Front-end (Angular)

```bash
cd payment-hub-frontend
npm install          # first time only
ng serve
```

The app is available at **http://localhost:4200**.

In IntelliJ, create a **npm run configuration** (`ng serve`) or use the built-in terminal.

### Pages

| Route | Page |
|-------|------|
| `/` | Home — stats overview + quick links |
| `/payment-files` | Payment File listing |
| `/payments` | Payment listing with filters |
| `/payments/:reference` | Payment detail + feedback |
| `/payments/create` | Create payment form |
| `/statements` | Statement viewer |
| `/dashboard-builder` | Apache Superset Dashboard Builder |
| `/dashboards` | Saved Dashboard listing |

---

## Apache Superset Integration

The **Dashboard Builder** page (`/dashboard-builder`) allows you to:

1. Browse all available database tables and their columns via the back-end API.
2. Select tables, chart type (Tabular / Bar / Pie / Line / Scatter), X-axis and Y-axis columns.
3. Save the dashboard configuration — it is persisted in the back-end database.
4. Open saved dashboards directly in Apache Superset via the **Saved Dashboards** page.

### Running Apache Superset (Docker)

```bash
# Pull and start Superset
docker run -d -p 8088:8088 \
  -e "SUPERSET_SECRET_KEY=your-secret-key" \
  --name superset apache/superset:latest

# Initialize Superset
docker exec -it superset superset fab create-admin \
  --username admin --firstname Admin --lastname User \
  --email admin@example.com --password admin

docker exec -it superset superset db upgrade
docker exec -it superset superset init
```

Superset is available at **http://localhost:8088** (admin / admin).

**Connecting Superset to the Payment Hub database:**

1. In Superset → **Data → Databases → + Database**
2. Select **SQLite** (for H2 file-mode) or use the JDBC connection if you switch to PostgreSQL.
3. Alternatively, connect directly to the H2 TCP server by adding:
   ```
   jdbc:h2:tcp://localhost/mem:paymenthub
   ```
4. Add the `PAYMENTS`, `PAYMENT_FILES`, `ACCOUNTS`, `STATEMENTS`, and `PAYMENT_FEEDBACK`
   tables as Superset datasets.
5. Build charts: bar chart by payment status, pie chart by currency,
   line chart of daily payment volumes, tabular view of recent payments.

---

## Sample Data Overview

The back-end auto-loads sample data on startup (`data.sql`):

| Entity | Records |
|--------|---------|
| Accounts | 20 (SAVINGS / CHECKING / CORPORATE, multi-currency: USD, EUR, GBP, KES) |
| Payment Files | 50 (BULK / SINGLE / BATCH, all statuses) |
| Payments | 2 000 (spread across 12 months, all payment types, channels and statuses) |
| Payment Feedbacks | ~1 400 (for completed / failed payments) |
| Statements | ~600 (linked to accounts and payments) |

---

## Data Model

```
Account ──< Payment (as debit or credit account)
Account ──< Statement
PaymentFile ──< Payment
Payment ──< PaymentFeedback
Payment ──< Statement
SupersetDashboard (stores saved dashboard configuration as JSON)
```

---

## Dashboard Examples

The pre-loaded dataset supports the following Superset visualisations out of the box:

- **Tabular** — Full payment listing with filters
- **Bar Chart** — Payment count / volume by status, type, or channel
- **Pie Chart** — Payment distribution by currency or payment type
- **Line Chart** — Daily payment volume over the past 12 months
- **Scatter Plot** — Payment amount vs. processing time
- **Big Number** — Total payments, total value, pending count

---

## Development Tips

- The back-end uses an **in-memory H2 database** — data resets on every restart.  
  To persist data, change `spring.datasource.url` in `application.properties` to a
  file-based H2 URL or swap to PostgreSQL/MySQL.
- CORS is fully open for demo purposes. Restrict `allowedOriginPattern` in
  `CorsConfig.java` before any production use.
- The Angular `environment.ts` sets `apiUrl: 'http://localhost:8080'`. Update this
  if you deploy the back-end to a different host/port.

---

## License

This project is for demonstration purposes only.
