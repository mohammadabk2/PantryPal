import uuid
from datetime import date
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, model_validator


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


class PantryItemUpdate(BaseModel):
    name: ItemName | None = None
    quantity: Quantity | None = None
    unit: Unit | None = None
    expiration_date: date | None = None
    barcode: Barcode | None = None

    @model_validator(mode="after")
    def validate_update_fields(self) -> "PantryItemUpdate":
        if not self.model_fields_set:
            raise ValueError("At least one field must be provided")
        for field in ("name", "quantity", "unit"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null")
        return self


class PantryItemRead(PantryItemCreate):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID