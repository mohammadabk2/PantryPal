# PantryPal Backend

FastAPI server for PantryPal.

## Setup

Run these from the `backend/` folder:

```bash
# 1. Create and activate a virtual environment
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create your environment file
cp app/.env.example app/.env
```

## Environment variables

Settings are loaded from `app/.env` (see `app/config.py`). A real environment variable with the same name overrides the value in the file.

| Variable       | Description                                        | Example                 |
| -------------- | -------------------------------------------------- | ----------------------- |
| `APP_NAME`     | Name shown in the API docs and root response       | `PantryPal`             |
| `CORS_ORIGINS` | Comma-separated list of allowed frontend origins   | `http://localhost:5173` |
| `DATABASE_URL` | SQLAlchemy URL for the Postgres database (start it with `docker compose up -d` from the repo root) | `postgresql+psycopg://pantrypal:pantrypal@localhost:5432/pantrypal` |

Every variable is required. If one is missing, the server refuses to start and the error names it.

## Running the server

From `backend/`, with the virtual environment active:

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000

`--reload` restarts the server whenever you save a file. Leave it off in production.

## Docker

***in root run***

- Turn on Docker
```bash
sudo docker compose up -d
```

- Turn off Docker
```bash
sudo docker compose down
```

## Endpoints

| Method | Path          | Description            |
| ------ | ------------- | ---------------------- |
| GET    | `/`           | Checks the API is up   |
| GET    | `/api/health` | Health check           |

