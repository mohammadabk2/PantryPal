# Barcode Scanner: Implementation and API Guide

This guide describes the current barcode demo: what each action does, which actions
send requests, how the frontend and backend connect, and how to configure or replace
the database.

## 1. What is implemented

- Live camera scanning, image-file scanning, and manual entry for **EAN-8 and EAN-13** barcodes.
- Preference for a rear-facing camera and a camera selector on devices with multiple cameras.
- A responsive scanner layout, touch-friendly controls, and a scan frame sized to the video.
- Local camera status and error messages.
- Product lookup through the demo Express API and PostgreSQL database, with an
  Open Food Facts fallback when a barcode is absent from the local database.
- A result card displaying the product name and barcode.
- Backend endpoints for creating products and reading/adding inventory, available for manual requests.

The scan page **does not create products or add scanned products to inventory**.
If a product is absent from the connected database, the backend looks it up in
Open Food Facts and returns its name without saving it to the local database.

The directory layout follows the organization of `database-setup`, but this demo
uses its own Express backend, not that branch's Python backend or authentication.

## 2. File responsibilities

Paths below are relative to the repository root.

| File | Responsibility |
| --- | --- |
| `client/src/components/BarcodeScanner.tsx` | Camera lifecycle, camera selection, local barcode decoding, image selection, manual barcode entry, and the `onScan` callback. No backend requests. |
| `client/src/pages/BarcodeDemo.tsx` | Connects `onScan` to product lookup; manages lookup loading, results, and errors. |
| `client/src/api/products.ts` | Defines the `Product` interface and `getProductByBarcode(barcode)`. |
| `client/src/api/barcodeclient.ts` | Provides `apiFetch`, API base URL handling, and `ApiError`. This demo helper currently sends GET requests only. |
| `client/src/main.tsx` | Registers the `/barcode-demo` route. |
| `client/src/i18n/index.ts` | Configures language detection, persistence, and document direction. |
| `client/src/locales/en/translation.json`, `client/src/locales/ar/translation.json` | English and Arabic UI translation strings. |
| `client/src/components/LanguageSwitcher.tsx` | Language selector shown on the home page. The selected language is cached for later visits. |
| `client/src/styles/BarcodeScanner.css` | Scanner controls, preview, upload area, and responsive styles. |
| `client/src/styles/BarcodeDemo.css` | Page navigation, spacing, heading, and product result styling. |
| `client/src/App.css`, `client/src/index.css` | Existing application/global styles, kept in their original locations. |
| `client/vite.config.ts` | Forwards development requests beginning with `/api` to `http://localhost:3000`. |
| `backend/src/server.ts` | Express routes, request validation, SQL queries, Open Food Facts fallback, and server startup. |
| `backend/src/db.ts` | Loads environment variables and creates the PostgreSQL connection pool. |
| `backend/.env` | Local database connection settings. Ignored by Git. |

## 3. Complete data flow

```text
Camera frames or selected image --decode locally--+
                                                  +--> onScan(barcode)
Manual entry --validate digits and length---------+         |
                                                            | JavaScript callback, not an HTTP request
                                                            v
BarcodeDemo.handleScan(barcode)
        |
        v
getProductByBarcode(barcode) -> apiFetch(path)
        |
        | GET /api/products/{barcode}
        v
Vite development proxy -> Express backend on port 3000
        |
        | Parameterized SQL query through the pg Pool
        v
PostgreSQL products table
        |
        | If absent, GET request to Open Food Facts
        v
Open Food Facts product catalog
        |
        | JSON product record, or HTTP error
        v
BarcodeDemo: display product or lookup error
```

Camera frames and uploaded images stay in the browser. Camera and image flows
decode locally; manual entry validates the typed value without decoding it. All
three flows pass the barcode string to the same lookup, which sends that value in
the URL. A SQL query from the backend to PostgreSQL is separate from the browser's
HTTP request.

## 4. Every scanner action

