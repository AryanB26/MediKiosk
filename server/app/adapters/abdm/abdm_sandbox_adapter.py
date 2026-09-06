import uuid
from datetime import datetime
from typing import Dict, Any, List
from app.adapters.abdm.base import BaseABDMAdapter
from app.adapters.abdm.mock_adapter import MockABDMAdapter

class ABDMSandboxAdapter(BaseABDMAdapter):
    def __init__(self, client_id: str = None, client_secret: str = None):
        self.client_id = client_id
        self.client_secret = client_secret
        self.mock_fallback = MockABDMAdapter()

    async def verify_abha(self, abha_number: str) -> Dict[str, Any]:
        return await self.mock_fallback.verify_abha(abha_number)

    async def fetch_longitudinal_ehr(self, abha_number: str) -> List[Dict[str, Any]]:
        return await self.mock_fallback.fetch_longitudinal_ehr(abha_number)

    def generate_fhir_bundle(self, patient_data: Dict[str, Any], visit_data: Dict[str, Any], summary_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate official ABDM FHIR R4 Bundle for Health Document Exchange."""
        bundle_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"

        return {
            "resourceType": "Bundle",
            "id": bundle_id,
            "meta": {
                "versionId": "1",
                "lastUpdated": timestamp,
                "profile": ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle"]
            },
            "identifier": {
                "system": "https://hip.satara.gov.in",
                "value": f"BUND-{bundle_id[:8]}"
            },
            "type": "document",
            "timestamp": timestamp,
            "entry": [
                {
                    "fullUrl": f"urn:uuid:patient-{patient_data.get('id', '000')}",
                    "resource": {
                        "resourceType": "Patient",
                        "id": str(patient_data.get("id", "000")),
                        "identifier": [
                            {
                                "type": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/v2-0203", "code": "MR"}]},
                                "system": "https://abdm.gov.in/abha",
                                "value": patient_data.get("abha_number", "91-4821-9920-11")
                            }
                        ],
                        "name": [{"text": patient_data.get("full_name", "Rameshwar Patil")}],
                        "gender": patient_data.get("gender", "male").lower(),
                        "birthDate": "1964-05-12"
                    }
                },
                {
                    "fullUrl": f"urn:uuid:encounter-{visit_data.get('id', '000')}",
                    "resource": {
                        "resourceType": "Encounter",
                        "id": str(visit_data.get("id", "000")),
                        "status": "finished",
                        "class": {"system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB", "display": "ambulatory"},
                        "subject": {"reference": f"urn:uuid:patient-{patient_data.get('id', '000')}"}
                    }
                },
                {
                    "fullUrl": f"urn:uuid:condition-1",
                    "resource": {
                        "resourceType": "Condition",
                        "id": "cond-01",
                        "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]},
                        "code": {
                            "coding": [
                                {"system": "https://namaste.ayush.gov.in", "code": "AG-0422.1", "display": "Urdhvaga Amlapitta"},
                                {"system": "http://id.who.int/icd/release/11/mms", "code": "DA42.0", "display": "GERD / Functional Dyspepsia"}
                            ]
                        },
                        "subject": {"reference": f"urn:uuid:patient-{patient_data.get('id', '000')}"}
                    }
                }
            ]
        }
