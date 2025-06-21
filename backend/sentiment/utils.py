from collections import Counter
from typing import Optional
from fastapi.responses import JSONResponse
from sentiment.models import SentimentSummary
from database import db_reddits, db

def capitalize_product_name(product: str) -> str:
    # Capitalize the first letter of each word in the product name
    return ' '.join(word.capitalize() for word in product.split())


def get_new_sentiments(product: str, user_id: str) -> Optional[SentimentSummary]:
    def query_sentiments(collection, product: str):
        cursor = collection.find({"product": {"$regex": f"^{product}$", "$options": "i"}})
        return [doc.get("prediction") for doc in cursor if doc.get("prediction") in ["Positive", "Neutral", "Negative"]]

    # Thử tìm trong db_reddits
    sentiments = query_sentiments(db_reddits, product)

    # Nếu không có kết quả, thử private db
    db_private = db[user_id]
    if not sentiments:
        sentiments = query_sentiments(db_private, product)
        if not sentiments:
            return None  # Không có dữ liệu ở cả 2 nơi

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


def get_comments(product: str, user_id: str, limit=10):
    def query_comments(collection, product: str, limit=10):
        cursor = collection.find(
            {"product": {"$regex": f"^{product}$", "$options": "i"}},
            {"_id": 0, "text": 1, "author": 1, "score": 1, "created": 1, "prediction": 1}
        ).sort("score", -1).limit(limit)
        return list(cursor)

    # Thử tìm trong db_reddits
    comments = query_comments(db_reddits, product)

    # Nếu không có kết quả, thử private db
    db_private = db[user_id]
    if not comments:
        comments = query_comments(db_private, product)
        if not comments:
            return None  # Không có dữ liệu ở cả 2 nơi

    return comments