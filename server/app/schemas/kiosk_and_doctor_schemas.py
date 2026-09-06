from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

# --- Auth & Session ---
class AuthRequest(BaseModel):
    username: str
    password: str
    role: str = "DOCTOR" # DOCTOR, KIOSK, ADMIN

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    username: str

class IdentificationRequest(BaseModel):
    id_type: str = Field(..., example="ABHA_NUMBER")
    external_ref: str = Field(..., example="91-4821-9920-11")
    full_name: Optional[str] = "Rameshwar Patil"
    phone_number: Optional[str] = "+91 98231 ****84"
    age: Optional[int] = 62
    gender: Optional[str] = "Male"

class IdentificationResponse(BaseModel):
    patient_id: UUID
    visit_id: UUID
    token_number: str
    is_abha_linked: bool
    full_name: str
    age: int
    gender: str

class ConsentCreate(BaseModel):
    patient_id: UUID
    visit_id: UUID
    purpose: str = "CLINICAL_INTAKE_AND_AYUSH_ASSESSMENT"
    scopes: List[str] = ["HPI", "AYUSH", "DOCUMENT_OCR", "ABDM_RECORD_FETCH"]

class ConsentResponse(BaseModel):
    consent_id: UUID
    status: str
    granted_at: datetime

# --- Conversation & Intake ---
class StartConversationRequest(BaseModel):
    visit_id: UUID
    patient_id: UUID
    interaction_language: str = "hi" # hi, mr, en

class SubmitAnswerRequest(BaseModel):
    session_id: UUID
    step_number: int
    question_id: str
    audio_base64: Optional[str] = None
    touch_value: Optional[Any] = None
    interaction_language: str = "hi"

class ConversationStateResponse(BaseModel):
    session_id: UUID
    visit_id: UUID
    current_step: int
    total_steps: int
    question_id: str
    section_title: Dict[str, str]
    question_text: Dict[str, str]
    audio_prompt_url: Optional[str] = None
    input_type: str # "VOICE_AND_TOUCH", "TOUCH_ONLY"
    options: Optional[List[Dict[str, Any]]] = None
    missing_required_fields: List[str] = []
    detected_red_flags: List[str] = []
    is_completed: bool = False

# --- Document & OCR ---
class DocumentUploadResponse(BaseModel):
    document_id: UUID
    file_name: str
    status: str
    sha256: str

class ExtractedEntities(BaseModel):
    diagnoses: List[Dict[str, Any]] = []
    medications: List[Dict[str, Any]] = []
    lab_results: List[Dict[str, Any]] = []
    procedures: List[Dict[str, Any]] = []

class DocumentExtractionResponse(BaseModel):
    document_id: UUID
    ocr_text: str
    entities: ExtractedEntities
    ocr_confidence: float

# --- Doctor Queue & Case Summary ---
class QueueItem(BaseModel):
    token_number: str
    visit_id: UUID
    patient_id: UUID
    patient_name: str
    abha_number: str
    age_gender: str
    chief_complaint: str
    intake_mode: str
    ayush_prakriti: str
    document_count: int
    triage_priority: str # NORMAL, AMBER_FLAG, RED_FLAG
    wait_time_mins: int
    status: str

class ProvenanceItem(BaseModel):
    fact_key: str
    source_type: str # "AUDIO_SNIPPET", "OCR_BOUNDING_BOX", "TOUCH_INPUT", "ABDM_RECORD"
    source_id: str
    confidence: float
    raw_snippet: str
    timestamp: str

class ClinicalCaseOverview(BaseModel):
    visit_id: UUID
    patient_id: UUID
    token_number: str
    patient_name: str
    abha_number: str
    age: int
    gender: str
    facility: str
    vitals: Dict[str, Any]
    chief_complaint: str
    hpi: Dict[str, Any]
    regional_spoken_statement: Dict[str, str]
    ayush_assessment: Dict[str, Any]
    digitized_medications: List[Dict[str, Any]]
    lab_investigations: List[Dict[str, Any]]
    medical_timeline: List[Dict[str, Any]]
    ai_draft_summary: Dict[str, Any]
    provenance_sources: List[ProvenanceItem]
    red_flag_alerts: List[Dict[str, Any]]
    icd11_namaste_codes: List[Dict[str, Any]]
    status: str

class SummaryVerifyRequest(BaseModel):
    summary_id: UUID
    physician_notes: Optional[str] = None
    edits: Optional[Dict[str, Any]] = None
    final_prescriptions: List[Dict[str, Any]] = []
    chikitsa_sutra: List[str] = []
    pathya_regimen: List[str] = []
    apathya_regimen: List[str] = []

# --- Patient & Visit CRUD Schemas ---
class PatientCreate(BaseModel):
    full_name: str = Field(..., example="Rameshwar Patil")
    gender: Optional[str] = "Male"
    age: Optional[int] = 62
    phone_number: Optional[str] = "+91 98231 ****84"
    address: Optional[str] = "Satara, Maharashtra"

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

class PatientResponse(BaseModel):
    id: UUID
    full_name: str
    gender: Optional[str] = None
    age: Optional[int] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

class VisitUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    department: Optional[str] = None
    room_number: Optional[str] = None
    chief_complaint: Optional[str] = None

