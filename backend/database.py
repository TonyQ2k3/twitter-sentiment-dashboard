import os
from pymongo import MongoClient
from dotenv import load_dotenv

try:
    print("Loading environment vars")
    load_dotenv()
    print("Loaded environment vars\n")
except Exception as e:
    print(f"Error loading environment vars: {e}")

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

try:
    client = MongoClient(MONGO_URI)
    db = client["main"]
    db_users = db["users"]
    db_reddits = db["reddits"]
    db_summaries = db["summaries"]
    print("Connected to MongoDB: ", MONGO_URI)
except Exception as e:
    print(f"An error occurred: {e}")
