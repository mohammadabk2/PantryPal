##cd backend
##source .venv/bin/activate
##python server.py

##python3 -m venv .venv
##source .venv/bin/activate
##pip install -r requirements.txt


import logging
import os
from urllib.parse import quote

import httpx
import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import JSONResponse

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

OPEN_FOOD_FACTS_API = "https://world.openfoodfacts.org/api/v2/product"
EXTERNAL_LOOKUP_ERROR = {"error": "External product lookup failed"}


@app.get("/api/health")
def health() -> dict[str, str]:
    return {
        "status": "success",
        "message": "PantryPal Backend is running",
    }


@app.get("/api/products/{barcode}")
async def get_product(barcode: str) -> JSONResponse:
    url = f"{OPEN_FOOD_FACTS_API}/{quote(barcode, safe='')}.json"
    params = {"fields": "product_name,product_name_en"}

    try:
        async with httpx.AsyncClient(
            timeout=8.0,
            headers={"User-Agent": "PantryPal/1.0 (barcode lookup)"},
        ) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
    except httpx.HTTPStatusError as error:
        logger.error(
            "Open Food Facts returned HTTP %s",
            error.response.status_code,
        )
        return JSONResponse(status_code=502, content=EXTERNAL_LOOKUP_ERROR)
    except (httpx.RequestError, ValueError):
        logger.exception("Open Food Facts lookup failed")
        return JSONResponse(status_code=502, content=EXTERNAL_LOOKUP_ERROR)

    if not isinstance(data, dict):
        return JSONResponse(status_code=502, content=EXTERNAL_LOOKUP_ERROR)

    product = data.get("product")
    status = data.get("status")
    if status != 1 or isinstance(status, bool) or not isinstance(product, dict):
        return JSONResponse(status_code=404, content={"error": "Product not found"})

    name = next(
        (
            value.strip()
            for value in (product.get("product_name"), product.get("product_name_en"))
            if isinstance(value, str) and value.strip()
        ),
        None,
    )
    if name is None:
        return JSONResponse(status_code=404, content={"error": "Product not found"})

    return JSONResponse(content={"barcode": barcode, "name": name})


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "3000")),
    )
