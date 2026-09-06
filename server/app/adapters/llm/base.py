from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseLLMAdapter(ABC):
    @abstractmethod
    async def extract_clinical_facts(self, transcript_text: str) -> Dict[str, Any]:
        """Extract structured HPI, symptoms, and red flags from patient transcript."""
        pass

    @abstractmethod
    async def generate_clinical_summary(
        self,
        chief_complaint: str,
        hpi: Dict[str, Any],
        ayush_data: Dict[str, Any],
        ocr_entities: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate structured physician summary with provenance mappings."""
        pass
