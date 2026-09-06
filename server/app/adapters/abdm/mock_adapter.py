from typing import Dict, Any, List
from app.adapters.abdm.base import BaseABDMAdapter

class MockABDMAdapter(BaseABDMAdapter):
    async def verify_abha(self, abha_number: str) -> Dict[str, Any]:
        return {
            "status": "SUCCESS",
            "abha_number": abha_number or "91-4821-9920-11",
            "abha_address": "rameshwar.patil@abdm",
            "full_name": "Rameshwar Patil",
            "gender": "Male",
            "age": 62,
            "mobile": "+91 98231 ****84",
            "facility_name": "Civil Hospital Satara",
            "verification_source": "ABDM Sandbox Gateway (M1 Verified)"
        }

    async def fetch_longitudinal_ehr(self, abha_number: str) -> List[Dict[str, Any]]:
        return [
            {
                "id": "ABDM-DOC-78421",
                "date": "12 Aug 2026",
                "facility": "Govt. Civil Hospital Satara — General Medicine OPD",
                "record_type": "OPD Prescription & Lab Report",
                "diagnosis": "Essential Hypertension (ICD-10 I10)",
                "medication": "Tab. Amlodipine 5mg OD (Morning after food)",
                "bp_logged": "148/94 mmHg",
                "physician": "Dr. A. K. Deshmukh (MD Med)"
            },
            {
                "id": "ABDM-DOC-61029",
                "date": "10 Jan 2026",
                "facility": "Taluka Dispensary — Ayurveda Unit",
                "record_type": "Ayush EMR Log",
                "diagnosis": "Amlapitta (Pitta-Vata Grahani lakshanas)",
                "medication": "Kamadudha Rasa (Mukta Yukta) 1 Tab BD + Sutshekhar Rasa 1 Tab BD",
                "outcome": "Mild transient relief for 2 weeks",
                "physician": "Dr. V. S. Joshi (BAMS)"
            },
            {
                "id": "ABDM-DOC-44810",
                "date": "15 Oct 2025",
                "facility": "Sub-District Hospital Diagnostic Lab",
                "record_type": "Resting 12-Lead ECG & Lipid Profile",
                "findings": "Normal sinus rhythm, rate 74 bpm, no acute ST-T wave deviation. Total Chol: 184 mg/dL",
                "physician": "Dr. S. M. Mane (MD Path)"
            }
        ]
