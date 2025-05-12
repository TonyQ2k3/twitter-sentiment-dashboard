from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth.routes import router as auth_router
from sentiment.routes import router as sentiment_router

app = FastAPI()

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(sentiment_router, prefix="/sentiment", tags=["Sentiment"])