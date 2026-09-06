from fastapi import APIRouter, HTTPException, status
from app.schemas.kiosk_and_doctor_schemas import AuthRequest, AuthResponse
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/session", response_model=AuthResponse)
async def create_session(req: AuthRequest):
    if req.role == "DOCTOR":
        token = create_access_token({"sub": req.username, "role": "DOCTOR", "room": "Room 4"})
        return AuthResponse(access_token=token, role="DOCTOR", username=req.username)
    else:
        token = create_access_token({"sub": "kiosk_02", "role": "PATIENT_KIOSK"})
        return AuthResponse(access_token=token, role="PATIENT_KIOSK", username="Kiosk #02")
