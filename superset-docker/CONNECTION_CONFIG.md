# Connection Config — Angular App Integration

## Quick Start

```bash
cd superset-docker
docker compose up -d
```

Wait ~30 seconds for Superset to finish initialising, then open
**http://localhost:8088** and log in with `admin` / `admin`.

---

## Service Endpoints

| Service    | URL / Host             | Port  |
|------------|------------------------|-------|
| PostgreSQL | `localhost`            | 5432  |
| Superset   | http://localhost:8088  | 8088  |
| Redis      | `localhost`            | 6379  |

---

## PostgreSQL Connection (for Angular `environment.ts`)

```typescript
// environment.ts
export const environment = {
  production: false,

  // Direct DB access (via a backend API, NOT from the browser)
  database: {
    host: 'localhost',
    port: 5432,
    name: 'demo_db',
    user: 'demo_user',
    password: 'demo_pass',
  },

  // Superset API (callable from Angular HttpClient)
  superset: {
    baseUrl: 'http://localhost:8088',
    username: 'admin',
    password: 'admin',
  },
};
```

> **Note:** Browsers cannot connect to PostgreSQL directly.
> Use a Node/Express/NestJS backend as a middleman, or query
> data exclusively through the Superset REST API.

---

## Superset REST API — Key Endpoints

### 1. Authenticate (get a JWT access token)

```typescript
// POST http://localhost:8088/api/v1/security/login
const body = {
  username: 'admin',
  password: 'admin',
  provider: 'db',
  refresh: true,
};

this.http.post('http://localhost:8088/api/v1/security/login', body)
  .subscribe((res: any) => {
    const token = res.access_token;
    // Store and attach as: Authorization: Bearer <token>
  });
```

### 2. List Dashboards

```
GET /api/v1/dashboard/
Authorization: Bearer <token>
```

### 3. Get Chart Data

```
GET /api/v1/chart/<id>/data/
Authorization: Bearer <token>
```

### 4. Execute SQL (SQL Lab API)

```
POST /api/v1/sqllab/execute/
Authorization: Bearer <token>
Content-Type: application/json

{
  "database_id": 1,
  "sql": "SELECT * FROM demo_metrics ORDER BY recorded_at DESC",
  "schema": "public"
}
```

---

## Embedding Superset Dashboards in Angular

The `superset_config.py` already has CORS and iframe embedding enabled.

### Option A — iframe

```html
<iframe
  src="http://localhost:8088/superset/dashboard/1/"
  width="100%" height="800"
  frameborder="0">
</iframe>
```

### Option B — Superset Embedded SDK

```bash
npm install @superset-ui/embedded-sdk
```

```typescript
import { embedDashboard } from '@superset-ui/embedded-sdk';

embedDashboard({
  id: '<embedded-dashboard-uuid>',        // from Superset UI
  supersetDomain: 'http://localhost:8088',
  mountPoint: document.getElementById('superset-container')!,
  fetchGuestToken: () => this.getGuestToken(),
  dashboardUiConfig: {
    hideTitle: true,
    hideChartControls: false,
    hideTab: false,
  },
});
```

---

## CORS

Already configured in `superset_config.py` for:

- `http://localhost:4200` (Angular default)
- `http://localhost:3000`

If your Angular app runs on a different port, add it to
`CORS_OPTIONS["origins"]` in `superset_config.py`.

---

## Stopping / Resetting

```bash
# Stop containers (data persists)
docker compose down

# Stop AND delete all data
docker compose down -v
```