| Action | How to perform it | What the implementation does | Backend request? |
| --- | --- | --- | --- |
| Open the page | Visit `/barcode-demo`. | Renders the scanner. Does not automatically start the camera or look up products. | No product/API request. Normal page and asset loading still occurs. |
| Start camera | Click **Start camera** and grant permission. | `startCamera()` checks browser camera availability and secure context, initializes `Html5Qrcode`, and awaits `scanner.start(...)`. | No. The browser requests camera permission/access, not a backend endpoint. |
| Read camera status | Look at the status badge. | `loading` and `running` control `Working…`, `Camera on`, or `Ready to scan`. | No. |
| List cameras | Start the camera successfully. | `Html5Qrcode.getCameras()` updates the local camera list. Enumeration errors are ignored. | No. |
| Change camera | Stop scanning, select a camera, then click **Start camera** again. | Updates `cameraId`. The next start uses that ID. Automatic mode prefers the rear camera with `facingMode: "environment"`. | No. |
| Stop camera | Click **Stop camera**. | Awaits `scanner.stop()`, sets `running` to `false`, and displays `Camera stopped`. | No. |
| Detect a camera barcode | Hold a supported barcode in the scan area. | Decodes locally, blocks duplicate callbacks with `busyRef`, attempts to stop the camera, then calls `onScan(barcode)`. | The scanner itself sends none; the demo page then sends one product lookup. |
| Select an image | Stop the camera, expand **Have a photo? Upload a barcode image**, and choose a file. | Checks the image MIME type and uses ZXing to decode a temporary local image URL. | None until decoding succeeds. No image upload to the backend. |
| Decode an image successfully | Choose a readable EAN-8/EAN-13 image. | Calls `onScan(barcode)`, revokes the temporary image URL, and resets the file input. | The demo page sends one product lookup. |
| Enter a barcode manually | Expand **Couldn’t scan? Enter the barcode manually**, enter 8 or 13 digits, and select **Search**. | Validates the length and numeric characters, then calls `onScan(barcode)`. It does not check the EAN check digit. | The demo page sends one product lookup. |
| Change the interface language | Use the language selector on the home page, then open the scanner. | The UI supports English and Arabic. The selected language is stored in local storage and the document direction is updated for RTL. | No product/API request. |
| Fail to decode an image | Select an unreadable or unsupported barcode image. | Displays a local decoding error and resets loading/file selection. | No product lookup. |
| Receive a lookup result | Scan a barcode or submit a manual entry, then wait. | The page shows the returned name and barcode, a not-found message, or a lookup failure. | This is the response to the existing GET, not another request. |
| Leave the page | Navigate away/unmount the scanner. | The effect cleanup attempts to stop the scanner. | No. |

### Camera status and local state

```tsx
const [running, setRunning] = useState(false);
```

- After `await scanner.start(...)` resolves, the component sets `running = true`.
- After a successful manual stop, it sets `running = false`.
- After a camera barcode is decoded, it attempts to stop the camera and sets `running = false`.
- `loading` inside the scanner means camera startup or image decoding is in progress.
- `loading` in the page means an HTTP product lookup is in progress; the page passes it as `disabled` to the scanner.

There is **no camera-status API**, polling request, or database field tracking the
camera. `running` reflects the component's lifecycle state; it is not continuous
hardware monitoring. Camera interruptions outside the component may require
additional handling. The badge `Ready to scan` is not proof of granted permission.

The live scanner targets 10 decoding attempts per second. The scan frame is capped
at 300 × 150 pixels and scaled down to fit the video. Frames without a readable
barcode do not send requests. One camera session stops after its first accepted
barcode; click **Start camera** again to scan another product.

## 5. Product lookup request

`getProductByBarcode` URL-encodes the barcode and calls:

```http
GET /api/products/7290000000000
```

This request has no JSON body and the demo helper sends no authentication token.
Camera, image, and manual-entry flows use the same lookup function. The camera and
image flows provide a locally decoded barcode; manual entry provides the validated
text value. The backend checks PostgreSQL first and calls Open Food Facts only if
the local product table has no matching row. The external result is returned to
the page but is not inserted into PostgreSQL.

The backend first executes:

```sql
SELECT * FROM products WHERE barcode = $1
```

The barcode is passed separately as the query parameter, rather than interpolated
into the SQL text. If there is no matching row, the backend requests that barcode
from `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`, asking for
the product name in the available default or English field.

### Responses

