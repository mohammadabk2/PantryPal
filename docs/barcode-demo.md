# Barcode demo layout

The branch is based on main. The frontend files from main are organized under
client/src with package and build configuration under client/, matching the
folder layout of database-setup without importing its features or files.

- components/BarcodeScanner.tsx: decode a camera/image barcode and emit onScan.
- api/client.ts: shared HTTP helper for this demo.
- api/products.ts: product lookup.
- pages/BarcodeDemo.tsx: orchestrate lookup and display the product.

Run npm install and npm run dev from client/ and open /barcode-demo.
Run npm install and npx tsx src/server.ts from backend/ to start the original
Express barcode demo. Configure backend/.env with DATABASE_URL pointing to the
existing demo database (products, inventory_items, demo user ID 1).
Vite forwards /api to localhost:3000. No database-setup backend is included.
