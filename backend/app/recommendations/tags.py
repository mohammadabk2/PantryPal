"""Tags offered to users when they pick what they like (signup, settings).

Users can still have weights for other tags (e.g. learned from recipes);
this is only the list shown as choices. Names are lowercase with underscores,
and the client shows each one through a translation key (tags.<name>),
so add a translation in every client language when you add a tag here.
"""

# Group name -> tags, in display order.
SUGGESTED_TAGS: dict[str, list[str]] = {
    "cuisine": ["middle_eastern", "mediterranean", "italian", "asian", "indian", "mexican"],
    "dish": ["breakfast", "salads", "soups", "baking", "desserts"],
    "style": ["quick", "healthy", "spicy", "comfort_food"],
    "ingredient": ["chicken", "beef", "fish", "eggs", "cheese", "pasta", "rice", "legumes", "vegetables"],
}
