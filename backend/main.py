from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from typing import Optional
from collections import Counter
from pydantic import BaseModel
from dotenv import load_dotenv
import os

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
try:
    client = MongoClient("mongodb+srv://admin:01122003@cluster0.atbocxy.mongodb.net/")
    db = client["main"]
    db_tweets = db["tweets"]
    db_summaries = db["summaries"]
    print("Connected to MongoDB")
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
    cursor = db_summaries.find({"product": {"$regex": f"^{product}$", "$options": "i"}})
    
    # Retrieve the first matching document
    existing_summary = cursor.next() if cursor.count() > 0 else None
    
    if existing_summary:
        return SentimentSummary(
            product=existing_summary["product"],
            total=existing_summary["total"],
            positive=existing_summary["positive"],
            neutral=existing_summary["neutral"],
            negative=existing_summary["negative"],
            irrelevant=existing_summary["irrelevant"],
        )
    return None


def get_new_sentiments(product: str) -> Optional[SentimentSummary]:
    # Case-insensitive search for product
    cursor = db_tweets.find({"product": {"$regex": f"^{product}$", "$options": "i"}})
    sentiments = [doc.get("prediction") for doc in cursor if doc.get("prediction") in ["Positive", "Neutral", "Negative", "Irrelevant"]]
    counts = Counter(sentiments)
    total = sum(counts.values())
    
    product_name = capitalize_product_name(product)

    summary = SentimentSummary(
        product=product_name,
        total=total,
        positive=counts.get("Positive", 0),
        neutral=counts.get("Neutral", 0),
        negative=counts.get("Negative", 0),
        irrelevant=counts.get("Irrelevant", 0),
    )
    # Insert summary into MongoDB for future query
    db_summaries.insert_one(summary.dict())
    return summary
    


@app.get("/sentiment-summary", response_model=SentimentSummary)
def get_sentiment_summary(product: str = Query(..., min_length=1)):
    # Find existing sentiments in the db_summary, if not found, get new sentiments from db_tweets
    pass
