from typing import Dict, Any
from app.adapters.ocr.base import BaseOCRAdapter

class MockOCRAdapter(BaseOCRAdapter):
    async def process_document_image(self, image_bytes: bytes, file_name: str) -> Dict[str, Any]:
        return {
            "document_type": "GOVT_CIVIL_HOSPITAL_OPD_PRESCRIPTION",
            "ocr_confidence": 0.984,
            "raw_ocr_text": "GOVERNMENT OF MAHARASHTRA CIVIL HOSPITAL SATARA\nOPD PRESCRIPTION\nName: Rameshwar Patil Age: 62\nDx: Essential Hypertension (Stage 1)\nRx: Tab. Amlodipine 5mg OD (Morning after food)\nLab: S. Creatinine: 0.9 mg/dL, Hb: 11.4 g/dL",
            "bounding_boxes": [
                {"text": "Dx: HTN (148/94)", "box": [120, 45, 300, 85], "confidence": 0.984},
                {"text": "Rx: Tab Amlodipine 5mg OD", "box": [120, 110, 420, 150], "confidence": 0.990}
            ],
            "extracted_entities": {
                "diagnoses": [
                    {"name": "Essential Hypertension (Stage 1)", "icd10": "I10", "confidence": 0.98}
                ],
                "medications": [
                    {
                        "name": "Tab. Amlodipine 5mg",
                        "dosage": "5mg",
                        "frequency": "OD (Morning)",
                        "duration": "30 Days",
                        "confidence": 0.99
                    }
                ],
                "lab_results": [
                    {"parameter": "Hemoglobin (Hb)", "value": 11.4, "unit": "g/dL", "status": "Low (Pandu)", "confidence": 0.97},
                    {"parameter": "Serum Creatinine", "value": 0.9, "unit": "mg/dL", "status": "Normal", "confidence": 0.98},
                    {"parameter": "Fasting Blood Sugar", "value": 104, "unit": "mg/dL", "status": "Pre-diabetic", "confidence": 0.96}
                ],
                "prescribing_doctor": "Dr. R. K. Verma, MBBS, MD (Reg. #DMC-84920)"
            }
        }
