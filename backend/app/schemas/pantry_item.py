import uuid
from datetime import date
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


ItemName = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=200)
]
Unit = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=32)
]
Barcode = Annotated[
    str, StringConstraints(strip_whitespace=True, min_length=1, max_length=64)
]
Quantity = Annotated[
    Decimal, Field(gt=0, max_digits=10, decimal_places=3)
]


class PantryItemCreate(BaseModel):
    name: ItemName
    quantity: Quantity
    unit: Unit
    expiration_date: date | None = None
    barcode: Barcode | None = None


class PantryItemUpdate(PantryItemCreate):
    pass


class PantryItemRead(PantryItemCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID