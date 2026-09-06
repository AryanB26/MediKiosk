import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from app.models.schema_definitions import Consent, ConsentStatus
from app.schemas.kiosk_and_doctor_schemas import ConsentCreate, ConsentResponse
from app.core.audit import log_audit_event

router = APIRouter(prefix="/consents", tags=["Consent"])

@router.post("", response_model=ConsentResponse)
async def record_consent(req: ConsentCreate, db: AsyncSession = Depends(get_db)):
    consent_id = uuid.uuid4()
    consent = Consent(
        id=consent_id,
        patient_id=req.patient_id,
        visit_id=req.visit_id,
        purpose=req.purpose,
        scope_json=req.scopes,
        policy_version="v3.2",
        status=ConsentStatus.GRANTED,
        granted_at=datetime.utcnow()
    )
    db.add(consent)
    await db.commit()

    await log_audit_event(
        db, action="CONSENT_GRANTED", resource_type="CONSENT",
        patient_id=req.patient_id, visit_id=req.visit_id, resource_id=str(consent_id),
        metadata_json={"scopes": req.scopes, "policy_version": "v3.2"}
    )

    return ConsentResponse(
        consent_id=consent_id,
        status="GRANTED",
        granted_at=consent.granted_at
    )
