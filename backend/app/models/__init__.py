# Import every model here so Base.metadata sees all tables.
from app.models.base import Base
from app.models.user import User
from app.models.user_dietary_restriction import DietaryRestriction, UserDietaryRestriction
from app.models.user_feature_weight import Feature, UserFeatureWeight
from app.models.user_tag_weight import UserTagWeight

__all__ = [
    "Base",
    "DietaryRestriction",
    "Feature",
    "User",
    "UserDietaryRestriction",
    "UserFeatureWeight",
    "UserTagWeight",
]
