from collections import Counter
from typing import Optional
from sentiment.models import SentimentSummary
from database import db_reddits


def capitalize_product_name(product: str) -> str:
    # Capitalize the first letter of each word in the product name
    return ' '.join(word.capitalize() for word in product.split())


def get_new_sentiments(product: str) -> Optional[SentimentSummary]:
    # Case-insensitive search for product
    cursor = db_reddits.find({"product": {"$regex": f"^{product}$", "$options": "i"}})
    sentiments = [doc.get("prediction") for doc in cursor if doc.get("prediction") in ["Positive", "Neutral", "Negative"]]
    counts = Counter(sentiments)
    total = sum(counts.values())
    
    product_name = capitalize_product_name(product)

    summary = SentimentSummary(
        product=product_name,
        total=total,
        positive=counts.get("Positive", 0),
        neutral=counts.get("Neutral", 0),
        negative=counts.get("Negative", 0),
    )
    return summary