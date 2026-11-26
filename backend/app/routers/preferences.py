from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status
from sqlalchemy import delete
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import CurrentUser
from app.models import DietaryRestriction, UserDietaryRestriction, UserFeatureWeight, UserTagWeight
from app.recommendations.tags import SUGGESTED_TAGS
from app.recommendations.weights import get_dietary_restrictions, get_feature_weights, get_tag_weights
from app.schemas.preferences import (
    DietaryRestrictionsRead,
    DietaryRestrictionsUpdate,
    PreferenceOptions,
    PreferencesRead,
    TagGroup,
    TagWeightRead,
    TagWeightUpdate,
)

# Every /me route works on the logged-in user only; there is no way to name another user.
router = APIRouter(tags=["preferences"])


def normalize_tag(tag: Annotated[str, Path(min_length=1, max_length=64)]) -> str:
    """Tags are stored trimmed and lowercase, so "Italian " and "italian" are the same tag."""
    tag = tag.strip().lower()
    if not tag:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Tag can't be empty")
    return tag


Tag = Annotated[str, Depends(normalize_tag)]
DB = Annotated[Session, Depends(get_db)]


def _sorted(restrictions: set[DietaryRestriction]) -> list[DietaryRestriction]:
    return sorted(restrictions, key=lambda r: r.value)


@router.get("/preferences/options", response_model=PreferenceOptions)
def preference_options():
    """Allowed values, so the client builds its choices from the server's list. No login needed."""
    return PreferenceOptions(
        dietary_restrictions=list(DietaryRestriction),
        tag_groups=[TagGroup(name=name, tags=tags) for name, tags in SUGGESTED_TAGS.items()],
    )


@router.get("/me/preferences", response_model=PreferencesRead)
def read_preferences(user: CurrentUser, db: DB):
    return PreferencesRead(
        dietary_restrictions=_sorted(get_dietary_restrictions(db, user.id)),
        tag_weights=get_tag_weights(db, user.id),
        feature_weights={f.value: w for f, w in get_feature_weights(db, user.id).items()},
    )


@router.put("/me/preferences/dietary-restrictions", response_model=DietaryRestrictionsRead)
def replace_dietary_restrictions(body: DietaryRestrictionsUpdate, user: CurrentUser, db: DB):
    """Replaces the user's whole list with the one sent. Send [] to clear it."""
    wanted = set(body.restrictions)
    db.execute(delete(UserDietaryRestriction).where(UserDietaryRestriction.user_id == user.id))
    db.add_all(UserDietaryRestriction(user_id=user.id, restriction=r.value) for r in wanted)
    db.commit()
    return DietaryRestrictionsRead(restrictions=_sorted(wanted))


@router.put("/me/preferences/tags/{tag}", response_model=TagWeightRead)
def set_tag_weight(tag: Tag, body: TagWeightUpdate, user: CurrentUser, db: DB):
    """Creates or updates how much the user likes this tag."""
    # Insert, or update if the row exists. One statement, so two requests at once can't clash.
    stmt = insert(UserTagWeight).values(user_id=user.id, tag=tag, weight=body.weight)
    stmt = stmt.on_conflict_do_update(
        index_elements=[UserTagWeight.user_id, UserTagWeight.tag],
        set_={"weight": stmt.excluded.weight, "updated_at": stmt.excluded.updated_at},
    )
    db.execute(stmt)
    db.commit()
    return TagWeightRead(tag=tag, weight=body.weight)


@router.delete("/me/preferences/tags/{tag}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag_weight(tag: Tag, user: CurrentUser, db: DB):
    """Back to neutral. Succeeds even if the user had no opinion on the tag."""
    db.execute(delete(UserTagWeight).where(UserTagWeight.user_id == user.id, UserTagWeight.tag == tag))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/me/preferences/feature-weights", status_code=status.HTTP_204_NO_CONTENT)
def reset_feature_weights(user: CurrentUser, db: DB):
    """"Reset my recommendations": forget what was learned and go back to the defaults."""
    db.execute(delete(UserFeatureWeight).where(UserFeatureWeight.user_id == user.id))
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
