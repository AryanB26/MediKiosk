import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from app.models.schema_definitions import Patient, PatientIdentity, Visit, VisitStatus, PriorityLevel, IdentityType
from typing import List
from sqlalchemy import select
from app.schemas.kiosk_and_doctor_schemas import (
    IdentificationRequest, IdentificationResponse,
    PatientCreate, PatientUpdate, PatientResponse
)
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

# --- Full CRUD Endpoints ---

@router.get("", response_model=List[PatientResponse])
async def list_patients(db: AsyncSession = Depends(get_db)):
    """READ (List All Patients)"""
    stmt = select(Patient).order_by(Patient.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(patient_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """READ (Get Patient by ID)"""
    stmt = select(Patient).where(Patient.id == patient_id)
    res = await db.execute(stmt)
    patient = res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.post("", response_model=PatientResponse, status_code=201)
async def create_patient(req: PatientCreate, db: AsyncSession = Depends(get_db)):
    """CREATE (Create New Patient)"""
    patient = Patient(
        id=uuid.uuid4(),
        full_name=req.full_name,
        gender=req.gender,
        age=req.age,
        phone_number=req.phone_number,
        address=req.address
    )
    db.add(patient)
    await db.commit()
    await db.refresh(patient)
    return patient

@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(patient_id: uuid.UUID, req: PatientUpdate, db: AsyncSession = Depends(get_db)):
    """UPDATE (Update Patient Details)"""
    stmt = select(Patient).where(Patient.id == patient_id)
    res = await db.execute(stmt)
    patient = res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    if req.full_name is not None: patient.full_name = req.full_name
    if req.gender is not None: patient.gender = req.gender
    if req.age is not None: patient.age = req.age
    if req.phone_number is not None: patient.phone_number = req.phone_number
    if req.address is not None: patient.address = req.address

    await db.commit()
    await db.refresh(patient)
    return patient

@router.delete("/{patient_id}")
async def delete_patient(patient_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """DELETE (Delete Patient)"""
    stmt = select(Patient).where(Patient.id == patient_id)
    res = await db.execute(stmt)
    patient = res.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    await db.delete(patient)
    await db.commit()
    return {"status": "SUCCESS", "message": f"Patient {patient_id} deleted successfully"}