| Status | Backend response | Page behavior |
| --- | --- | --- |
| `200` | Matching database row, or an Open Food Facts result with `barcode` and `name`. | Displays product name and barcode. |
| `404` | Neither the database nor Open Food Facts has a named product for the barcode. | Displays `Barcode ...: Product not found`. |
| `500` | `{ "error": "Server error" }` | Displays a general lookup failure. Details are logged by the backend. |
| `502` | Open Food Facts is unreachable, times out, or returns an unsuccessful HTTP response. | Displays a general lookup failure; details are logged by the backend. |
| Network failure | No HTTP response; `ApiError` has status `0`. | Displays a general lookup failure. |

Example success body for a database result (the server may return additional columns):

```json
{ "id": 1, "barcode": "7290000000000", "name": "Milk" }
```

The frontend expects `barcode: string` and `name: string`. Only database results
include an `id`.
The TypeScript interface documents this shape but does not validate JSON at runtime.
The HTTP helper uses the response status text for non-success responses; it does
not currently extract the backend JSON `error` message. Invalid JSON on a successful
response also results in the page's general lookup error.

The page clears the previous product before starting a lookup and uses `requestId`
to ignore older responses when a newer lookup exists. This does not cancel the
older network request.

## 6. Other backend endpoints

These endpoints exist in `backend/src/server.ts`, but **the current scanner page
never calls them**. Use an API client or the manual commands below to exercise them.

| Method and path | Input | Database operation | Responses |
| --- | --- | --- | --- |
| `GET /api/health` | None. | `SELECT 1` to check connectivity. | `200` success message; `500` database connection error. |
| `POST /api/products` | JSON `barcode`, `name`. | Inserts a product into `products`. | `201` created row; `400` invalid input; `409` duplicate barcode; `500` server error. |
| `POST /api/inventory` | JSON `productId`, `quantity`, optional `expiryDate`. | Inserts an `inventory_items` row for demo user ID `1`. | `201` created row; `400` invalid product ID or quantity; `500` insertion failure. |
| `GET /api/inventory` | None. | Joins `inventory_items` with `products` for demo user ID `1`. | `200` array of items; `500` load failure. |

Product creation accepts a barcode string containing 8–14 digits and a nonempty
name, which is trimmed before insertion. This server validation is broader than
the scanner's EAN-8/EAN-13 decoding configuration; it does not validate EAN checksums.

Inventory insertion requires positive integer `productId` and `quantity`.
`expiryDate` defaults to SQL null if omitted; its format is not explicitly validated
by the route. Invalid dates or foreign-key failures can therefore return `500`.

The inventory list returns `id`, `name`, `barcode`, `quantity`, and `expiry_date`.
There is no user login integration in these routes: `DEMO_USER_ID = 1` is hard-coded
in `backend/src/server.ts`. There are no update/delete inventory routes in this demo.

## 7. Where the database is

The database is a **PostgreSQL service**, not a file inside the React component or
inside this repository. `backend/src/db.ts` is connection code, not the data itself:

```ts
import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
```

At the time this guide was updated, the local configuration pointed to:

| Setting | Local value |
| --- | --- |
| Host | `localhost` |
| Port | `5432` |
| Database name | `pantrypal_demo` |
| Configuration file | `backend/.env` |

These values describe configuration, not a verified running connection. Credentials
are intentionally not included here. The actual data files are managed by the
PostgreSQL installation/service. Their disk location cannot be determined from the
application source. An inherited `DATABASE_URL` environment variable can override
the value loaded from `.env`.

### Required database structure

The code expects these tables and columns:

| Table | Columns used by the code | Purpose |
| --- | --- | --- |
| `products` | `id`, `barcode`, `name` | Product catalog and barcode lookup. `barcode` needs a unique constraint for the product creation query. |
| `inventory_items` | `id`, `user_id`, `product_id`, `quantity`, `expiry_date` | Demo user's inventory. `product_id` joins to `products.id`. |

The original database may contain additional columns, tables, constraints, or user
relationships. If `user_id` references a users table, user `1` must exist before
inventory insertion. The scan/lookup flow itself only needs `products`.

There is currently **no committed SQL initialization/migration script for this
demo**, and starting Express does not create a database or its tables. This guide
has not inspected the live database schema.

