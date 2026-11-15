from pydantic import BaseModel, Field

from app.models import DietaryRestriction
from app.recommendations.weights import TAG_WEIGHT_MAX, TAG_WEIGHT_MIN


class PreferencesRead(BaseModel):
    """Body of GET /api/me/preferences."""

    dietary_restrictions: list[DietaryRestriction]
    # Tag -> weight from -1 (dislikes) to +1 (loves). Tags not listed are neutral.
    tag_weights: dict[str, float]
    # Feature -> weight, defaults included. Read-only: changed by the recommender, not the user.
    feature_weights: dict[str, float]


class DietaryRestrictionsUpdate(BaseModel):
    """Body of PUT /api/me/preferences/dietary-restrictions. Replaces the whole list."""

    # Unknown values are rejected with 422. Duplicates are ignored.
    restrictions: list[DietaryRestriction] = Field(max_length=len(DietaryRestriction))


class DietaryRestrictionsRead(BaseModel):
    restrictions: list[DietaryRestriction]


class TagWeightUpdate(BaseModel):
    """Body of PUT /api/me/preferences/tags/{tag}."""

    weight: float = Field(ge=TAG_WEIGHT_MIN, le=TAG_WEIGHT_MAX)


class TagWeightRead(BaseModel):
    tag: str
    weight: float


class PreferenceOptions(BaseModel):
    """Body of GET /api/preferences/options: the values the client can offer."""

    dietary_restrictions: list[DietaryRestriction]
