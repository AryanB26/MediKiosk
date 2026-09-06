import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from app.models.schema_definitions import Patient, PatientIdentity, Visit, VisitStatus, PriorityLevel, IdentityType
from app.schemas.kiosk_and_doctor_schemas import IdentificationRequest, IdentificationResponse
from app.core.audit import log_audit_event

router = APIRouter(prefix="/patients", tags=["Patients & Identity"])

@router.post("/identify", response_model=IdentificationResponse)
async def identify_patient(req: IdentificationRequest, db: AsyncSession = Depends(get_db)):
    # 1. Create or retrieve Patient record (Internal Patient UUID)
    patient_id = uuid.uuid4()
    patient = Patient(
        id=patient_id,
        full_name=req.full_name or "Rameshwar Patil",
        gender=req.gender or "Male",
        age=req.age or 62,
        phone_number=req.phone_number or "+91 98231 ****84",
        address="Satara, Maharashtra"
    )
    db.add(patient)

    # 2. Add Identity Mapping (ABHA is external reference, not PK)
    identity = PatientIdentity(
        id=uuid.uuid4(),
        patient_id=patient_id,
        identity_type=IdentityType.ABHA_NUMBER if "ABHA" in req.id_type else IdentityType.MOBILE_OTP,
        external_reference=req.external_ref,
        is_verified=True,
        verified_at=datetime.utcnow()
    )
    db.add(identity)

    # 3. Create Visit Record (Internal Visit UUID)
    visit_id = uuid.uuid4()
    token_num = "#024"
    visit = Visit(
        id=visit_id,
        patient_id=patient_id,
        token_number=token_num,
        department="Ayurveda General Medicine",
        room_number="Room 4",
        status=VisitStatus.INTAKE_IN_PROGRESS,
        priority=PriorityLevel.NORMAL,
        kiosk_id="Kiosk #02"
    )
    db.add(visit)
    await db.commit()

    await log_audit_event(
        db, action="PATIENT_IDENTIFIED", resource_type="PATIENT",
        patient_id=patient_id, visit_id=visit_id, resource_id=str(patient_id),
        metadata_json={"identity_type": req.id_type, "external_ref": req.external_ref}
    )

    return IdentificationResponse(
        patient_id=patient_id,
        visit_id=visit_id,
        token_number=token_num,
        is_abha_linked=True,
        full_name=patient.full_name,
        age=patient.age,
        gender=patient.gender
    )
