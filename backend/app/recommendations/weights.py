"""Default weights for the scoring factors, and reading a user's personalized values.

A recipe's score for a user is roughly:
    score = Σ weight[feature] × feature_value(recipe, user)
where features in NEGATIVE_FEATURES count against the recipe.
The factors themselves are listed in Feature (app/models/user_feature_weight.py).
"""

import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import DietaryRestriction, Feature, UserDietaryRestriction, UserFeatureWeight, UserTagWeight

# These lower the score instead of raising it.
NEGATIVE_FEATURES = frozenset({Feature.MISSING, Feature.COST})

# Starting guesses for everyone (the rule-based baseline). Tune these as you test.
# Expiring is highest because reducing food waste is the app's main goal.
DEFAULT_FEATURE_WEIGHTS: dict[Feature, float] = {
    Feature.PANTRY: 1.0,
    Feature.EXPIRING: 1.5,
    Feature.LIKES: 1.0,
    Feature.RATING: 0.8,
    Feature.MISSING: 0.5,
    Feature.COST: 0.3,
}

# Allowed range for user_tag_weights.weight (matches the database check).
TAG_WEIGHT_MIN = -1.0
TAG_WEIGHT_MAX = 1.0


def get_feature_weights(db: Session, user_id: uuid.UUID) -> dict[Feature, float]:
    """The user's weights: defaults, with any personalized values on top."""
    weights = dict(DEFAULT_FEATURE_WEIGHTS)
    rows = db.execute(
        select(UserFeatureWeight.feature, UserFeatureWeight.weight).where(UserFeatureWeight.user_id == user_id)
    )
    for feature, weight in rows:
        try:
            weights[Feature(feature)] = weight
        except ValueError:
            continue  # a feature that was removed from the code; ignore its old rows
    return weights


def get_tag_weights(db: Session, user_id: uuid.UUID) -> dict[str, float]:
    """Tag -> weight. Tags the user has no opinion on are missing (treat as 0)."""
    rows = db.execute(select(UserTagWeight.tag, UserTagWeight.weight).where(UserTagWeight.user_id == user_id))
    return dict(rows.tuples().all())


def get_dietary_restrictions(db: Session, user_id: uuid.UUID) -> set[DietaryRestriction]:
    rows = db.scalars(
        select(UserDietaryRestriction.restriction).where(UserDietaryRestriction.user_id == user_id)
    )
    return {DietaryRestriction(r) for r in rows if r in DietaryRestriction._value2member_map_}
