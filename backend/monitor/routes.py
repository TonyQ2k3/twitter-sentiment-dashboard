from fastapi import APIRouter, Query, Depends, HTTPException
from fastapi.responses import JSONResponse
from pymongo import MongoClient, DESCENDING
from bson.son import SON
from bson.json_util import dumps
from database import db_model
from datetime import datetime
from bson import ObjectId

router = APIRouter()

# Get all reports, up to 10 maximum
def serialize_report(doc):
    doc["_id"] = str(doc["_id"])
    if "timestamp" in doc and isinstance(doc["timestamp"], datetime):
        doc["timestamp"] = doc["timestamp"].isoformat()
    return doc

@router.get("/model")
def get_reports():
    try:
        reports_cursor = db_model.find().sort("timestamp", DESCENDING).limit(10)
        reports = [serialize_report(doc) for doc in reports_cursor]
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
