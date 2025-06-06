from fastapi import APIRouter, Query, Depends, HTTPException
from fastapi.responses import JSONResponse
from pymongo import MongoClient, DESCENDING
from bson.son import SON
from bson.json_util import dumps
from database import db_model, db_datadrift, db_alert, db_datasummary
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
    
    
@router.get("/dataset-drift")
def get_datadrift():
    try:
        reports_cursor = db_datadrift.find().sort("timestamp", DESCENDING).limit(10)
        reports = [serialize_report(doc) for doc in reports_cursor]
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/dataset-summary")
def get_datasummary():
    try:
        reports_cursor = db_datasummary.find().sort("timestamp", DESCENDING).limit(10)
        reports = [serialize_report(doc) for doc in reports_cursor]
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/alerts")
def get_alerts():
    try:
        reports_cursor = db_alert.find().sort("timestamp", DESCENDING).limit(20)
        reports = [serialize_report(doc) for doc in reports_cursor]
        return reports
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))