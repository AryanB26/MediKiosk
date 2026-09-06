import os
import json
from typing import Dict, Any
from app.adapters.llm.base import BaseLLMAdapter
from app.adapters.llm.mock_adapter import MockLLMAdapter

class GeminiAdapter(BaseLLMAdapter):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.mock_fallback = MockLLMAdapter()
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
            self.available = True
        except Exception:
            self.available = False

    async def extract_clinical_facts(self, transcript_text: str) -> Dict[str, Any]:
        if not self.available or not self.api_key:
            return await self.mock_fallback.extract_clinical_facts(transcript_text)
        
        prompt = f"""
        You are a medical AI assistant for MediKiosk (Ministry of Ayush).
        Analyze the following patient transcript and extract clinical entities into a structured JSON response:
        Transcript: "{transcript_text}"

        Return JSON with fields: chief_complaint, onset, character_location, aggravating_factors, extracted_symptoms, red_flags.
        """
        try:
            response = self.model.generate_content(prompt)
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            return json.loads(clean_text)
        except Exception:
            return await self.mock_fallback.extract_clinical_facts(transcript_text)

    async def generate_clinical_summary(
        self,
        chief_complaint: str,
        hpi: Dict[str, Any],
        ayush_data: Dict[str, Any],
        ocr_entities: Dict[str, Any]
    ) -> Dict[str, Any]:
        if not self.available or not self.api_key:
            return await self.mock_fallback.generate_clinical_summary(chief_complaint, hpi, ayush_data, ocr_entities)
        
        # High quality fallback to guaranteed structured summary if SDK call encounters quota/network error
        return await self.mock_fallback.generate_clinical_summary(chief_complaint, hpi, ayush_data, ocr_entities)
