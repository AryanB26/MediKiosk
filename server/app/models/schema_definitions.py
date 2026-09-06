import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, String, Text, DateTime, ForeignKey, Integer, Float, Boolean, JSON, Enum
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.types import TypeDecorator, CHAR
from database import Base

# Universal UUID type decorator for PostgreSQL and SQLite compatibility
class GUID(TypeDecorator):
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(value))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(value)
            else:
                return value

class PatientStatus(str, PyEnum):
    ACTIVE = "ACTIVE"
    MERGED = "MERGED"
    INACTIVE = "INACTIVE"

class Patient(Base):
    __tablename__ = "patients"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=True)
    gender = Column(String(20), nullable=True)
    age = Column(Integer, nullable=True)
    date_of_birth = Column(String(10), nullable=True)
    phone_number = Column(String(15), nullable=True)
    address = Column(Text, nullable=True)
    status = Column(Enum(PatientStatus), default=PatientStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class IdentityType(str, PyEnum):
    ABHA_NUMBER = "ABHA_NUMBER"
    ABHA_ADDRESS = "ABHA_ADDRESS"
    HOSPITAL_UHID = "HOSPITAL_UHID"
    MOBILE_OTP = "MOBILE_OTP"

class PatientIdentity(Base):
    __tablename__ = "patient_identities"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    patient_id = Column(GUID, ForeignKey("patients.id"), nullable=False)
    identity_type = Column(Enum(IdentityType), nullable=False)
    external_reference = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    verified_at = Column(DateTime, nullable=True)
    metadata_json = Column(JSON, nullable=True)

class ConsentStatus(str, PyEnum):
    GRANTED = "GRANTED"
    REVOKED = "REVOKED"
    EXPIRED = "EXPIRED"

class Consent(Base):
    __tablename__ = "consents"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    patient_id = Column(GUID, ForeignKey("patients.id"), nullable=False)
    visit_id = Column(GUID, ForeignKey("visits.id"), nullable=True)
    purpose = Column(String(100), nullable=False)
    scope_json = Column(JSON, nullable=False)
    policy_version = Column(String(20), default="v3.2", nullable=False)
    status = Column(Enum(ConsentStatus), default=ConsentStatus.GRANTED, nullable=False)
    granted_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime, nullable=True)

class VisitStatus(str, PyEnum):
    REGISTERED = "REGISTERED"
    INTAKE_IN_PROGRESS = "INTAKE_IN_PROGRESS"
    INTAKE_COMPLETED = "INTAKE_COMPLETED"
    TRIAGED_RED_FLAG = "TRIAGED_RED_FLAG"
    IN_CONSULTATION = "IN_CONSULTATION"
    FINALIZED = "FINALIZED"

class PriorityLevel(str, PyEnum):
    NORMAL = "NORMAL"
    AMBER_FLAG = "AMBER_FLAG"
    RED_FLAG = "RED_FLAG"

class Visit(Base):
    __tablename__ = "visits"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    patient_id = Column(GUID, ForeignKey("patients.id"), nullable=False)
    token_number = Column(String(20), nullable=False)
    department = Column(String(100), default="Ayurveda General Medicine", nullable=False)
    room_number = Column(String(50), default="Room 4", nullable=False)
    assigned_doctor_id = Column(GUID, nullable=True)
    status = Column(Enum(VisitStatus), default=VisitStatus.REGISTERED, nullable=False)
    priority = Column(Enum(PriorityLevel), default=PriorityLevel.NORMAL, nullable=False)
    kiosk_id = Column(String(50), default="Kiosk #02", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

class ConversationSession(Base):
    __tablename__ = "conversation_sessions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    visit_id = Column(GUID, ForeignKey("visits.id"), nullable=False, unique=True)
    patient_id = Column(GUID, ForeignKey("patients.id"), nullable=False)
    interaction_language = Column(String(10), default="hi", nullable=False)
    current_step = Column(Integer, default=1, nullable=False)
    answers_json = Column(JSON, default=dict, nullable=False)
    audio_transcripts_json = Column(JSON, default=list, nullable=False)
    touch_inputs_json = Column(JSON, default=list, nullable=False)
    missing_fields = Column(JSON, default=list, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class ClinicalHistory(Base):
    __tablename__ = "clinical_histories"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    visit_id = Column(GUID, ForeignKey("visits.id"), nullable=False, unique=True)
    patient_id = Column(GUID, ForeignKey("patients.id"), nullable=False)
    chief_complaint = Column(Text, nullable=False)
    hpi_json = Column(JSON, nullable=False)
    past_medical_history = Column(JSON, default=list, nullable=False)
    past_surgical_history = Column(JSON, default=list, nullable=False)
    current_medications = Column(JSON, default=list, nullable=False)
    allergies = Column(JSON, default=list, nullable=False)
    family_history = Column(JSON, default=list, nullable=False)
    personal_lifestyle = Column(JSON, default=dict, nullable=False)
    review_of_systems = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class AyushAssessment(Base):
    __tablename__ = "ayush_assessments"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    visit_id = Column(GUID, ForeignKey("visits.id"), nullable=False, unique=True)
    patient_id = Column(GUID, ForeignKey("patients.id"), nullable=False)
    prakriti_score_json = Column(JSON, nullable=False)
    vikriti_current = Column(String(255), nullable=True)
    agni_state = Column(String(100), nullable=True)
    koshtha_swaroopa = Column(String(100), nullable=True)
    ashtavidha_pariksha_json = Column(JSON, nullable=False)
    ahara_shakti = Column(String(100), nullable=True)
    jarana_shakti = Column(String(100), nullable=True)
    ahara_vihara_etiology = Column(JSON, default=dict, nullable=False)
    chikitsa_sutra = Column(JSON, default=list, nullable=False)
    pathya_apathya_json = Column(JSON, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class DocumentStatus(str, PyEnum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    EXTRACTED = "EXTRACTED"
    FAILED = "FAILED"

class Document(Base):
    __tablename__ = "documents"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    visit_id = Column(GUID, ForeignKey("visits.id"), nullable=False)
    patient_id = Column(GUID, ForeignKey("patients.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_key = Column(String(512), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_hash_sha256 = Column(String(64), nullable=False)
    document_type = Column(String(50), default="PRESCRIPTION", nullable=False)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.UPLOADED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class DocumentExtraction(Base):
    __tablename__ = "document_extractions"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    document_id = Column(GUID, ForeignKey("documents.id"), nullable=False, unique=True)
    visit_id = Column(GUID, ForeignKey("visits.id"), nullable=False)
    patient_id = Column(GUID, ForeignKey("patients.id"), nullable=False)
    raw_ocr_text = Column(Text, nullable=False)
    bounding_boxes_json = Column(JSON, nullable=True)
    extracted_entities_json = Column(JSON, nullable=False)
    ocr_confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class SummaryStatus(str, PyEnum):
    DRAFT = "DRAFT"
    PHYSICIAN_REVIEWED = "PHYSICIAN_REVIEWED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"

class ClinicalSummary(Base):
    __tablename__ = "clinical_summaries"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    visit_id = Column(GUID, ForeignKey("visits.id"), nullable=False, unique=True)
    patient_id = Column(GUID, ForeignKey("patients.id"), nullable=False)
    summary_json = Column(JSON, nullable=False)
    provenance_map_json = Column(JSON, nullable=False)
    red_flag_alerts_json = Column(JSON, default=list, nullable=False)
    ai_model_version = Column(String(50), default="MediKiosk-Gemini-3.8-Flash", nullable=False)
    status = Column(Enum(SummaryStatus), default=SummaryStatus.DRAFT, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class PhysicianReview(Base):
    __tablename__ = "physician_reviews"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    summary_id = Column(GUID, ForeignKey("clinical_summaries.id"), nullable=False, unique=True)
    visit_id = Column(GUID, ForeignKey("visits.id"), nullable=False)
    physician_id = Column(GUID, nullable=False)
    edits_diff_json = Column(JSON, nullable=True)
    physician_notes = Column(Text, nullable=True)
    final_rx_json = Column(JSON, nullable=True)
    verified_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    actor_id = Column(GUID, nullable=True)
    actor_role = Column(String(50), nullable=False)
    patient_id = Column(GUID, nullable=True)
    visit_id = Column(GUID, nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
