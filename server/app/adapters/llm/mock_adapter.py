from typing import Dict, Any
from app.adapters.llm.base import BaseLLMAdapter

class MockLLMAdapter(BaseLLMAdapter):
    async def extract_clinical_facts(self, transcript_text: str) -> Dict[str, Any]:
        return {
            "chief_complaint": "Epigastric burning sensation (Urdhwaga Amlapitta) aggravated after sour/spicy meals. Retro-sternal burning since 3 weeks.",
            "onset": "Yesterday evening (~18 hrs duration)",
            "character_location": "Retrosternal Burning & Epigastric Pressure",
            "aggravating_factors": "Post-prandial (deep-fried feast intake)",
            "regional_spoken_statement": transcript_text or "खाने के बाद सीने में भारी जलन और खट्टी डकारें होती हैं। रात को नींद नहीं आती।",
            "extracted_symptoms": ["Epigastric Burning", "Sour Eructations", "Retrosternal Pyrosis"],
            "red_flags": ["Substernal chest discomfort reported (requires ECG rule-out)"]
        }

    async def generate_clinical_summary(
        self,
        chief_complaint: str,
        hpi: Dict[str, Any],
        ayush_data: Dict[str, Any],
        ocr_entities: Dict[str, Any]
    ) -> Dict[str, Any]:
        return {
            "summary_title": "AI Integrated Clinical Draft",
            "provenance_match_score": 98.4,
            "chief_complaint_hpi": {
                "symptom_onset": "Yesterday evening (~18 hrs duration)",
                "character_location": "Retrosternal Burning & Epigastric Pressure",
                "aggravating_factors": "Post-prandial (deep-fried feast intake)",
                "hpi_narrative": "Patient reports severe retrosternal burning radiating to epigastrium accompanied by acidic eructations (Vidagdha Amlodgara) and regurgitation. No radiation to left arm or left shoulder; denies exertional dyspnea, cold sweats, or dizziness. Mild relief noted transiently after sipping warm water."
            },
            "ayush_synthesis": {
                "prakriti": "Pitta 58% • Vata 32% • Kapha 10% (Pitta-Vata Dominant)",
                "agni_state": "Tikshnagni -> Mandagni (Impaired secondary digestion & Ama accumulation)",
                "etiology": "Ushna, Tikshna & Vidahi Ahara (Irregular timings, deep fried snacks)"
            },
            "active_medications": [
                {
                    "name": "Tab. Amlodipine 5mg",
                    "dosage": "OD (Morning)",
                    "category": "Antihypertensive",
                    "source": "Digitized OPD Rx (District Hospital Satara)",
                    "confidence": 98.4
                },
                {
                    "name": "Cap. Omeprazole 20mg",
                    "dosage": "PRN (As needed)",
                    "category": "Proton Pump Inhibitor",
                    "source": "Self-reported Kiosk Intake",
                    "confidence": 96.8
                }
            ],
            "red_flag_warnings": [
                {
                    "title": "Substernal Chest Discomfort (Non-exertional, post-meal)",
                    "level": "AMBER_RED_OVERLAP",
                    "recommendation": "Immediate 12-Lead ECG advised before instituting classical Kamadudha Rasa or Sootshekhar Rasa to rule out silent myocardial ischemia vs Urdhvaga Amlapitta."
                }
            ]
        }
