from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from typing import Optional
from collections import Counter
from pydantic import BaseModel
from dotenv import load_dotenv
from datetime import datetime
import os
from bson.son import SON

try:
    print("Loading environment vars")
    load_dotenv()
    print("Loaded environment vars\n")
except Exception as e:
    print(f"Error loading environment vars: {e}")

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
uri = os.getenv("MONGO_URI")
try:
    client = MongoClient(uri)
    db = client["main"]
    db_reddits = db["reddits"]
    db_summaries = db["summaries"]
    print("Connected to MongoDB: ", uri)
except Exception as e:
    print(f"An error occurred: {e}")


class SentimentSummary(BaseModel):
    product: str
    total: int = 0
    positive: int = 0
    neutral: int = 0
    negative: int = 0
    irrelevant: int = 0
    

def capitalize_product_name(product: str) -> str:
    # Capitalize the first letter of each word in the product name
    return ' '.join(word.capitalize() for word in product.split())
    
    
def get_existing_sentiments(product: str) -> Optional[SentimentSummary]:
    # Case-insensitive search for product in summaries
    document = db_summaries.find_one({"product": {"$regex": f"^{product}$", "$options": "i"}})
    
    if document:
        return SentimentSummary(
            product=document["product"],
            total=document["total"],
            positive=document["positive"],
            neutral=document["neutral"],
            negative=document["negative"],
        )
    return None


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
    # Insert summary into MongoDB for future query
    db_summaries.insert_one(summary.dict())
    return summary
    


@app.get("/sentiment-summary", response_model=SentimentSummary)
def get_sentiment_summary(product: str = Query(..., min_length=1)):
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
            
            
@app.get("/top-comments")
def get_top_comments(product: str = Query(..., min_length=1), limit: int = 10):
    cursor = db_reddits.find(
        {"product": {"$regex": f"^{product}$", "$options": "i"}},
        {"_id": 0, "text": 1, "author": 1, "score": 1, "created": 1, "prediction": 1}
    ).sort("score", -1).limit(limit)
    
    comments = list(cursor)
    return JSONResponse(content=comments)



@app.get("/weekly-sentiment")
def get_weekly_sentiment(product: str = Query(..., min_length=1)):
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