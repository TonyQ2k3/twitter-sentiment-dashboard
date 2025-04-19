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
    collection = db["tweets"]
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

@app.get("/sentiment-summary", response_model=SentimentSummary)
def get_sentiment_summary(product: str = Query(..., min_length=1)):
    # Case-insensitive search for product
    cursor = collection.find({"product": {"$regex": f"^{product}$", "$options": "i"}})

    sentiments = [doc.get("prediction") for doc in cursor if doc.get("prediction") in ["Positive", "Neutral", "Negative", "Irrelevant"]]
    counts = Counter(sentiments)
    total = sum(counts.values())

    return SentimentSummary(
        product=product,
        total=total,
        positive=counts.get("Positive", 0),
        neutral=counts.get("Neutral", 0),
        negative=counts.get("Negative", 0),
        irrelevant=counts.get("Irrelevant", 0),
    )
