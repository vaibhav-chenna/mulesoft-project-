# AI Support Dashboard

This dashboard includes three working screens:

- Dashboard analytics at `/`
- Interactive chatbot at `/chat`
- Database admin console at `/admin`

## Local Run

Open two terminals in `dashboard`.

```bash
npm install
npm run api
```

Then in the second terminal:

```bash
npm start
```

The React app defaults to `http://localhost:3000` and calls the local API at `http://localhost:8086/api/v1/support`.

To change the local API ports:

```bash
set SUPPORT_PORTS=8086
npm run api
```

To point the dashboard at a deployed API:

```bash
set REACT_APP_API_URL=https://your-api-host/api/v1/support
npm start
```

## Local Database

The development API seeds itself from `../database/local-db.json` and writes runtime data to `dashboard/data/local-db.json`. Set `SUPPORT_DB_PATH` if you want the API to write somewhere else. The SQL schema for a real MySQL-style deployment remains in `../database/schemas`.

## Public API Discovery

The chatbot supports prompts such as `Show public APIs for weather data`. It reads public API catalog metadata from APIs.guru when the machine has internet access and falls back to safe examples such as Open-Meteo. It does not scrape or collect exposed API keys, secrets, or credentials.
