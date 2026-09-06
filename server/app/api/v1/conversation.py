import uuid
from datetime import datetime
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from config import settings
from app.models.schema_definitions import ConversationSession, Visit, PriorityLevel, VisitStatus
from app.schemas.kiosk_and_doctor_schemas import (
    StartConversationRequest, SubmitAnswerRequest, ConversationStateResponse
)
from app.core.rules_engine import QUESTION_BANK, evaluate_red_flags
from app.core.audit import log_audit_event
from app.adapters.llm.mock_adapter import MockLLMAdapter
from app.adapters.language.mock_adapter import MockLanguageAdapter

router = APIRouter(prefix="/conversation", tags=["Clinical Conversation"])

llm_adapter = MockLLMAdapter()
lang_adapter = MockLanguageAdapter()

@router.post("/start", response_model=ConversationStateResponse)
async def start_conversation(req: StartConversationRequest, db: AsyncSession = Depends(get_db)):
    session_id = uuid.uuid4()
    first_question = QUESTION_BANK[0]
    
    session = ConversationSession(
        id=session_id,
        visit_id=req.visit_id,
        patient_id=req.patient_id,
        interaction_language=req.interaction_language,
        current_step=1,
        answers_json={},
        audio_transcripts_json=[],
        touch_inputs_json=[],
        missing_fields=["CHIEF_COMPLAINT", "DURATION", "AYUSH_AGNI"],
        is_active=True
    )
    db.add(session)
    await db.commit()

    return ConversationStateResponse(
        session_id=session_id,
        visit_id=req.visit_id,
        current_step=1,
        total_steps=len(QUESTION_BANK),
        question_id=first_question["id"],
        section_title=first_question["section_title"],
        question_text=first_question["question_text"],
        input_type=first_question["input_type"],
        options=first_question["options"],
        missing_required_fields=session.missing_fields,
        detected_red_flags=[],
        is_completed=False
    )

@router.post("/answer", response_model=ConversationStateResponse)
async def submit_answer(req: SubmitAnswerRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(ConversationSession).where(ConversationSession.id == req.session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=404, detail="Conversation session not found")

    # Record touch or speech input
    current_answers = dict(session.answers_json)
    detected_red_flags_list = []
    
    if req.touch_value:
        current_answers[req.question_id] = req.touch_value
        session.touch_inputs_json.append({"question_id": req.question_id, "value": req.touch_value})

    if req.audio_base64 or req.touch_value:
        transcript_res = await lang_adapter.transcribe_speech(b"dummy", req.interaction_language)
        session.audio_transcripts_json.append({
            "question_id": req.question_id,
            "transcript": transcript_res["transcript"],
            "confidence": transcript_res["confidence"]
        })
        # Evaluate Red Flags on combined intake text
        answers_combined_text = str(current_answers) + " " + transcript_res["transcript"]
        priority_lvl, red_flags = evaluate_red_flags(answers_combined_text)

        if priority_lvl == "RED_FLAG":
            visit_stmt = select(Visit).where(Visit.id == session.visit_id)
            visit_res = await db.execute(visit_stmt)
            visit = visit_res.scalar_one_or_none()
            if visit:
                visit.priority = PriorityLevel.RED_FLAG
                visit.status = VisitStatus.TRIAGED_RED_FLAG
            detected_red_flags_list = [rf["reason"] for rf in red_flags]

    # Progress step
    next_step = session.current_step + 1
    session.answers_json = current_answers
    session.current_step = next_step
    await db.commit()

    if next_step > len(QUESTION_BANK):
        # Conversation Completed
        return ConversationStateResponse(
            session_id=session.id,
            visit_id=session.visit_id,
            current_step=len(QUESTION_BANK),
            total_steps=len(QUESTION_BANK),
            question_id="COMPLETED",
            section_title={"hi": "पूर्णांक", "mr": "पूर्ण झाले", "en": "Intake Complete"},
            question_text={"hi": "आपकी स्वास्थ्य जानकारी दर्ज कर ली गई है।", "mr": "तुमची माहिती नोंदवली गेली आहे.", "en": "Intake complete."},
            input_type="NONE",
            missing_required_fields=[],
            detected_red_flags=detected_red_flags_list,
            is_completed=True
        )

    next_q = QUESTION_BANK[next_step - 1]
    return ConversationStateResponse(
        session_id=session.id,
        visit_id=session.visit_id,
        current_step=next_step,
        total_steps=len(QUESTION_BANK),
        question_id=next_q["id"],
        section_title=next_q["section_title"],
        question_text=next_q["question_text"],
        input_type=next_q["input_type"],
        options=next_q["options"],
        missing_required_fields=[],
        detected_red_flags=detected_red_flags_list,
        is_completed=False
    )
