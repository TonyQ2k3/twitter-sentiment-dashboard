from pydantic import BaseModel

class SentimentSummary(BaseModel):
    product: str
    total: int = 0
    positive: int = 0
    neutral: int = 0
    negative: int = 0
    irrelevant: int = 0
