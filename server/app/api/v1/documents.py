import uuid
import hashlib
import os
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from config import settings
from app.models.schema_definitions import Document, DocumentExtraction, DocumentStatus
from app.schemas.kiosk_and_doctor_schemas import DocumentUploadResponse, DocumentExtractionResponse, ExtractedEntities
from app.adapters.ocr.mock_adapter import MockOCRAdapter
from app.core.audit import log_audit_event

router = APIRouter(prefix="/documents", tags=["Document Scanning & OCR"])
ocr_adapter = MockOCRAdapter()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    visit_id: str = Form(...),
    patient_id: str = Form(...),
    document_type: str = Form("PRESCRIPTION"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    contents = await file.read()
    sha256_hash = hashlib.sha256(contents).hexdigest()
    
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    doc_id = uuid.uuid4()
    filename = f"{doc_id}_{file.filename}"
    file_path = os.path.join(settings.STORAGE_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    doc = Document(
        id=doc_id,
        visit_id=uuid.UUID(visit_id),
        patient_id=uuid.UUID(patient_id),
        file_name=file.filename,
        storage_key=file_path,
        mime_type=file.content_type or "image/jpeg",
        file_hash_sha256=sha256_hash,
        document_type=document_type,
        status=DocumentStatus.EXTRACTED,
        created_at=datetime.utcnow()
    )
    db.add(doc)

    # Process OCR & Medical Entity Extraction
    ocr_result = await ocr_adapter.process_document_image(contents, file.filename)
    extraction = DocumentExtraction(
        id=uuid.uuid4(),
        document_id=doc_id,
        visit_id=uuid.UUID(visit_id),
        patient_id=uuid.UUID(patient_id),
        raw_ocr_text=ocr_result["raw_ocr_text"],
        bounding_boxes_json=ocr_result["bounding_boxes"],
        extracted_entities_json=ocr_result["extracted_entities"],
        ocr_confidence=ocr_result["ocr_confidence"],
        created_at=datetime.utcnow()
    )
    db.add(extraction)
    await db.commit()

    await log_audit_event(
        db, action="DOCUMENT_UPLOADED_AND_EXTRACTED", resource_type="DOCUMENT",
        patient_id=uuid.UUID(patient_id), visit_id=uuid.UUID(visit_id), resource_id=str(doc_id),
        metadata_json={"sha256": sha256_hash, "ocr_confidence": ocr_result["ocr_confidence"]}
    )

    return DocumentUploadResponse(
        document_id=doc_id,
        file_name=file.filename,
        status="EXTRACTED",
        sha256=sha256_hash
    )
