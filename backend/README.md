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
| `JWT_SECRET_KEY` | Secret that signs login tokens (32+ characters). Generate one with `python -c "import secrets; print(secrets.token_urlsafe(64))"`. Changing it logs everyone out | — |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Optional. How long a login lasts (default `1440`, one day) | `1440` |

Every variable is required unless marked optional. If one is missing, the server refuses to start and the error names it.

## Database tables

Models live in `app/models/` (one file per table)
With the database running

```bash
python -m app.init_db
```

This only creates tables that don't exist yet. It does not change a table that already 

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
| POST   | `/api/auth/register` | Create an account |
| POST   | `/api/auth/login` | Log in, get a token |
| GET    | `/api/auth/me` | The logged-in user |
| GET    | `/api/preferences/options` | Allowed dietary restrictions |
| GET    | `/api/me/preferences` | The user's restrictions, tag weights and factor weights |
| PUT    | `/api/me/preferences/dietary-restrictions` | Replace the restriction list, `{"restrictions": [...]}`|
| PUT    | `/api/me/preferences/tags/{tag}` | Set how much the user likes a tag, `{"weight": -1 to 1}`|
| DELETE | `/api/me/preferences/tags/{tag}` | Remove a tag opinion |
| DELETE | `/api/me/preferences/feature-weights` | Reset learned factor weights to defaults |

