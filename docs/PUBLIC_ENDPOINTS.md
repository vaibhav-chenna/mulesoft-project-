# Public Endpoint Deployment

This project can run as one public web service from the `dashboard` folder:

- Dashboard: `https://your-host/`
- API base URL: `https://your-host/api/v1/support`
- Health check: `https://your-host/api/v1/support/health`
- Chat query: `POST https://your-host/api/v1/support/query`

The Node server serves the React production build when `dashboard/build` exists. Locally, the dashboard still uses `http://localhost:8086/api/v1/support`.

## Recommended Cloud Setup

Use one of these approaches:

1. MuleSoft CloudHub for the real Mule app and company-managed public URLs.
2. Azure App Service, Render, or Railway for the Node demo API plus dashboard.
3. A company-approved reverse proxy or VPN endpoint for internal-only access.

Avoid exposing this through an unmanaged public tunnel for production or company data.

## Render

From the `dashboard` folder, deploy using `render.yaml`, or create a Web Service manually:

- Root directory: `dashboard`
- Build command: `npm ci && npm run build`
- Start command: `npm run api:cloud`
- Environment variables:
  - `PUBLIC_READ_ONLY=true`

Render provides the runtime `PORT`; the server automatically listens on it.

## Railway

Create a Node web service with root directory `dashboard`:

- Build command: `npm ci && npm run build`
- Start command: `npm run api:cloud`
- Environment variables:
  - `PUBLIC_READ_ONLY=true`

Generate a public domain in Railway, then use:

```text
https://your-service.up.railway.app/api/v1/support/health
```

## Azure App Service

Deploy `dashboard` as a Node app:

- Build command: `npm ci && npm run build`
- Startup command: `npm run api:cloud`
- App setting:
  - `PUBLIC_READ_ONLY=true`

The public API URL will be:

```text
https://your-app-name.azurewebsites.net/api/v1/support/health
```

## Docker

Build and run locally:

```bash
cd dashboard
docker build -t ai-support-public .
docker run --rm -p 8086:8086 -e PUBLIC_READ_ONLY=true ai-support-public
```

Then open:

```text
http://localhost:8086/
http://localhost:8086/api/v1/support/health
```

## Dashboard Pointing To A Separate API

If the dashboard and API are hosted separately, build the dashboard with:

```bash
set REACT_APP_API_URL=https://your-api-host/api/v1/support
npm run build
```

## Safety

Set `PUBLIC_READ_ONLY=true` on public hosts. It blocks admin create, update, and delete routes while leaving health, analytics, customer/order reads, and chatbot queries available for demos.
