import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine, Base
from app.api.v1.router import api_v1_router
from app.models.schema_definitions import Patient # Ensures all models registered

app = FastAPI(
    title=settings.APP_NAME,
    description="MediKiosk SIH26047 — Clinical Intake, Document Intelligence, AYUSH & ABDM EMR Suite",
    version="3.2.0",
    debug=settings.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "adapters": {
            "llm": settings.LLM_PROVIDER,
            "language": settings.LANGUAGE_PROVIDER,
            "ocr": settings.OCR_PROVIDER,
            "abdm": settings.ABDM_ENV
        }
    }

app.include_router(api_v1_router)
