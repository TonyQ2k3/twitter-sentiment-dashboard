from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from database import db_summaries, db_reddits
from sentiment.models import SentimentSummary
from sentiment.utils import get_existing_sentiments, get_new_sentiments, capitalize_product_name
from auth.utils import get_current_user
from bson.son import SON

router = APIRouter()


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
        week_label = f"{item['_id']['year']}-{item['_id']['month']}-W{item['_id']['week']}"
        data = {"week": week_label, "Positive": 0, "Neutral": 0, "Negative": 0}
        for entry in item["counts"]:
            data[entry["sentiment"]] = entry["count"]
        output.append(data)
    return JSONResponse(content=output)