from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from database import db_reddits, db_users, premium_db
from sentiment.models import SentimentSummary
from sentiment.utils import get_new_sentiments, capitalize_product_name
from auth.utils import get_current_user, require_enterprise
from bson.son import SON
import os

router = APIRouter()

CRAWL_API = os.getenv("CRAWL_API", "http://localhost:8090")


# Fetch sentiment summary for a product
@router.get("/summary", response_model=SentimentSummary)
def get_sentiment_summary(
    product: str = Query(..., min_length=1),
    current_user: str = Depends(get_current_user)
):
    summary = get_new_sentiments(product)
    if summary:
        return summary
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


# Submit analysis request for a product
@router.post("/submit-analysis")
def submit_analysis(
    product: str = Query(...),
    time_filter: str = Query(...),  # "week", "month", "year"
    requester: str = Depends(require_enterprise)
):
    exclusive_db = premium_db[f"reddits_{requester["_id"]}"]
    # Validate time_filter choice
    if time_filter not in ["week", "month", "year"]:
        raise HTTPException(status_code=400, detail="Invalid time_filter")

    # Check if product exists in DB
    latest_doc = exclusive_db.find_one(
        {"product": {"$regex": f"^{product}$", "$options": "i"}},
        sort=[("created", -1)]
    )

    if latest_doc and "created" in latest_doc:
        try:
            last_date = datetime.strptime(latest_doc["created"], "%Y-%m-%d")
            now = datetime.utcnow()
            delta_days = (now - last_date).days

            if delta_days < 7:
                raise HTTPException(status_code=400, detail="Product was crawled recently (less than 7 days ago).")
            elif delta_days < 30 and time_filter in ["month", "year"]:
                raise HTTPException(status_code=400, detail="Only 'week' is allowed. Too soon for 'month/year'.")
            elif delta_days < 365 and time_filter == "year":
                raise HTTPException(status_code=400, detail="Only 'week' or 'month' allowed. Too soon for 'year'.")
        except ValueError:
            raise HTTPException(status_code=500, detail="Invalid 'created' date format in DB.")

    # Trigger the crawl
    try:
        res = requests.post(f"{CRAWL_API}/crawl", json={
            "requester_id": requester,
            "keyword": product,
            "subreddits": ["technology", "gadgets"],
            "limit": 30,
            "time_filter": time_filter
        })
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail="Crawl server failed")
        return {"message": "Crawl triggered successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))