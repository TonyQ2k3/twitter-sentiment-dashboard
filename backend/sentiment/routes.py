from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from database import db_summaries, db_reddits, db_users
from sentiment.models import SentimentSummary
from sentiment.utils import get_existing_sentiments, get_new_sentiments, capitalize_product_name
from auth.utils import get_current_user, require_enterprise
from bson.son import SON

router = APIRouter()


# Fetch sentiment summary for a product
@router.get("/summary", response_model=SentimentSummary)
def get_sentiment_summary(
    product: str = Query(..., min_length=1),
    current_user: str = Depends(get_current_user)
):
    # Find existing sentiments in the db_summary, if not found, get new sentiments from db_reddits
    existing_summary = get_existing_sentiments(product)
    if existing_summary:
        return existing_summary
    else:
        new_summary = get_new_sentiments(product)
        if new_summary:
            return new_summary
        else:
            return SentimentSummary(
                product=capitalize_product_name(product),
                total=0,
                positive=0,
                neutral=0,
                negative=0,
                irrelevant=0,
            )
            

# Fetch most popular comments for a product
@router.get("/top-comments")
def get_top_comments(
    product: str = Query(..., min_length=1), 
    limit: int = 10,
    current_user: str = Depends(get_current_user)
):
    cursor = db_reddits.find(
        {"product": {"$regex": f"^{product}$", "$options": "i"}},
        {"_id": 0, "text": 1, "author": 1, "score": 1, "created": 1, "prediction": 1}
    ).sort("score", -1).limit(limit)
    
    comments = list(cursor)
    return JSONResponse(content=comments)


# Aggreggate weekly sentiment data
@router.get("/weekly")
def get_weekly_sentiment(
    product: str = Query(..., min_length=1),
    current_user: str = Depends(get_current_user)
):
    pipeline = [
        {"$match": {
            "product": {"$regex": f"^{product}$", "$options": "i"},
            "prediction": {"$in": ["Positive", "Neutral", "Negative"]},
            "created": {"$type": "string"}
        }},
        {"$addFields": {
            "created_date": {
                "$dateFromString": {
                    "dateString": "$created",
                    "format": "%Y-%m-%d"
                }
            }
        }},
        {"$addFields": {
            "week": {"$isoWeek": "$created_date"},
            "year": {"$isoWeekYear": "$created_date"},
            "month": {"$month": "$created_date"}
        }},
        {"$group": {
            "_id": {
                "year": "$year",
                "month": "$month",
                "week": "$week",
                "prediction": "$prediction"
            },
            "count": {"$sum": 1}
        }},
        {"$group": {
            "_id": {
                "year": "$_id.year",
                "month": "$_id.month",
                "week": "$_id.week"
            },
            "counts": {
                "$push": {
                    "sentiment": "$_id.prediction",
                    "count": "$count"
                }
            }
        }},
        {"$sort": SON([("_id.year", 1), ("_id.month", 1), ("_id.week", 1)])}
    ]
    results = db_reddits.aggregate(pipeline)
    output = []
    for item in results:
        week_label = f"{item['_id']['year']}-{item['_id']['month']}-W{item['_id']['week']%4+1}"
        data = {"week": week_label, "Positive": 0, "Neutral": 0, "Negative": 0}
        for entry in item["counts"]:
            data[entry["sentiment"]] = entry["count"]
        output.append(data)
    return JSONResponse(content=output)


# Aggreggate monthly sentiment data
@router.get("/monthly")
def get_monthly_sentiment(
    product: str = Query(..., min_length=1), 
    current_user: str = Depends(get_current_user)
):
    pipeline = [
        {"$match": {
            "product": {"$regex": f"^{product}$", "$options": "i"},
            "prediction": {"$in": ["Positive", "Neutral", "Negative"]},
            "created": {"$type": "string"}
        }},
        {"$addFields": {
            "created_date": {
                "$dateFromString": {
                    "dateString": "$created",
                    "format": "%Y-%m-%d"
                }
            }
        }},
        {"$addFields": {
            "year": {"$year": "$created_date"},
            "month": {"$month": "$created_date"}
        }},
        {"$group": {
            "_id": {
                "year": "$year",
                "month": "$month",
                "prediction": "$prediction"
            },
            "count": {"$sum": 1}
        }},
        {"$group": {
            "_id": {
                "year": "$_id.year",
                "month": "$_id.month"
            },
            "counts": {
                "$push": {
                    "sentiment": "$_id.prediction",
                    "count": "$count"
                }
            }
        }},
        {"$sort": SON([("_id.year", 1), ("_id.month", 1)])}
    ]

    results = db_reddits.aggregate(pipeline)
    output = []
    for item in results:
        month_label = f"{item['_id']['year']}-{item['_id']['month']:02}"
        data = {"month": month_label, "Positive": 0, "Neutral": 0, "Negative": 0}
        for entry in item["counts"]:
            data[entry["sentiment"]] = entry["count"]
        output.append(data)
    return JSONResponse(content=output)


# Add a new tracked product to the user's list
@router.post("/track-product")
def add_tracked_product(product: str = Query(...), user=Depends(require_enterprise)):
    if product not in user["tracked_products"]:
        db_users.update_one(
            {"email": user["email"]},
            {"$addToSet": {"tracked_products": product}}
        )
    return {"msg": f"Tracking {product}"}


# Remove a tracked product from the user's list
@router.post("/untrack-product")
def untrack_product(product: str = Query(...), user=Depends(require_enterprise)):
    db_users.update_one(
        {"email": user["email"]},
        {"$pull": {"tracked_products": product}}
    )
    return {"msg": f"Stopped tracking '{product}'"}


# Fetch all tracked products for the user
@router.get("/tracked-products")
def get_tracked_products(user=Depends(require_enterprise)):
    return {"tracked_products": user.get("tracked_products", [])}