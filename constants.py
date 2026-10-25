# This file contains constants used in the getPriceData.py

SHUFERSAL_URL = "https://prices.shufersal.co.il/"

# Define ONLY the tags you want to keep
TAGS_TO_KEEP_RAMI_LEVI = {
    "ItemCode",
    "ItemName",
    "ItemPrice",
    "Quantity",
}

TaGS_TO_KEEP_SHUFERSAL = {
    "ItemCode",
    "ItemName",
    "ItemPrice",
    "Quantity",
}

# Structural container tags that are required to keep the XML hierarchy intact
CONTAINER_TAGS = {
    "root",
    "Items",
    "Item",
    "Prices",
    "Store",
    "ChainId",
    "SubChainId",
    "StoreId",
}

# Hebrew keywords that identify non-food products. Matched as substrings of ItemName.
NON_FOOD_KEYWORDS = [
    # Cleaning / laundry
    "אבקת כביסה",
    "ג'ל כביסה",
    "מרכך כביסה",
    "נוזל כלים",
    "טבליות למדיח",
    "מלח למדיח",
    "חומר ניקוי",
    "אקונומיקה",
    "מנקה",
    "מסיר כתמים",
    "מטהר אוויר",
    "מי ג'אוולי",
    "מטליות",
    "ספוג",
    "צמר פלדה",
    "שקיות אשפה",
    "כפפות",
    "קוטל חרקים",
    "קוטל",
    "מגבונים",
    "מגבון",
    # Paper / household
    "נייר טואלט",
    "נייר סופג",
    "מגבות נייר",
    "מפיות",
    "נייר אלומיניום",
    "נייר אפייה",
    "ניילון נצמד",
    "שקיות סנדוויץ",
    "כלים חד פעמיים",
    "צלחות חד פעמיות",
    "כוסות חד פעמיות",
    "סוללות",
    "נורה",
    "מצית",
    "נרות",
    # Personal care / cosmetics
    "שמפו",
    "מרכך שיער",
    "סבון",
    "ג'ל רחצה",
    "דאודורנט",
    "משחת שיניים",
    "מברשת שיניים",
    "שטיפת פה",
    "חוט דנטלי",
    "סכיני גילוח",
    "סכין גילוח",
    "קרם פנים",
    "קרם ידיים",
    "קרם גוף",
    "קרם לחות",
    "קרם הגנה",
    "תחליב גוף",
    "בושם",
    "לק",
    "מסקרה",
    "שפתון",
    "צבע לשיער",
    "תחבושות",
    "טמפונים",
    "חיתולים",
    "חיתול",
    "מטרנה",
    "פדים",
    "מקלוני אוזניים",
    "צמר גפן",
    "פלסטר",
    "קונדומים",
    # Pets
    "מזון לכלב",
    "מזון לחתול",
    "מזון לכלבים",
    "מזון לחתולים",
    "חול לחתולים",
]