import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import CurrentUser
from app.models import PantryItem
from app.schemas.pantry_item import PantryItemCreate, PantryItemRead, PantryItemUpdate

router = APIRouter(tags=["pantry"])
DB = Annotated[Session, Depends(get_db)]


@router.post(
    "/me/pantry-items",
    response_model=PantryItemRead,
    status_code=status.HTTP_201_CREATED,
)
def add_item(body: PantryItemCreate, user: CurrentUser, db: DB):
    item = db.scalar(
        select(PantryItem).where(
            PantryItem.user_id == user.id,
            PantryItem.name == body.name,
            PantryItem.unit == body.unit,
            PantryItem.expiration_date == body.expiration_date,
        )
    )

    if item is None:
        item = PantryItem(user_id=user.id, **body.model_dump())
        db.add(item)
    else:
        item.quantity += body.quantity
        if item.barcode is None:
            item.barcode = body.barcode

    db.commit()
    db.refresh(item)
    return item


@router.get("/me/pantry-items", response_model=list[PantryItemRead])
def list_items(user: CurrentUser, db: DB):
    return db.scalars(
        select(PantryItem).where(PantryItem.user_id == user.id)
    ).all()


@router.put("/me/pantry-items/{item_id}", response_model=PantryItemRead)
def edit_item(item_id: uuid.UUID, body: PantryItemUpdate, user: CurrentUser, db: DB):
    item = db.scalar(
        select(PantryItem).where(
            PantryItem.id == item_id,
            PantryItem.user_id == user.id,
        )
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    for field, value in body.model_dump().items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


@router.delete("/me/pantry-items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: uuid.UUID, user: CurrentUser, db: DB):
    item = db.scalar(
        select(PantryItem).where(
            PantryItem.id == item_id,
            PantryItem.user_id == user.id,
        )
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    db.delete(item)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)