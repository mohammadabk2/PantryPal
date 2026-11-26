# Barcode Scanner: Implementation and API Guide

## What it does

The barcode demo scans EAN-8 and EAN-13 barcodes using the camera, an image, or
manual entry. Decoding happens in the browser. After a barcode is decoded or
entered, the frontend looks up the product directly through Open Food Facts.
If that request fails or returns no usable product name, it falls back to the
Python FastAPI backend.

The backend does not use a database, save products, or store inventory. A product
not found in Open Food Facts is not cached; each lookup makes a new external request.

## Main files

Paths are relative to the repository root.

| File | Responsibility |
| --- | --- |
| `client/src/components/BarcodeScanner.tsx` | Camera, image scanning, manual entry, and local barcode decoding. |
| `client/src/pages/BarcodeDemo.tsx` | Connects scanner results to product lookup and displays results or errors. |
| `client/src/api/products.ts` | Queries Open Food Facts first, then falls back to the backend. |
| `client/src/api/barcodeclient.ts` | Sends fallback requests to the configured API base URL. |
| `client/vite.config.ts` | Forwards development `/api` requests to the backend on port `8001`. |
| `backend/app/main.py` | Creates the FastAPI application and registers its routers. |
| `backend/app/routers/server.py` | Serves the barcode product lookup endpoint through the main API. |

## Lookup flow

```text
Camera / image / manual entry
            |
            v
Browser decodes or validates the barcode
            |
            v
GET Open Food Facts /api/v2/product/{barcode}.json
            |
      +-----+-----+
      |           |
  found/name    failed or no product
      |           |
      |           v
      |     GET /api/products/{barcode}
      |           |
      |           v
      |     FastAPI backend -> Open Food Facts
      +-----+-----+
            |
            v
Product name and barcode displayed in the browser
```

Camera frames and images stay in the browser; images are not uploaded to the
backend. A product lookup is sent only after a barcode is decoded or submitted.

## API

### `GET /api/products/:barcode`

The frontend first queries
`https://world.openfoodfacts.org/api/v2/product/{barcode}.json`, requesting the
default and English product-name fields. If the request fails or returns no
usable name, the frontend calls this backend endpoint as a fallback. The backend
uses the same lookup and returns the first non-empty name it finds.

Successful response:

```json
{ "barcode": "7290000000000", "name": "Product name" }
```

| Status | Meaning |
| --- | --- |
| `200` | Product found with a name. |
| `404` | Open Food Facts has no matching product with a usable name. |
| `502` | Open Food Facts could not be reached, timed out, or returned an unsuccessful HTTP response. |
| `500` | Unexpected backend error. |

The frontend expects `barcode` and `name` strings. The response is not persisted.

### `GET /api/health`

Returns a simple success response when the backend is running. It does not check
the availability of Open Food Facts; it checks that the backend can reach its
database.

## Running locally

Start the backend in one terminal:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

Start the frontend in another terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Open the Vite URL followed by `/barcode-demo` (usually
`http://localhost:5173/barcode-demo`).

The backend listens on port `8001`. The Vite proxy forwards fallback `/api`
requests to `http://localhost:8001`, as configured by `API_PROXY_TARGET` in `client/.env`.
The frontend API base URL is configured by `VITE_API_URL` and defaults to `/api`.

Quick API checks:

```bash
curl -i http://localhost:8001/api/health
curl -i http://localhost:8001/api/products/7290000000000
```

## Scanner behavior and troubleshooting

- Camera scanning, image decoding, and manual entry all call the same product
  lookup after obtaining a barcode.
- The scanner supports EAN-8 and EAN-13. Manual entry checks the digit count and
  numeric characters; it does not validate the EAN checksum.
- Camera access generally requires HTTPS, except on `localhost`. Permission and
  hardware availability are controlled by the browser and device.
- A `404` means Open Food Facts did not return a usable product name for that
  barcode; successful barcode decoding does not guarantee a catalog match.
- A `502` usually means the backend cannot reach `world.openfoodfacts.org`.
- If lookup works with `curl` but not through the frontend, check the Vite proxy,
  `VITE_API_URL`, backend port, and browser network errors.

Frontend checks, run from `client/`:

```bash
npm run build
npm run lint
```