### Minimal product table for a new demo database

The following is an **example setup for a new demo database**, not a migration or
a claim about the current schema. Run it in a PostgreSQL SQL editor connected to
the database you intend to use:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  barcode TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL
);
```

That table is enough for product creation and lookup. To exercise the inventory
endpoints in an isolated demo database, an example compatible table is:

```sql
CREATE TABLE inventory_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  expiry_date DATE
);
```

This minimal example deliberately has no users-table foreign key; it is not the
full database-setup schema. No schema changes are executed by reading this guide.

## 8. Changing the connected database

### Another PostgreSQL database with the same schema

1. Create or select the target PostgreSQL database and make sure it is reachable.
2. Create/migrate the required tables and copy any products you want to look up.
   Changing the URL alone does not transfer data.
3. Edit `backend/.env`:

   ```env
   DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@YOUR_HOST:5432/YOUR_DATABASE
   PORT=3000
   ```

4. Use credentials and connection options supplied by that PostgreSQL service.
   URL-encode special characters in the username/password. For hosted databases,
   use the provider's required TLS configuration.
5. Stop and restart the backend from `backend/`:

   ```bash
   npx tsx src/server.ts
   ```

6. Check `/api/health`, then look up a known barcode in the target database.

No frontend change is required when only the PostgreSQL host/database changes and
the backend URL and response format stay the same. Keep database credentials in
the backend; never put `DATABASE_URL` in frontend source or `VITE_*` variables.
`backend/.env` is ignored by the backend Git ignore rules.

`dotenv/config` loads `.env` relative to the process working directory by default,
so the documented startup commands run from `backend/`. If a shell or deployment
already sets `DATABASE_URL`, update that setting as well. Restart the process after
changing it because the connection pool is created at startup.

### A database with different table or column names

Update the SQL queries in `backend/src/server.ts` to match the target schema.
Preserve the API response fields `id`, `barcode`, and `name`, using SQL aliases or
an explicit response mapping if needed. If you change the API shape, also update
`Product` in `client/src/api/products.ts` and the fields rendered in the page.

### A different database engine or the database branch backend

Changing `DATABASE_URL` is enough only for compatible PostgreSQL connections.
SQLite, MySQL, or another engine requires a different driver/connection layer and
adapted SQL. Switching to the Python backend requires implementing matching product
routes there; matching directory layouts does not automatically provide them.

The scanner can stay unchanged because it only emits barcode strings. Reuse the
target frontend's existing HTTP helper and authentication if integrating into an
application that already has them.

## 9. Frontend API address versus database address

These are different settings:

| Setting | Location | Controls |
| --- | --- | --- |
| `DATABASE_URL` | `backend/.env` or backend process environment | Backend-to-PostgreSQL connection. |
| `PORT` | Backend environment | Express listening port; defaults to `3000`. |
| `VITE_API_URL` | `client/.env` | Browser API base URL; defaults to `/api`. |
| `server.proxy["/api"].target` | `client/vite.config.ts` | Development proxy destination; currently `http://localhost:3000`. |

For example, a frontend base URL of `/api` plus the product path
`/products/7290000000000` gives `/api/products/7290000000000`.
To call a different backend directly:

```env
VITE_API_URL=https://your-api.example.com/api
```

Restart Vite after changing its environment. Production builds embed `VITE_*`
settings, so rebuild when changing them for deployment. Direct requests to another
origin require backend CORS configuration; the current Express demo does not
configure it. Prefer a same-origin proxy or explicitly add the required CORS setup.

If changing Express to port `4000`, also update the Vite proxy target to
`http://localhost:4000`. A remote backend's `localhost` refers to that backend host,
not your development computer.

The current proxy configuration applies to `npm run dev`, not automatically to
production hosting or `npm run preview`. Configure production API routing separately.

## 10. Running and testing

### Start the backend

Install Node.js/npm and have PostgreSQL available. Configure `backend/.env`, then:

```bash
cd backend
npm install
npx tsx src/server.ts
```

The default backend URL is `http://localhost:3000`. The backend package currently
has no `npm start` script; use the command above.

### Start the frontend in a second terminal

