from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.patients import router as patients_router
from app.api.v1.consents import router as consents_router
from app.api.v1.conversation import router as conversation_router
from app.api.v1.documents import router as documents_router
from app.api.v1.doctor import router as doctor_router
from app.api.v1.abdm import router as abdm_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(patients_router)
api_v1_router.include_router(consents_router)
api_v1_router.include_router(conversation_router)
api_v1_router.include_router(documents_router)
api_v1_router.include_router(doctor_router)
api_v1_router.include_router(abdm_router)
