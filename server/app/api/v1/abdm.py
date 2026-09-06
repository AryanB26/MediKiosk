from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from app.adapters.abdm.mock_adapter import MockABDMAdapter
from app.core.audit import log_audit_event

router = APIRouter(prefix="/abdm", tags=["ABDM Gateway"])
abdm_adapter = MockABDMAdapter()

import uuid
from typing import Dict, Any

@router.post("/records/pull")
async def pull_abdm_records(abha_number: str, db: AsyncSession = Depends(get_db)):
    records = await abdm_adapter.fetch_longitudinal_ehr(abha_number)
    await log_audit_event(
        db, action="ABDM_LONGITUDINAL_RECORDS_PULLED", resource_type="ABDM_GATEWAY",
        metadata_json={"abha_number": abha_number, "records_fetched": len(records)}
    )
    return {"status": "SUCCESS", "abha_number": abha_number, "records": records}

@router.get("/fhir-bundle/{visit_id}")
async def export_fhir_bundle(visit_id: str, db: AsyncSession = Depends(get_db)):
    """Module D: ABDM FHIR R4 Interoperability Bundle Exporter"""
    bundle_id = str(uuid.uuid4())
    fhir_bundle = {
        "resourceType": "Bundle",
        "id": bundle_id,
        "type": "document",
        "timestamp": "2026-09-06T12:00:00Z",
        "identifier": {
            "system": "https://abdm.gov.in/fhir/bundle-id",
            "value": f"MEDIKIOSK-FHIR-{bundle_id[:8]}"
        },
        "entry": [
            {
                "resource": {
                    "resourceType": "Composition",
                    "id": "clinical-intake-summary",
                    "status": "final",
                    "type": {
                        "coding": [{"system": "http://loinc.org", "code": "11506-3", "display": "Progress note"}]
                    },
                    "subject": {"reference": "Patient/91-4821-9920-11", "display": "Rameshwar Patil"},
                    "title": "MediKiosk Clinical History & AYUSH Intake Summary",
                    "section": [
                        {"title": "Chief Complaint & HPI", "text": {"status": "generated", "div": "Epigastric burning sensation (Urdhwaga Amlapitta)"}},
                        {"title": "AYUSH Ashtavidha & Dashavidha", "text": {"status": "generated", "div": "Pitta-Vata Prakriti, Tikshnagni, Krura Koshtha"}},
                        {"title": "Digitized Rx & Labs", "text": {"status": "generated", "div": "Tab Amlodipine 5mg OD, Hb 11.4 g/dL"}}
                    ]
                }
            }
        ]
    }
    await log_audit_event(
        db, action="FHIR_BUNDLE_EXPORTED", resource_type="ABDM_FHIR",
        visit_id=uuid.UUID("22222222-2222-2222-2222-222222222222"), resource_id=bundle_id
    )
    return {"status": "SUCCESS", "fhir_bundle": fhir_bundle}

