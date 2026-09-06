from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db
from app.adapters.abdm.mock_adapter import MockABDMAdapter
from app.core.audit import log_audit_event

router = APIRouter(prefix="/abdm", tags=["ABDM Gateway"])
abdm_adapter = MockABDMAdapter()

@router.post("/records/pull")
async def pull_abdm_records(abha_number: str, db: AsyncSession = Depends(get_db)):
    records = await abdm_adapter.fetch_longitudinal_ehr(abha_number)
    await log_audit_event(
        db, action="ABDM_LONGITUDINAL_RECORDS_PULLED", resource_type="ABDM_GATEWAY",
        metadata_json={"abha_number": abha_number, "records_fetched": len(records)}
    )
    return {"status": "SUCCESS", "abha_number": abha_number, "records": records}
