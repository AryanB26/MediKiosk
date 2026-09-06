import uuid
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schema_definitions import AuditLog

async def log_audit_event(
    db: AsyncSession,
    action: str,
    resource_type: str,
    actor_id: Optional[uuid.UUID] = None,
    actor_role: str = "SYSTEM",
    patient_id: Optional[uuid.UUID] = None,
    visit_id: Optional[uuid.UUID] = None,
    resource_id: Optional[str] = None,
    metadata_json: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = "127.0.0.1"
):
    audit_entry = AuditLog(
        id=uuid.uuid4(),
        actor_id=actor_id,
        actor_role=actor_role,
        patient_id=patient_id,
        visit_id=visit_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        ip_address=ip_address,
        metadata_json=metadata_json or {},
        timestamp=datetime.utcnow()
    )
    db.add(audit_entry)
    await db.commit()
    return audit_entry
