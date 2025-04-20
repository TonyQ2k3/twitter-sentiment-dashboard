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
uri = os.getenv("MONGO_URI")
try:
    client = MongoClient(uri)
    db = client["main"]
    db_tweets = db["tweets"]
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
            irrelevant=document["irrelevant"],
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