```bash
cd client
npm install
npm run dev
```

Open the Vite URL followed by `/barcode-demo` (usually
`http://localhost:5173/barcode-demo`; use the port Vite actually prints).

### Test the API without a camera

Connectivity check:

```bash
curl -i http://localhost:3000/api/health
```

A successful health check confirms database connectivity, but does not verify that
the product/inventory tables exist. Create a sample product only in the intended
demo database (this request writes a row):

```bash
curl -i -X POST http://localhost:3000/api/products \
  -H 'Content-Type: application/json' \
  -d '{"barcode":"4006381333931","name":"Demo product"}'
```

If that barcode already exists, the endpoint returns `409`. Look it up:

```bash
curl -i http://localhost:3000/api/products/4006381333931
```

Then upload an image, scan an EAN-13 barcode, or expand the manual-entry panel and
enter `4006381333931`. The page should display `Demo product` (or the existing
product name). For a barcode that is not in the local database but exists in Open
Food Facts, the page displays the external product name the same way. In browser
DevTools, open **Network** and filter for `products` to see the GET request and
response.

To test inventory manually, replace `1` below with an actual product ID returned
by your database. This request writes an inventory row and requires the inventory
schema and any required demo user record:

```bash
curl -i -X POST http://localhost:3000/api/inventory \
  -H 'Content-Type: application/json' \
  -d '{"productId":1,"quantity":2,"expiryDate":"2030-12-31"}'

curl -i http://localhost:3000/api/inventory
```

These examples document requests; they are not automatically executed by the scanner.

## 11. Reusing the scanner component

```tsx
import BarcodeScanner from './components/BarcodeScanner'

export default function Example() {
  return (
    <BarcodeScanner
      onScan={(barcode) => console.log('Barcode:', barcode)}
      disabled={false}
    />
  )
}
```

- `onScan` is required and receives a decoded or manually entered barcode as a string.
- `disabled` is optional and defaults to `false`; it disables camera startup, image
  upload, and manual entry. It does not automatically stop an already-running camera.
- The consumer decides whether to look up a product, fill a form, or do something else.
- Reuse requires React, `html5-qrcode`, `@zxing/browser`, `@zxing/library`, and the scanner CSS.
- Element IDs use React `useId`, avoiding fixed-ID collisions between instances.
  This does not guarantee that the device supports simultaneous camera streams.

## 12. Device requirements and troubleshooting

| Problem | What to check |
| --- | --- |
| Camera unavailable on a phone | Use HTTPS and grant camera permission. Plain HTTP over a local-network IP is not a secure camera context. `localhost` on a phone means the phone itself. |
| Wrong camera | Stop scanning, select another camera, and restart. Rear-camera mode is a preference, not a guarantee about a particular lens. |
| Permission denied | Allow camera access in browser/site settings or use an image. |
| Camera busy | Close other apps/tabs using the camera and retry. |
| Image cannot be decoded | Use a supported EAN-8/EAN-13 barcode with clear focus, full bars, and good lighting. The code checks image MIME type; browser image format support still applies. |
| Product returns `404` | Check that the barcode exists in either the connected database or Open Food Facts and that the external entry has a product name. A successful decode does not imply a known product. |
| Product lookup returns `502` | Check backend connectivity to `world.openfoodfacts.org`; the local database lookup remains available, but missing products require the external service. |
| Health returns `500` | Check the backend environment, PostgreSQL service, credentials, reachability, and any required TLS settings. |
| Health succeeds but lookup returns `500` | Inspect backend logs and verify the `products` table and its schema. |
| Lookup fails only through frontend | Verify Vite proxy destination, API base URL, backend port, and CORS if using another origin. |
| Changing `.env` has no effect | Restart the relevant process and check for an overriding environment variable. |

The layout supports phones, tablets, desktop widths, and landscape orientation.
Actual camera behavior still depends on the browser, OS, permissions, and hardware.
Physical Android/iOS camera compatibility and the live database schema have not
been verified by the build/lint checks.

Frontend checks, run from `client/`:

```bash
npm run build
npm run lint
```

The backend package's `npm test` is currently a placeholder that exits with an
error; it is not an automated API/database test suite.
